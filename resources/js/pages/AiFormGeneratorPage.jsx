import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../api/client';

export default function AiFormGeneratorPage() {
    const navigate = useNavigate();

    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleGenerate(event) {
        event.preventDefault();

        if (!prompt.trim()) {
            setError('Please describe the form you want to create.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post(
                '/ai/forms/generate',
                {
                    prompt: prompt.trim(),
                }
            );

            const form = response.data.data.form;

            navigate(`/forms/${form.id}/builder`);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to generate form.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-vh-100 bg-light">

            <nav className="navbar bg-white border-bottom">
                <div className="container-fluid px-4">

                    <div className="d-flex align-items-center gap-3">

                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => navigate('/')}
                        >
                            ← Dashboard
                        </button>

                        <div>
                            <div className="fw-semibold">
                                Generate Form with AI
                            </div>

                            <div className="small text-muted">
                                Describe the form you want to create
                            </div>
                        </div>

                    </div>

                </div>
            </nav>

            <main className="container py-5">

                <div className="row justify-content-center">

                    <div className="col-lg-8">

                        <div className="card shadow-sm">

                            <div className="card-body p-4">

                                <h4 className="mb-2">
                                    What kind of form do you need?
                                </h4>

                                <p className="text-muted mb-4">
                                    Describe the fields, sections,
                                    options and validations you need.
                                </p>

                                <form onSubmit={handleGenerate}>

                                    <textarea
                                        className="form-control"
                                        rows="8"
                                        value={prompt}
                                        onChange={(event) =>
                                            setPrompt(event.target.value)
                                        }
                                        placeholder="Example: Create an internship application form with personal information, education history, skills, work experience and resume upload."
                                        disabled={loading}
                                    />

                                    {error && (
                                        <div className="alert alert-danger mt-3 mb-0">
                                            {error}
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-end mt-4">

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={
                                                loading ||
                                                !prompt.trim()
                                            }
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    />

                                                    Generating...
                                                </>
                                            ) : (
                                                'Generate Form'
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