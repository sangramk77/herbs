@php
    /** @var \App\Models\Order $order */
    $items = collect($order->items ?? []);
    $rows = $items->map(function ($item) {
        $name = (string) ($item['name'] ?? 'N/A');
        $qty = (int) ($item['quantity'] ?? 1);
        $price = (float) ($item['price'] ?? 0);
        return [
            'name' => $name,
            'qty' => $qty,
            'price' => $price,
            'line_total' => $price * $qty,
        ];
    });
    $subtotal = (float) $rows->sum('line_total');
    $total = (float) ($order->total_price ?? $subtotal);
@endphp

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="border:1px solid #fed7aa;border-radius:14px;background:#fff7ed;">
    <tr>
        <td style="padding:14px 14px 10px 14px;">
            <div style="font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:18px;font-weight:700;color:#9a3412;">
                Order summary
            </div>
        </td>
    </tr>
    <tr>
        <td style="padding:0 14px 14px 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border-collapse:collapse;">
                <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #ffedd5;font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:16px;color:#7c2d12;font-weight:700;">
                        Item
                    </td>
                    <td align="right" style="padding:8px 0;border-bottom:1px solid #ffedd5;font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:16px;color:#7c2d12;font-weight:700;">
                        Qty
                    </td>
                    <td align="right" style="padding:8px 0;border-bottom:1px solid #ffedd5;font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:16px;color:#7c2d12;font-weight:700;">
                        Price
                    </td>
                    <td align="right" style="padding:8px 0;border-bottom:1px solid #ffedd5;font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:16px;color:#7c2d12;font-weight:700;">
                        Total
                    </td>
                </tr>

                @foreach ($rows as $row)
                    <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #ffedd5;font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:18px;color:#431407;">
                            {{ $row['name'] }}
                        </td>
                        <td align="right" style="padding:10px 0;border-bottom:1px solid #ffedd5;font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:18px;color:#431407;">
                            {{ $row['qty'] }}
                        </td>
                        <td align="right" style="padding:10px 0;border-bottom:1px solid #ffedd5;font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:18px;color:#431407;">
                            ₹{{ number_format((float) $row['price'], 2) }}
                        </td>
                        <td align="right" style="padding:10px 0;border-bottom:1px solid #ffedd5;font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:18px;color:#431407;">
                            ₹{{ number_format((float) $row['line_total'], 2) }}
                        </td>
                    </tr>
                @endforeach

                <tr>
                    <td colspan="3" align="right" style="padding:12px 0 0 0;font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:18px;color:#7c2d12;font-weight:700;">
                        Total
                    </td>
                    <td align="right" style="padding:12px 0 0 0;font-family:'Roboto', Arial, sans-serif;font-size:14px;line-height:18px;color:#7c2d12;font-weight:800;">
                        ₹{{ number_format((float) $total, 2) }}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

