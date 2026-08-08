<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiFormGenerator
{
    public function generate(string $prompt): array
    {
        $response = Http::timeout(60)
            ->withToken(config('ai.api_key'))
            ->acceptJson()
            ->post(config('ai.api_url'), [
                'model' => config('ai.model'),
                'temperature' => 0.2,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $this->systemPrompt(),
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException(
                'AI provider request failed: ' .
                    $response->body()
            );
        }

        $content = $response->json(
            'choices.0.message.content'
        );

        if (!is_string($content) || trim($content) === '') {
            throw new RuntimeException(
                'AI provider returned an empty response.'
            );
        }

        $schema = $this->decodeJson($content);

        $this->validateSchema($schema);

        return $schema;
    }

    public function edit(array $currentSchema, string $prompt): array
    {
        $response = Http::timeout(60)
            ->withToken(config('ai.api_key'))
            ->acceptJson()
            ->post(config('ai.api_url'), [
                'model' => config('ai.model'),
                'temperature' => 0.2,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $this->editSystemPrompt(),
                    ],
                    [
                        'role' => 'user',
                        'content' => json_encode([
                            'current_schema' => $currentSchema,
                            'instruction' => $prompt,
                        ], JSON_PRETTY_PRINT),
                    ],
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException(
                'AI provider request failed: ' .
                    $response->body()
            );
        }

        $content = $response->json(
            'choices.0.message.content'
        );

        if (!is_string($content) || trim($content) === '') {
            throw new RuntimeException(
                'AI provider returned an empty response.'
            );
        }

        $schema = $this->decodeJson($content);

        $this->validateSchema($schema);

        return $schema;
    }

    // mocked methods for testing without actual AI calls
    // public function generate(string $prompt): array
    // {
    //     return [
    //         'sections' => [
    //             [
    //                 'id' => (string) \Illuminate\Support\Str::uuid(),
    //                 'title' => 'Personal Information',
    //                 'fields' => [
    //                     [
    //                         'id' => (string) \Illuminate\Support\Str::uuid(),
    //                         'key' => 'full_name',
    //                         'type' => 'text',
    //                         'label' => 'Full Name',
    //                         'default' => null,
    //                         'options' => [],
    //                         'required' => true,
    //                         'help_text' => '',
    //                         'validation' => [],
    //                         'placeholder' => 'Enter your full name',
    //                     ],
    //                     [
    //                         'id' => (string) \Illuminate\Support\Str::uuid(),
    //                         'key' => 'email',
    //                         'type' => 'email',
    //                         'label' => 'Email Address',
    //                         'default' => null,
    //                         'options' => [],
    //                         'required' => true,
    //                         'help_text' => '',
    //                         'validation' => [],
    //                         'placeholder' => 'Enter your email',
    //                     ],
    //                 ],
    //             ],
    //         ],
    //         'schema_version' => 1,
    //     ];
    // }

    // public function edit(array $currentSchema, string $prompt): array
    // {
    //     $schema = $currentSchema;

    //     $normalizedPrompt = strtolower(trim($prompt));

    //     if (str_contains($normalizedPrompt, 'emergency contact')) {
    //         $schema['sections'][] = [
    //             'id' => (string) \Illuminate\Support\Str::uuid(),
    //             'title' => 'Emergency Contact',
    //             'fields' => [
    //                 [
    //                     'id' => (string) \Illuminate\Support\Str::uuid(),
    //                     'key' => 'emergency_contact_name',
    //                     'type' => 'text',
    //                     'label' => 'Emergency Contact Name',
    //                     'default' => null,
    //                     'options' => [],
    //                     'required' => true,
    //                     'help_text' => '',
    //                     'validation' => [],
    //                     'placeholder' => 'Enter emergency contact name',
    //                 ],
    //                 [
    //                     'id' => (string) \Illuminate\Support\Str::uuid(),
    //                     'key' => 'emergency_contact_phone',
    //                     'type' => 'phone',
    //                     'label' => 'Emergency Contact Phone',
    //                     'default' => null,
    //                     'options' => [],
    //                     'required' => true,
    //                     'help_text' => '',
    //                     'validation' => [],
    //                     'placeholder' => 'Enter emergency contact phone',
    //                 ],
    //             ],
    //         ];
    //     } elseif (
    //         str_contains($normalizedPrompt, 'phone') &&
    //         str_contains($normalizedPrompt, 'required')
    //     ) {
    //         foreach ($schema['sections'] as &$section) {
    //             foreach ($section['fields'] as &$field) {
    //                 if (
    //                     $field['type'] === 'phone' ||
    //                     str_contains(
    //                         strtolower($field['key']),
    //                         'phone'
    //                     )
    //                 ) {
    //                     $field['required'] = true;
    //                 }
    //             }
    //         }

    //         unset($section, $field);
    //     } else {
    //         // Mock response for arbitrary prompts.
    //         $schema['sections'][] = [
    //             'id' => (string) \Illuminate\Support\Str::uuid(),
    //             'title' => 'AI Generated Section',
    //             'fields' => [
    //                 [
    //                     'id' => (string) \Illuminate\Support\Str::uuid(),
    //                     'key' => 'ai_generated_field_' . time(),
    //                     'type' => 'text',
    //                     'label' => 'AI Generated Field',
    //                     'default' => null,
    //                     'options' => [],
    //                     'required' => false,
    //                     'help_text' => 'Added by mocked AI response.',
    //                     'validation' => [],
    //                     'placeholder' => 'Enter value',
    //                 ],
    //             ],
    //         ];
    //     }

    //     $this->validateSchema($schema);

    //     return $schema;
    // }

    private function systemPrompt(): string
    {
        return <<<'PROMPT'
        You are an AI form-builder assistant.

        Your task is to convert a natural-language description into a valid form schema.

        Return ONLY valid JSON.
        Do not return markdown.
        Do not wrap the JSON in ```json fences.
        Do not include explanations.

        The JSON must have exactly this top-level structure:

        {
            "sections": [
                {
                    "id": "uuid",
                    "title": "Section title",
                    "fields": [
                        {
                            "id": "uuid",
                            "key": "unique_field_key",
                            "type": "text",
                            "label": "Field label",
                            "default": null,
                            "options": [],
                            "required": false,
                            "help_text": "",
                            "validation": [],
                            "placeholder": ""
                        }
                    ]
                }
            ],
            "schema_version": 1
        }

        Supported field types are:

        text
        textarea
        number
        email
        phone
        date
        dropdown
        radio
        checkbox
        file
        rating

        Rules:

        1. Every field must have a unique id.
        2. Every field must have a unique key.
        3. Every section must have a unique id.
        4. Use only the supported field types.
        5. dropdown, radio and checkbox fields may contain options.
        6. Fields that do not need options must use [].
        7. required must always be boolean.
        8. default must be null or an appropriate default value.
        9. validation must be an array.
        10. placeholder and help_text must be strings.
        11. schema_version must be 1.
        12. Use sensible validation rules based on the requested form.
        13. Use UUID v4 strings for IDs.
        14. Do not invent unsupported field types.
        15. Keep the generated form practical and concise.
        16. Never omit sections or fields that are clearly requested.

        Example:

        {
            "sections": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "title": "Personal Information",
                    "fields": [
                        {
                            "id": "550e8400-e29b-41d4-a716-446655440001",
                            "key": "full_name",
                            "type": "text",
                            "label": "Full Name",
                            "default": null,
                            "options": [],
                            "required": true,
                            "help_text": "",
                            "validation": [],
                            "placeholder": "Enter your full name"
                        }
                    ]
                }
            ],
            "schema_version": 1
        }
        PROMPT;
    }

    private function decodeJson(string $content): array
    {
        $content = trim($content);

        // Handle providers/models that still return fenced JSON.
        $content = preg_replace(
            '/^```(?:json)?\s*|\s*```$/i',
            '',
            $content
        );

        $decoded = json_decode(
            trim($content),
            true
        );

        if (!is_array($decoded)) {
            throw new RuntimeException(
                'AI returned invalid JSON.'
            );
        }

        return $decoded;
    }

    private function validateSchema(array $schema): void
    {
        if (
            !isset($schema['sections']) ||
            !is_array($schema['sections'])
        ) {
            throw new RuntimeException(
                'AI generated schema is missing sections.'
            );
        }

        if (
            ($schema['schema_version'] ?? null) !== 1
        ) {
            throw new RuntimeException(
                'AI generated schema has an unsupported schema version.'
            );
        }

        $supportedTypes = [
            'text',
            'textarea',
            'number',
            'email',
            'phone',
            'date',
            'dropdown',
            'radio',
            'checkbox',
            'file',
            'rating',
        ];

        $fieldKeys = [];

        foreach ($schema['sections'] as $section) {
            if (
                !is_array($section) ||
                empty($section['id']) ||
                empty($section['title']) ||
                !isset($section['fields']) ||
                !is_array($section['fields'])
            ) {
                throw new RuntimeException(
                    'AI generated an invalid section.'
                );
            }

            foreach ($section['fields'] as $field) {
                if (
                    !is_array($field) ||
                    empty($field['id']) ||
                    empty($field['key']) ||
                    empty($field['type']) ||
                    empty($field['label'])
                ) {
                    throw new RuntimeException(
                        'AI generated an invalid field.'
                    );
                }

                if (
                    !in_array(
                        $field['type'],
                        $supportedTypes,
                        true
                    )
                ) {
                    throw new RuntimeException(
                        "Unsupported AI field type: {$field['type']}"
                    );
                }

                if (isset($fieldKeys[$field['key']])) {
                    throw new RuntimeException(
                        "Duplicate field key: {$field['key']}"
                    );
                }

                $fieldKeys[$field['key']] = true;

                if (
                    !isset($field['required']) ||
                    !is_bool($field['required'])
                ) {
                    throw new RuntimeException(
                        "Invalid required value for {$field['key']}."
                    );
                }

                if (
                    !isset($field['options']) ||
                    !is_array($field['options'])
                ) {
                    throw new RuntimeException(
                        "Invalid options for {$field['key']}."
                    );
                }

                if (
                    !isset($field['validation']) ||
                    !is_array($field['validation'])
                ) {
                    throw new RuntimeException(
                        "Invalid validation for {$field['key']}."
                    );
                }
            }
        }
    }

    private function editSystemPrompt(): string
    {
        return <<<'PROMPT'
        You are an AI form-builder assistant.

        Your task is to modify an existing form schema according to a user's instruction.

        You will receive:

        1. The current form schema.
        2. A natural-language instruction describing the requested change.

        Return ONLY the complete updated JSON schema.

        Do not return a patch.
        Do not return only the changed fields.
        Do not return markdown.
        Do not wrap the JSON in ```json fences.
        Do not include explanations.

        The output must have exactly this top-level structure:

        {
            "sections": [
                {
                    "id": "uuid",
                    "title": "Section title",
                    "fields": [
                        {
                            "id": "uuid",
                            "key": "unique_field_key",
                            "type": "text",
                            "label": "Field label",
                            "default": null,
                            "options": [],
                            "required": false,
                            "help_text": "",
                            "validation": [],
                            "placeholder": ""
                        }
                    ]
                }
            ],
            "schema_version": 1
        }

        Supported field types are:

        text
        textarea
        number
        email
        phone
        date
        dropdown
        radio
        checkbox
        file
        rating

        Rules:

        1. Preserve existing sections and fields unless the user's instruction explicitly asks to modify, remove, rename, or replace them.
        2. Preserve existing field IDs when modifying existing fields.
        3. Preserve existing section IDs when modifying existing sections.
        4. New sections must receive unique UUID v4 IDs.
        5. New fields must receive unique UUID v4 IDs.
        6. Every field must have a unique key.
        7. Never create duplicate field keys.
        8. Use only the supported field types.
        9. dropdown, radio and checkbox fields may contain options.
        10. Fields that do not need options must use [].
        11. required must always be boolean.
        12. default must be null or an appropriate default value.
        13. validation must always be an array.
        14. placeholder and help_text must always be strings.
        15. schema_version must always be 1.
        16. Use sensible validation rules based on the user's instruction.
        17. Never invent unsupported field types.
        18. Do not remove existing information unless the user explicitly requests it.
        19. If the instruction says to make a field required, locate the appropriate existing field and change its required value to true.
        20. If the instruction asks to add a section or field, add it while preserving the rest of the form.
        21. If the instruction asks to translate labels, translate the labels while preserving field keys and IDs.
        22. Return the entire resulting schema.

        Examples of valid instructions:

        "Add an emergency contact section."

        "Make the phone number required."

        "Add a dropdown for preferred programming language with PHP, JavaScript and Python as options."

        "Translate all field labels to Hindi."

        "Add a date field for expected joining date."

        The current schema and user instruction will be supplied separately.
        PROMPT;
    }
}
