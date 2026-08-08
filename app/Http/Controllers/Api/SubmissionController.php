<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubmissionResource;
use App\Models\Form;
use Illuminate\Http\Request;
use App\Models\Submission;

class SubmissionController extends Controller
{
    public function index(Request $request, Form $form)
    {
        abort_unless(
            $form->user_id === $request->user()->id,
            403
        );

        $submissions = $form
            ->submissions()
            ->latest()
            ->paginate(20);

        return SubmissionResource::collection($submissions);
    }

    public function show(Request $request, Form $form, Submission $submission)
    {
        abort_unless(
            $form->user_id === $request->user()->id,
            403
        );

        abort_unless(
            $submission->form_id === $form->id,
            404
        );

        $submission->load('formVersion');

        return new SubmissionResource($submission);
    }
}
