<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class SendOtpSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly string $phone, public readonly string $otp) {}

    public function handle(SmsService $smsService): void
    {
        $smsService->send($this->phone, "Your Herbs login OTP is {$this->otp}. It expires in 2 minutes.", [
            'templateid' => (string) config('services.text2india.templates.otp'),
        ]);
    }
}
