<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class BlogRequest extends FormRequest
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
        $blogId = $this->route('id');

        return [
            'blog_title' => ['required', 'string', 'max:200'],
            'blog_category_id' => ['nullable', 'string'],
            'description' => ['required', 'string'],
            'post_by' => ['nullable', 'string', 'max:100'],
            'meta_title' => ['nullable', 'string', 'max:150'],
            'meta_keyword' => ['nullable', 'string'],
            'meta_description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'banner' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'publish_date' => ['nullable', 'date'],
            'status' => ['nullable', 'boolean'],
            'seo_url' => [
                'nullable',
                'string',
                'max:200',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                $blogId ? 'unique:blogs,seo_url,'.$blogId.',_id' : 'unique:blogs,seo_url',
            ],
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
            'blog_title' => 'blog title',
            'blog_category_id' => 'category',
            'description' => 'description',
            'post_by' => 'author',
            'meta_title' => 'meta title',
            'meta_keyword' => 'meta keywords',
            'meta_description' => 'meta description',
            'thumbnail' => 'thumbnail image',
            'banner' => 'banner image',
            'publish_date' => 'publish date',
            'status' => 'status',
            'seo_url' => 'SEO URL',
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
            'blog_title.required' => 'The blog title field is required.',
            'description.required' => 'The description field is required.',
            'thumbnail.image' => 'The thumbnail must be an image file.',
            'thumbnail.mimes' => 'The thumbnail must be a JPG or PNG file.',
            'thumbnail.max' => 'The thumbnail may not be greater than 2MB.',
            'banner.image' => 'The banner must be an image file.',
            'banner.mimes' => 'The banner must be a JPG or PNG file.',
            'banner.max' => 'The banner may not be greater than 2MB.',
            'seo_url.regex' => 'The SEO URL must be lowercase letters, numbers, and hyphens only.',
            'seo_url.unique' => 'This SEO URL is already in use.',
        ];
    }
}
