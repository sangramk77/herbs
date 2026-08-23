<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class PasswordResetLinkController extends Controller
{
    /**
     * Handle an incoming password reset link request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Rate limit: 1 request per minute per email
        $key = 'password-reset:'.Str::lower($request->input('email'));

        if (RateLimiter::tooManyAttempts($key, 1)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'email' => "Please wait {$seconds} seconds before requesting another password reset link.",
            ]);
        }

        // Always send the password reset link, even if email doesn't exist
        // This prevents email enumeration attacks
        Password::sendResetLink(
            $request->only('email')
        );

        // Hit the rate limiter (60 seconds = 1 minute)
        RateLimiter::hit($key, 60);

        // Always return success message for security
        return back()->with('status', 'If an account exists with that email, you will receive a password reset link shortly.');
    }
}
