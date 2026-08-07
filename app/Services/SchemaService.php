<?php

namespace App\Services;

use App\Models\Form;
use App\Models\FormVersion;
use App\Models\User;
use App\Schema\SchemaEditor;
use App\Schema\SchemaValidator;

class SchemaService
{
    public function __construct(protected SchemaValidator $validator, protected FormVersionService $formVersionService,) {}

    private function editor(Form $form): SchemaEditor
    {
        $currentVersion = $form->currentVersion()->firstOrFail();

        return new SchemaEditor($currentVersion->schema_json);
    }

    private function save(Form $form, User $user, SchemaEditor $editor): FormVersion
    {
        $schema = $editor->getSchema();
        $this->validator->validate($schema);

        return $this->formVersionService->createNextVersion($form, $user, $schema);
    }

    public function addSection(Form $form, User $user, string $title): FormVersion
    {
        $editor = $this->editor($form);
        $editor->addSection($title);

        return $this->save($form, $user, $editor);
    }

    public function renameSection(Form $form, User $user, string $sectionId, string $title): FormVersion
    {
        $editor = $this->editor($form);
        $editor->renameSection($sectionId, $title);

        return $this->save($form, $user, $editor);
    }

    public function deleteSection(Form $form, User $user, string $sectionId): FormVersion
    {
        $editor = $this->editor($form);
        $editor->deleteSection($sectionId);

        return $this->save($form, $user, $editor);
    }

    public function addField(Form $form, User $user, string $sectionId, string $type, string $label): FormVersion
    {
        $editor = $this->editor($form);
        $editor->addField($sectionId, $type, $label);

        return $this->save($form, $user, $editor);
    }

    public function updateField(Form $form, User $user, string $fieldId, array $attributes): FormVersion
    {
        $editor = $this->editor($form);
        $editor->updateField($fieldId, $attributes);

        return $this->save($form, $user, $editor);
    }

    public function deleteField(Form $form, User $user, string $fieldId): FormVersion
    {
        $editor = $this->editor($form);
        $editor->deleteField($fieldId);

        return $this->save($form, $user, $editor);
    }

    public function duplicateField(Form $form, User $user, string $fieldId): FormVersion
    {
        $editor = $this->editor($form);
        $editor->duplicateField($fieldId);

        return $this->save($form, $user, $editor);
    }

    public function moveField(Form $form, User $user, string $sectionId, int $from, int $to): FormVersion
    {
        $editor = $this->editor($form);
        $editor->moveField($sectionId, $from, $to);

        return $this->save($form, $user, $editor);
    }
}
