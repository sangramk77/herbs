<?php

declare(strict_types=1);

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string $coupon_id
 * @property string $coupon_code
 * @property string|null $user_id
 * @property string $order_id
 * @property float $discount_amount
 * @property \Carbon\Carbon|null $used_at
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
final class CouponUsage extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'coupon_usages';

    protected $fillable = [
        'coupon_id',
        'coupon_code',
        'user_id',
        'order_id',
        'discount_amount',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'discount_amount' => 'float',
            'used_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
