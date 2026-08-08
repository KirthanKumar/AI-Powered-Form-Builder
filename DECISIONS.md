# Part D — Custom Improvement

## Form Versioning & Rollback

### User Problem

Form builders need a safe way to experiment with changes without losing previously working form configurations.

Without versioning, accidentally deleting a field, changing validation rules, or making an unwanted structural change can require manually reconstructing the previous form.

### Implementation

The application stores each meaningful schema change as an immutable `FormVersion`.

The `forms` table maintains a `current_version_id` pointing to the active version.

Each version contains:

* Form ID
* Sequential version number
* Complete JSON schema snapshot
* Schema hash
* User who created the version
* Creation timestamp

The schema is stored as a complete snapshot rather than storing individual field-level changes.

A simplified version flow is:

```text
Form
 │
 └── Current Version → Version 4
                         │
                         ├── Version 1
                         ├── Version 2
                         ├── Version 3
                         └── Version 4
```

Whenever a form is modified, the application:

1. Loads the current schema.
2. Applies the requested modification through `SchemaEditor`.
3. Validates the resulting schema.
4. Generates a hash of the schema.
5. Compares it with the current version.
6. Creates a new version only when the schema actually changed.
7. Updates `forms.current_version_id`.

The frontend provides a Version History interface showing previous versions and the currently active version.

Users can select an earlier version and perform a rollback.

### Rollback Strategy

Rollback does not delete or overwrite historical versions.

Instead, the selected historical schema is restored as a **new version** and becomes the current version.

For example:

```text
Version 1
    ↓
Version 2
    ↓
Version 3
    ↓
Version 4 ← Current
```

Rolling back to Version 2 results conceptually in:

```text
Version 1
    ↓
Version 2
    ↓
Version 3
    ↓
Version 4
    ↓
Version 5 ← Current
```

Version 5 contains the schema from Version 2.

This preserves the complete audit/history trail and allows the user to recover from an unsuccessful rollback as well.

### Trade-offs

The implementation uses complete JSON snapshots instead of storing field-level diffs.

This makes version creation and rollback considerably simpler and ensures that every version is independently reconstructable.

The trade-off is increased storage usage because unchanged portions of the schema are duplicated between versions.

For the expected scale of this assignment, snapshot-based versioning provides a simpler and more reliable design.

### Why Schema Hashing?

A SHA-256-style schema hash is stored with every version.

Before creating a new version, the generated schema is hashed and compared with the current version's hash.

This prevents unnecessary versions from being created when an operation does not actually change the schema.

### What I Would Do With More Time

For a larger production system, I would consider:

* Storing schema diffs for very large forms
* Adding version descriptions/change summaries
* Showing a visual diff between two versions
* Recording more detailed audit information
* Supporting version restoration directly from the version history UI
* Adding automated tests around concurrent version creation and rollback
