<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiFormGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;
use App\Models\Form;
use App\Models\FormVersion;
use Illuminate\Support\Facades\DB;

class AiFormController extends Controller
{
    public function generate(Request $request, AiFormGenerator $generator): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => [
                'required',
                'string',
                'min:10',
                'max:5000',
            ],
        ]);

        try {
            $schema = $generator->generate(
                $validated['prompt']
            );

            $user = $request->user();

            $form = DB::transaction(function () use (
                $user,
                $schema,
                $validated
            ) {
                $form = $user->forms()->create([
                    'title' => $this->extractTitle($schema, $validated['prompt']),
                    'description' => 'Generated with AI',
                    'status' => Form::STATUS_DRAFT,
                ]);

                $version = $form->versions()->create([
                    'version_number' => FormVersion::INITIAL_VERSION,
                    'schema_json' => $schema,
                    'schema_hash' => hash(
                        'sha256',
                        json_encode($schema)
                    ),
                    'created_by' => $user->id,
                ]);

                $form->update([
                    'current_version_id' => $version->id,
                ]);

                return $form->fresh('currentVersion');
            });

            return response()->json([
                'message' => 'Form generated successfully.',
                'data' => [
                    'form' => $form,
                ],
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to generate form from AI.',
            ], 422);
        }
    }

    private function extractTitle(array $schema, string $prompt): string
    {
        $firstSection = $schema['sections'][0]['title'] ?? null;

        if ($firstSection) {
            return $firstSection;
        }

        return 'AI Generated Form';
    }

    public function edit(
        Request $request,
        Form $form,
        AiFormGenerator $generator
    ): JsonResponse {
        abort_unless(
            $form->user_id === $request->user()->id,
            403
        );

        $validated = $request->validate([
            'prompt' => [
                'required',
                'string',
                'min:3',
                'max:5000',
            ],
        ]);

        try {
            $form->load('currentVersion');

            if (!$form->currentVersion) {
                throw new \RuntimeException(
                    'Form does not have a current version.'
                );
            }

            $schema = $generator->edit(
                $form->currentVersion->schema_json,
                $validated['prompt']
            );

            $version = DB::transaction(function () use (
                $form,
                $schema,
                $request
            ) {
                $nextVersionNumber = $form
                    ->versions()
                    ->max('version_number') + 1;

                $version = $form->versions()->create([
                    'version_number' => $nextVersionNumber,
                    'schema_json' => $schema,
                    'schema_hash' => hash(
                        'sha256',
                        json_encode($schema)
                    ),
                    'created_by' => $request->user()->id,
                ]);

                $form->update([
                    'current_version_id' => $version->id,
                ]);

                return $version;
            });

            return response()->json([
                'message' => 'Form updated successfully with AI.',
                'data' => [
                    'form' => $form->fresh('currentVersion'),
                    'version' => $version,
                ],
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to update form with AI.',
            ], 422);
        }
    }
}
