<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Razorpay API Keys
    |--------------------------------------------------------------------------
    |
    | These are the API keys from your Razorpay dashboard.
    | Use test keys for development and live keys for production.
    |
    */

    'key_id' => env('RAZORPAY_KEY_ID'),
    'key_secret' => env('RAZORPAY_KEY_SECRET'),
    'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    |
    | The default currency for Razorpay transactions.
    |
    */

    'currency' => 'INR',

    /*
    |--------------------------------------------------------------------------
    | Company Name
    |--------------------------------------------------------------------------
    |
    | The company name to display in Razorpay checkout.
    |
    */

    'name' => env('APP_NAME', 'Laravel'),
];
