<?php

namespace App\Services;

use App\Models\User;
use App\Models\Form;
use App\Schema\DefaultSchema;

class FormService
{
    public function __construct(protected FormVersionService $formVersionService) {}

    public function create(User $user, string $title, ?string $description = null): Form
    {
        $form = Form::create([
            'user_id' => $user->id,
            'title' => $title,
            'description' => $description,
            'status' => Form::STATUS_DRAFT,
        ]);
        $this->formVersionService->createInitialVersion($form, $user, DefaultSchema::make($title));
        $form->load('currentVersion');
        return $form;
    }
}
