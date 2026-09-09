<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $unitId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:50', Rule::unique('units', 'name')->ignore($unitId, '_id')],
            'symbol' => ['required', 'string', 'max:12', Rule::unique('units', 'symbol')->ignore($unitId, '_id')],
            'status' => ['required', 'in:active,inactive'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
