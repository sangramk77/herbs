<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\OrderShippedEmail;
use App\Models\Order;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

final class SendOrderShippedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public Order $order,
    ) {}

    public function handle(): void
    {
        $email = (string) ($this->order->customer_email ?? '');
        if ($email === '') {
            Log::warning('Order shipped email skipped (missing customer_email)', [
                'order_id' => $this->order->order_id,
            ]);

            return;
        }

        try {
            Mail::to($email)->send(new OrderShippedEmail($this->order));

            Log::info('Order shipped email sent', [
                'order_id' => $this->order->order_id,
                'email' => $email,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to send order shipped email', [
                'order_id' => $this->order->order_id,
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Order shipped email job failed after all retries', [
            'order_id' => $this->order->order_id,
            'error' => $exception->getMessage(),
        ]);
    }
}
