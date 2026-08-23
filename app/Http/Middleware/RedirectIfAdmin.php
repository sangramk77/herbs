<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class RedirectIfAdmin
{
    /**
     * Handle an incoming request.
     *
     * Prevents admin/super_admin users from accessing regular user routes.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasAdminAccess()) {
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
