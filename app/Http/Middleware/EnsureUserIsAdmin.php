<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('admin');

        if (! $user) {
            return redirect()->route('admin.login');
        }

        if (! $user->hasAdminAccess()) {
            abort(403, 'You do not have permission to access the admin panel.');
        }

        return $next($request);
    }
}
