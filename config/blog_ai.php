<?php

declare(strict_types=1);

return [
    'provider' => env('BLOG_AI_PROVIDER', 'openai'),
    'model' => env('BLOG_AI_MODEL', ''),
    'timeout' => (int) env('BLOG_AI_TIMEOUT', 60),
];
