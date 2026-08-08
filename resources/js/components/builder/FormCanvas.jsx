export default function FormCanvas({
    schema,
    selectedFieldId,
    selectedSectionId,
    onSelectField,
    onSelectSection,
}) {
    if (!schema) {
        return null;
    }

    return (
        <div className="builder-canvas">

            {schema.sections.length === 0 && (
                <div className="text-center py-5 text-muted">
                    <h5>No sections yet</h5>

                    <p className="mb-0">
                        Add a section to start building your form.
                    </p>
                </div>
            )}

            {schema.sections.map((section) => (
                <div
                    key={section.id}
                    className={`card mb-4 shadow-sm ${
                        selectedSectionId === section.id
                            ? 'border-primary'
                            : ''
                    }`}
                    onClick={() => onSelectSection(section.id)}
                    style={{ cursor: 'pointer' }}
                >

                    <div className="card-header bg-white">

                        <div className="d-flex justify-content-between align-items-center">

                            <h5 className="mb-0">
                                {section.title}
                            </h5>

                            {selectedSectionId === section.id && (
                                <span className="badge text-bg-primary">
                                    Selected
                                </span>
                            )}

                        </div>

                    </div>

                    <div className="card-body">

                        {section.fields.length === 0 && (
                            <div className="text-muted small py-3 text-center">
                                No fields yet.
                                <br />
                                Select a field type from the left.
                            </div>
                        )}

                        {section.fields.map((field) => (
                            <div
                                key={field.id}
                                className={`card mb-3 ${
                                    selectedFieldId === field.id
                                        ? 'border-primary'
                                        : ''
                                }`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onSelectField(field.id);
                                }}
                            >
                                <div className="card-body">

                                    <div className="d-flex justify-content-between">

                                        <div>
                                            <div className="fw-semibold">
                                                {field.label}
                                            </div>

                                            <div className="small text-muted">
                                                {field.type}
                                            </div>
                                        </div>

                                        {field.required && (
                                            <span className="badge text-bg-danger">
                                                Required
                                            </span>
                                        )}

                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>

                </div>
            ))}
        </div>
    );
}