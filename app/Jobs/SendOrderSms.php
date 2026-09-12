<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Order;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class SendOrderSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Order $order, public readonly string $event, public readonly ?string $reason = null) {}

    public function handle(SmsService $sms): void
    {
        $phone = (string) ($this->order->customer_phone ?? '');
        if ($phone === '') {
            return;
        }
        $id = (string) $this->order->order_id;
        $message = match ($this->event) {
            'accepted' => "Your Herbs order {$id} is confirmed and being prepared for dispatch.",
            'shipped' => "Your Herbs order {$id} has been shipped. Tracking ID: ".((string) ($this->order->tracking_id ?? 'NA')).'.',
            'delivered' => "Your Herbs order {$id} has been delivered. Thank you for shopping with us.",
            'rejected' => "Herbs could not process order {$id}. Please contact support. Ref: ".($this->reason ?: 'NA').'.',
            default => "Thank you for choosing Herbs. Your order {$id} has been received and is being reviewed.",
        };
        $templates = ['placed' => 'order_received', 'accepted' => 'order_confirmed', 'shipped' => 'order_shipped', 'delivered' => 'order_delivered', 'rejected' => 'order_failed'];
        $sms->send($phone, $message, ['templateid' => (string) config('services.text2india.templates.'.($templates[$this->event] ?? 'order_received'))]);
    }
}
