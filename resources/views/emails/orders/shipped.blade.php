@php
    /** @var \App\Models\Order $order */
    $title = 'Order Shipped - #'.$order->order_id;
    $preheader = 'Your order #'.$order->order_id.' has been shipped.';
    $headline = 'Order shipped';
    $courier = trim((string) ($order->courier_name ?? ''));
    $trackingId = trim((string) ($order->tracking_id ?? ''));

    $trackingHtml = '';
    if ($courier !== '' || $trackingId !== '') {
        $trackingHtml = '<br><br>';
        if ($courier !== '') {
            $trackingHtml .= '<strong style="color:#7c2d12;">Courier:</strong> '.e($courier).'<br>';
        }
        if ($trackingId !== '') {
            $trackingHtml .= '<strong style="color:#7c2d12;">Tracking ID:</strong> '.e($trackingId);
        }
    }

    $introHtml = 'Hi <span style="color:#ea580c;font-weight:700;">'.e($order->customer_name ?? 'there').'</span>, your order has been shipped and is on its way to you.'
        .$trackingHtml;
@endphp

@include('emails.orders._layout', compact('order', 'title', 'preheader', 'headline', 'introHtml'))

