<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

final class AdminManagementController extends Controller
{
    /**
     * Display a listing of admins.
     */
    public function index(): Response
    {
        $admins = User::admins()
            ->with('creator:_id,name,email')
            ->latest()
            ->get()
            ->map(fn ($admin) => [
                'id' => $admin->_id,
                'name' => $admin->name,
                'email' => $admin->email,
                'is_active' => $admin->is_active,
                'last_login_at' => $admin->last_login_at?->format('Y-m-d H:i:s'),
                'created_at' => $admin->created_at->format('Y-m-d H:i:s'),
                'created_by' => $admin->creator ? [
                    'name' => $admin->creator->name,
                    'email' => $admin->creator->email,
                ] : null,
            ]);

        return Inertia::render('admin/AdminManagement', [
            'admins' => $admins,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new admin.
     */
    public function create(): Response
    {
        return Inertia::render('admin/CreateAdmin');
    }

    /**
     * Store a newly created admin in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class, 'email'),
            ],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_ADMIN,
            'created_by' => $request->user('admin')->_id,
            'is_active' => true,
        ]);

        return redirect()
            ->route('admin.admins.index')
            ->with('success', 'Admin created successfully.');
    }

    /**
     * Show the form for editing the specified admin.
     */
    public function edit(string $id): Response
    {
        $admin = User::admins()->findOrFail($id);

        return Inertia::render('admin/EditAdmin', [
            'admin' => [
                'id' => $admin->_id,
                'name' => $admin->name,
                'email' => $admin->email,
                'is_active' => $admin->is_active,
            ],
        ]);
    }

    /**
     * Update the specified admin in storage.
     */
    public function update(Request $request, string $id)
    {
        $admin = User::admins()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class, 'email')->ignore($id, '_id'),
            ],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'is_active' => ['boolean'],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_active' => $validated['is_active'] ?? $admin->is_active,
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $admin->update($updateData);

        return redirect()
            ->route('admin.admins.index')
            ->with('success', 'Admin updated successfully.');
    }

    /**
     * Remove the specified admin from storage.
     */
    public function destroy(string $id)
    {
        $admin = User::admins()->findOrFail($id);

        // Prevent deleting yourself
        if ($admin->_id === auth('admin')->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $admin->delete();

        return redirect()
            ->route('admin.admins.index')
            ->with('success', 'Admin deleted successfully.');
    }

    /**
     * Toggle admin active status.
     */
    public function toggleStatus(string $id)
    {
        $admin = User::admins()->findOrFail($id);

        // Prevent deactivating yourself
        if ($admin->_id === auth('admin')->id()) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $admin->update(['is_active' => ! $admin->is_active]);

        return back()->with('success', 'Admin status updated successfully.');
    }
}
