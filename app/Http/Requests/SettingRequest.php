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

        foreach ([
            'global_meta_title',
            'global_og_title',
            'global_twitter_title',
        ] as $field) {
            if ($this->has($field)) {
                $rules[$field] = ['nullable', 'string', 'max:120'];
            }
        }

        foreach ([
            'global_meta_description',
            'global_og_description',
            'global_twitter_description',
        ] as $field) {
            if ($this->has($field)) {
                $rules[$field] = ['nullable', 'string', 'max:160'];
            }
        }

        if ($this->has('global_meta_keywords')) {
            $rules['global_meta_keywords'] = ['nullable', 'string', 'max:500'];
        }

        foreach (['global_og_image_url', 'global_twitter_image_url'] as $field) {
            if ($this->has($field)) {
                $rules[$field] = ['nullable', 'url', 'max:2048'];
            }
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
            $rules['header_scripts'] = ['nullable', 'string', 'max:100000'];
        }

        if ($this->has('footer_scripts')) {
            $rules['footer_scripts'] = ['nullable', 'string', 'max:100000'];
        }

        if ($this->has('ads_txt')) {
            $rules['ads_txt'] = ['nullable', 'string', 'max:20000'];
        }

        if ($this->has('ticker_text')) {
            $rules['ticker_text'] = ['nullable', 'string', 'max:255'];
        }

        if ($this->has('ticker_enabled')) {
            $rules['ticker_enabled'] = ['boolean'];
        }

        if ($this->has('default_video_1') || $this->hasFile('default_video_1')) {
            $rules['default_video_1'] = ['nullable', 'file', 'mimes:mp4,webm,mov', 'max:102400'];
        }

        if ($this->has('default_video_2') || $this->hasFile('default_video_2')) {
            $rules['default_video_2'] = ['nullable', 'file', 'mimes:mp4,webm,mov', 'max:102400'];
        }

        if ($this->has('homepage_video') || $this->hasFile('homepage_video')) {
            $rules['homepage_video'] = ['nullable', 'file', 'mimes:mp4,webm,mov', 'max:102400'];
        }

        if ($this->has('category_video') || $this->hasFile('category_video')) {
            $rules['category_video'] = ['nullable', 'file', 'mimes:mp4,webm,mov', 'max:102400'];
        }

        if ($this->hasFile('verification_files')) {
            $rules['verification_files'] = ['required', 'array', 'max:10'];
            $rules['verification_files.*'] = ['required', 'file', 'max:1024'];
        }

        if ($this->hasFile('trust_feature_image')) {
            $rules['trust_feature_image'] = ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'];
        }

        if ($this->has('trust_feature_id')) {
            $rules['trust_feature_id'] = ['required', 'string', 'max:80'];
        }

        if ($this->has('filename')) {
            $rules['filename'] = ['required', 'string', 'max:180'];
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
            'global_meta_title' => 'global SEO title',
            'global_meta_description' => 'global SEO description',
            'global_meta_keywords' => 'global SEO keywords',
            'global_og_title' => 'global Open Graph title',
            'global_og_description' => 'global Open Graph description',
            'global_og_image_url' => 'global Open Graph image URL',
            'global_twitter_title' => 'global Twitter title',
            'global_twitter_description' => 'global Twitter description',
            'global_twitter_image_url' => 'global Twitter image URL',
            'active_clients' => 'active clients',
            'varieties_of_rudraksha' => 'varieties of rudraksha',
            'active_products' => 'active products',
            'country_cover' => 'country cover',
            'header_scripts' => 'header scripts',
            'footer_scripts' => 'footer scripts',
            'ads_txt' => 'ads.txt',
            'ticker_text' => 'ticker text',
            'ticker_enabled' => 'ticker status',
            'verification_files' => 'verification files',
            'verification_files.*' => 'verification file',
            'trust_feature_image' => 'trust feature image',
            'trust_feature_id' => 'trust feature',
            'filename' => 'filename',
            'homepage_video' => 'homepage video',
            'category_video' => 'category video',
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
            'ads_txt.max' => 'ads.txt content must not exceed 20,000 characters.',
            'ticker_text.max' => 'Ticker text must not exceed 255 characters.',
        ];
    }
}
