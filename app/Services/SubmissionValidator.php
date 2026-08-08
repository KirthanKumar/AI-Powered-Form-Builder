<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;

class SubmissionValidator
{
    public function validate(array $schema, array $data): void
    {
        $rules = [];

        foreach ($schema['sections'] ?? [] as $section) {
            foreach ($section['fields'] ?? [] as $field) {
                $key = $field['key'] ?? null;

                if (! $key) {
                    continue;
                }

                $rules[$key] = $this->rulesForField($field);
            }
        }

        validator($data, $rules)->validate();
    }

    private function rulesForField(array $field): array
    {
        $rules = [];

        if (($field['required'] ?? false) === true) {
            $rules[] = 'required';
        } else {
            $rules[] = 'nullable';
        }

        return array_merge(
            $rules,
            $this->typeRules($field),
            $this->validationRules($field)
        );
    }

    private function typeRules(array $field): array
    {
        return match ($field['type'] ?? null) {
            'text',
            'textarea',
            'phone' => ['string'],
            'email' => ['string', 'email'],
            'number' => ['numeric'],
            'date' => ['date'],
            'dropdown',
            'radio' => ['string'],
            'checkbox' => ['array'],
            'file' => ['file'],
            'rating' => ['integer'],
            default => [],
        };
    }

    private function validationRules(array $field): array
    {
        $validation = $field['validation'] ?? [];

        return match ($field['type'] ?? null) {
            'text',
            'textarea' => $this->textValidationRules($validation),
            'number' => $this->numberValidationRules($validation),
            'email' => $this->emailValidationRules($validation),
            'dropdown',
            'radio' => $this->choiceValidationRules($field),
            'checkbox' => $this->checkboxValidationRules($field),
            'file' => $this->fileValidationRules($validation),
            'rating' => [
                'min:1',
                'max:5',
            ],

            default => [],
        };
    }

    private function textValidationRules(array $validation): array
    {
        $rules = [];

        if (($validation['min'] ?? null) !== null) {
            $rules[] = 'min:' . $validation['min'];
        }

        if ($validation['max'] ?? null !== null) {
            $rules[] = 'max:' . $validation['max'];
        }

        return $rules;
    }

    private function numberValidationRules(array $validation): array
    {
        $rules = [];

        if (($validation['min'] ?? null) !== null) {
            $rules[] = 'min:' . $validation['min'];
        }

        if ($validation['max'] ?? null !== null) {
            $rules[] = 'max:' . $validation['max'];
        }

        return $rules;
    }

    private function emailValidationRules(array $validation): array
    {
        if (($validation['email'] ?? true) === true) {
            return ['email'];
        }

        return [];
    }

    private function choiceValidationRules(array $field): array
    {
        $options = $field['options'] ?? [];

        if (empty($options)) {
            return [];
        }

        return [
            'in:' . implode(',', $options),
        ];
    }

    private function checkboxValidationRules(array $field): array
    {
        $options = $field['options'] ?? [];

        $rules = [
            'array',
        ];

        if (! empty($options)) {
            $rules[] = 'min:1';
        }

        return $rules;
    }

    private function fileValidationRules(array $validation): array
    {
        $rules = [];

        if (! empty($validation['types'])) {
            $rules[] = 'mimes:' . implode(',', $validation['types']);
        }

        if (($validation['max_size'] ?? null) !== null) {
            $rules[] = 'max:' . $validation['max_size'];
        }

        return $rules;
    }
}
