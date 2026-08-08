<?php

namespace App\Services;

use App\Models\User;
use App\Models\Form;
use App\Schema\DefaultSchema;
use Illuminate\Validation\ValidationException;

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

    public function publish(Form $form): Form
    {
        if ($form->status === Form::STATUS_PUBLISHED) {
            return $form;
        }

        if (! $form->current_version_id) {
            throw ValidationException::withMessages([
                'form' => 'The form does not have a version to publish.',
            ]);
        }

        $form->update([
            'status' => Form::STATUS_PUBLISHED,
            'published_at' => now(),
        ]);

        return $form->fresh('currentVersion');
    }

    public function unpublish(Form $form): Form
    {
        if ($form->status !== Form::STATUS_PUBLISHED) {
            return $form;
        }

        $form->update([
            'status' => Form::STATUS_DRAFT,
            'published_at' => null,
        ]);

        return $form->fresh('currentVersion');
    }
}
