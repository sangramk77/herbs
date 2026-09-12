<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\OrderDeliveredEmail;
use App\Models\Order;
use App\Services\InvoicePdfService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

final class SendOrderDeliveredEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public Order $order,
    ) {}

    public function handle(InvoicePdfService $invoicePdfService): void
    {
        $email = (string) ($this->order->customer_email ?? '');
        if ($email === '') {
            Log::warning('Order delivered email skipped (missing customer_email)', [
                'order_id' => $this->order->order_id,
            ]);

            return;
        }

        try {
            $invoicePdfPath = $invoicePdfService->generateForOrder($this->order);
            Mail::to($email)->send(new OrderDeliveredEmail($this->order, $invoicePdfPath));

            Log::info('Order delivered email sent', [
                'order_id' => $this->order->order_id,
                'email' => $email,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to send order delivered email', [
                'order_id' => $this->order->order_id,
                'email' => $email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Order delivered email job failed after all retries', [
            'order_id' => $this->order->order_id,
            'error' => $exception->getMessage(),
        ]);
    }
}
