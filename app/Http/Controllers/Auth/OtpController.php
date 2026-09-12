<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CompleteOtpProfileRequest;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Jobs\SendWelcomeEmail;
use App\Jobs\SendWelcomeSms;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Throwable;

/** Customer-only mobile OTP authentication. Admins retain password login. */
final class OtpController extends Controller
{
    public function __construct(private readonly OtpService $otpService) {}

    public function send(SendOtpRequest $request): JsonResponse
    {
        $phone = $request->validated('phone');
        $key = 'otp_send:'.$request->ip().':'.$phone;

        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json(['success' => false, 'message' => 'Too many requests. Please try again in '.RateLimiter::availableIn($key).' seconds.'], 429);
        }

        RateLimiter::hit($key, 600);
        $this->otpService->sendOtp($phone);

        return response()->json(['success' => true, 'message' => 'OTP sent to your mobile number.', 'expires_in' => 120]);
    }

    public function resend(SendOtpRequest $request): JsonResponse
    {
        return $this->send($request);
    }

    public function verify(VerifyOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $phone = $validated['phone'];
        $key = 'otp_verify:'.$request->ip().':'.$phone;

        if (RateLimiter::tooManyAttempts($key, 10)) {
            return response()->json(['success' => false, 'message' => 'Too many attempts. Please request a new OTP.'], 429);
        }

        RateLimiter::hit($key, 120);
        if (! $this->otpService->verifyOtp($phone, $validated['otp'])) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired OTP. Please try again.'], 422);
        }

        RateLimiter::clear($key);
        $user = User::query()
            ->where('phone', $phone)
            ->where('role', User::ROLE_USER)
            ->first();

        if ($user && ! $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'This account has been deactivated. Please contact support for assistance.',
            ], 403);
        }

        $isNewUser = $user === null;

        if ($isNewUser) {
            $user = User::query()->create([
                'phone' => $phone,
                'name' => 'Customer '.Str::upper(Str::random(6)),
                'email' => null,
                'role' => User::ROLE_USER,
                'is_active' => true,
                'phone_verified_at' => now(),
                'email_verified_at' => now(),
            ]);

            try {
                SendWelcomeSms::dispatch($user);
            } catch (Throwable $exception) {
                report($exception);
            }
        } else {
            $user->update([
                'phone_verified_at' => now(),
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);
        }

        Auth::login($user, remember: true);
        $request->session()->regenerate();
        $request->session()->put('show_confetti_login', true);

        return response()->json([
            'success' => true,
            'message' => $isNewUser ? 'Account created successfully!' : 'Welcome back!',
            'is_new_user' => $isNewUser,
            'redirect' => $validated['redirect'] ?? route('dashboard', absolute: false),
            'csrf_token' => csrf_token(),
        ]);
    }

    public function completeProfile(CompleteOtpProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $hadEmail = filled($user->email);
        $user->update($request->validated());

        if (! $hadEmail && filled($user->email)) {
            try {
                SendWelcomeEmail::dispatch($user->fresh());
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return response()->json(['success' => true, 'message' => 'Profile completed successfully.']);
    }
}
