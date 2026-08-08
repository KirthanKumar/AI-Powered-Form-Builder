import FieldRenderer from './FieldRenderer';

export default function FormRenderer({
    schema,
    values,
    errors = {},
    onChange,
    disabled = false,
}) {
    if (!schema) {
        return null;
    }

    if (!schema.sections || schema.sections.length === 0) {
        return (
            <div className="text-center py-5 text-muted">
                <h5>No fields available</h5>

                <p className="mb-0">
                    This form does not contain any fields yet.
                </p>
            </div>
        );
    }

    function handleFieldChange(field, value) {
        if (!onChange) {
            return;
        }

        onChange(field.key, value);
    }

    return (
        <div>
            {schema.sections.map((section) => (
                <section
                    key={section.id}
                    className="mb-5"
                >
                    <div className="mb-4">
                        <h4 className="mb-1">
                            {section.title}
                        </h4>
                    </div>

                    {section.fields.length === 0 && (
                        <div className="text-muted small">
                            No fields in this section.
                        </div>
                    )}

                    {section.fields.map((field) => (
                        <FieldRenderer
                            key={field.id}
                            field={field}
                            value={values?.[field.key]}
                            error={errors?.[field.key]}
                            disabled={disabled}
                            onChange={(value) =>
                                handleFieldChange(
                                    field,
                                    value
                                )
                            }
                        />
                    ))}
                </section>
            ))}
        </div>
    );
}
