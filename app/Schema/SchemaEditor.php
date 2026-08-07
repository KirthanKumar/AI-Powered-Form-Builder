<?php

namespace App\Schema;

use Illuminate\Support\Str;

class SchemaEditor
{
    public function __construct(protected array $schema) {}

    public function getSchema(): array
    {
        return $this->schema;
    }

    public function addSection(string $title): void
    {
        $this->schema['sections'][] = [
            'id' => (string) Str::uuid(),
            'title' => $title,
            'fields' => [],
        ];
    }

    public function renameSection(string $sectionId, string $title): void
    {
        foreach ($this->schema['sections'] as &$section) {
            if ($section['id'] === $sectionId) {
                $section['title'] = $title;
                return;
            }
        }
    }

    public function deleteSection(string $sectionId): void
    {
        $this->schema['sections'] = array_values(
            array_filter($this->schema['sections'], fn($section) => $section['id'] !== $sectionId)
        );
    }

    public function addField(string $sectionId, string $type, string $label): void
    {
        foreach ($this->schema['sections'] as &$section) {
            if ($section['id'] !== $sectionId) {
                continue;
            }

            $section['fields'][] = FieldFactory::make($type, $label);

            return;
        }
    }

    public function updateField(string $fieldId, array $attributes): void
    {
        unset(
            $attributes['id']
        );
        foreach ($this->schema['sections'] as &$section) {
            foreach ($section['fields'] as &$field) {
                if ($field['id'] !== $fieldId) {
                    continue;
                }

                $field = array_replace_recursive($field, $attributes);

                return;
            }
        }
    }

    public function deleteField(string $fieldId): void
    {
        foreach ($this->schema['sections'] as &$section) {
            $section['fields'] = array_values(
                array_filter($section['fields'], fn($field) => $field['id'] !== $fieldId)
            );
        }
    }

    public function duplicateField(string $fieldId): void
    {
        foreach ($this->schema['sections'] as &$section) {
            foreach ($section['fields'] as $index => $field) {
                if ($field['id'] !== $fieldId) {
                    continue;
                }

                $copy = $field;
                $copy['id'] = (string) Str::uuid();
                $copy['key'] .= '_' . Str::lower(Str::random(6));
                array_splice($section['fields'], $index + 1, 0, [$copy]);

                return;
            }
        }
    }

    public function moveField(string $sectionId, int $from, int $to): void
    {
        foreach ($this->schema['sections'] as &$section) {
            if ($section['id'] !== $sectionId) {
                continue;
            }
            if (! isset($section['fields'][$from]) || $to < 0 || $to >= count($section['fields'])) {
                return;
            }

            $field = $section['fields'][$from];
            array_splice($section['fields'], $from, 1);
            array_splice($section['fields'], $to, 0, [$field]);

            return;
        }
    }
}
