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

    public function export(Request $request, Form $form)
    {
        abort_unless(
            $form->user_id === $request->user()->id,
            403
        );

        $submissions = $form
            ->submissions()
            ->with('formVersion')
            ->latest()
            ->get();

        $filename = sprintf(
            '%s-submissions-%s.csv',
            str($form->title)->slug(),
            now()->format('Y-m-d')
        );

        return response()->streamDownload(function () use ($submissions) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'ID',
                'Submitted At',
                'Email',
                'Version',
                'Submission',
            ]);

            foreach ($submissions as $submission) {
                fputcsv($handle, [
                    $submission->id,
                    $submission->submitted_at,
                    $submission->submitted_email,
                    $submission->formVersion?->version_number,
                    json_encode($submission->submission),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
