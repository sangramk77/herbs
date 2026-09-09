<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\SendOrderPlacedEmail;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\OnlinePayment;
use App\Models\Order;
use App\Services\CouponService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Razorpay\Api\Api;

final class PaymentController extends Controller
{
    private readonly Api $razorpay;

    public function __construct(
        private readonly CouponService $couponService,
    ) {
        $this->razorpay = new Api(
            config('razorpay.key_id'),
            config('razorpay.key_secret')
        );
    }

    /**
     * Create a Razorpay order and persist a pending payment snapshot.
     */
    public function createOrder(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'address' => ['required', 'string', 'max:255'],
                'city' => ['required', 'string', 'max:100'],
                'state' => ['required', 'string', 'max:100'],
                'pincode' => ['required', 'string', 'max:10'],
            ]);

            $cart = Session::get('cart', []);
            if (empty($cart)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your cart is empty.',
                ], 400);
            }

            $cartSubtotal = $this->couponService->cartSubtotal($cart);
            $couponData = $this->couponService->resolveSessionCoupon(
                $cart,
                Session::get('applied_coupon'),
                (string) $request->user()->id,
            );
            $discountAmount = (float) ($couponData['discount'] ?? 0);
            $deliveryCharge = 0.0; // Online payment has free delivery.
            $finalAmount = max(0, $cartSubtotal - $discountAmount + $deliveryCharge);

            $items = collect($cart)->map(fn (array $item) => [
                'id' => $item['id'] ?? null,
                'name' => $item['name'] ?? 'N/A',
                'price' => (float) ($item['price'] ?? 0),
                'quantity' => (int) ($item['quantity'] ?? 1),
                'image' => $item['image'] ?? null,
                'measurement_value' => $item['measurement_value'] ?? null,
                'measurement_label' => $item['measurement_label'] ?? null,
                'slug' => $item['slug'] ?? null,
                'categorySlug' => $item['categorySlug'] ?? null,
            ])->values()->all();

            $shippingAddress = [
                'line1' => $validated['address'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'postal_code' => $validated['pincode'],
                'country' => 'India',
            ];

            // Create Razorpay order.
            $razorpayOrder = $this->razorpay->order->create([
                'amount' => (int) ($finalAmount * 100), // Amount in paise
                'currency' => config('razorpay.currency'),
                'receipt' => 'order_'.time(),
                'notes' => [
                    'address' => $validated['address'],
                    'city' => $validated['city'],
                    'state' => $validated['state'],
                    'pincode' => $validated['pincode'],
                    'user_id' => (string) $request->user()->id,
                ],
            ]);

            // Keep legacy session data for current checkout UX.
            Session::put('razorpay_order_data', [
                'razorpay_order_id' => $razorpayOrder->id,
                'amount' => $finalAmount,
                'subtotal' => $cartSubtotal,
                'discount_amount' => $discountAmount,
                'coupon_code' => $couponData['code'] ?? null,
                'coupon_id' => isset($couponData['coupon']) ? (string) $couponData['coupon']->getKey() : null,
                'delivery_charge' => $deliveryCharge,
                'address' => $validated['address'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'pincode' => $validated['pincode'],
            ]);

            // Persist a server-side source of truth so webhook can finalize without browser/session.
            OnlinePayment::create([
                'razorpay_order_id' => $razorpayOrder->id,
                'user_id' => (string) $request->user()->id,
                'customer_name' => $request->user()->name,
                'customer_email' => $request->user()->email,
                'customer_phone' => $request->user()->phone ?? null,
                'shipping_address' => $shippingAddress,
                'total_price' => $finalAmount,
                'subtotal_price' => $cartSubtotal,
                'coupon_code' => $couponData['code'] ?? null,
                'coupon_id' => isset($couponData['coupon']) ? (string) $couponData['coupon']->getKey() : null,
                'discount_amount' => $discountAmount,
                'delivery_charge' => $deliveryCharge,
                'status' => 'pending',
                'payment_method' => 'ONLINE',
                'payment_status' => 'pending',
                'items' => $items,
            ]);

            return response()->json([
                'success' => true,
                'order_id' => $razorpayOrder->id,
                'amount' => $razorpayOrder->amount,
                'currency' => $razorpayOrder->currency,
                'key_id' => config('razorpay.key_id'),
            ]);
        } catch (Exception $e) {
            Log::error('Razorpay order creation failed: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment order. Please try again.',
            ], 500);
        }
    }

    /**
     * Verify payment and finalize order.
     */
    public function verifyPayment(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'razorpay_order_id' => ['required', 'string'],
                'razorpay_payment_id' => ['required', 'string'],
                'razorpay_signature' => ['required', 'string'],
            ]);

            $attributes = [
                'razorpay_order_id' => $validated['razorpay_order_id'],
                'razorpay_payment_id' => $validated['razorpay_payment_id'],
                'razorpay_signature' => $validated['razorpay_signature'],
            ];

            $this->razorpay->utility->verifyPaymentSignature($attributes);

            $order = $this->finalizePaidOrder(
                $validated['razorpay_order_id'],
                $validated['razorpay_payment_id'],
                $validated['razorpay_signature'],
                'verify',
                null,
            );

            if (! $order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to finalize order for this payment.',
                ], 400);
            }

            Session::forget('cart');
            Session::forget('applied_coupon');
            Session::forget('razorpay_order_data');

            return response()->json([
                'success' => true,
                'order_id' => $order->order_id,
                'message' => 'Payment verified successfully!',
            ]);
        } catch (\Razorpay\Api\Errors\SignatureVerificationError $e) {
            Log::error('Razorpay signature verification failed: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed. Please contact support.',
            ], 400);
        } catch (Exception $e) {
            Log::error('Payment verification error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing your payment.',
            ], 500);
        }
    }

    /**
     * Razorpay webhook endpoint.
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = (string) $request->getContent();
        $signature = (string) $request->header('X-Razorpay-Signature', '');

        if (! $this->isValidWebhookSignature($payload, $signature)) {
            Log::warning('Razorpay webhook signature mismatch');

            return response()->json(['success' => false, 'message' => 'Invalid signature'], 400);
        }

        /** @var array<string, mixed>|null $eventData */
        $eventData = json_decode($payload, true);
        if (! is_array($eventData)) {
            return response()->json(['success' => false, 'message' => 'Invalid payload'], 400);
        }

        $event = (string) ($eventData['event'] ?? '');
        Log::info('Razorpay webhook received', ['event' => $event]);

        if (in_array($event, ['payment.captured', 'order.paid'], true)) {
            [$razorpayOrderId, $razorpayPaymentId] = $this->extractSuccessfulPaymentIdentifiers($eventData);

            if ($razorpayOrderId === '' || $razorpayPaymentId === '') {
                Log::warning('Razorpay webhook missing payment identifiers', [
                    'event' => $event,
                    'payload_keys' => array_keys($eventData),
                ]);

                return response()->json(['success' => false, 'message' => 'Missing identifiers'], 422);
            }

            Log::info('Razorpay webhook payment identifiers resolved', [
                'event' => $event,
                'razorpay_order_id' => $razorpayOrderId,
                'razorpay_payment_id' => $razorpayPaymentId,
            ]);

            $order = $this->finalizePaidOrder(
                $razorpayOrderId,
                $razorpayPaymentId,
                null,
                'webhook',
                $eventData,
            );

            if (! $order) {
                Log::warning('Webhook could not finalize order: pending record not found', [
                    'event' => $event,
                    'razorpay_order_id' => $razorpayOrderId,
                    'razorpay_payment_id' => $razorpayPaymentId,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Pending payment record not found',
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order finalized',
            ]);
        }

        if ($event === 'payment.failed') {
            $paymentEntity = $this->extractPaymentEntity($eventData);
            $razorpayOrderId = (string) ($paymentEntity['order_id'] ?? '');
            $razorpayPaymentId = (string) ($paymentEntity['id'] ?? '');

            if ($razorpayOrderId !== '') {
                $pending = OnlinePayment::where('razorpay_order_id', $razorpayOrderId)->first();
                if ($pending) {
                    $pending->status = 'failed';
                    $pending->payment_status = 'failed';
                    if ($razorpayPaymentId !== '') {
                        $pending->razorpay_payment_id = $razorpayPaymentId;
                    }
                    $pending->webhook_payload = $eventData;
                    $pending->processed_at = now();
                    $pending->save();
                }
            }

            return response()->json(['success' => true, 'message' => 'Failure noted']);
        }

        return response()->json(['success' => true, 'message' => 'Event ignored']);
    }

    /**
     * Handle payment failure callback from checkout UI.
     */
    public function handleFailure(Request $request): JsonResponse
    {
        $error = $request->input('error', []);
        $razorpayOrderId = (string) $request->input('razorpay_order_id', '');

        Log::warning('Payment modal dismissed or failed', [
            'user_id' => $request->user()?->id,
            'error' => $error,
            'razorpay_order_id' => $razorpayOrderId,
        ]);

        if ($razorpayOrderId !== '') {
            $pending = OnlinePayment::where('razorpay_order_id', $razorpayOrderId)->first();
            if ($pending) {
                // Don't update if webhook has already processed this payment
                if ($pending->processed_at !== null) {
                    Log::info('Payment already processed by webhook, skipping failure update', [
                        'razorpay_order_id' => $razorpayOrderId,
                        'status' => $pending->status,
                        'order_id' => $pending->order_id,
                    ]);

                    Session::forget('razorpay_order_data');

                    return response()->json([
                        'success' => false,
                        'message' => 'Payment is being processed. Please check your orders.',
                    ]);
                }

                // Mark as user_cancelled but DON'T set processed_at
                // This allows webhook to recover if payment actually succeeded
                $pending->status = 'user_cancelled';
                $pending->payment_status = 'user_cancelled';
                // Removed: $pending->processed_at = now();
                $pending->save();

                Log::info('Payment marked as user_cancelled (webhook can still recover)', [
                    'razorpay_order_id' => $razorpayOrderId,
                ]);
            }
        }

        Session::forget('razorpay_order_data');

        return response()->json([
            'success' => false,
            'message' => 'Payment was cancelled or failed. Please try again.',
        ]);
    }

    /**
     * Idempotently finalize order after a successful payment.
     */
    private function finalizePaidOrder(
        string $razorpayOrderId,
        string $razorpayPaymentId,
        ?string $razorpaySignature,
        string $source,
        ?array $webhookPayload,
    ): ?Order {
        // First check if order already exists (quick check without lock)
        $existingOrder = Order::where('razorpay_payment_id', $razorpayPaymentId)
            ->orWhere('razorpay_order_id', $razorpayOrderId)
            ->first();

        if ($existingOrder) {
            if (($existingOrder->payment_status ?? '') !== 'completed') {
                $existingOrder->payment_status = 'completed';
                $existingOrder->save();
            }

            return $existingOrder;
        }

        // Use pessimistic locking to prevent race conditions
        // This ensures only one request (webhook OR verify) creates the order
        $pending = OnlinePayment::where('razorpay_order_id', $razorpayOrderId)
            ->lockForUpdate()
            ->first();

        if (! $pending) {
            Log::warning('No pending online payment found for order finalization', [
                'razorpay_order_id' => $razorpayOrderId,
                'razorpay_payment_id' => $razorpayPaymentId,
                'source' => $source,
            ]);

            return null;
        }

        // Check again if already processed (after acquiring lock)
        // Another concurrent request might have processed it
        if ($pending->processed_at !== null && $pending->order_id) {
            Log::info('Payment already processed by concurrent request', [
                'razorpay_order_id' => $razorpayOrderId,
                'razorpay_payment_id' => $razorpayPaymentId,
                'source' => $source,
                'existing_order_id' => $pending->order_id,
            ]);

            return Order::where('order_id', $pending->order_id)->first();
        }

        // Log if we're recovering from a cancelled state (user closed modal after payment)
        if (in_array($pending->status, ['user_cancelled', 'cancelled', 'failed'], true)) {
            Log::info('Recovering payment from cancelled/failed state', [
                'razorpay_order_id' => $razorpayOrderId,
                'razorpay_payment_id' => $razorpayPaymentId,
                'previous_status' => $pending->status,
                'source' => $source,
                'recovery_scenario' => $pending->status === 'user_cancelled'
                    ? 'User closed modal after payment succeeded'
                    : 'Payment failed then succeeded',
            ]);
        }

        $items = collect($pending->items ?? [])->map(fn (array $item) => [
            'id' => $item['id'] ?? null,
            'name' => $item['name'] ?? 'N/A',
            'price' => (float) ($item['price'] ?? 0),
            'quantity' => (int) ($item['quantity'] ?? 1),
            'image' => $item['image'] ?? null,
            'slug' => $item['slug'] ?? null,
            'categorySlug' => $item['categorySlug'] ?? null,
        ])->values();

        $order = Order::create([
            'user_id' => $pending->user_id,
            'customer_name' => $pending->customer_name,
            'customer_email' => $pending->customer_email,
            'customer_phone' => $pending->customer_phone,
            'shipping_address' => $pending->shipping_address,
            'total_price' => (float) $pending->total_price,
            'subtotal_price' => (float) ($pending->subtotal_price ?? $pending->total_price),
            'coupon_code' => $pending->coupon_code,
            'coupon_id' => $pending->coupon_id,
            'discount_amount' => (float) ($pending->discount_amount ?? 0),
            'delivery_charge' => (float) ($pending->delivery_charge ?? 0),
            'status' => 'Order Placed',
            'payment_method' => 'ONLINE',
            'payment_status' => 'completed',
            'razorpay_order_id' => $razorpayOrderId,
            'razorpay_payment_id' => $razorpayPaymentId,
            'razorpay_signature' => $razorpaySignature,
            'items' => $items,
        ]);

        if ($pending->coupon_id) {
            $usageExists = CouponUsage::where('order_id', (string) $order->order_id)->exists();
            if (! $usageExists) {
                $coupon = Coupon::where('_id', (string) $pending->coupon_id)->first();
                if ($coupon) {
                    $this->couponService->recordUsage(
                        $coupon,
                        (string) $order->order_id,
                        $pending->user_id ? (string) $pending->user_id : null,
                        (float) ($pending->discount_amount ?? 0),
                    );
                }
            }
        }

        try {
            SendOrderPlacedEmail::dispatch($order);
        } catch (Exception $e) {
            Log::error('Failed to dispatch order placed email job', [
                'order_id' => $order->order_id,
                'error' => $e->getMessage(),
            ]);
        }

        $pending->order_id = (string) $order->order_id;
        $pending->status = 'completed';
        $pending->payment_status = 'completed';
        $pending->razorpay_payment_id = $razorpayPaymentId;
        if ($razorpaySignature) {
            $pending->razorpay_signature = $razorpaySignature;
        }
        if ($webhookPayload) {
            $pending->webhook_payload = $webhookPayload;
        }
        $pending->processed_at = now();
        $pending->save();

        return $order;
    }

    /**
     * @param  array<string, mixed>  $eventData
     * @return array<string, mixed>
     */
    private function extractPaymentEntity(array $eventData): array
    {
        $paymentEntity = data_get($eventData, 'payload.payment.entity');

        return is_array($paymentEntity) ? $paymentEntity : [];
    }

    /**
     * Resolve Razorpay order/payment IDs from both payment.captured and order.paid payloads.
     *
     * @param  array<string, mixed>  $eventData
     * @return array{0:string,1:string}
     */
    private function extractSuccessfulPaymentIdentifiers(array $eventData): array
    {
        $paymentEntity = $this->extractPaymentEntity($eventData);
        $orderEntity = data_get($eventData, 'payload.order.entity');
        $orderEntity = is_array($orderEntity) ? $orderEntity : [];

        $razorpayOrderId = (string) ($paymentEntity['order_id'] ?? $orderEntity['id'] ?? '');
        $razorpayPaymentId = (string) ($paymentEntity['id'] ?? '');

        if ($razorpayPaymentId === '') {
            $candidateKeys = ['payment_id', 'payment', 'payment_id_1', 'last_payment_id'];
            foreach ($candidateKeys as $key) {
                $candidate = (string) ($orderEntity[$key] ?? '');
                if ($candidate !== '') {
                    $razorpayPaymentId = $candidate;
                    break;
                }
            }
        }

        return [$razorpayOrderId, $razorpayPaymentId];
    }

    private function isValidWebhookSignature(string $payload, string $signature): bool
    {
        $secret = (string) config('razorpay.webhook_secret');

        if ($secret === '' || $signature === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $signature);
    }
}
