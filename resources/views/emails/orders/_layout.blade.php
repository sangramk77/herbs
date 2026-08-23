@php
    /** @var \App\Models\Order $order */
    $shipping = is_array($order->shipping_address ?? null) ? $order->shipping_address : [];
    $addressLines = array_filter([
        $shipping['line1'] ?? null,
        $shipping['line2'] ?? null,
        trim(implode(' ', array_filter([
            $shipping['city'] ?? null,
            $shipping['state'] ?? null,
            $shipping['postal_code'] ?? ($shipping['zip'] ?? null),
        ]))),
        $shipping['country'] ?? null,
    ]);
    $addressText = implode(', ', $addressLines);
@endphp
<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
    <title>{{ $title ?? 'Natural Rudraksh' }}</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Slab:wght@600;700&display=swap"
        rel="stylesheet">

    <!--[if (gte mso 9)|(IE)]>
    <xml>
        <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->

    <style type="text/css">
        body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            background-color: #fff7ed;
        }

        table {
            border-spacing: 0;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        td {
            border-collapse: collapse;
            mso-line-height-rule: exactly;
        }

        img {
            border: 0;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
            display: block;
        }

        a {
            color: inherit;
            text-decoration: none;
        }

        .preheader {
            display: none !important;
            visibility: hidden;
            opacity: 0;
            color: transparent;
            height: 0;
            width: 0;
            max-height: 0;
            max-width: 0;
            overflow: hidden;
            mso-hide: all;
        }

        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                max-width: 100% !important;
            }

            .px {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }

            .stack {
                display: block !important;
                width: 100% !important;
            }

            .btn a {
                display: block !important;
                width: 100% !important;
            }
        }
    </style>
</head>

<body>
    <span class="preheader">{{ $preheader ?? '' }}</span>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fff7ed"
        style="background-color:#fff7ed;">
        <tr>
            <td align="center" style="padding:28px 16px;">

                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="container"
                    style="width:600px;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(124, 45, 18, 0.12);">

                    <tr>
                        <td style="background: linear-gradient(90deg, #ffedd5 0%, #fff7ed 45%, #ffedd5 100%);height:10px;line-height:10px;font-size:10px;">
                            &nbsp;
                        </td>
                    </tr>

                    <tr>
                        <td class="px" align="center" style="padding:22px 40px 6px 40px;">
                            <a href="{{ route('home') }}" style="display:inline-block;">
                                <img src="https://i.postimg.cc/cHSF01FG/logos.png" width="180" alt="Natural Rudraksh"
                                    style="width:180px;height:auto;">
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td class="px" style="padding:10px 40px 6px 40px;">
                            <div style="font-family:'Roboto Slab', Georgia, serif;font-size:28px;line-height:36px;font-weight:700;color:#7c2d12;text-align:center;">
                                {{ $headline ?? '' }}
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td class="px" style="padding:0 40px 18px 40px;">
                            <div style="font-family:'Roboto', Arial, sans-serif;font-size:16px;line-height:26px;color:#431407;text-align:center;">
                                {!! $introHtml ?? '' !!}
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td class="px" style="padding:0 40px 18px 40px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td class="stack" width="50%" valign="top" style="padding:0 10px 0 0;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                            border="0" height="116"
                                            style="border:1px solid #fed7aa;border-radius:14px;background:#fff7ed;height:116px;">
                                            <tr>
                                                <td valign="top" height="116"
                                                    style="padding:14px 14px 12px 14px;height:116px;">
                                                    <div style="font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:18px;font-weight:700;color:#9a3412;">
                                                        Order number
                                                    </div>
                                                    <div style="padding-top:6px;font-family:'Roboto', Arial, sans-serif;font-size:15px;line-height:20px;color:#431407;font-weight:700;">
                                                        #{{ $order->order_id }}
                                                    </div>
                                                    <div style="padding-top:6px;font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:18px;color:#9a3412;">
                                                        {{ optional($order->created_at)->format('d M Y, h:i A') }}
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td class="stack" width="50%" valign="top" style="padding:0 0 0 10px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                            border="0" height="116"
                                            style="border:1px solid #fed7aa;border-radius:14px;background:#fff7ed;height:116px;">
                                            <tr>
                                                <td valign="top" height="116"
                                                    style="padding:14px 14px 12px 14px;height:116px;">
                                                    <div style="font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:18px;font-weight:700;color:#9a3412;">
                                                        Shipping address
                                                    </div>
                                                    <div style="padding-top:6px;font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:20px;color:#431407;">
                                                        {{ $addressText !== '' ? $addressText : 'N/A' }}
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td class="px" style="padding:0 40px 18px 40px;">
                            @include('emails.orders._order-table', ['order' => $order])
                        </td>
                    </tr>

                    <tr>
                        <td class="px" style="padding:0 40px 24px 40px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="border-top:1px solid #ffedd5;">
                                <tr>
                                    <td style="padding-top:14px;">
                                        <div style="font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:18px;color:#9a3412;">
                                            Need help? Reply to this email or contact us:
                                            <a href="{{ route('contact.index') }}" style="color:#ea580c;text-decoration:underline;">Support</a>
                                        </div>
                                        <div style="padding-top:10px;font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:18px;color:#9a3412;">
                                            © {{ date('Y') }} Natural Rudraksh. All rights reserved.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>

