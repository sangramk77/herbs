<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\User;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class SendWelcomeSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly User $user) {}

    public function handle(SmsService $smsService): void
    {
        $phone = (string) ($this->user->phone ?? '');

        if ($phone === '') {
            Log::info('Welcome SMS skipped because the customer has no phone number.', ['user_id' => $this->user->getKey()]);

            return;
        }

        $name = (string) ($this->user->name ?: 'Customer');
        $smsService->send(
            $phone,
            "Dear {$name}, welcome to Herbs. Your account has been created successfully.",
            ['templateid' => (string) config('services.text2india.templates.welcome')],
        );
    }
}
