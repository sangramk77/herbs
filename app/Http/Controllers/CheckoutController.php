<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\SendOrderPlacedEmail;
use App\Models\Order;
use App\Services\CouponService;
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

        $cartTotal = array_reduce($cart, fn ($total, $item) => $total + ($item['price'] * $item['quantity']), 0);

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

        $cartTotal = array_reduce($cart, fn ($total, $item) => $total + ($item['price'] * $item['quantity']), 0);
        $couponData = $this->couponService->resolveSessionCoupon(
            $cart,
            Session::get('applied_coupon'),
            (string) $request->user()->id,
        );
        $discountAmount = (float) ($couponData['discount'] ?? 0);

        $settings = SettingsService::getSettingsData();
        $deliveryCharge = (float) ($settings['cod_charge'] ?? 0);
        $finalTotal = max(0, $cartTotal - $discountAmount + $deliveryCharge);

        $items = collect($cart)->map(fn (array $item) => [
            'id' => $item['id'] ?? null,
            'name' => $item['name'] ?? 'N/A',
            'price' => (float) ($item['price'] ?? 0),
            'quantity' => (int) ($item['quantity'] ?? 1),
            'image' => $item['image'] ?? null,
            'slug' => $item['slug'] ?? null,
            'categorySlug' => $item['categorySlug'] ?? null,
        ])->values();

        $shippingAddress = [
            'line1' => $validated['address'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'postal_code' => $validated['pincode'],
            'country' => 'India',
        ];

        $order = Order::create([
            'user_id' => $request->user()->id,
            'customer_name' => $request->user()->name,
            'customer_email' => $request->user()->email,
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
