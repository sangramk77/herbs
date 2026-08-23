<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final class AdminAuthController extends Controller
{
    /**
     * Display the admin login form.
     */
    public function showLoginForm(): Response
    {
        return Inertia::render('admin/auth/AdminLogin');
    }

    /**
     * Handle an admin login request.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $throttleKey = Str::transliterate(Str::lower($request->string('email')).'|'.$request->ip());
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            throw ValidationException::withMessages([
                'email' => __('Too many login attempts. Please try again in :seconds seconds.', [
                    'seconds' => $seconds,
                ]),
            ]);
        }

        // Attempt to authenticate using the admin guard
        if (! Auth::guard('admin')->attempt(
            $request->only('email', 'password'),
            $request->boolean('remember')
        )) {
            RateLimiter::hit($throttleKey, 60);

            throw ValidationException::withMessages([
                'email' => __('These credentials do not match our records.'),
            ]);
        }

        RateLimiter::clear($throttleKey);

        $user = Auth::guard('admin')->user();

        // Check if user has admin access
        if (! $user->hasAdminAccess()) {
            Auth::guard('admin')->logout();

            throw ValidationException::withMessages([
                'email' => __('You do not have permission to access the admin panel.'),
            ]);
        }

        // Check if admin account is active
        if (! $user->is_active) {
            Auth::guard('admin')->logout();

            throw ValidationException::withMessages([
                'email' => __('Your account has been deactivated. Please contact support for assistance.'),
            ]);
        }

        // Update last login timestamp
        $user->updateLastLogin();

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'));
    }

    /**
     * Log the admin out.
     */
    public function logout(Request $request)
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
