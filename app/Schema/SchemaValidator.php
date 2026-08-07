<?php

namespace App\Schema;

use InvalidArgumentException;
use App\Schema\FieldFactory;

class SchemaValidator
{
    public function validate(array $schema): void
    {
        if (! isset($schema['version'])) {
            throw new InvalidArgumentException('Schema version is missing.');
        }

        if (! isset($schema['sections'])) {
            throw new InvalidArgumentException('Schema sections are missing.');
        }

        if (! is_array($schema['sections'])) {
            throw new InvalidArgumentException('Sections must be an array.');
        }

        foreach ($schema['sections'] as $section) {
            foreach ($section['fields'] as $field) {
                if (! in_array($field['type'], FieldFactory::SUPPORTED_TYPES, true)) {
                    throw new InvalidArgumentException("Unsupported field type.");
                }
                if (! isset($field['id'])) {
                    throw new InvalidArgumentException("Field ID is missing.");
                }

                if (! isset($field['key'])) {
                    throw new InvalidArgumentException("Field key is missing.");
                }

                if (! isset($field['label'])) {
                    throw new InvalidArgumentException("Field label is missing.");
                }
            }
        }
    }
}
