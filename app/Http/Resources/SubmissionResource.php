<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'form_id' => $this->form_id,
            'form_version_id' => $this->form_version_id,
            'submission' => $this->submission_json,
            'submitted_email' => $this->submitted_email,
            'submitted_at' => $this->created_at,
            'form_version' => [
                'id' => $this->formVersion?->id,
                'version_number' => $this->formVersion?->version_number,
                'schema' => $this->formVersion?->schema_json,
            ],
        ];
    }
}
