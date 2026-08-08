const FIELD_TYPES = [
    {
        type: 'text',
        label: 'Text',
        icon: 'T',
    },
    {
        type: 'textarea',
        label: 'Textarea',
        icon: '≡',
    },
    {
        type: 'number',
        label: 'Number',
        icon: '#',
    },
    {
        type: 'email',
        label: 'Email',
        icon: '@',
    },
    {
        type: 'phone',
        label: 'Phone',
        icon: '☎',
    },
    {
        type: 'date',
        label: 'Date',
        icon: '▣',
    },
    {
        type: 'dropdown',
        label: 'Dropdown',
        icon: '▾',
    },
    {
        type: 'radio',
        label: 'Radio',
        icon: '◉',
    },
    {
        type: 'checkbox',
        label: 'Checkbox',
        icon: '☑',
    },
    {
        type: 'file',
        label: 'File Upload',
        icon: '↑',
    },
    {
        type: 'rating',
        label: 'Rating',
        icon: '★',
    },
];

export default function FieldPalette({
    selectedSectionId,
    onAddField,
    disabled = false,
}) {
    return (
        <div>
            <h6 className="text-uppercase text-muted mb-3">
                Field Types
            </h6>

            {!selectedSectionId && (
                <div className="alert alert-warning small">
                    Select a section first.
                </div>
            )}

            <div className="d-grid gap-2">
                {FIELD_TYPES.map((field) => (
                    <button
                        key={field.type}
                        type="button"
                        className="btn btn-outline-secondary text-start"
                        disabled={disabled || !selectedSectionId}
                        onClick={() => onAddField(field.type)}
                    >
                        <span
                            className="d-inline-flex align-items-center justify-content-center me-2"
                            style={{
                                width: '24px',
                                height: '24px',
                            }}
                        >
                            {field.icon}
                        </span>

                        {field.label}
                    </button>
                ))}
            </div>
        </div>
    );
}