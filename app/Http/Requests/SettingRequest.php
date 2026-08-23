<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class SettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [];

        // General Settings Validation
        if ($this->has('phone')) {
            $rules['phone'] = ['required', 'string', 'max:20', 'regex:/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/'];
        }

        if ($this->has('phone2')) {
            $rules['phone2'] = ['nullable', 'string', 'max:20', 'regex:/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/'];
        }

        if ($this->has('email')) {
            $rules['email'] = ['nullable', 'email', 'max:255'];
        }

        if ($this->has('email2')) {
            $rules['email2'] = ['nullable', 'email', 'max:255'];
        }

        if ($this->has('address')) {
            $rules['address'] = ['nullable', 'string'];
        }

        if ($this->has('cod_charge')) {
            $rules['cod_charge'] = ['required', 'integer', 'min:0'];
        }

        // Social Media Links Validation
        if ($this->has('facebook_link')) {
            $rules['facebook_link'] = ['nullable', 'url', 'max:255'];
        }

        if ($this->has('twitter_link')) {
            $rules['twitter_link'] = ['nullable', 'url', 'max:255'];
        }

        if ($this->has('instagram_link')) {
            $rules['instagram_link'] = ['nullable', 'url', 'max:255'];
        }

        if ($this->has('youtube_link')) {
            $rules['youtube_link'] = ['nullable', 'url', 'max:255'];
        }

        // Counter Settings Validation
        if ($this->has('active_clients')) {
            $rules['active_clients'] = ['nullable', 'integer', 'min:0'];
        }

        if ($this->has('varieties_of_rudraksha')) {
            $rules['varieties_of_rudraksha'] = ['nullable', 'integer', 'min:0'];
        }

        if ($this->has('active_products')) {
            $rules['active_products'] = ['nullable', 'integer', 'min:0'];
        }

        if ($this->has('country_cover')) {
            $rules['country_cover'] = ['nullable', 'integer', 'min:0'];
        }

        if ($this->has('header_scripts')) {
            $rules['header_scripts'] = [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    $items = array_filter(
                        array_map(trim(...), explode(',', (string) $value)),
                        fn ($item) => $item !== ''
                    );
                    foreach ($items as $item) {
                        if (! preg_match('/^https?:\/\//i', $item)) {
                            $fail('Header scripts must be http/https URLs.');
                            break;
                        }
                    }
                },
            ];
        }

        if ($this->has('footer_scripts')) {
            $rules['footer_scripts'] = [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    $items = array_filter(
                        array_map(trim(...), explode(',', (string) $value)),
                        fn ($item) => $item !== ''
                    );
                    foreach ($items as $item) {
                        if (! preg_match('/^https?:\/\//i', $item)) {
                            $fail('Footer scripts must be http/https URLs.');
                            break;
                        }
                    }
                },
            ];
        }

        return $rules;
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'phone' => 'phone number',
            'phone2' => 'secondary phone number',
            'email' => 'email address',
            'email2' => 'secondary email address',
            'address' => 'address',
            'cod_charge' => 'COD delivery charge',
            'facebook_link' => 'Facebook link',
            'twitter_link' => 'Twitter link',
            'instagram_link' => 'Instagram link',
            'youtube_link' => 'YouTube link',
            'active_clients' => 'active clients',
            'varieties_of_rudraksha' => 'varieties of rudraksha',
            'active_products' => 'active products',
            'country_cover' => 'country cover',
            'header_scripts' => 'header scripts',
            'footer_scripts' => 'footer scripts',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.required' => 'The phone number is required.',
            'phone.regex' => 'The phone number format is invalid. Example: +91 9437 060 170',
            'phone2.regex' => 'The secondary phone number format is invalid.',
            'email.email' => 'The email address must be a valid email.',
            'email2.email' => 'The secondary email address must be a valid email.',
            'cod_charge.required' => 'The COD delivery charge is required.',
            'cod_charge.integer' => 'The COD delivery charge must be a whole number.',
            'cod_charge.min' => 'The COD delivery charge must be at least 0.',
            'active_clients.integer' => 'Active clients must be a number.',
            'active_clients.min' => 'Active clients must be at least 0.',
            'varieties_of_rudraksha.integer' => 'Varieties of rudraksha must be a number.',
            'varieties_of_rudraksha.min' => 'Varieties of rudraksha must be at least 0.',
            'active_products.integer' => 'Active products must be a number.',
            'active_products.min' => 'Active products must be at least 0.',
            'country_cover.integer' => 'Country cover must be a number.',
            'country_cover.min' => 'Country cover must be at least 0.',
            'header_scripts.string' => 'Header scripts must be text.',
            'footer_scripts.string' => 'Footer scripts must be text.',
        ];
    }
}
