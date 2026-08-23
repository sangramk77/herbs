<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PasswordChangeRequest;
use App\Http\Requests\ProfileRequest;
use App\Services\ImageService;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

final class ProfileController extends Controller
{
    public function __construct(
        private readonly ImageService $imageService
    ) {}

    /**
     * Display the admin profile page.
     */
    public function show(): Response
    {
        $user = Auth::user();

        // Get profile statistics
        $blogsCount = \App\Models\Blog::where('created_by', $user->id)->count();
        $testimonialsCount = \App\Models\Testimonial::where('created_by', $user->id)->count();

        return Inertia::render('admin/Profile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'last_login_at' => $user->last_login_at?->diffForHumans(),
                'created_at' => $user->created_at?->format('M d, Y'),
            ],
            'stats' => [
                'blogs_count' => $blogsCount,
                'testimonials_count' => $testimonialsCount,
            ],
        ]);
    }

    /**
     * Update the admin profile.
     */
    public function update(ProfileRequest $request)
    {
        try {
            $user = Auth::user();
            $data = $request->validated();

            // Handle avatar upload
            if ($request->hasFile('avatar')) {
                // Delete old avatar if exists
                if ($user->avatar) {
                    $this->imageService->deleteAvatar($user->avatar);
                }

                // Upload new avatar
                $data['avatar'] = $this->imageService->uploadAvatar(
                    $request->file('avatar'),
                    (string) $user->id
                );
            } elseif ($request->boolean('remove_avatar')) {
                if ($user->avatar) {
                    $this->imageService->deleteAvatar($user->avatar);
                }

                $data['avatar'] = null;
            }

            // Update user profile
            $user->update([
                'name' => $data['name'],
                'avatar' => array_key_exists('avatar', $data) ? $data['avatar'] : $user->avatar,
            ]);

            return redirect()
                ->back()
                ->with('success', 'Profile updated successfully');
        } catch (Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to update profile: '.$e->getMessage());
        }
    }

    /**
     * Change the admin password.
     */
    public function changePassword(PasswordChangeRequest $request)
    {
        try {
            $user = Auth::user();
            $data = $request->validated();

            // Update password
            $user->update([
                'password' => Hash::make($data['password']),
            ]);

            return redirect()
                ->back()
                ->with('success', 'Password changed successfully');
        } catch (Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to change password: '.$e->getMessage());
        }
    }
}
