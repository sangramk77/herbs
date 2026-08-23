<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Coupon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class CouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $couponId = $this->route('id');

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('coupons', 'code')->ignore($couponId, '_id'),
            ],
            'discount_type' => [
                'required',
                Rule::in([
                    Coupon::DISCOUNT_TYPE_PERCENTAGE,
                    Coupon::DISCOUNT_TYPE_FIXED,
                ]),
            ],
            'discount_value' => ['required', 'numeric', 'min:0.01'],
            'applies_to' => [
                'required',
                Rule::in([
                    Coupon::APPLIES_TO_ENTIRE_STORE,
                    Coupon::APPLIES_TO_CATEGORY,
                    Coupon::APPLIES_TO_PRODUCT,
                ]),
            ],
            'category_id' => ['nullable', 'exists:categories,_id'],
            'product_id' => ['nullable', 'exists:products,_id'],
            'is_active' => ['required', 'boolean'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'usage_per_user' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $appliesTo = (string) $this->input('applies_to');

            if ($appliesTo === Coupon::APPLIES_TO_CATEGORY && ! $this->filled('category_id')) {
                $validator->errors()->add('category_id', 'Category is required for category coupon.');
            }

            if ($appliesTo === Coupon::APPLIES_TO_PRODUCT && ! $this->filled('product_id')) {
                $validator->errors()->add('product_id', 'Product is required for product coupon.');
            }

            if ($appliesTo === Coupon::APPLIES_TO_ENTIRE_STORE) {
                return;
            }

            if ($appliesTo === Coupon::APPLIES_TO_CATEGORY && $this->filled('product_id')) {
                $validator->errors()->add('product_id', 'Product must be empty when scope is category.');
            }

            if ($appliesTo === Coupon::APPLIES_TO_PRODUCT && $this->filled('category_id')) {
                $validator->errors()->add('category_id', 'Category must be empty when scope is product.');
            }

            $discountType = (string) $this->input('discount_type');
            $discountValue = (float) $this->input('discount_value', 0);

            if ($discountType === Coupon::DISCOUNT_TYPE_PERCENTAGE && $discountValue > 100) {
                $validator->errors()->add('discount_value', 'Percentage discount cannot exceed 100.');
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $code = mb_strtoupper(mb_trim((string) $this->input('code', '')));

        $isActive = filter_var($this->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        $usageLimit = $this->input('usage_limit');
        $usagePerUser = $this->input('usage_per_user');

        $this->merge([
            'code' => $code,
            'is_active' => $isActive,
            'usage_limit' => $usageLimit === '' ? null : $usageLimit,
            'usage_per_user' => $usagePerUser === '' ? null : $usagePerUser,
        ]);
    }
}
