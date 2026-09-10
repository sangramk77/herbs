<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\SendOtpSms;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

final class OtpService
{
    private const OTP_TTL = 120;

    private const MAX_ATTEMPTS = 3;

    public function sendOtp(string $phone): bool
    {
        $otp = mb_str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Redis::setex('otp:'.$phone, self::OTP_TTL, hash('sha256', $otp));
        Redis::del('otp_attempts:'.$phone);

        if (! app()->isProduction()) {
            Log::info("OTP for {$phone}: {$otp}");
        }

        SendOtpSms::dispatch($phone, $otp);

        return true;
    }

    public function verifyOtp(string $phone, string $otp): bool
    {
        $key = 'otp:'.$phone;
        $attemptsKey = 'otp_attempts:'.$phone;
        $storedHash = Redis::get($key);

        if (! $storedHash) {
            return false;
        }

        $attempts = (int) Redis::incr($attemptsKey);
        Redis::expire($attemptsKey, self::OTP_TTL);
        if ($attempts > self::MAX_ATTEMPTS) {
            Redis::del($key, $attemptsKey);

            return false;
        }

        if (! hash_equals((string) $storedHash, hash('sha256', $otp))) {
            return false;
        }

        Redis::del($key, $attemptsKey);

        return true;
    }
}
