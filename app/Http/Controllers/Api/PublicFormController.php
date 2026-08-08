<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\PublicFormResource;
use App\Models\Form;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class PublicFormController extends Controller
{
    public function show(string $uuid): JsonResponse
    {
        $form = Form::query()->where('uuid', $uuid)->where('status', Form::STATUS_PUBLISHED)->with('currentVersion')->firstOrFail();

        return response()->json([
            'data' => new PublicFormResource($form),
        ]);
    }
}
