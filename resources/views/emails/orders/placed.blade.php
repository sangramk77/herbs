@php
    /** @var \App\Models\Order $order */
    $title = 'Order Confirmed - #'.$order->order_id;
    $preheader = 'We have received your order #'.$order->order_id.'.';
    $headline = 'Order confirmed';
    $introHtml = 'Hi <span style="color:#ea580c;font-weight:700;">'.e($order->customer_name ?? 'there').'</span>, thank you for your purchase. We have received your order and we will start processing it shortly.';
@endphp

@include('emails.orders._layout', compact('order', 'title', 'preheader', 'headline', 'introHtml'))

