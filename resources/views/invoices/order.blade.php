@php
    /** @var \App\Models\Order $order */
    $shipping = is_array($order->shipping_address ?? null) ? $order->shipping_address : [];
    $address = array_filter([
        $shipping['line1'] ?? null,
        trim(implode(', ', array_filter([$shipping['city'] ?? null, $shipping['state'] ?? null, $shipping['postal_code'] ?? null]))),
        $shipping['country'] ?? null,
    ]);
    $items = collect($order->items ?? []);
    $subtotal = (float) ($order->subtotal_price ?? $items->sum(fn (array $item) => (float) ($item['price'] ?? 0) * (int) ($item['quantity'] ?? 1)));
    $discount = (float) ($order->discount_amount ?? 0);
    $delivery = (float) ($order->delivery_charge ?? 0);
    $total = (float) ($order->total_price ?? max(0, $subtotal - $discount + $delivery));
@endphp
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $order->order_id }}</title>
    <style>
        @page { size: A4; margin: 24px; }
        html { background: #ffffff; }
        * { box-sizing: border-box; }
        body { background: #ffffff; color: #173c28; font-family: Arial, sans-serif; font-size: 12px; margin: 0; }
        header { align-items: flex-start; border-bottom: 2px solid #2e7b43; display: flex; justify-content: space-between; padding-bottom: 20px; }
        h1 { color: #2e7b43; font-size: 27px; letter-spacing: .08em; margin: 0; }
        h2 { font-size: 15px; margin: 28px 0 10px; text-transform: uppercase; }
        .muted { color: #5f6f63; line-height: 1.6; }
        .columns { display: flex; gap: 40px; }
        .columns > div { width: 50%; }
        table { border-collapse: collapse; margin-top: 26px; width: 100%; }
        th { background: #2e7b43; color: white; font-size: 11px; padding: 11px; text-align: left; text-transform: uppercase; }
        td { border-bottom: 1px solid #dce6df; padding: 11px; vertical-align: top; }
        .right { text-align: right; } .center { text-align: center; }
        .summary { margin-left: auto; margin-top: 22px; width: 300px; }
        .summary td { border: 0; padding: 6px 0; }
        .summary .total td { border-top: 2px solid #2e7b43; color: #2e7b43; font-size: 14px; font-weight: bold; padding-top: 10px; }
        footer { border-top: 1px solid #dce6df; color: #5f6f63; margin-top: 42px; padding-top: 14px; }
    </style>
</head>
<body>
    <header>
        <div><h1>HERBS</h1><p class="muted">Natural wellness, thoughtfully delivered.</p></div>
        <div class="right"><strong>INVOICE #{{ $order->order_id }}</strong><br><span class="muted">{{ optional($order->created_at)->format('d M Y, h:i A') }}</span></div>
    </header>
    <section class="columns">
        <div><h2>Billing to</h2><div class="muted">{{ $order->customer_name ?: 'N/A' }}<br>{{ $order->customer_email }}<br>{{ $order->customer_phone }}</div></div>
        <div><h2>Shipping to</h2><div class="muted">{{ $address ? implode(', ', $address) : 'N/A' }}<br>Payment: {{ strtoupper((string) ($order->payment_method ?? 'N/A')) }}</div></div>
    </section>
    <table>
        <thead><tr><th>Product</th><th class="right">Price</th><th class="center">Qty</th><th class="right">Total</th></tr></thead>
        <tbody>
        @forelse ($items as $item)
            @php $price = (float) ($item['price'] ?? 0); $quantity = (int) ($item['quantity'] ?? 1); @endphp
            <tr><td>{{ $item['name'] ?? 'N/A' }} @if (!empty($item['measurement_label']))<br><span class="muted">{{ $item['measurement_label'] }}</span>@endif</td><td class="right">Rs. {{ number_format($price, 2) }}</td><td class="center">{{ $quantity }}</td><td class="right">Rs. {{ number_format($price * $quantity, 2) }}</td></tr>
        @empty
            <tr><td colspan="4" class="center">No invoice items found.</td></tr>
        @endforelse
        </tbody>
    </table>
    <table class="summary"><tbody>
        <tr><td>Subtotal</td><td class="right">Rs. {{ number_format($subtotal, 2) }}</td></tr>
        @if ($discount > 0)<tr><td>Discount</td><td class="right">- Rs. {{ number_format($discount, 2) }}</td></tr>@endif
        @if ($delivery > 0)<tr><td>Delivery</td><td class="right">Rs. {{ number_format($delivery, 2) }}</td></tr>@endif
        <tr class="total"><td>Total</td><td class="right">Rs. {{ number_format($total, 2) }}</td></tr>
    </tbody></table>
    <footer>Thank you for shopping with Herbs. Please retain this invoice for your records.</footer>
</body>
</html>
