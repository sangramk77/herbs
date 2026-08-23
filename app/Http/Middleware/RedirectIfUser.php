<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class RedirectIfUser
{
    /**
     * Handle an incoming request.
     *
     * Prevents regular users from accessing admin routes.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isUser()) {
            return redirect()->route('home');
        }

        return $next($request);
    }
}
