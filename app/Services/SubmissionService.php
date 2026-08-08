<?php

namespace App\Services;

use App\Models\Form;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SubmissionService
{
    public function submit(Form $form, array $data, Request $request): Submission
    {
        $version = $form->currentVersion()->firstOrFail();
        $this->validateSubmission($version->schema_json, $data);

        return $form->submissions()->create([
            'form_version_id' => $version->id,
            'submission_json' => $data,
            'submitted_email' => $this->extractEmail(
                $version->schema_json,
                $data
            ),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }

    private function validateSubmission(array $schema, array $data): void
    {
        $errors = [];

        foreach ($schema['sections'] ?? [] as $section) {
            foreach ($section['fields'] ?? [] as $field) {
                $key = $field['key'];
                $value = $data[$key] ?? null;

                if (($field['required'] ?? false) && ($value === null || $value === '')) {
                    $errors[$key] = [
                        'This field is required.'
                    ];

                    continue;
                }

                if ($value === null || $value === '') {
                    continue;
                }

                $this->validateField(
                    $field,
                    $value,
                    $errors
                );
            }
        }

        if (! empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function validateField(array $field, mixed $value, array &$errors): void
    {
        $key = $field['key'];
        $validation = $field['validation'] ?? [];

        switch ($field['type']) {
            case 'email':
                if (($validation['email'] ?? false) && ! filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$key] = [
                        'Please enter a valid email address.'
                    ];
                }

                break;

            case 'number':
                if (($validation['numeric'] ?? false) && ! is_numeric($value)) {
                    $errors[$key] = [
                        'This field must be a number.'
                    ];

                    break;
                }

                if (isset($validation['min']) && $validation['min'] !== null && $value < $validation['min']) {
                    $errors[$key] = [
                        "Value must be at least {$validation['min']}."
                    ];
                }

                if (isset($validation['max']) && $validation['max'] !== null && $value > $validation['max']) {
                    $errors[$key] = [
                        "Value must not exceed {$validation['max']}."
                    ];
                }

                break;

            case 'text':
            case 'textarea':
                $length = mb_strlen((string) $value);

                if (isset($validation['min']) && $validation['min'] !== null && $length < $validation['min']) {
                    $errors[$key] = [
                        "Must be at least {$validation['min']} characters."
                    ];
                }

                if (isset($validation['max']) && $validation['max'] !== null && $length > $validation['max']) {
                    $errors[$key] = [
                        "Must not exceed {$validation['max']} characters."
                    ];
                }

                break;

            case 'dropdown':
            case 'radio':
                $options = $field['options'] ?? [];

                if (! in_array($value, $options, true)) {
                    $errors[$key] = [
                        'Invalid option selected.'
                    ];
                }

                break;

            case 'checkbox':
                if (! is_array($value)) {
                    $errors[$key] = [
                        'Invalid checkbox value.'
                    ];

                    break;
                }

                $options = $field['options'] ?? [];

                foreach ($value as $selected) {
                    if (! in_array($selected, $options, true)) {
                        $errors[$key] = [
                            'Invalid checkbox option selected.'
                        ];

                        break;
                    }
                }

                break;
        }
    }

    private function extractEmail(array $schema, array $data): ?string
    {
        foreach ($schema['sections'] ?? [] as $section) {
            foreach ($section['fields'] ?? [] as $field) {
                if ($field['type'] === 'email' && isset($data[$field['key']])) {
                    return $data[$field['key']];
                }
            }
        }

        return null;
    }
}
