<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\SendOrderPlacedEmail;
use App\Jobs\SendOrderSms;
use App\Models\Order;
use App\Services\CouponService;
use App\Services\ProductPurchaseService;
use App\Services\PurchaseUnavailableException;
use App\Services\SettingsService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

final class CheckoutController extends Controller
{
    public function __construct(
        private readonly CouponService $couponService,
        private readonly ProductPurchaseService $productPurchaseService,
    ) {}

    /**
     * Display the checkout page.
     */
    public function index(Request $request): Response
    {
        $cart = Session::get('cart', []);
        $userId = $request->user()?->id ? (string) $request->user()->id : null;
        $appliedCoupon = $this->couponService->resolveSessionCoupon(
            $cart,
            Session::get('applied_coupon'),
            $userId,
        );

        // Get all products for navbar
        $products = \App\Models\Product::active()
            ->orderBy('name')
            ->get(['_id', 'name', 'slug', 'primary_image'])
            ->map(fn ($product) => [
                'id' => $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
            ]);

        if (empty($cart)) {
            return Inertia::render('Checkout', [
                'cart' => [],
                'cartTotal' => 0,
                'cartCount' => 0,
                'appliedCoupon' => null,
                'user' => $request->user(),
                'settings' => (object) SettingsService::getSettingsData(),
                'products' => $products,
            ]);
        }

        try {
            $purchase = $this->productPurchaseService->revalidateCart($cart);
            $cart = $purchase['cart'];
            Session::put('cart', $cart);
        } catch (PurchaseUnavailableException) {
            // Final checkout provides the specific availability error.
        }
        $cartTotal = $this->couponService->cartSubtotal($cart);

        $cartCount = array_reduce($cart, fn ($count, $item) => $count + $item['quantity'], 0);

        if (! $appliedCoupon) {
            Session::forget('applied_coupon');
        }

        return Inertia::render('Checkout', [
            'cart' => array_values($cart),
            'cartTotal' => $cartTotal,
            'cartCount' => $cartCount,
            'appliedCoupon' => $appliedCoupon ? [
                'code' => $appliedCoupon['code'],
                'discount' => $appliedCoupon['discount'],
                'discountType' => $appliedCoupon['discount_type'],
                'discountValue' => $appliedCoupon['discount_value'],
                'appliesTo' => $appliedCoupon['applies_to'],
            ] : null,
            'user' => $request->user(),
            'settings' => (object) SettingsService::getSettingsData(),
            'products' => $products,
        ]);
    }

    /**
     * Process the checkout and create an order.
     * This handles COD orders. Online payments are handled by PaymentController.
     */
    public function process(Request $request)
    {
        $validated = $request->validate([
            'customerName' => ['required', 'string', 'max:100'],
            'customerEmail' => ['nullable', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'pincode' => ['required', 'string', 'max:10'],
            'paymentMethod' => ['required', 'in:cod,online'],
        ]);

        // If online payment, return success (actual order creation happens after payment verification)
        if ($validated['paymentMethod'] === 'online') {
            return response()->json([
                'success' => true,
                'message' => 'Proceed to payment',
            ]);
        }

        // Handle COD orders
        $cart = Session::get('cart', []);
        if (empty($cart)) {
            return back()->with('error', 'Your cart is empty.');
        }

        try {
            $purchase = $this->productPurchaseService->revalidateCart($cart);
        } catch (PurchaseUnavailableException $e) {
            return back()->with('error', $e->getMessage());
        }
        $cart = $purchase['cart'];
        Session::put('cart', $cart);
        $cartTotal = $this->couponService->cartSubtotal($cart);
        $couponData = $this->couponService->resolveSessionCoupon(
            $cart,
            Session::get('applied_coupon'),
            (string) $request->user()->id,
        );
        $discountAmount = (float) ($couponData['discount'] ?? 0);

        $settings = SettingsService::getSettingsData();
        $deliveryCharge = (float) ($settings['cod_charge'] ?? 0);
        $finalTotal = max(0, $cartTotal - $discountAmount + $deliveryCharge);

        $items = $purchase['items'];

        $shippingAddress = [
            'line1' => $validated['address'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'postal_code' => $validated['pincode'],
            'country' => 'India',
        ];

        $this->productPurchaseService->decrementInventory($purchase['inventory']);
        try {
            $order = Order::create([
                'user_id' => $request->user()->id,
                'customer_name' => $validated['customerName'],
                'customer_email' => $validated['customerEmail'] ?? null,
                'customer_phone' => $request->user()->phone ?? null,
                'shipping_address' => $shippingAddress,
                'total_price' => $finalTotal,
                'subtotal_price' => $cartTotal,
                'coupon_code' => $couponData['code'] ?? null,
                'coupon_id' => isset($couponData['coupon']) ? (string) $couponData['coupon']->getKey() : null,
                'discount_amount' => $discountAmount,
                'delivery_charge' => $deliveryCharge,
                'status' => 'Order Placed',
                'payment_method' => 'COD',
                'payment_status' => 'pending',
                'items' => $items,
            ]);
        } catch (Exception $e) {
            foreach ($purchase['inventory'] as $requirement) {
                $this->productPurchaseService->restoreInventory($requirement['product_id'], $requirement['quantity']);
            }
            throw $e;
        }

        if ($couponData && isset($couponData['coupon'])) {
            $this->couponService->recordUsage(
                $couponData['coupon'],
                (string) $order->order_id,
                (string) $request->user()->id,
                $discountAmount,
            );
        }

        // Email immediately after a successful order placement (do not block checkout on mail failure).
        try {
            SendOrderPlacedEmail::dispatch($order);
            SendOrderSms::dispatch($order, 'placed');
        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to dispatch order placed email job', [
                'order_id' => $order->order_id,
                'error' => $e->getMessage(),
            ]);
        }

        Session::forget('cart');
        Session::forget('applied_coupon');

        return redirect()->route('orders.success', ['orderId' => $order->order_id])
            ->with('success', 'Order placed successfully!');
    }
}
