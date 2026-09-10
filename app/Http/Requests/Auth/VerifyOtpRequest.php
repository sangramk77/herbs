<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

final class VerifyOtpRequest extends FormRequest
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'digits:10'],
            'otp' => ['required', 'string', 'digits:6'],
            'redirect' => ['nullable', 'string', 'starts_with:/', 'not_regex:/^\\/\\//'],
        ];
    }
}
