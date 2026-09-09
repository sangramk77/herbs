<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class ProductRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,_id'],
            'description' => ['required', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'sell_price' => ['required', 'numeric', 'min:0'],
            'mrp' => ['nullable', 'numeric', 'min:0', 'gte:sell_price'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'sku' => ['nullable', 'string', 'max:100'],
            'meta_title' => ['nullable', 'string', 'max:120'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'meta_keywords' => ['nullable', 'string'],
            'og_title' => ['nullable', 'string', 'max:120'],
            'og_description' => ['nullable', 'string', 'max:160'],
            'twitter_title' => ['nullable', 'string', 'max:120'],
            'twitter_description' => ['nullable', 'string', 'max:160'],
            'videos' => ['nullable', 'array', 'max:2'],
            'videos.*' => ['nullable', 'file', 'mimetypes:video/mp4,video/quicktime,video/webm', 'max:102400'],
            'tags' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive,draft'],
            'is_featured' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'measurement_unit_id' => ['nullable', 'exists:units,_id'],
            'measurement_minimum' => ['nullable', 'numeric', 'gt:0', 'required_with:measurement_unit_id,measurement_maximum,measurement_increment'],
            'measurement_maximum' => ['nullable', 'numeric', 'gte:measurement_minimum', 'required_with:measurement_unit_id,measurement_minimum,measurement_increment'],
            'measurement_increment' => ['nullable', 'numeric', 'gt:0', 'required_with:measurement_unit_id,measurement_minimum,measurement_maximum'],
            'images.*' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'image2' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'image3' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'image4' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];

        // Primary image is required only on create
        if ($this->isMethod('post')) {
            $rules['primary_image'] = ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];
        } else {
            $rules['primary_image'] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'];
        }

        return $rules;
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'primary_image' => 'product image',
            'sell_price' => 'selling price',
            'mrp' => 'MRP',
            'sku' => 'SKU',
            'meta_title' => 'SEO title',
            'meta_description' => 'SEO description',
            'meta_keywords' => 'SEO keywords',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'mrp.gte' => 'MRP must be greater than or equal to selling price.',
            'primary_image.required' => 'Please upload a product image.',
            'primary_image.image' => 'The file must be an image.',
            'primary_image.mimes' => 'Image must be a file of type: jpg, jpeg, png, webp.',
            'primary_image.max' => 'Image size must not exceed 5MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert comma-separated meta keywords to array
        if ($this->has('meta_keywords') && is_string($this->meta_keywords)) {
            $keywords = array_map(trim(...), explode(',', $this->meta_keywords));
            $keywords = array_filter($keywords); // Remove empty values
            $this->merge(['meta_keywords' => $keywords]);
        }

        // Convert comma-separated tags to array
        if ($this->has('tags') && is_string($this->tags)) {
            $tags = array_map(trim(...), explode(',', $this->tags));
            $tags = array_filter($tags);
            $this->merge(['tags' => $tags]);
        }

        // Convert is_featured to boolean
        if ($this->has('is_featured')) {
            $this->merge(['is_featured' => filter_var($this->is_featured, FILTER_VALIDATE_BOOLEAN)]);
        }

        // Default storefront sort order to 0 when omitted or invalid.
        $sortOrder = is_numeric($this->input('sort_order'))
            ? (int) $this->input('sort_order')
            : null;
        if ($sortOrder === null || $sortOrder < 0) {
            $this->merge(['sort_order' => 0]);
        }
    }
}
