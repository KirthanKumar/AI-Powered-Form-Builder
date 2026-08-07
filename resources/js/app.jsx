import React from 'react';
import { createRoot } from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import AppRoutes from './routes/AppRoutes';

const rootElement = document.getElementById('app');

if (!rootElement) {
    throw new Error('React root element #app was not found.');
}

createRoot(rootElement).render(
    <React.StrictMode>
        <AppRoutes />
    </React.StrictMode>
);