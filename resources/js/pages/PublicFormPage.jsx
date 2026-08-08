import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import api from '../api/client';
import FormRenderer from '../components/form/FormRenderer';

export default function PublicFormPage() {
    const { uuid } = useParams();

    const [form, setForm] = useState(null);
    const [schema, setSchema] = useState(null);

    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    async function loadForm() {
        setLoading(true);
        setError('');

        try {
            const response = await api.get(
                `/public/forms/${uuid}`
            );

            const data = response.data.data;

            setForm(data);
            setSchema(data.schema ?? null);

        } catch (error) {
            console.error(error);

            if (error.response?.status === 404) {
                setError(
                    'This form does not exist or is no longer available.'
                );
            } else {
                setError(
                    error.response?.data?.message ??
                    'Unable to load this form.'
                );
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadForm();
    }, [uuid]);

    function handleFieldChange(key, value) {
        setValues((current) => ({
            ...current,
            [key]: value,
        }));

        setErrors((current) => {
            const updated = { ...current };
            delete updated[key];

            return updated;
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!form || !schema) {
            return;
        }

        setSubmitting(true);
        setErrors({});
        setError('');

        try {
            await api.post(
                `/public/forms/${uuid}/submissions`,
                {
                    data: values,
                }
            );

            setSubmitted(true);

        } catch (error) {
            console.error(error);

            if (error.response?.status === 422) {
                setErrors(
                    error.response?.data?.errors ?? {}
                );

                return;
            }

            setError(
                error.response?.data?.message ??
                'Unable to submit the form.'
            );

        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="text-center">

                    <div
                        className="spinner-border"
                        role="status"
                    />

                    <div className="mt-2 text-muted">
                        Loading form...
                    </div>

                </div>
            </div>
        );
    }

    if (error && !form) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="container">

                    <div className="row justify-content-center">

                        <div className="col-md-6">

                            <div className="alert alert-danger text-center">
                                {error}
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                <div className="container">

                    <div className="row justify-content-center">

                        <div className="col-md-6">

                            <div className="card shadow-sm">

                                <div className="card-body p-5 text-center">

                                    <div className="display-5 mb-3">
                                        ✓
                                    </div>

                                    <h2 className="mb-3">
                                        Thank you!
                                    </h2>

                                    <p className="text-muted mb-0">
                                        Your response has been
                                        submitted successfully.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light">

            <main className="container py-5">

                <div className="row justify-content-center">

                    <div className="col-lg-8">

                        <div className="card shadow-sm">

                            <div className="card-body p-4 p-md-5">

                                <div className="mb-4">

                                    <h1 className="h2 mb-2">
                                        {form.title}
                                    </h1>

                                    {form.description && (
                                        <p className="text-muted mb-0">
                                            {form.description}
                                        </p>
                                    )}

                                </div>

                                {error && (
                                    <div className="alert alert-danger">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>

                                    <FormRenderer
                                        schema={schema}
                                        values={values}
                                        errors={errors}
                                        onChange={
                                            handleFieldChange
                                        }
                                        disabled={submitting}
                                    />

                                    <div className="border-top pt-4 mt-4">

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    />

                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit'
                                            )}
                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}