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

        $search = trim($request->string('search')->toString());

        $submissions = $form
            ->submissions()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('submitted_email', 'like', "%{$search}%")
                        ->orWhereRaw(
                            'CAST(submission_json AS CHAR) LIKE ?',
                            ["%{$search}%"]
                        );
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

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
