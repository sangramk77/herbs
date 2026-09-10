<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class CategoryRequest extends FormRequest
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
        $categoryId = $this->route('id');

        $rules = [
            'name' => [
                'required',
                'string',
                'max:255',
                // Unique validation for MongoDB - ignore current category when updating
                Rule::unique('categories', 'name')->ignore($categoryId, '_id'),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:active,inactive'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'show_video' => ['nullable', 'boolean'],
            'show_banner' => ['nullable', 'boolean'],
        ];

        $rules['image'] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'];
        $rules['remove_image'] = ['nullable', 'boolean'];
        $rules['video'] = ['nullable', 'file', 'mimes:mp4,mov,avi,mkv,webm', 'max:102400'];
        $rules['remove_video'] = ['nullable', 'boolean'];
        $rules['banner'] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];
        $rules['remove_banner'] = ['nullable', 'boolean'];

        return $rules;
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'category name',
            'sort_order' => 'display order',
            'video' => 'category video',
            'banner' => 'category banner',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please enter a category name.',
            'name.unique' => 'This category name already exists. Please choose a different name.',
            'status.required' => 'Please select a status.',
            'status.in' => 'Status must be either active or inactive.',
        ];
    }
}
