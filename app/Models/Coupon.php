<?php

declare(strict_types=1);

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string $code
 * @property string $discount_type
 * @property float $discount_value
 * @property string $applies_to
 * @property string|null $category_id
 * @property string|null $product_id
 * @property bool $is_active
 * @property int|null $usage_limit
 * @property int|null $usage_per_user
 * @property int $used_count
 * @property \Carbon\Carbon|null $expires_at
 * @property string|null $created_by
 * @property string|null $updated_by
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
final class Coupon extends Model
{
    public const DISCOUNT_TYPE_PERCENTAGE = 'percentage';

    public const DISCOUNT_TYPE_FIXED = 'fixed';

    public const APPLIES_TO_ENTIRE_STORE = 'entire_store';

    public const APPLIES_TO_CATEGORY = 'category';

    public const APPLIES_TO_PRODUCT = 'product';

    protected $connection = 'mongodb';

    protected $collection = 'coupons';

    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'applies_to',
        'category_id',
        'product_id',
        'is_active',
        'usage_limit',
        'usage_per_user',
        'used_count',
        'expires_at',
        'created_by',
        'updated_by',
    ];

    protected $attributes = [
        'is_active' => true,
        'used_count' => 0,
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    protected static function boot(): void
    {
        parent::boot();

        self::saving(function (self $coupon): void {
            $coupon->code = mb_strtoupper((string) $coupon->code);
        });
    }

    protected function casts(): array
    {
        return [
            'discount_value' => 'float',
            'is_active' => 'boolean',
            'usage_limit' => 'integer',
            'usage_per_user' => 'integer',
            'used_count' => 'integer',
            'expires_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
