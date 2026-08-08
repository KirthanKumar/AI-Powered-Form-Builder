import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import api from '../api/client';

export default function SubmissionsPage() {
    const { formId } = useParams();
    const navigate = useNavigate();

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadSubmissions() {
        setLoading(true);
        setError('');

        try {
            const response = await api.get(
                `/forms/${formId}/submissions`
            );

            setSubmissions(response.data.data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to load submissions.'
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSubmissions();
    }, [formId]);

    return (
        <div className="min-vh-100 bg-light">

            <nav className="navbar bg-white border-bottom">
                <div className="container-fluid px-4">

                    <div className="d-flex align-items-center gap-3">

                        <Link
                            to={`/forms/${formId}/builder`}
                            className="btn btn-outline-secondary"
                        >
                            ← Builder
                        </Link>

                        <div>
                            <div className="fw-semibold">
                                Submissions
                            </div>

                            <div className="small text-muted">
                                Form responses
                            </div>
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
                            Loading submissions...
                        </div>

                    </div>
                )}

                {!loading && error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="card shadow-sm">

                        <div className="card-header bg-white">
                            <div className="fw-semibold">
                                Responses
                            </div>

                            <div className="small text-muted">
                                {submissions.length} submission
                                {submissions.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {submissions.length === 0 ? (
                            <div className="card-body text-center py-5">

                                <h5>
                                    No submissions yet
                                </h5>

                                <p className="text-muted mb-0">
                                    Responses submitted through the
                                    public form will appear here.
                                </p>

                            </div>
                        ) : (
                            <div className="table-responsive">

                                <table className="table table-hover mb-0">

                                    <thead>
                                        <tr>
                                            <th>
                                                #
                                            </th>

                                            <th>
                                                Submitted
                                            </th>

                                            <th>
                                                Email
                                            </th>

                                            <th>
                                                Version
                                            </th>

                                            <th className="text-end">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {submissions.map(
                                            (submission, index) => (
                                                <tr
                                                    key={
                                                        submission.id
                                                    }
                                                >

                                                    <td>
                                                        {index + 1}
                                                    </td>

                                                    <td>
                                                        {new Date(
                                                            submission.submitted_at
                                                        ).toLocaleString()}
                                                    </td>

                                                    <td>
                                                        {submission.submitted_email ??
                                                            '—'}
                                                    </td>

                                                    <td>
                                                        {submission.form_version?.version_number ?? '—'}
                                                    </td>

                                                    <td className="text-end">

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/forms/${formId}/submissions/${submission.id}`
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>
                )}

            </main>

        </div>
    );
}