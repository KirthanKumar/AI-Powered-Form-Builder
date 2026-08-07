<?php

namespace App\Schema;

use InvalidArgumentException;
use App\Schema\FieldFactory;

class SchemaValidator
{
    public function validate(array $schema): void
    {
        if (! isset($schema['schema_version'])) {
            throw new InvalidArgumentException('Schema version is missing.');
        }

        if (! is_int($schema['schema_version'])) {
            throw new InvalidArgumentException('Schema version must be an integer.');
        }

        if (! isset($schema['sections'])) {
            throw new InvalidArgumentException('Schema sections are missing.');
        }

        if (! is_array($schema['sections'])) {
            throw new InvalidArgumentException('Sections must be an array.');
        }

        foreach ($schema['sections'] as $section) {
            if (! isset($section['id'], $section['title'], $section['fields'])) {
                throw new InvalidArgumentException('Invalid section structure.');
            }

            if (! is_array($section['fields'])) {
                throw new InvalidArgumentException('Section fields must be an array.');
            }

            foreach ($section['fields'] as $field) {
                if (! isset($field['type'])) {
                    throw new InvalidArgumentException('Field type is missing.');
                }

                if (! in_array($field['type'], FieldFactory::SUPPORTED_TYPES, true)) {
                    throw new InvalidArgumentException('Unsupported field type.');
                }

                if (! isset($field['id'])) {
                    throw new InvalidArgumentException('Field ID is missing.');
                }

                if (! isset($field['key'])) {
                    throw new InvalidArgumentException('Field key is missing.');
                }

                if (! isset($field['label'])) {
                    throw new InvalidArgumentException('Field label is missing.');
                }
            }
        }
    }
}
