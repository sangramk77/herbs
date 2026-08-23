<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\ImageService;
use Exception;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

final class ProfileController extends Controller
{
    public function __construct(
        private readonly ImageService $imageService,
    ) {}

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // Handle avatar upload/remove separately from fill().
        if ($request->hasFile('avatar')) {
            try {
                if ($user->avatar) {
                    $this->imageService->deleteAvatar($user->avatar);
                }

                $user->avatar = $this->imageService->uploadAvatar(
                    $request->file('avatar'),
                    (string) $user->id
                );
            } catch (Exception $e) {
                Log::error('Failed to update user avatar', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        } elseif ($request->boolean('remove_avatar')) {
            try {
                if ($user->avatar) {
                    $this->imageService->deleteAvatar($user->avatar);
                }
                $user->avatar = null;
            } catch (Exception $e) {
                Log::error('Failed to remove user avatar', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        unset($data['avatar'], $data['remove_avatar']);
        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
