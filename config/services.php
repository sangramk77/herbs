<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'text2india' => [
        'base_url' => env('TEXT2INDIA_BASE_URL', 'https://text2india.store/vb/apikey.php'),
        'api_key' => env('TEXT2INDIA_API_KEY'),
        'sender_id' => env('TEXT2INDIA_SENDER_ID'),
        'templates' => [
            'otp' => env('TEXT2INDIA_OTP_TEMPLATE_ID'),
            'welcome' => env('TEXT2INDIA_WELCOME_TEMPLATE_ID'),
            'order_received' => env('TEXT2INDIA_ORDER_RECEIVED_TEMPLATE_ID'),
            'order_confirmed' => env('TEXT2INDIA_ORDER_CONFIRMED_TEMPLATE_ID'),
            'order_shipped' => env('TEXT2INDIA_ORDER_SHIPPED_TEMPLATE_ID'),
            'order_delivered' => env('TEXT2INDIA_ORDER_DELIVERED_TEMPLATE_ID'),
            'order_failed' => env('TEXT2INDIA_ORDER_FAILED_TEMPLATE_ID'),
        ],
    ],

];
