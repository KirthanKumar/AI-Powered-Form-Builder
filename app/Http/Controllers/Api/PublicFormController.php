<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Resources\PublicFormResource;
use App\Models\Form;
use App\Services\SubmissionService;
use Illuminate\Http\JsonResponse;

class PublicFormController extends Controller
{
    public function __construct(protected SubmissionService $submissionService) {}

    public function show(string $uuid): JsonResponse
    {
        $form = Form::query()
            ->where('uuid', $uuid)
            ->where('status', Form::STATUS_PUBLISHED)
            ->with('currentVersion')
            ->firstOrFail();

        return response()->json([
            'data' => new PublicFormResource($form),
        ]);
    }

    public function submit(StoreSubmissionRequest $request, string $uuid): JsonResponse
    {
        $form = Form::query()
            ->where('uuid', $uuid)
            ->where('status', Form::STATUS_PUBLISHED)
            ->with('currentVersion')
            ->firstOrFail();

        $submission = $this->submissionService->submit(
            $form,
            $request->validated('data'),
            $request
        );

        return response()->json([
            'message' => 'Form submitted successfully.',
            'data' => [
                'id' => $submission->id,
            ],
        ], 201);
    }
}
