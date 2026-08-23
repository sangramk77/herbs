<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

final class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(): Response
    {
        $customers = User::users()
            ->orderBy('created_at', 'desc')
            ->get(['_id', 'name', 'email', 'created_at'])
            ->map(fn (User $user) => [
                'id' => (string) $user->_id,
                'name' => $user->name,
                'email' => $user->email,
                'registeredAt' => $user->created_at?->toISOString(),
            ]);

        return Inertia::render('admin/Customers', [
            'customers' => $customers,
        ]);
    }
}
