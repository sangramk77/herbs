<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class OrderAcceptedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('orders@naturalrudraksh.com', 'Natural Rudraksh'),
            subject: 'Order Accepted - #'.$this->order->order_id,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.accepted',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
