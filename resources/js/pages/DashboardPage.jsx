import { useEffect, useState } from 'react';

import api from '../api/client';

import FormCard from '../components/dashboard/FormCard';
import CreateFormModal from '../components/dashboard/CreateFormModal';

export default function DashboardPage() {

    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadForms() {

        setLoading(true);
        setError('');

        try {

            const response = await api.get('/forms');

            setForms(response.data.data ?? []);

        } catch (error) {

            if (error.response?.status === 401) {
                window.location.href = '/login';
                return;
            }

            setError(
                error.response?.data?.message ??
                'Unable to load forms.'
            );

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {
        loadForms();
    }, []);

    function handleCreated(form) {
        setForms((previous) => [
            form,
            ...previous,
        ]);
    }

    return (
        <>

            <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">

                <div className="container">

                    <a
                        className="navbar-brand fw-semibold"
                        href="/dashboard"
                    >
                        AI Form Builder
                    </a>

                    <div className="d-flex align-items-center gap-2">

                        <button
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#createFormModal"
                        >
                            + Create form
                        </button>

                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                localStorage.removeItem('auth_token');
                                window.location.href = '/login';
                            }}
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </nav>

            <main className="container py-4">

                <div className="mb-4">

                    <h1 className="h3 mb-1">
                        My Forms
                    </h1>

                    <p className="text-muted mb-0">
                        Create and manage your forms.
                    </p>

                </div>

                {loading && (
                    <div className="text-center py-5">

                        <div
                            className="spinner-border"
                            role="status"
                        />

                        <div className="mt-2 text-muted">
                            Loading forms...
                        </div>

                    </div>
                )}

                {!loading && error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {!loading && !error && forms.length === 0 && (

                    <div className="card border-0 bg-light">

                        <div className="card-body text-center py-5">

                            <h4>
                                No forms yet
                            </h4>

                            <p className="text-muted">
                                Create your first form to get started.
                            </p>

                            <button
                                className="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#createFormModal"
                            >
                                Create your first form
                            </button>

                        </div>

                    </div>

                )}

                {!loading && !error && forms.length > 0 && (

                    <div className="row g-4">

                        {forms.map((form) => (
                            <div
                                className="col-md-6 col-lg-4"
                                key={form.id}
                            >
                                <FormCard form={form} />
                            </div>
                        ))}

                    </div>

                )}

            </main>

            <CreateFormModal
                onCreated={handleCreated}
            />

        </>
    );
}