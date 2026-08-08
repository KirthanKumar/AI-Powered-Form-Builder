<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormVersion;
use App\Services\FormVersionService;
use Illuminate\Http\Request;

class FormVersionController extends Controller
{
    public function __construct(protected FormVersionService $formVersionService) {}

    public function index(Request $request, Form $form)
    {
        abort_unless(
            $form->user_id === $request->user()->id,
            403
        );

        return response()->json([
            'data' => $this->formVersionService->getVersions($form),
        ]);
    }

    public function rollback(Request $request, Form $form, FormVersion $version)
    {
        abort_unless(
            $form->user_id === $request->user()->id,
            403
        );

        if ($version->form_id !== $form->id) {
            abort(404);
        }

        $newVersion = $this->formVersionService->rollback(
            $form,
            $request->user(),
            $version
        );

        return response()->json([
            'message' => 'Form rolled back successfully.',
            'data' => [
                'version' => $newVersion,
                'form' => $form->fresh('currentVersion'),
            ],
        ]);
    }
}
