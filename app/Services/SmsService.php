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

        $normalisedPhone = $this->normalisePhone($phone);

        if ($normalisedPhone === '') {
            Log::warning('[SmsService] SMS not sent because the phone number is invalid.', ['phone' => $phone]);

            return false;
        }

        try {
            $response = Http::timeout(15)->acceptJson()->get($baseUrl, array_filter([
                'apikey' => $apiKey,
                'senderid' => $senderId,
                'number' => $normalisedPhone,
                'message' => $message,
                'templateid' => $options['templateid'] ?? null,
                'format' => 'json',
            ]));

            $payload = $response->json();
            $providerAccepted = is_array($payload)
                && (mb_strtolower((string) ($payload['status'] ?? '')) === 'success'
                    || (string) ($payload['code'] ?? '') === '011');

            if (! $response->successful() || ! $providerAccepted) {
                Log::warning('[SmsService] SMS provider rejected delivery.', [
                    'phone' => $normalisedPhone,
                    'http_status' => $response->status(),
                    'response' => $payload,
                ]);
            }

            return $response->successful() && $providerAccepted;
        } catch (Throwable $exception) {
            Log::error('[SmsService] SMS delivery failed.', ['phone' => $normalisedPhone, 'error' => $exception->getMessage()]);

            return false;
        }
    }

    private function normalisePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone) ?? '';

        if (str_starts_with($digits, '91') && mb_strlen($digits) === 12) {
            return mb_substr($digits, 2);
        }

        if (str_starts_with($digits, '0') && mb_strlen($digits) === 11) {
            return mb_substr($digits, 1);
        }

        return $digits;
    }
}
