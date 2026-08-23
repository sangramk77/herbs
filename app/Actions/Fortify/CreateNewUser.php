<?php

declare(strict_types=1);

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

final class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make(
            $input,
            [
                ...$this->profileRules(),
                'phone' => [
                    'required',
                    'string',
                    'regex:/^[6-9][0-9]{9}$/',
                    Rule::unique(User::class, 'phone'),
                ],
                'password' => $this->passwordRules(),
            ],
            [
                'name.required' => 'The name field is required.',
                'name.regex' => 'The name may only contain letters, spaces, dots, and hyphens.',
                'email.required' => 'The email field is required.',
                'email.email' => 'Please enter a valid email address.',
                'email.unique' => 'This email is already registered.',
                'phone.required' => 'The mobile number is required.',
                'phone.regex' => 'The mobile number must be 10 digits starting with 6, 7, 8, or 9.',
                'phone.unique' => 'This mobile number is already registered.',
                'password.required' => 'The password field is required.',
                'password.confirmed' => 'The password confirmation does not match.',
            ],
        )->validate();

        request()->session()->put('show_confetti_register', true);

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'],
            'password' => $input['password'],
        ]);

        // Dispatch welcome email job - wrapped in try-catch to prevent blocking signup
        try {
            \App\Jobs\SendWelcomeEmail::dispatch($user);
        } catch (Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to dispatch welcome email job', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            // Continue with registration even if email dispatch fails
        }

        return $user;
    }
}
