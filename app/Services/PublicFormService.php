<?php

namespace App\Services;

use App\Models\Form;

class PublicFormService
{
    public function getPublishedForm(string $uuid): Form
    {
        return Form::query()
            ->where('uuid', $uuid)
            ->where('status', Form::STATUS_PUBLISHED)
            ->with('currentVersion')
            ->firstOrFail();
    }
}
