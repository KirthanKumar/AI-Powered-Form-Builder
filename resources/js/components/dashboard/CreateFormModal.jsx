import { useState } from 'react';

import api from '../../api/client';

export default function CreateFormModal({ onCreated }) {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function reset() {
        setTitle('');
        setDescription('');
        setError('');
        setLoading(false);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setLoading(true);

        try {
            const response = await api.post('/forms', {
                title,
                description,
            });

            reset();

            onCreated(response.data.data ?? response.data);

        } catch (error) {

            const errors = error.response?.data?.errors;

            if (errors) {
                setError(
                    Object.values(errors)
                        .flat()
                        .join(' ')
                );
            } else {
                setError(
                    error.response?.data?.message ??
                    'Unable to create form.'
                );
            }

            setLoading(false);
        }
    }

    return (
        <div
            className="modal fade"
            id="createFormModal"
            tabIndex="-1"
            aria-hidden="true"
        >
            <div className="modal-dialog">

                <div className="modal-content">

                    <form onSubmit={handleSubmit}>

                        <div className="modal-header">

                            <h5 className="modal-title">
                                Create form
                            </h5>

                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={reset}
                            />

                        </div>

                        <div className="modal-body">

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            <div className="mb-3">

                                <label className="form-label">
                                    Form title
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(event.target.value)
                                    }
                                    placeholder="e.g. Internship Application"
                                    required
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Description
                                </label>

                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    placeholder="What is this form for?"
                                />

                            </div>

                        </div>

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                onClick={reset}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Creating...'
                                    : 'Create form'}
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        </div>
    );
}