import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import api from '../api/client';

export default function SubmissionsPage() {
    const { formId } = useParams();
    const navigate = useNavigate();

    const [submissions, setSubmissions] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    async function handleExport() {
        try {
            const response = await api.get(
                `/forms/${formId}/submissions/export`,
                {
                    responseType: 'blob',
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: 'text/csv',
                })
            );

            const link = document.createElement('a');

            link.href = url;
            link.download = `form-${formId}-submissions.csv`;

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to export submissions.'
            );
        }
    }

    async function loadSubmissions(page = 1, searchTerm = search) {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                page: page.toString(),
            });

            if (searchTerm.trim()) {
                params.set('search', searchTerm.trim());
            }

            const response = await api.get(
                `/forms/${formId}/submissions?${params.toString()}`
            );

            setSubmissions(response.data.data);
            setPagination(response.data.meta);

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

                            <div className="d-flex justify-content-between align-items-center gap-3">

                                <div>
                                    <div className="fw-semibold">
                                        Responses
                                    </div>

                                    <div className="small text-muted">
                                        {pagination?.total ?? submissions.length} submission
                                        {(pagination?.total ?? submissions.length) !== 1 ? 's' : ''}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={handleExport}
                                >
                                    Export CSV
                                </button>

                                <form
                                    className="d-flex gap-2"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        loadSubmissions(1, search);
                                    }}
                                >
                                    <input
                                        type="search"
                                        className="form-control"
                                        placeholder="Search submissions..."
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                    />

                                    <button
                                        type="submit"
                                        className="btn btn-outline-primary"
                                    >
                                        Search
                                    </button>

                                    {search && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                                setSearch('');
                                                loadSubmissions(1, '');
                                            }}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </form>

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
                                                        {(pagination.current_page - 1) * pagination.per_page + index + 1}
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

                        {pagination && pagination.last_page > 1 && (
                            <div className="card-footer bg-white d-flex justify-content-between align-items-center">

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={pagination.current_page <= 1 || loading}
                                    onClick={() =>
                                        loadSubmissions(pagination.current_page - 1)
                                    }
                                >
                                    Previous
                                </button>

                                <span className="small text-muted">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={
                                        pagination.current_page >= pagination.last_page ||
                                        loading
                                    }
                                    onClick={() =>
                                        loadSubmissions(pagination.current_page + 1)
                                    }
                                >
                                    Next
                                </button>

                            </div>
                        )}

                    </div>
                )}

            </main>

        </div>
    );
}