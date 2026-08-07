<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateFieldRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'string'],
            'key' => ['sometimes', 'string', 'max:255'],
            'label' => ['sometimes', 'string', 'max:255'],
            'placeholder' => ['sometimes', 'nullable', 'string'],
            'help_text' => ['sometimes', 'nullable', 'string'],
            'default' => ['sometimes', 'nullable'],
            'required' => ['sometimes', 'boolean'],
            'options' => ['sometimes', 'array'],
            'validation' => ['sometimes', 'array'],
        ];
    }
}
