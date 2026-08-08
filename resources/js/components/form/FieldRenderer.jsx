export default function FieldRenderer({
    field,
    value,
    onChange,
    error = null,
    disabled = false,
}) {
    const inputId = `field-${field.id}`;

    function handleChange(event) {
        onChange(event.target.value);
    }

    function renderInput() {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
            case 'number':
                return (
                    <input
                        id={inputId}
                        type={
                            field.type === 'phone'
                                ? 'tel'
                                : field.type
                        }
                        className={`form-control ${
                            error ? 'is-invalid' : ''
                        }`}
                        value={value ?? ''}
                        placeholder={field.placeholder ?? ''}
                        disabled={disabled}
                        onChange={handleChange}
                    />
                );

            case 'date':
                return (
                    <input
                        id={inputId}
                        type="date"
                        className={`form-control ${
                            error ? 'is-invalid' : ''
                        }`}
                        value={value ?? ''}
                        disabled={disabled}
                        onChange={handleChange}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        id={inputId}
                        className={`form-control ${
                            error ? 'is-invalid' : ''
                        }`}
                        rows="4"
                        value={value ?? ''}
                        placeholder={field.placeholder ?? ''}
                        disabled={disabled}
                        onChange={handleChange}
                    />
                );

            case 'dropdown':
                return (
                    <select
                        id={inputId}
                        className={`form-select ${
                            error ? 'is-invalid' : ''
                        }`}
                        value={value ?? ''}
                        disabled={disabled}
                        onChange={handleChange}
                    >
                        <option value="">
                            Select an option
                        </option>

                        {(field.options ?? []).map(
                            (option, index) => (
                                <option
                                    key={`${field.id}-option-${index}`}
                                    value={option}
                                >
                                    {option}
                                </option>
                            )
                        )}
                    </select>
                );

            case 'radio':
                return (
                    <div>
                        {(field.options ?? []).map(
                            (option, index) => (
                                <div
                                    className="form-check mb-2"
                                    key={`${field.id}-option-${index}`}
                                >
                                    <input
                                        id={`${inputId}-${index}`}
                                        type="radio"
                                        name={field.key}
                                        className={`form-check-input ${
                                            error
                                                ? 'is-invalid'
                                                : ''
                                        }`}
                                        value={option}
                                        checked={
                                            value === option
                                        }
                                        disabled={disabled}
                                        onChange={handleChange}
                                    />

                                    <label
                                        htmlFor={`${inputId}-${index}`}
                                        className="form-check-label"
                                    >
                                        {option}
                                    </label>
                                </div>
                            )
                        )}
                    </div>
                );

            case 'checkbox':
                return (
                    <div>
                        {(field.options ?? []).map(
                            (option, index) => {
                                const selectedValues =
                                    Array.isArray(value)
                                        ? value
                                        : [];

                                const checked =
                                    selectedValues.includes(
                                        option
                                    );

                                function handleCheckboxChange(
                                    event
                                ) {
                                    let updatedValues;

                                    if (event.target.checked) {
                                        updatedValues = [
                                            ...selectedValues,
                                            option,
                                        ];
                                    } else {
                                        updatedValues =
                                            selectedValues.filter(
                                                (item) =>
                                                    item !== option
                                            );
                                    }

                                    onChange(updatedValues);
                                }

                                return (
                                    <div
                                        className="form-check mb-2"
                                        key={`${field.id}-option-${index}`}
                                    >
                                        <input
                                            id={`${inputId}-${index}`}
                                            type="checkbox"
                                            className={`form-check-input ${
                                                error
                                                    ? 'is-invalid'
                                                    : ''
                                            }`}
                                            value={option}
                                            checked={checked}
                                            disabled={disabled}
                                            onChange={
                                                handleCheckboxChange
                                            }
                                        />

                                        <label
                                            htmlFor={`${inputId}-${index}`}
                                            className="form-check-label"
                                        >
                                            {option}
                                        </label>
                                    </div>
                                );
                            }
                        )}
                    </div>
                );

            case 'file':
                return (
                    <input
                        id={inputId}
                        type="file"
                        className={`form-control ${
                            error ? 'is-invalid' : ''
                        }`}
                        disabled={disabled}
                        onChange={(event) =>
                            onChange(
                                event.target.files?.[0] ?? null
                            )
                        }
                    />
                );

            case 'rating':
                return (
                    <div className="d-flex gap-2">

                        {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                                key={rating}
                                type="button"
                                className={`btn ${
                                    Number(value) === rating
                                        ? 'btn-warning'
                                        : 'btn-outline-secondary'
                                }`}
                                disabled={disabled}
                                onClick={() =>
                                    onChange(rating)
                                }
                            >
                                ★
                            </button>
                        ))}

                    </div>
                );

            default:
                return (
                    <div className="alert alert-warning">
                        Unsupported field type:
                        {' '}
                        {field.type}
                    </div>
                );
        }
    }

    return (
        <div className="mb-4">

            <label
                htmlFor={inputId}
                className="form-label fw-semibold"
            >
                {field.label}

                {field.required && (
                    <span className="text-danger ms-1">
                        *
                    </span>
                )}
            </label>

            {renderInput()}

            {field.help_text && (
                <div className="form-text">
                    {field.help_text}
                </div>
            )}

            {error && (
                <div className="invalid-feedback d-block">
                    {error}
                </div>
            )}

        </div>
    );
}