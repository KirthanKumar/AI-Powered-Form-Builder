import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

function SortableField({
    field,
    selectedFieldId,
    onSelectField,
    onDuplicateField,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: field.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`card mb-3 ${selectedFieldId === field.id
                    ? 'border-primary'
                    : ''
                }`}
            onClick={(event) => {
                event.stopPropagation();
                onSelectField(field.id);
            }}
        >
            <div className="card-body">

                <div className="d-flex justify-content-between align-items-center">

                    <div className="d-flex align-items-center">

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary me-3"
                            title="Drag field"
                            {...attributes}
                            {...listeners}
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                        >
                            ☷
                        </button>

                        <div>
                            <div className="fw-semibold">
                                {field.label}
                            </div>

                            <div className="small text-muted">
                                {field.type}
                            </div>
                        </div>

                    </div>

                    <div className="d-flex align-items-center gap-2">

                        {field.required && (
                            <span className="badge text-bg-danger">
                                Required
                            </span>
                        )}

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={(event) => {
                                event.stopPropagation();
                                onDuplicateField(field.id);
                            }}
                        >
                            Duplicate
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default function FormCanvas({
    schema,
    selectedFieldId,
    selectedSectionId,
    onSelectField,
    onSelectSection,
    onDuplicateField,
    onMoveField,
}) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    if (!schema) {
        return null;
    }

    function handleDragEnd(event, sectionId) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const fields = schema.sections.find(
            (section) => section.id === sectionId
        )?.fields ?? [];

        const from = fields.findIndex(
            (field) => field.id === active.id
        );

        const to = fields.findIndex(
            (field) => field.id === over.id
        );

        if (from === -1 || to === -1) {
            return;
        }

        onMoveField(sectionId, from, to);
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
                    className={`card mb-4 shadow-sm ${selectedSectionId === section.id
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

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) =>
                                handleDragEnd(event, section.id)
                            }
                        >
                            <SortableContext
                                items={section.fields.map(
                                    (field) => field.id
                                )}
                                strategy={verticalListSortingStrategy}
                            >
                                {section.fields.map((field) => (
                                    <SortableField
                                        key={field.id}
                                        field={field}
                                        selectedFieldId={selectedFieldId}
                                        onSelectField={onSelectField}
                                        onDuplicateField={onDuplicateField}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>

                    </div>

                </div>
            ))}

        </div>
    );
}