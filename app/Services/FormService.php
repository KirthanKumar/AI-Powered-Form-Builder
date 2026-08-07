<?php

namespace App\Services;

use App\Models\User;
use App\Models\Form;

class FormService
{
    public function __construct(protected FormVersionService $formVersionService) {}

    private function defaultSchema(): array
    {
        return [
            'schema_version' => 1,
            'sections' => [],
        ];
    }

    public function create(User $user, string $title, ?string $description = null): Form
    {
        $form = Form::create([
            'user_id' => $user->id,
            'title' => $title,
            'description' => $description,
            'status' => Form::STATUS_DRAFT,
        ]);
        $this->formVersionService->createInitialVersion($form, $user, $this->defaultSchema());
        $form->load('currentVersion');
        return $form;
    }
}
