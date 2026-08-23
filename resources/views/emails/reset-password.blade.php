<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
    <title>Reset Your Password - Natural Rudraksh</title>

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
    <span class="preheader">
        Reset your Natural Rudraksh password. This link expires in {{ $count }} minutes.
    </span>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fff7ed"
        style="background-color:#fff7ed;">
        <tr>
            <td align="center" style="padding:28px 16px;">

                <!-- Card -->
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="container"
                    style="width:600px;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(124, 45, 18, 0.12);">

                    <!-- Top bar -->
                    <tr>
                        <td style="background: linear-gradient(90deg, #ffedd5 0%, #fff7ed 45%, #ffedd5 100%);height:10px;line-height:10px;font-size:10px;">
                            &nbsp;
                        </td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td class="px" align="center" style="padding:22px 40px 6px 40px;">
                            <a href="{{ route('home') }}" style="display:inline-block;">
                                <img src="https://i.postimg.cc/cHSF01FG/logos.png" width="180" alt="Natural Rudraksh"
                                    style="width:180px;height:auto;">
                            </a>
                        </td>
                    </tr>

                    <!-- Hero -->
                    <tr>
                        <td class="px" style="padding:10px 40px 6px 40px;">
                            <div
                                style="font-family:'Roboto Slab', Georgia, serif;font-size:28px;line-height:36px;font-weight:700;color:#7c2d12;text-align:center;">
                                Reset your password
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="px" style="padding:0 40px 18px 40px;">
                            <div
                                style="font-family:'Roboto', Arial, sans-serif;font-size:16px;line-height:26px;color:#431407;text-align:center;">
                                Hello <span style="color:#ea580c;font-weight:700;">{{ $user->name ?? 'there' }}</span>,
                                we received a request to reset your password. Click the button below to set a new one.
                            </div>
                        </td>
                    </tr>

                    <!-- CTA -->
                    <tr>
                        <td class="px" align="center" style="padding:0 40px 16px 40px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="btn"
                                style="border-collapse:separate;">
                                <tr>
                                    <td bgcolor="#ea580c"
                                        style="background:#ea580c;border-radius:12px;text-align:center;">
                                        <a href="{{ $url }}"
                                            style="font-family:'Roboto', Arial, sans-serif;font-size:16px;line-height:20px;font-weight:700;color:#ffffff;display:inline-block;padding:14px 26px;border-radius:12px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Expiry note -->
                    <tr>
                        <td class="px" style="padding:0 40px 26px 40px;">
                            <div
                                style="font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:18px;color:#9a3412;text-align:center;">
                                This link expires in <strong style="color:#7c2d12;">{{ $count }} minutes</strong>.
                            </div>
                        </td>
                    </tr>

                    <!-- Info cards -->
                    <tr>
                        <td class="px" style="padding:0 40px 10px 40px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td class="stack" width="50%" valign="top" style="padding:0 10px 0 0;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                            border="0" height="124"
                                            style="border:1px solid #fed7aa;border-radius:14px;background:#fff7ed;height:124px;">
                                            <tr>
                                                <td valign="top" height="124"
                                                    style="padding:14px 14px 12px 14px;height:124px;">
                                                    <div
                                                        style="font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:18px;font-weight:700;color:#9a3412;">
                                                        Account email
                                                    </div>
                                                    <div
                                                        style="padding-top:6px;font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:20px;color:#431407;">
                                                        {{ $user->email }}
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td class="stack" width="50%" valign="top" style="padding:0 0 0 10px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                            border="0" height="124"
                                            style="border:1px solid #fed7aa;border-radius:14px;background:#fff7ed;height:124px;">
                                            <tr>
                                                <td valign="top" height="124"
                                                    style="padding:14px 14px 12px 14px;height:124px;">
                                                    <div
                                                        style="font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:18px;font-weight:700;color:#9a3412;">
                                                        Security note
                                                    </div>
                                                    <div
                                                        style="padding-top:6px;font-family:'Roboto', Arial, sans-serif;font-size:13px;line-height:20px;color:#431407;">
                                                        If you did not request this, ignore this email. Your password
                                                        will remain unchanged.
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Fallback link -->
                    <tr>
                        <td class="px" style="padding:14px 40px 24px 40px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="border-top:1px solid #ffedd5;">
                                <tr>
                                    <td style="padding-top:14px;">
                                        <div
                                            style="font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:18px;color:#9a3412;">
                                            Having trouble with the button? Copy and paste this link into your browser:
                                        </div>
                                        <div
                                            style="padding-top:6px;font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:18px;color:#431407;word-break:break-all;">
                                            <a href="{{ $url }}" style="color:#ea580c;text-decoration:underline;">{{ $url }}</a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="px" style="padding:0 40px 28px 40px;">
                            <div style="font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:18px;color:#9a3412;">
                                © {{ date('Y') }} Natural Rudraksh. All rights reserved.
                            </div>
                            <div style="padding-top:10px;font-family:'Roboto', Arial, sans-serif;font-size:12px;line-height:18px;color:#9a3412;">
                                <a href="{{ url('/about') }}" style="color:#ea580c;text-decoration:underline;">About</a>
                                &nbsp;|&nbsp;
                                <a href="{{ route('contact.index') }}" style="color:#ea580c;text-decoration:underline;">Contact</a>
                            </div>
                        </td>
                    </tr>

                </table>
                <!-- /Card -->

            </td>
        </tr>
    </table>
</body>

</html>

