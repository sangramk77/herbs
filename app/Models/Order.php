<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string $order_id
 * @property string|null $user_id
 * @property string $customer_name
 * @property string $customer_email
 * @property string $customer_phone
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
 * @property string|null $razorpay_order_id
 * @property string|null $razorpay_payment_id
 * @property string|null $razorpay_signature
 * @property array $items
 * @property string|null $notes
 * @property string|null $courier_name
 * @property string|null $tracking_id
 * @property string|null $received_by
 * @property string|null $bill_pdf_path
 * @property \Carbon\Carbon|null $shipped_at
 * @property \Carbon\Carbon|null $accepted_at
 * @property \Carbon\Carbon|null $rejected_at
 * @property \Carbon\Carbon|null $out_for_delivery_at
 * @property \Carbon\Carbon|null $delivered_at
 * @property \Carbon\Carbon|null $bill_uploaded_at
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * @property-read User|null $user
 */
final class Order extends Model
{
    use SoftDeletes;

    protected $connection = 'mongodb';

    protected $collection = 'orders';

    protected $fillable = [
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
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        'items',
        'notes',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'subtotal_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'delivery_charge' => 'decimal:2',
        'items' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
        'shipped_at' => 'datetime',
        'out_for_delivery_at' => 'datetime',
        'delivered_at' => 'datetime',
        'bill_uploaded_at' => 'datetime',
    ];

    /**
     * Generate a unique 8-digit order ID.
     */
    public static function generateUniqueOrderId(): string
    {
        do {
            $orderId = (string) mt_rand(10000000, 99999999);
        } while (self::where('order_id', $orderId)->exists());

        return $orderId;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        self::creating(function ($order) {
            if (empty($order->order_id)) {
                $order->order_id = self::generateUniqueOrderId();
            }
        });
    }
}
