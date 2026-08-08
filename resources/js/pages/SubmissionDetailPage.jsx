import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import api from '../api/client';

export default function SubmissionDetailPage() {
    const { formId, submissionId } = useParams();

    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadSubmission() {
        setLoading(true);
        setError('');

        try {
            const response = await api.get(
                `/forms/${formId}/submissions/${submissionId}`
            );

            setSubmission(response.data.data);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to load submission.'
            );

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSubmission();
    }, [formId, submissionId]);

    function getFields() {
        if (!submission?.form_version?.schema?.sections) {
            return [];
        }

        return submission.form_version.schema.sections.flatMap(
            (section) =>
                section.fields.map((field) => ({
                    ...field,
                    sectionTitle: section.title,
                }))
        );
    }

    const fields = getFields();

    return (
        <div className="min-vh-100 bg-light">

            <nav className="navbar bg-white border-bottom">
                <div className="container-fluid px-4">

                    <div className="d-flex align-items-center gap-3">

                        <Link
                            to={`/forms/${formId}/submissions`}
                            className="btn btn-outline-secondary"
                        >
                            ← Submissions
                        </Link>

                        <div>
                            <div className="fw-semibold">
                                Submission #{submissionId}
                            </div>

                            {submission && (
                                <div className="small text-muted">
                                    Submitted{' '}
                                    {new Date(
                                        submission.submitted_at
                                    ).toLocaleString()}
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </nav>

            <main className="container py-4">

                {loading && (
                    <div className="text-center py-5">

                        <div
                            className="spinner-border"
                            role="status"
                        />

                        <div className="mt-2 text-muted">
                            Loading submission...
                        </div>

                    </div>
                )}

                {!loading && error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {!loading && !error && submission && (

                    <div className="row justify-content-center">

                        <div className="col-lg-8">

                            <div className="card shadow-sm">

                                <div className="card-header bg-white">

                                    <div className="fw-semibold">
                                        Submission Details
                                    </div>

                                    <div className="small text-muted">
                                        Form version{' '}
                                        {
                                            submission.form_version
                                                ?.version_number
                                        }
                                    </div>

                                </div>

                                <div className="card-body">

                                    {submission.submitted_email && (
                                        <div className="mb-4">
                                            <div className="small text-muted">
                                                Email
                                            </div>

                                            <div>
                                                {
                                                    submission.submitted_email
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {fields.length === 0 ? (
                                        <div className="text-muted">
                                            No fields found for this
                                            submission.
                                        </div>
                                    ) : (
                                        fields.map((field) => {

                                            const value =
                                                submission.submission?.[
                                                field.key
                                                ];

                                            return (
                                                <div
                                                    key={field.id}
                                                    className="mb-4"
                                                >

                                                    <div className="small text-muted mb-1">
                                                        {
                                                            field.sectionTitle
                                                        }
                                                    </div>

                                                    <div className="fw-semibold">
                                                        {field.label}
                                                    </div>

                                                    <div className="mt-1">
                                                        {value ===
                                                            null ||
                                                            value ===
                                                            undefined ||
                                                            value === '' ? (
                                                            <span className="text-muted">
                                                                —
                                                            </span>
                                                        ) : Array.isArray(
                                                            value
                                                        ) ? (
                                                            value.join(
                                                                ', '
                                                            )
                                                        ) : (
                                                            String(value)
                                                        )}
                                                    </div>

                                                </div>
                                            );
                                        })
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}