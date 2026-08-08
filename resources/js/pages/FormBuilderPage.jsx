import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import api from '../api/client';
import FormCanvas from '../components/builder/FormCanvas';
import FieldPalette from '../components/builder/FieldPalette';
import FieldSettings from '../components/builder/FieldSettings';
import SectionControls from '../components/builder/SectionControls';

export default function FormBuilderPage() {

    const { formId } = useParams();

    const [schema, setSchema] = useState(null);
    const [version, setVersion] = useState(null);
    const [form, setForm] = useState(null);

    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const publicUrl = form ? `${window.location.origin}/public/forms/${form.uuid}` : '';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    const [versions, setVersions] = useState([]);
    const [showVersions, setShowVersions] = useState(false);

    async function loadVersions() {
        try {
            const response = await api.get(
                `/forms/${formId}/versions`
            );

            setVersions(response.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleRollback(versionId) {
        const confirmed = window.confirm(
            'Rollback this form to this version?'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await api.post(
                `/forms/${formId}/versions/${versionId}/rollback`
            );

            const updatedForm = response.data.data.form;
            const updatedVersion = response.data.data.version;

            setSchema(updatedVersion.schema_json);
            setVersion(updatedVersion.version_number);
            setForm(updatedForm);

            setSelectedFieldId(null);
            setSelectedSectionId(null);

            await loadVersions();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to rollback form.'
            );
        }
    }

    async function handleAiEdit() {
        if (!aiPrompt.trim()) {
            return;
        }

        setAiLoading(true);
        setAiError('');
        setError('');

        try {
            const response = await api.post(
                `/forms/${formId}/ai/edit`,
                {
                    prompt: aiPrompt.trim(),
                }
            );

            console.log('AI FULL RESPONSE:', response.data);

            const updatedForm = response.data.data.form;
            const updatedVersion = response.data.data.version;

            console.log(
                'AI UPDATED SCHEMA:',
                updatedVersion.schema_json
            );

            setSchema(updatedVersion.schema_json);
            setVersion(updatedVersion.version_number);
            setForm(updatedForm);

            setSelectedFieldId(null);
            setSelectedSectionId(null);

            setAiPrompt('');

        } catch (error) {
            console.error('AI edit failed:', error);

            setAiError(
                error.response?.data?.message ??
                'Unable to update form with AI.'
            );
        } finally {
            setAiLoading(false);
        }
    }

    async function handlePublish() {
        try {
            const response = await api.post(
                `/forms/${formId}/publish`
            );

            setForm(response.data.data);
            setVersion(
                response.data.data.current_version?.version_number
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to publish form.'
            );
        }
    }

    async function handleUnpublish() {
        try {
            const response = await api.post(
                `/forms/${formId}/unpublish`
            );

            setForm(response.data.data);
            setVersion(
                response.data.data.current_version?.version_number
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to unpublish form.'
            );
        }
    }

    async function loadForm() {
        try {
            const response = await api.get(`/forms/${formId}`);

            setForm(response.data.data);
        } catch (error) {
            console.error(error);

            if (error.response?.status === 401) {
                window.location.href = '/login';
                return;
            }

            setError(
                error.response?.data?.message ??
                'Unable to load form.'
            );
        }
    }

    async function handleDuplicateField(fieldId) {
        if (!fieldId) {
            return;
        }

        try {
            const response = await api.post(
                `/forms/${formId}/fields/${fieldId}/duplicate`
            );

            setSchema(response.data.data.schema);
            setVersion(response.data.data.version_number);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to duplicate field.'
            );
        }
    }

    async function handleMoveField(sectionId, from, to) {
        try {
            const response = await api.patch(
                `/forms/${formId}/sections/${sectionId}/fields/move`,
                {
                    from,
                    to,
                }
            );

            setSchema(response.data.data.schema);
            setVersion(response.data.data.version_number);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to move field.'
            );
        }
    }

    async function handleAddSection(title) {
        try {
            const response = await api.post(
                `/forms/${formId}/sections`,
                {
                    title,
                }
            );

            setSchema(response.data.data.schema);
            setVersion(response.data.data.version_number);

            const newSchema = response.data.data.schema;

            const newSection =
                newSchema.sections[newSchema.sections.length - 1];

            setSelectedSectionId(newSection?.id ?? null);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to add section.'
            );
        }
    }

    async function handleRenameSection(sectionId, title) {
        try {
            const response = await api.patch(
                `/forms/${formId}/sections/${sectionId}`,
                {
                    title,
                }
            );

            setSchema(response.data.data.schema);
            setVersion(response.data.data.version_number);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to rename section.'
            );
        }
    }

    async function handleDeleteSection(sectionId) {
        try {
            const response = await api.delete(
                `/forms/${formId}/sections/${sectionId}`
            );

            setSchema(response.data.data.schema);
            setVersion(response.data.data.version_number);

            setSelectedSectionId(null);
            setSelectedFieldId(null);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to delete section.'
            );
        }
    }

    async function handleDeleteField(fieldId) {
        if (!fieldId) {
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to delete this field?'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await api.delete(
                `/forms/${formId}/fields/${fieldId}`
            );

            setSchema(response.data.data.schema);
            setVersion(response.data.data.version_number);

            setSelectedFieldId(null);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to delete field.'
            );
        }
    }

    async function handleUpdateField(attributes) {
        if (!selectedFieldId) {
            return;
        }

        try {
            const response = await api.patch(
                `/forms/${formId}/fields/${selectedFieldId}`,
                attributes
            );

            setSchema(response.data.data.schema);
            setVersion(response.data.data.version_number);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to update field.'
            );
        }
    }

    function findField(fieldId) {
        if (!schema || !fieldId) {
            return null;
        }

        for (const section of schema.sections) {
            const field = section.fields.find(
                (field) => field.id === fieldId
            );

            if (field) {
                return field;
            }
        }

        return null;
    }

    function findSection(sectionId) {
        if (!schema || !sectionId) {
            return null;
        }

        return schema.sections.find(
            (section) => section.id === sectionId
        ) ?? null;
    }

    function getDefaultLabel(type) {
        const labels = {
            text: 'Text Field',
            textarea: 'Text Area',
            number: 'Number',
            email: 'Email',
            phone: 'Phone',
            date: 'Date',
            dropdown: 'Dropdown',
            radio: 'Radio',
            checkbox: 'Checkbox',
            file: 'File Upload',
            rating: 'Rating',
        };

        return labels[type] ?? 'New Field';
    }

    async function handleAddField(type) {
        if (!selectedSectionId) {
            return;
        }

        try {
            const response = await api.post(
                `/forms/${formId}/sections/${selectedSectionId}/fields`,
                {
                    type,
                    label: getDefaultLabel(type),
                }
            );

            setSchema(response.data.data.schema);
            setVersion(response.data.data.version_number);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ??
                'Unable to add field.'
            );
        }
    }

    async function loadSchema() {

        setLoading(true);
        setError('');

        try {

            const response = await api.get(
                `/forms/${formId}/schema`
            );

            setSchema(response.data.data.schema);
            setVersion(response.data.data.version_number);
            setForm(response.data.data.form);

        } catch (error) {

            if (error.response?.status === 401) {
                window.location.href = '/login';
                return;
            }

            setError(
                error.response?.data?.message ??
                'Unable to load form schema.'
            );

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {
        loadForm();
        loadSchema();
    }, [formId]);

    function handleSelectField(fieldId) {
        setSelectedFieldId(fieldId);
    }
    const selectedField = findField(selectedFieldId);
    const selectedSection = findSection(selectedSectionId);

    return (
        <div className="min-vh-100 bg-light">

            <nav className="navbar bg-white border-bottom">

                <div className="container-fluid px-4">

                    <div className="d-flex align-items-center gap-3">

                        <Link
                            to="/dashboard"
                            className="btn btn-outline-secondary"
                        >
                            ← Forms
                        </Link>

                        <div>
                            <div className="fw-semibold">
                                Form Builder
                            </div>

                            {version && (
                                <div className="small text-muted">
                                    Version {version}
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                const next = !showVersions;

                                setShowVersions(next);

                                if (next) {
                                    loadVersions();
                                }
                            }}
                        >
                            Version History
                        </button>

                        <Link
                            to={`/forms/${formId}/preview`}
                            className="btn btn-outline-secondary"
                        >
                            Preview
                        </Link>

                        {form?.status === 'published' ? (
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge text-bg-success">
                                    Published
                                </span>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() =>
                                        navigator.clipboard.writeText(publicUrl)
                                    }
                                >
                                    Copy public URL
                                </button>

                                <a
                                    href={publicUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-sm btn-outline-primary"
                                >
                                    Open form
                                </a>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={handleUnpublish}
                                >
                                    Unpublish
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={loading}
                                onClick={handlePublish}
                            >
                                Publish
                            </button>
                        )}

                    </div>

                </div>

            </nav>

            <div className="container-fluid">
                {showVersions && (
                    <div className="bg-white border-bottom">
                        <div className="container-fluid px-4 py-3">

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">
                                    Version History
                                </h6>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setShowVersions(false)}
                                >
                                    Close
                                </button>
                            </div>

                            {versions.map((item) => (
                                <div
                                    key={item.id}
                                    className="border rounded p-3 mb-2"
                                >
                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>
                                            <div className="fw-semibold">
                                                Version {item.version_number}
                                            </div>

                                            <div className="small text-muted">
                                                {new Date(
                                                    item.created_at
                                                ).toLocaleString()}
                                            </div>
                                        </div>

                                        {item.is_current ? (
                                            <span className="badge text-bg-primary">
                                                Current
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-warning"
                                                onClick={() =>
                                                    handleRollback(item.id)
                                                }
                                            >
                                                Rollback
                                            </button>
                                        )}

                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                )}
                {loading && (
                    <div className="text-center py-5">

                        <div
                            className="spinner-border"
                            role="status"
                        />

                        <div className="mt-2 text-muted">
                            Loading form...
                        </div>

                    </div>
                )}

                {!loading && error && (
                    <div className="container py-4">

                        <div className="alert alert-danger">
                            {error}
                        </div>

                    </div>
                )}

                {!loading && !error && schema && (

                    <div className="row g-0">

                        {/* Field palette */}

                        <aside
                            className="col-md-3 col-lg-2 bg-white border-end"
                            style={{ minHeight: 'calc(100vh - 57px)' }}
                        >
                            <div className="p-3">

                                <FieldPalette
                                    selectedSectionId={selectedSectionId}
                                    onAddField={handleAddField}
                                    disabled={loading}
                                />

                            </div>
                        </aside>

                        {/* Canvas */}

                        <main
                            className="col-md-6 col-lg-7"
                            style={{
                                minHeight: 'calc(100vh - 57px)'
                            }}
                        >

                            <div className="p-4">
                                <SectionControls
                                    selectedSection={selectedSection}
                                    onAdd={handleAddSection}
                                    onRename={handleRenameSection}
                                    onDelete={handleDeleteSection}
                                    disabled={loading}
                                />


                                <FormCanvas
                                    schema={schema}
                                    selectedFieldId={selectedFieldId}
                                    selectedSectionId={selectedSectionId}
                                    onSelectField={handleSelectField}
                                    onSelectSection={setSelectedSectionId}
                                    onDuplicateField={handleDuplicateField}
                                    onMoveField={handleMoveField}
                                />

                            </div>

                        </main>

                        {/* Settings */}

                        <aside
                            className="col-md-3 col-lg-3 bg-white border-start"
                            style={{
                                minHeight: 'calc(100vh - 57px)'
                            }}
                        >
                            <div className="p-4">

                                <h5 className="mb-4">
                                    Field settings
                                </h5>

                                <FieldSettings
                                    field={selectedField}
                                    onUpdate={handleUpdateField}
                                    onDelete={handleDeleteField}
                                    disabled={loading || aiLoading}
                                />

                                <hr className="my-4" />

                                <h5 className="mb-3">
                                    AI Assistant
                                </h5>

                                <p className="small text-muted">
                                    Describe a change you want to make to this form.
                                </p>

                                <textarea
                                    className="form-control mb-2"
                                    rows="5"
                                    placeholder="e.g. Add an emergency contact section"
                                    value={aiPrompt}
                                    onChange={(event) =>
                                        setAiPrompt(event.target.value)
                                    }
                                    disabled={aiLoading}
                                />

                                {aiError && (
                                    <div className="alert alert-danger small">
                                        {aiError}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={handleAiEdit}
                                    disabled={
                                        aiLoading ||
                                        !aiPrompt.trim()
                                    }
                                >
                                    {aiLoading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            />
                                            Updating form...
                                        </>
                                    ) : (
                                        'Apply with AI'
                                    )}
                                </button>

                            </div>
                        </aside>

                    </div>

                )}

            </div>

        </div>
    );
}