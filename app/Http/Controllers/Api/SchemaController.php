<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SchemaService;

use App\Http\Requests\AddSectionRequest;
use App\Http\Resources\FormVersionResource;
use App\Models\Form;
use App\Http\Requests\AddFieldRequest;
use App\Http\Requests\UpdateFieldRequest;

class SchemaController extends Controller
{
    public function __construct(protected SchemaService $schemaService) {}

    public function addSection(AddSectionRequest $request, Form $form): FormVersionResource
    {
        return new FormVersionResource(
            $this->schemaService->addSection($form, $request->user(), $request->string('title')->toString())
        );
    }

    public function addField(AddFieldRequest $request, Form $form, string $sectionId): FormVersionResource
    {
        return new FormVersionResource(
            $this->schemaService->addField(
                $form,
                $request->user(),
                $sectionId,
                $request->string('type')->toString(),
                $request->string('label')->toString()
            )
        );
    }

    public function updateField(UpdateFieldRequest $request, Form $form, string $fieldId): FormVersionResource
    {
        return new FormVersionResource(
            $this->schemaService->updateField(
                $form,
                $request->user(),
                $fieldId,
                $request->validated()
            )
        );
    }
}
