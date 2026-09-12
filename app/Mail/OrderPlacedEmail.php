<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class OrderPlacedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public ?string $invoicePdfPath = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('orders@naturalrudraksh.com', 'Natural Rudraksh'),
            subject: 'Order Confirmed - #'.$this->order->order_id,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.placed',
        );
    }

    public function attachments(): array
    {
        if (! $this->invoicePdfPath) {
            return [];
        }

        return [
            Attachment::fromPath(public_path($this->invoicePdfPath))
                ->as('invoice-'.$this->order->order_id.'.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
