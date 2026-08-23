@php
    /** @var \App\Models\Order $order */
    /** @var string|null $reason */
    $title = 'Order Rejected - #'.$order->order_id;
    $preheader = 'Your order #'.$order->order_id.' was rejected.';
    $headline = 'Order rejected';
    $reasonText = trim((string) ($reason ?? 'Rejected due to internal policy.'));
    $introHtml = 'Hi <span style="color:#ea580c;font-weight:700;">'.e($order->customer_name ?? 'there').'</span>, unfortunately we could not process your order.<br><br><strong style="color:#7c2d12;">Reason:</strong> '.e($reasonText);
@endphp

@include('emails.orders._layout', compact('order', 'title', 'preheader', 'headline', 'introHtml'))

