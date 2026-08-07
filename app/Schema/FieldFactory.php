<?php

namespace App\Schema;

use Illuminate\Support\Str;
use InvalidArgumentException;

class FieldFactory
{
    public const SUPPORTED_TYPES = [
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

    public static function make(string $type, string $label): array
    {
        if (! in_array($type, self::SUPPORTED_TYPES)) {
            throw new InvalidArgumentException("Unsupported field type: {$type}");
        }

        return [
            'id' => (string) Str::uuid(),
            'type' => $type,
            'key' => Str::snake($label),
            'label' => $label,
            'placeholder' => '',
            'help_text' => '',
            'default' => null,
            'required' => false,
            'options' => self::defaultOptions($type),
            'validation' => self::defaultValidation($type),
        ];
    }

    private static function defaultOptions(string $type): array
    {
        return match ($type) {
            'dropdown', 'radio', 'checkbox' => [],
            default => [],
        };
    }

    private static function defaultValidation(string $type): array
    {
        return match ($type) {
            'email' => [
                'email' => true,
            ],

            'number' => [
                'numeric' => true,
                'min' => null,
                'max' => null,
            ],

            'file' => [
                'types' => [],
                'max_size' => null,
            ],

            default => [],
        };
    }
}
