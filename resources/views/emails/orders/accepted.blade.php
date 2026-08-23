@php
    /** @var \App\Models\Order $order */
    $title = 'Order Accepted - #'.$order->order_id;
    $preheader = 'Good news. Your order #'.$order->order_id.' has been accepted.';
    $headline = 'Order accepted';
    $introHtml = 'Hi <span style="color:#ea580c;font-weight:700;">'.e($order->customer_name ?? 'there').'</span>, your order has been accepted and is being prepared for shipment.';
@endphp

@include('emails.orders._layout', compact('order', 'title', 'preheader', 'headline', 'introHtml'))

