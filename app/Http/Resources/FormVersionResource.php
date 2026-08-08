<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormVersionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'version_number' => $this->version_number,
            'schema' => $this->schema_json,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at,
            'form' => [
                'id' => $this->form->id,
                'uuid' => $this->form->uuid,
                'title' => $this->form->title,
                'status' => $this->form->status,
                'published_at' => $this->form->published_at,
            ],
        ];
    }
}
