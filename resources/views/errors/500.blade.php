<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
        />
        <title>Server Error</title>
        <link rel="icon" type="image/png" href="{{ asset('assets/img/favi.png') }}" />
        <style>
            :root {
                color-scheme: light dark;
            }
            body {
                margin: 0;
                font-family: "Instrument Sans", system-ui, -apple-system,
                    Segoe UI, sans-serif;
                background: #f8fafc;
                color: #0f172a;
            }
            .wrap {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 32px;
            }
            .card {
                max-width: 720px;
                width: 100%;
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(15, 23, 42, 0.08);
                border-radius: 24px;
                padding: 32px;
                box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
                backdrop-filter: blur(10px);
                text-align: center;
            }
            .title {
                font-size: 28px;
                font-weight: 700;
                margin: 16px 0 6px;
            }
            .subtitle {
                color: #64748b;
                margin: 0 0 20px;
            }
            .button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 10px 18px;
                border-radius: 999px;
                background: linear-gradient(90deg, #f59e0b, #f97316);
                color: white;
                font-weight: 700;
                text-decoration: none;
                box-shadow: 0 10px 24px rgba(249, 115, 22, 0.35);
            }
            @media (prefers-color-scheme: dark) {
                body {
                    background: #0b0f17;
                    color: #e2e8f0;
                }
                .card {
                    background: rgba(15, 23, 42, 0.8);
                    border-color: rgba(148, 163, 184, 0.15);
                }
                .subtitle {
                    color: #94a3b8;
                }
            }
        </style>
    </head>
    <body>
        <div class="wrap">
            <div class="card">
                <img
                    src="{{ asset('svg/2133694.svg') }}"
                    alt="Server error"
                    style="max-width: 320px; width: 100%; height: auto"
                />
                <div class="title">Something went wrong</div>
                <p class="subtitle">
                    A server error occurred. Please try again or return home.
                </p>
                <a class="button" href="{{ url('/') }}">Back to home</a>
            </div>
        </div>
    </body>
</html>
