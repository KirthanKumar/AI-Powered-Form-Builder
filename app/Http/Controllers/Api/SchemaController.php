<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Gate;
use App\Http\Controllers\Controller;
use App\Services\SchemaService;
use App\Http\Requests\AddSectionRequest;
use App\Http\Resources\FormVersionResource;
use App\Models\Form;
use App\Http\Requests\AddFieldRequest;
use App\Http\Requests\UpdateFieldRequest;
use App\Http\Requests\RenameSectionRequest;
use Illuminate\Http\Request;
use App\Http\Requests\MoveFieldRequest;

class SchemaController extends Controller
{
    public function __construct(protected SchemaService $schemaService) {}

    public function addSection(AddSectionRequest $request, Form $form): FormVersionResource
    {
        Gate::authorize('update', $form);
        return new FormVersionResource(
            $this->schemaService->addSection($form, $request->user(), $request->string('title')->toString())
        );
    }

    public function renameSection(RenameSectionRequest $request, Form $form, string $sectionId): FormVersionResource
    {
        Gate::authorize('update', $form);

        return new FormVersionResource(
            $this->schemaService->renameSection(
                $form,
                $request->user(),
                $sectionId,
                $request->string('title')->toString()
            )
        );
    }

    public function deleteSection(Request $request, Form $form, string $sectionId): FormVersionResource
    {
        Gate::authorize('update', $form);

        return new FormVersionResource(
            $this->schemaService->deleteSection(
                $form,
                $request->user(),
                $sectionId
            )
        );
    }

    public function addField(AddFieldRequest $request, Form $form, string $sectionId): FormVersionResource
    {
        Gate::authorize('update', $form);
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
        Gate::authorize('update', $form);
        return new FormVersionResource(
            $this->schemaService->updateField(
                $form,
                $request->user(),
                $fieldId,
                $request->validated()
            )
        );
    }

    public function deleteField(Request $request, Form $form, string $fieldId): FormVersionResource
    {
        Gate::authorize('update', $form);

        return new FormVersionResource(
            $this->schemaService->deleteField(
                $form,
                $request->user(),
                $fieldId
            )
        );
    }

    public function duplicateField(Request $request, Form $form, string $fieldId): FormVersionResource
    {
        Gate::authorize('update', $form);

        return new FormVersionResource(
            $this->schemaService->duplicateField(
                $form,
                $request->user(),
                $fieldId
            )
        );
    }

    public function moveField(MoveFieldRequest $request, Form $form, string $sectionId): FormVersionResource
    {
        Gate::authorize('update', $form);

        return new FormVersionResource(
            $this->schemaService->moveField(
                $form,
                $request->user(),
                $sectionId,
                $request->integer('from'),
                $request->integer('to')
            )
        );
    }

    public function schema(Request $request, Form $form): FormVersionResource
    {
        Gate::authorize('view', $form);

        return new FormVersionResource(
            $form->currentVersion()->firstOrFail()
        );
    }
}
