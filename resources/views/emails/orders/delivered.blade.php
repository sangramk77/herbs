@php
    /** @var \App\Models\Order $order */
    $title = 'Order Delivered - #'.$order->order_id;
    $preheader = 'Your order #'.$order->order_id.' has been delivered.';
    $headline = 'Order delivered';
    $receivedBy = trim((string) ($order->received_by ?? ''));

    $receivedByHtml = $receivedBy !== ''
        ? '<br><br><strong style="color:#7c2d12;">Received by:</strong> '.e($receivedBy)
        : '';

    $introHtml = 'Hi <span style="color:#ea580c;font-weight:700;">'.e($order->customer_name ?? 'there').'</span>, your order has been delivered. Thank you for shopping with us.'
        .$receivedByHtml;
@endphp

@include('emails.orders._layout', compact('order', 'title', 'preheader', 'headline', 'introHtml'))

