import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../api/client';

export default function RegisterPage() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError('');

        if (form.password !== form.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {

            const response = await api.post('/register', form);

            localStorage.setItem(
                'auth_token',
                response.data.token
            );

            navigate('/dashboard');

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
                    'Unable to register.'
                );

            }

        } finally {

            setLoading(false);

        }
    }

    return (
        <div className="container">

            <div className="row justify-content-center mt-5">

                <div className="col-md-5">

                    <div className="card shadow-sm">

                        <div className="card-body p-4">

                            <h2 className="mb-4">
                                Create account
                            </h2>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">
                                        Confirm password
                                    </label>

                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        className="form-control"
                                        value={form.password_confirmation}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? 'Creating account...'
                                        : 'Register'}
                                </button>

                            </form>

                            <div className="mt-3 text-center">

                                Already have an account?

                                {' '}

                                <Link to="/login">
                                    Login
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}