<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

final class SmsService
{
    /** @param array{templateid?: string} $options */
    public function send(string $phone, string $message, array $options = []): bool
    {
        $apiKey = (string) config('services.text2india.api_key');
        $senderId = (string) config('services.text2india.sender_id');
        $baseUrl = (string) config('services.text2india.base_url');

        if ($apiKey === '' || $senderId === '' || $baseUrl === '' || app()->environment('testing')) {
            Log::info('[SmsService] SMS not sent because the provider is not configured.', ['phone' => $phone]);

            return true;
        }

        try {
            $response = Http::timeout(15)->acceptJson()->get($baseUrl, array_filter([
                'apikey' => $apiKey,
                'senderid' => $senderId,
                'number' => $phone,
                'message' => $message,
                'templateid' => $options['templateid'] ?? null,
                'format' => 'json',
            ]));

            return $response->successful();
        } catch (Throwable $exception) {
            Log::error('[SmsService] OTP SMS delivery failed.', ['error' => $exception->getMessage()]);

            return false;
        }
    }
}
