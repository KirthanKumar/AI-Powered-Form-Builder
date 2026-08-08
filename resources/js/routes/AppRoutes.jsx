import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import FormBuilderPage from '../pages/FormBuilderPage';
import SubmissionsPage from '../pages/SubmissionsPage';
import FormPreviewPage from '../pages/FormPreviewPage';
import PublicFormPage from '../pages/PublicFormPage';
import SubmissionDetailPage from '../pages/SubmissionDetailPage';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('auth_token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/forms/:formId/builder"
                    element={
                        <ProtectedRoute>
                            <FormBuilderPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/forms/:formId/submissions"
                    element={
                        <ProtectedRoute>
                            <SubmissionsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/forms/:formId/submissions/:submissionId"
                    element={
                        <ProtectedRoute>
                            <SubmissionDetailPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />

                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />

                <Route
                    path="/forms/:formId/preview"
                    element={<FormPreviewPage />}
                />

                <Route
                    path="/public/forms/:uuid"
                    element={<PublicFormPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}