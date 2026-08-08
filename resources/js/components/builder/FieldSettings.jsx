import { useEffect, useState } from 'react';

export default function FieldSettings({
    field,
    onUpdate,
    onDelete,
    disabled = false,
}) {
    const [form, setForm] = useState(null);

    useEffect(() => {
        if (!field) {
            setForm(null);
            return;
        }

        const options = (field.options ?? []).map((option) => ({
            id: crypto.randomUUID(),
            value: option,
        }));

        setForm({
            label: field.label ?? '',
            key: field.key ?? '',
            placeholder: field.placeholder ?? '',
            help_text: field.help_text ?? '',
            default: field.default ?? '',
            required: field.required ?? false,
            options,
            validation: field.validation ?? {},
        });
    }, [field?.id]);

    if (!field || !form) {
        return (
            <p className="text-muted">
                Select a field to edit its properties.
            </p>
        );
    }

    function updateField(changes) {
        setForm((current) => ({
            ...current,
            ...changes,
        }));

        onUpdate(changes);
    }

    function updateValidation(changes) {
        const validation = {
            ...form.validation,
            ...changes,
        };

        setForm((current) => ({
            ...current,
            validation,
        }));

        onUpdate({
            validation,
        });
    }

    function updateOption(optionId, value) {
        const updatedOptions = form.options.map((option) =>
            option.id === optionId
                ? {
                      ...option,
                      value,
                  }
                : option
        );

        setForm((current) => ({
            ...current,
            options: updatedOptions,
        }));

        onUpdate({
            options: updatedOptions.map((option) => option.value),
        });
    }

    function addOption() {
        const newOption = {
            id: crypto.randomUUID(),
            value: `Option ${form.options.length + 1}`,
        };

        const options = [
            ...form.options,
            newOption,
        ];

        setForm((current) => ({
            ...current,
            options,
        }));

        onUpdate({
            options: options.map((option) => option.value),
        });
    }

    function removeOption(optionId) {
        const options = form.options.filter(
            (option) => option.id !== optionId
        );

        setForm((current) => ({
            ...current,
            options,
        }));

        onUpdate({
            options: options.map((option) => option.value),
        });
    }

    return (
        <div>

            {/* Basic settings */}

            <div className="mb-3">
                <label className="form-label">
                    Label
                </label>

                <input
                    type="text"
                    className="form-control"
                    value={form.label}
                    disabled={disabled}
                    onChange={(event) =>
                        updateField({
                            label: event.target.value,
                        })
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Key
                </label>

                <input
                    type="text"
                    className="form-control"
                    value={form.key}
                    disabled={disabled}
                    onChange={(event) =>
                        updateField({
                            key: event.target.value,
                        })
                    }
                />

                <div className="form-text">
                    Unique identifier used when storing submissions.
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Placeholder
                </label>

                <input
                    type="text"
                    className="form-control"
                    value={form.placeholder}
                    disabled={disabled}
                    onChange={(event) =>
                        updateField({
                            placeholder: event.target.value,
                        })
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Help text
                </label>

                <textarea
                    className="form-control"
                    rows="2"
                    value={form.help_text}
                    disabled={disabled}
                    onChange={(event) =>
                        updateField({
                            help_text: event.target.value,
                        })
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Default value
                </label>

                <input
                    type="text"
                    className="form-control"
                    value={form.default}
                    disabled={disabled}
                    onChange={(event) =>
                        updateField({
                            default: event.target.value,
                        })
                    }
                />
            </div>

            {/* Required */}

            <div className="form-check mb-4">
                <input
                    id={`required-${field.id}`}
                    type="checkbox"
                    className="form-check-input"
                    checked={form.required}
                    disabled={disabled}
                    onChange={(event) =>
                        updateField({
                            required: event.target.checked,
                        })
                    }
                />

                <label
                    htmlFor={`required-${field.id}`}
                    className="form-check-label"
                >
                    Required field
                </label>
            </div>

            {/* Options */}

            {['dropdown', 'radio', 'checkbox'].includes(field.type) && (
                <div className="mb-4">

                    <div className="d-flex justify-content-between align-items-center mb-2">

                        <label className="form-label mb-0">
                            Options
                        </label>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            disabled={disabled}
                            onClick={addOption}
                        >
                            + Add
                        </button>

                    </div>

                    {form.options.length === 0 && (
                        <div className="text-muted small mb-2">
                            No options added.
                        </div>
                    )}

                    {form.options.map((option) => (
                        <div
                            key={option.id}
                            className="input-group mb-2"
                        >

                            <input
                                type="text"
                                className="form-control"
                                value={option.value}
                                disabled={disabled}
                                onChange={(event) =>
                                    updateOption(
                                        option.id,
                                        event.target.value
                                    )
                                }
                            />

                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                disabled={disabled}
                                onClick={() =>
                                    removeOption(option.id)
                                }
                            >
                                ×
                            </button>

                        </div>
                    ))}
                </div>
            )}

            {/* Text validation */}

            {['text', 'textarea'].includes(field.type) && (
                <div className="border-top pt-3 mb-4">

                    <h6>
                        Validation
                    </h6>

                    <div className="row g-2">

                        <div className="col-6">

                            <label className="form-label small">
                                Min length
                            </label>

                            <input
                                type="number"
                                className="form-control"
                                value={form.validation.min ?? ''}
                                disabled={disabled}
                                onChange={(event) =>
                                    updateValidation({
                                        min:
                                            event.target.value === ''
                                                ? null
                                                : Number(
                                                      event.target.value
                                                  ),
                                    })
                                }
                            />

                        </div>

                        <div className="col-6">

                            <label className="form-label small">
                                Max length
                            </label>

                            <input
                                type="number"
                                className="form-control"
                                value={form.validation.max ?? ''}
                                disabled={disabled}
                                onChange={(event) =>
                                    updateValidation({
                                        max:
                                            event.target.value === ''
                                                ? null
                                                : Number(
                                                      event.target.value
                                                  ),
                                    })
                                }
                            />

                        </div>

                    </div>

                </div>
            )}

            {/* Number validation */}

            {field.type === 'number' && (
                <div className="border-top pt-3 mb-4">

                    <h6>
                        Validation
                    </h6>

                    <div className="row g-2">

                        <div className="col-6">

                            <label className="form-label small">
                                Minimum
                            </label>

                            <input
                                type="number"
                                className="form-control"
                                value={form.validation.min ?? ''}
                                disabled={disabled}
                                onChange={(event) =>
                                    updateValidation({
                                        min:
                                            event.target.value === ''
                                                ? null
                                                : Number(
                                                      event.target.value
                                                  ),
                                    })
                                }
                            />

                        </div>

                        <div className="col-6">

                            <label className="form-label small">
                                Maximum
                            </label>

                            <input
                                type="number"
                                className="form-control"
                                value={form.validation.max ?? ''}
                                disabled={disabled}
                                onChange={(event) =>
                                    updateValidation({
                                        max:
                                            event.target.value === ''
                                                ? null
                                                : Number(
                                                      event.target.value
                                                  ),
                                    })
                                }
                            />

                        </div>

                    </div>

                </div>
            )}

            {/* Email validation */}

            {field.type === 'email' && (
                <div className="border-top pt-3 mb-4">

                    <h6>
                        Validation
                    </h6>

                    <div className="form-check">

                        <input
                            id={`email-validation-${field.id}`}
                            type="checkbox"
                            className="form-check-input"
                            checked={
                                form.validation.email ?? true
                            }
                            disabled={disabled}
                            onChange={(event) =>
                                updateValidation({
                                    email: event.target.checked,
                                })
                            }
                        />

                        <label
                            htmlFor={`email-validation-${field.id}`}
                            className="form-check-label"
                        >
                            Validate as email
                        </label>

                    </div>

                </div>
            )}

            {/* File validation */}

            {field.type === 'file' && (
                <div className="border-top pt-3 mb-4">

                    <h6>
                        File validation
                    </h6>

                    <div className="mb-3">

                        <label className="form-label small">
                            Allowed file types
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder="pdf, docx, jpg"
                            value={
                                form.validation.types?.join(', ') ?? ''
                            }
                            disabled={disabled}
                            onChange={(event) => {
                                const types = event.target.value
                                    .split(',')
                                    .map((type) => type.trim())
                                    .filter(Boolean);

                                updateValidation({
                                    types,
                                });
                            }}
                        />

                    </div>

                    <div>

                        <label className="form-label small">
                            Maximum size (KB)
                        </label>

                        <input
                            type="number"
                            className="form-control"
                            value={
                                form.validation.max_size ?? ''
                            }
                            disabled={disabled}
                            onChange={(event) =>
                                updateValidation({
                                    max_size:
                                        event.target.value === ''
                                            ? null
                                            : Number(
                                                  event.target.value
                                              ),
                                })
                            }
                        />

                    </div>

                </div>
            )}

            {/* Delete field */}

            <div className="border-top pt-3">

                <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    disabled={disabled}
                    onClick={() => onDelete(field.id)}
                >
                    Delete field
                </button>

            </div>

        </div>
    );
}