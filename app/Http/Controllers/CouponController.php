<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

final class CouponController extends Controller
{
    public function __construct(
        private readonly CouponService $couponService,
    ) {}

    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        $cart = Session::get('cart', []);

        $result = $this->couponService->validateForCart(
            (string) $validated['code'],
            $cart,
            $request->user()?->id ? (string) $request->user()->id : null,
        );

        if (! $result['valid'] || ! $result['coupon']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        $coupon = $result['coupon'];

        Session::put('applied_coupon', [
            'code' => $coupon->code,
        ]);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'appliedCoupon' => [
                'code' => $coupon->code,
                'discount' => (float) $result['discount'],
                'discountType' => $coupon->discount_type,
                'discountValue' => (float) $coupon->discount_value,
                'appliesTo' => $coupon->applies_to,
            ],
        ]);
    }

    public function remove(): JsonResponse
    {
        Session::forget('applied_coupon');

        return response()->json([
            'success' => true,
            'message' => 'Coupon removed successfully.',
        ]);
    }
}
