<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFormRequest;
use App\Http\Resources\FormResource;
use App\Services\FormService;
use Illuminate\Http\Request;

class FormController extends Controller
{
    public function __construct(
        protected FormService $formService
    ) {
    }

    public function store(StoreFormRequest $request): FormResource
    {
        $form = $this->formService->create(
            $request->user(),
            $request->validated('title'),
            $request->validated('description')
        );

        return new FormResource($form);
    }
}