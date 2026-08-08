import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import api from '../api/client';
import FormRenderer from '../components/form/FormRenderer';

export default function FormPreviewPage() {
    const { formId } = useParams();

    const [schema, setSchema] = useState(null);
    const [version, setVersion] = useState(null);

    const [values, setValues] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadSchema() {
        setLoading(true);
        setError('');

        try {
            const response = await api.get(
                `/forms/${formId}/schema`
            );

            const data = response.data.data;

            setSchema(data.schema);
            setVersion(data.version_number);

        } catch (error) {
            console.error(error);

            if (error.response?.status === 401) {
                window.location.href = '/login';
                return;
            }

            setError(
                error.response?.data?.message ??
                'Unable to load form preview.'
            );

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSchema();
    }, [formId]);

    function handleFieldChange(key, value) {
        setValues((current) => ({
            ...current,
            [key]: value,
        }));
    }

    return (
        <div className="min-vh-100 bg-light">

            {/* Header */}

            <nav className="navbar bg-white border-bottom">
                <div className="container">

                    <div className="d-flex align-items-center gap-3">

                        <Link
                            to={`/forms/${formId}`}
                            className="btn btn-outline-secondary"
                        >
                            ← Builder
                        </Link>

                        <div>
                            <div className="fw-semibold">
                                Form Preview
                            </div>

                            {version && (
                                <div className="small text-muted">
                                    Version {version}
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </nav>

            {/* Content */}

            <main className="container py-5">

                {loading && (
                    <div className="text-center py-5">

                        <div
                            className="spinner-border"
                            role="status"
                        />

                        <div className="mt-2 text-muted">
                            Loading preview...
                        </div>

                    </div>
                )}

                {!loading && error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {!loading && !error && schema && (
                    <div className="row justify-content-center">

                        <div className="col-lg-8">

                            <div className="card shadow-sm">

                                <div className="card-body p-4 p-md-5">

                                    <div className="mb-4">

                                        <h2 className="mb-2">
                                            Form Preview
                                        </h2>

                                        <p className="text-muted mb-0">
                                            This is how your form
                                            will appear to users.
                                        </p>

                                    </div>

                                    <FormRenderer
                                        schema={schema}
                                        values={values}
                                        onChange={
                                            handleFieldChange
                                        }
                                        disabled={false}
                                    />

                                    <div className="border-top pt-4 mt-4">

                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled
                                        >
                                            Submit
                                        </button>

                                        <div className="form-text mt-2">
                                            Submission will be
                                            enabled after publishing
                                            is implemented.
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

            </main>

        </div>
    );
}