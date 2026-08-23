<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class BannerRequest extends FormRequest
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
        $rules = [
            'heading1' => ['nullable', 'string', 'max:255'],
            'main_heading' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];

        // Image is required only on create
        if ($this->isMethod('post')) {
            $rules['image'] = ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];
            $rules['mobile_image'] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];
        } else {
            // On update, only validate as image if it's actually a file
            // This allows passing empty string or null to keep existing image
            $rules['image'] = ['nullable', 'sometimes', function ($attribute, $value, $fail) {
                // Only validate as image if it's an actual file upload
                if ($value instanceof \Illuminate\Http\UploadedFile) {
                    $validator = \Illuminate\Support\Facades\Validator::make(
                        [$attribute => $value],
                        [$attribute => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120']]
                    );

                    if ($validator->fails()) {
                        $fail($validator->errors()->first($attribute));
                    }
                }
                // If it's a string or null, it's valid (keeping existing image)
            }];
            $rules['mobile_image'] = ['nullable', 'sometimes', function ($attribute, $value, $fail) {
                if ($value instanceof \Illuminate\Http\UploadedFile) {
                    $validator = \Illuminate\Support\Facades\Validator::make(
                        [$attribute => $value],
                        [$attribute => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120']]
                    );

                    if ($validator->fails()) {
                        $fail($validator->errors()->first($attribute));
                    }
                }
            }];
        }

        return $rules;
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'heading1' => 'heading 1',
            'main_heading' => 'main heading',
            'image' => 'banner image',
            'mobile_image' => 'mobile banner image',
            'sort_order' => 'sort order',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'image.required' => 'Please upload a banner image.',
            'image.image' => 'The file must be an image.',
            'image.mimes' => 'Image must be a file of type: jpg, jpeg, png, webp.',
            'image.max' => 'Image size must not exceed 5MB.',
            'mobile_image.image' => 'The mobile banner must be an image.',
            'mobile_image.mimes' => 'Mobile image must be a file of type: jpg, jpeg, png, webp.',
            'mobile_image.max' => 'Mobile image size must not exceed 5MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert status to boolean if present
        if ($this->has('status')) {
            $this->merge(['status' => filter_var($this->status, FILTER_VALIDATE_BOOLEAN)]);
        }

        // Set default sort_order if not provided
        if (! $this->has('sort_order') || $this->sort_order === null) {
            $this->merge(['sort_order' => 0]);
        }
    }
}
