<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFormRequest;
use App\Http\Resources\FormResource;
use App\Services\FormService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\Form;

class FormController extends Controller
{
    public function __construct(
        protected FormService $formService
    ) {}

    public function index(Request $request)
    {
        $forms = $request->user()->forms()->latest()->paginate(10);

        return FormResource::collection($forms);
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

    public function publish(Request $request, Form $form): FormResource
    {
        Gate::authorize('update', $form);
        $form = $this->formService->publish($form);

        return new FormResource($form);
    }

    public function unpublish(Request $request, Form $form): FormResource
    {
        Gate::authorize('update', $form);
        $form = $this->formService->unpublish($form);

        return new FormResource($form);
    }

    public function show(Request $request, Form $form): FormResource
    {
        Gate::authorize('view', $form);

        return new FormResource(
            $form->load('currentVersion')
        );
    }
}
