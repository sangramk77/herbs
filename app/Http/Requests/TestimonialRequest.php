<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class TestimonialRequest extends FormRequest
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
        $testimonialId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:100'],
            'designation' => ['nullable', 'string', 'max:100'],
            'description' => ['required', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'status' => ['nullable', 'boolean'],
            'seo_url' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                $testimonialId ? 'unique:testimonials,seo_url,'.$testimonialId.',_id' : 'unique:testimonials,seo_url',
            ],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_keyword' => ['nullable', 'string'],
            'meta_description' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'name',
            'designation' => 'designation',
            'description' => 'description',
            'image' => 'image',
            'status' => 'status',
            'seo_url' => 'SEO URL',
            'meta_title' => 'meta title',
            'meta_keyword' => 'meta keywords',
            'meta_description' => 'meta description',
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
            'name.required' => 'The name field is required.',
            'description.required' => 'The description field is required.',
            'image.image' => 'The image must be an image file.',
            'image.mimes' => 'The image must be a JPG or PNG file.',
            'image.max' => 'The image may not be greater than 2MB.',
            'seo_url.regex' => 'The SEO URL must be lowercase letters, numbers, and hyphens only.',
            'seo_url.unique' => 'This SEO URL is already in use.',
        ];
    }
}
