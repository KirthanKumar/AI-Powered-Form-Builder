import { useState } from 'react';

export default function SectionControls({
    selectedSection,
    onAdd,
    onRename,
    onDelete,
    disabled = false,
}) {
    const [title, setTitle] = useState('');

    function handleAdd() {
        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            return;
        }

        onAdd(trimmedTitle);
        setTitle('');
    }

    function handleRename() {
        if (!selectedSection) {
            return;
        }

        const newTitle = window.prompt(
            'Enter section name:',
            selectedSection.title
        );

        if (newTitle === null) {
            return;
        }

        const trimmedTitle = newTitle.trim();

        if (!trimmedTitle || trimmedTitle === selectedSection.title) {
            return;
        }

        onRename(selectedSection.id, trimmedTitle);
    }

    function handleDelete() {
        if (!selectedSection) {
            return;
        }

        const confirmed = window.confirm(
            `Delete section "${selectedSection.title}" and all its fields?`
        );

        if (!confirmed) {
            return;
        }

        onDelete(selectedSection.id);
    }

    return (
        <div className="mb-4">

            <div className="d-flex gap-2">

                <input
                    type="text"
                    className="form-control"
                    placeholder="New section name"
                    value={title}
                    disabled={disabled}
                    onChange={(event) => setTitle(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            handleAdd();
                        }
                    }}
                />

                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={disabled || !title.trim()}
                    onClick={handleAdd}
                >
                    Add Section
                </button>

            </div>

            {selectedSection && (
                <div className="d-flex gap-2 mt-2">

                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        disabled={disabled}
                        onClick={handleRename}
                    >
                        Rename
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        disabled={disabled}
                        onClick={handleDelete}
                    >
                        Delete Section
                    </button>

                </div>
            )}

        </div>
    );
}