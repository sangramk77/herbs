<?php

declare(strict_types=1);

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string $razorpay_order_id
 * @property string|null $razorpay_payment_id
 * @property string|null $razorpay_signature
 * @property string|null $order_id
 * @property string|null $user_id
 * @property string $customer_name
 * @property string $customer_email
 * @property string|null $customer_phone
 * @property array $shipping_address
 * @property float $total_price
 * @property float $subtotal_price
 * @property float $discount_amount
 * @property float $delivery_charge
 * @property string|null $coupon_code
 * @property string|null $coupon_id
 * @property string $status
 * @property string $payment_method
 * @property string $payment_status
 * @property array $items
 * @property array|null $webhook_payload
 * @property \Carbon\Carbon|null $processing_started_at
 * @property \Carbon\Carbon|null $processed_at
 * @property string|null $inventory_error
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
final class OnlinePayment extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'online_payments';

    protected $fillable = [
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        'order_id',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'total_price',
        'subtotal_price',
        'discount_amount',
        'delivery_charge',
        'coupon_code',
        'coupon_id',
        'status',
        'payment_method',
        'payment_status',
        'items',
        'webhook_payload',
        'processing_started_at',
        'processed_at',
        'inventory_error',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'total_price' => 'decimal:2',
        'subtotal_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'delivery_charge' => 'decimal:2',
        'items' => 'array',
        'webhook_payload' => 'array',
        'processing_started_at' => 'datetime',
        'processed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
