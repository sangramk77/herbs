<?php

declare(strict_types=1);

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectIfAdmin;
use App\Http\Middleware\RedirectIfUser;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->redirectGuestsTo(function (Request $request): string {
            return $request->is('admin') || $request->is('admin/*')
                ? route('admin.login')
                : route('login');
        });

        $middleware->redirectUsersTo(function (Request $request): string {
            return $request->is('admin') || $request->is('admin/*')
                ? route('admin.dashboard')
                : route('dashboard');
        });

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->validateCsrfTokens(except: [
            'payment/webhook',
        ]);

        // Register middleware aliases
        $middleware->alias([
            'role' => CheckRole::class,
            'admin' => EnsureUserIsAdmin::class,
            'redirect.if.admin' => RedirectIfAdmin::class,
            'redirect.if.user' => RedirectIfUser::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
