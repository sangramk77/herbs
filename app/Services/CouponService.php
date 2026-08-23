<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Product;
use Illuminate\Support\Collection;

final class CouponService
{
    /**
     * @param  array<int|string, array<string, mixed>>  $cart
     * @return array{
     *     valid: bool,
     *     message: string,
     *     coupon: Coupon|null,
     *     code: string|null,
     *     discount: float,
     *     eligible_subtotal: float
     * }
     */
    public function validateForCart(string $rawCode, array $cart, ?string $userId = null): array
    {
        $code = mb_strtoupper(mb_trim($rawCode));

        if ($code === '') {
            return $this->invalid('Coupon code is required.');
        }

        if ($cart === []) {
            return $this->invalid('Your cart is empty.');
        }

        $coupon = Coupon::query()->where('code', $code)->first();

        if (! $coupon) {
            return $this->invalid('Coupon does not exist.');
        }

        if (! (bool) $coupon->is_active) {
            return $this->invalid('Coupon is not active.');
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return $this->invalid('Coupon has expired.');
        }

        if ($coupon->usage_limit !== null && (int) $coupon->used_count >= (int) $coupon->usage_limit) {
            return $this->invalid('Coupon usage limit has been reached.');
        }

        if ($userId && $coupon->usage_per_user !== null) {
            $usedByUser = CouponUsage::query()
                ->where('coupon_id', (string) $coupon->getKey())
                ->where('user_id', $userId)
                ->count();

            if ($usedByUser >= (int) $coupon->usage_per_user) {
                return $this->invalid('You have reached the usage limit for this coupon.');
            }
        }

        $productMap = $this->getCartProductsById($cart);
        $eligibleSubtotal = $this->getEligibleSubtotal($coupon, $cart, $productMap);

        if ($eligibleSubtotal <= 0) {
            return $this->invalid('Coupon is not applicable to items in your cart.');
        }

        $discount = $this->calculateDiscount($coupon, $eligibleSubtotal);

        if ($discount <= 0) {
            return $this->invalid('Coupon does not provide a valid discount.');
        }

        return [
            'valid' => true,
            'message' => 'Coupon applied successfully.',
            'coupon' => $coupon,
            'code' => $coupon->code,
            'discount' => $discount,
            'eligible_subtotal' => $eligibleSubtotal,
        ];
    }

    /**
     * @param  array<int|string, array<string, mixed>>  $cart
     * @param  array<string, mixed>|null  $sessionCoupon
     * @return array{
     *     coupon: Coupon,
     *     code: string,
     *     discount: float,
     *     eligible_subtotal: float,
     *     discount_type: string,
     *     discount_value: float,
     *     applies_to: string
     * }|null
     */
    public function resolveSessionCoupon(array $cart, ?array $sessionCoupon, ?string $userId = null): ?array
    {
        if (! $sessionCoupon) {
            return null;
        }

        $code = (string) ($sessionCoupon['code'] ?? '');
        if ($code === '') {
            return null;
        }

        $validation = $this->validateForCart($code, $cart, $userId);

        if (! $validation['valid'] || ! $validation['coupon']) {
            return null;
        }

        /** @var Coupon $coupon */
        $coupon = $validation['coupon'];

        return [
            'coupon' => $coupon,
            'code' => $coupon->code,
            'discount' => (float) $validation['discount'],
            'eligible_subtotal' => (float) $validation['eligible_subtotal'],
            'discount_type' => $coupon->discount_type,
            'discount_value' => (float) $coupon->discount_value,
            'applies_to' => $coupon->applies_to,
        ];
    }

    /**
     * @param  array<int|string, array<string, mixed>>  $cart
     */
    public function cartSubtotal(array $cart): float
    {
        return (float) array_reduce(
            $cart,
            fn (float $total, array $item): float => $total + ((float) ($item['price'] ?? 0) * (int) ($item['quantity'] ?? 1)),
            0.0,
        );
    }

    public function recordUsage(Coupon $coupon, string $orderId, ?string $userId, float $discountAmount): void
    {
        CouponUsage::create([
            'coupon_id' => (string) $coupon->getKey(),
            'coupon_code' => $coupon->code,
            'user_id' => $userId,
            'order_id' => $orderId,
            'discount_amount' => $discountAmount,
            'used_at' => now(),
        ]);

        $coupon->increment('used_count');
    }

    /**
     * @param  array<int|string, array<string, mixed>>  $cart
     * @return Collection<string, Product>
     */
    private function getCartProductsById(array $cart): Collection
    {
        $productIds = collect($cart)
            ->map(fn (array $item): ?string => isset($item['id']) ? (string) $item['id'] : null)
            ->filter()
            ->unique()
            ->values();

        if ($productIds->isEmpty()) {
            return collect();
        }

        return Product::query()
            ->whereIn('_id', $productIds->all())
            ->get(['_id', 'category_id'])
            ->keyBy(fn (Product $product): string => (string) $product->getKey());
    }

    /**
     * @param  array<int|string, array<string, mixed>>  $cart
     * @param  Collection<string, Product>  $productMap
     */
    private function getEligibleSubtotal(Coupon $coupon, array $cart, Collection $productMap): float
    {
        if ($coupon->applies_to === Coupon::APPLIES_TO_ENTIRE_STORE) {
            return $this->cartSubtotal($cart);
        }

        $eligibleSubtotal = 0.0;

        foreach ($cart as $item) {
            $itemProductId = isset($item['id']) ? (string) $item['id'] : null;
            $itemCategoryId = isset($item['categoryId']) && $item['categoryId']
                ? (string) $item['categoryId']
                : null;

            if (! $itemCategoryId && $itemProductId) {
                $itemCategoryId = (string) ($productMap->get($itemProductId)?->category_id ?? '');
            }

            $matches = false;

            if ($coupon->applies_to === Coupon::APPLIES_TO_PRODUCT && $itemProductId) {
                $matches = $itemProductId === (string) $coupon->product_id;
            }

            if ($coupon->applies_to === Coupon::APPLIES_TO_CATEGORY && $itemCategoryId) {
                $matches = $itemCategoryId === (string) $coupon->category_id;
            }

            if ($matches) {
                $eligibleSubtotal += ((float) ($item['price'] ?? 0) * (int) ($item['quantity'] ?? 1));
            }
        }

        return $eligibleSubtotal;
    }

    private function calculateDiscount(Coupon $coupon, float $eligibleSubtotal): float
    {
        $discount = 0.0;

        if ($coupon->discount_type === Coupon::DISCOUNT_TYPE_PERCENTAGE) {
            $discount = $eligibleSubtotal * ((float) $coupon->discount_value / 100);
        }

        if ($coupon->discount_type === Coupon::DISCOUNT_TYPE_FIXED) {
            $discount = (float) $coupon->discount_value;
        }

        return round(min($discount, $eligibleSubtotal), 2);
    }

    /**
     * @return array{valid: bool, message: string, coupon: Coupon|null, code: string|null, discount: float, eligible_subtotal: float}
     */
    private function invalid(string $message): array
    {
        return [
            'valid' => false,
            'message' => $message,
            'coupon' => null,
            'code' => null,
            'discount' => 0.0,
            'eligible_subtotal' => 0.0,
        ];
    }
}
