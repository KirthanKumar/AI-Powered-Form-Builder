# AI-Powered Form Builder

A full-stack AI-powered form builder built with **Laravel, React, MySQL, and Bootstrap**.

The application allows users to create and manage dynamic forms, edit forms through a visual builder, generate and modify forms using AI, publish forms through public URLs, collect submissions, and maintain version history with rollback support.

---

## Assignment Status

| Part                                  | Status             |
| ------------------------------------- | ------------------ |
| Part A — Core Form Builder            | ✅ Complete         |
| Part B — AI Form Generation & Editing | ✅ Complete         |
| Part C — Word/Excel Import            | ⚠️ Not implemented |
| Part D — Custom Improvements          | Form versioning and Rollback     |

### Part C Note

Word and Excel import was not implemented within the available development time.

---

## Live Demo

**Application:** `https://ai-powered-form-builder-production-b86d.up.railway.app/`

**Demo credentials:** `edu@net.com, eduneted`

**Github repository:** `https://github.com/KirthanKumar/AI-Powered-Form-Builder`

---

# Features

## Core Form Builder

* Create forms with a title and description
* Visual drag-and-drop/click-based form builder
* Organize fields into sections
* Add, edit, duplicate, reorder, and delete fields
* Add, rename, and delete sections
* Support for multiple field types
* Per-field configuration
* JSON schema as the source of truth
* Server-side schema validation
* Form publishing and unpublishing
* Public form URLs
* Submission storage
* Submission listing with pagination and search
* CSV export
* Authentication and authorization

### Supported Field Types

The builder supports:

* Text
* Textarea
* Number
* Email
* Phone
* Date
* Dropdown
* Radio
* Checkbox
* File Upload
* Rating

Fields are represented as JSON schema objects rather than being stored as separate database records.

---

# AI Form Generation

The application integrates an LLM to generate and modify form schemas from natural-language instructions.

Examples:

```text
Create an internship application form with education history,
skills, experience and resume upload.
```

Existing forms can also be modified through natural-language instructions such as:

```text
Add an emergency contact section.
```

```text
Make phone number required.
```

The AI-generated result is converted into the application's JSON schema and passed through schema validation before being persisted.

### AI Safety and Validation

The AI layer is not treated as a trusted source.

The generated schema is:

1. Received from the AI service.
2. Parsed into structured data.
3. Validated against the application's schema rules.
4. Rejected if it does not satisfy the required structure.
5. Persisted only after successful validation.

This prevents malformed AI output from corrupting stored form definitions.

---

# Form Versioning and Rollback

Form changes are stored as immutable versions.

Every schema modification creates a new version when the resulting schema differs from the current version.

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

The builder exposes version history and allows the user to roll back to a previous version.

Rollback does not overwrite or delete the historical version. Instead, the selected historical schema becomes the basis for a new current version.

A schema hash is stored with every version to detect whether a change actually occurred.

---

# Architecture

The application follows a Laravel API + React frontend architecture.

```text
                         ┌─────────────────────┐
                         │       React UI      │
                         │                     │
                         │ Form Builder        │
                         │ Dashboard           │
                         │ Submissions         │
                         │ AI Interface        │
                         └──────────┬──────────┘
                                    │
                                  REST
                                    │
                         ┌──────────▼──────────┐
                         │   Laravel API       │
                         │                     │
                         │ Controllers         │
                         │ Form Requests       │
                         │ API Resources       │
                         │ Policies            │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │      Services       │
                         │                     │
                         │ FormService         │
                         │ SchemaService       │
                         │ FormVersionService  │
                         │ AI services         │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │     Schema Layer    │
                         │                     │
                         │ SchemaEditor        │
                         │ SchemaValidator     │
                         │ FieldFactory        │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │       MySQL         │
                         │                     │
                         │ forms               │
                         │ form_versions       │
                         │ submissions         │
                         │ users               │
                         └─────────────────────┘
```

---

# Technology Stack

### Backend

* PHP 8.2+
* Laravel
* Laravel REST APIs
* Laravel Eloquent ORM
* Laravel Form Requests
* Laravel API Resources
* Laravel Policies / Authorization
* MySQL 8

### Frontend

* React
* React Router
* JavaScript ES6+
* Bootstrap 5
* Axios

### AI

* LLM API integration
* Structured JSON schema generation
* Schema validation before persistence

### Development

* Git
* Composer
* NPM
* Vite

---

# Database Design

The core database consists of users, forms, form versions, and submissions.

## Main Relationships

```text
users
  │
  └── hasMany forms
              │
              ├── hasMany form_versions
              │
              └── hasMany submissions
```

A form maintains a reference to its current version:

```text
forms.current_version_id
        │
        ▼
form_versions.id
```

## Forms

The `forms` table stores form-level information:

* UUID
* Owner
* Title
* Description
* Status
* Current version
* Published timestamp
* Soft deletion information

Important indexes include:

* `uuid` — unique lookup for public form URLs
* `user_id` — efficient retrieval of a user's forms
* `status` — filtering by draft/published/archived status

## Form Versions

The `form_versions` table stores immutable JSON schema snapshots.

Important columns:

* `form_id`
* `version_number`
* `schema_json`
* `schema_hash`
* `created_by`

The combination of:

```text
form_id + version_number
```

is unique.

The schema hash is indexed to support efficient comparison/deduplication.

## Submissions

Submissions reference the form they belong to and store submitted data against the schema used by the form.

---

# JSON Schema

The JSON schema is the single source of truth for the form structure.

A simplified example:

```json
{
  "version": 1,
  "sections": [
    {
      "id": "section-id",
      "title": "Personal Information",
      "fields": [
        {
          "id": "field-id",
          "type": "text",
          "key": "full_name",
          "label": "Full Name",
          "required": true
        }
      ]
    }
  ]
}
```

The frontend uses the schema to render the builder.

The backend validates the schema before creating a new version.

The same schema is used as the basis for server-side submission validation.

---

# API Documentation

The application exposes REST APIs for authentication, form management, schema editing, publishing, submissions, versioning, and AI operations.

## Form APIs

```text
GET    /api/forms
POST   /api/forms
GET    /api/forms/{form}
```

## Section APIs

```text
POST   /api/forms/{form}/sections
PATCH  /api/forms/{form}/sections/{section}
DELETE /api/forms/{form}/sections/{section}
```

## Field APIs

```text
POST   /api/forms/{form}/sections/{section}/fields
PATCH  /api/forms/{form}/fields/{field}
DELETE /api/forms/{form}/fields/{field}
POST   /api/forms/{form}/fields/{field}/duplicate
PATCH  /api/forms/{form}/sections/{section}/fields/move
```

## Publishing APIs

```text
POST   /api/forms/{form}/publish
POST   /api/forms/{form}/unpublish
```

## Versioning APIs

```text
GET    /api/forms/{form}/versions
POST   /api/forms/{form}/versions/{version}/rollback
```

## AI APIs

```text
POST   /api/forms/{form}/ai/edit
```

## Schema API

```text
GET    /api/forms/{form}/schema
```

The APIs use Laravel authorization policies to ensure users can only access forms they are authorized to manage.

---

# AI Prompt Strategy

The AI integration is designed around structured output rather than allowing the model to directly determine arbitrary application data.

The AI is instructed to produce a form representation compatible with the application's schema.

The expected contract includes:

* Form sections
* Field IDs
* Field types
* Labels
* Keys
* Placeholders
* Help text
* Defaults
* Required flags
* Options where applicable
* Validation information

Only supported field types are accepted.

The generated result is validated by the backend before persistence.

### Handling Invalid AI Output

AI responses can be malformed or contain unsupported structures.

The application therefore treats AI output as untrusted input and validates it before saving.

Invalid output is rejected rather than persisted as a broken form schema.

### AI Editing

AI editing operates on an existing form schema.

The existing schema is provided as the basis for the requested modification, allowing commands such as:

```text
Add an emergency contact section.
```

or:

```text
Make the phone field required.
```

The resulting schema goes through the same validation and versioning flow as manual edits.

---

# Part C — Word & Excel Import

**Status: Not implemented.**

The current submission does not include Word or Excel import functionality.

The intended architecture would use a hybrid approach:

### Word

A `.docx` parser would first deterministically identify:

* Headings → sections
* Questions → fields
* Checkbox/choice lists → field options

AI could then be used only where the document structure is ambiguous, such as determining field type or validation rules.

### Excel

A documented tabular format would be supported, for example:

```text
| Label | Type | Required | Options |
|-------|------|----------|---------|
| Name  | text | yes      |         |
| Email | email| yes      |         |
| Role  | dropdown | no   | Backend,Frontend |
```

A preview/mapping stage would be presented before committing the imported schema.

Large imports would ideally be processed through queued jobs.

This functionality was not completed within the assessment scope/time available.

---

# Part D — Custom Improvements

The project includes form versioning and rollback as a custom product/engineering improvement.

Additional Part D improvements are documented here as they are completed.

For every Part D feature, the following are documented:

* User problem
* Implementation
* Trade-offs
* Future improvements

---

# Authentication & Authorization

Authenticated users can manage their own forms.

Form operations are protected through Laravel authorization policies.

Operations such as:

* Viewing a form
* Updating a form
* Publishing
* Unpublishing
* Editing fields
* Managing versions
* Rolling back versions
* Managing submissions

are authorized on the backend.

The browser is not treated as a trusted authorization boundary.

---

# Public Forms

Published forms receive a public URL:

```text
/public/forms/{uuid}
```

The public form can be opened without access to the authenticated form builder.

The public UUID is separate from the internal numeric database ID.

---

# Submissions

Public users can submit responses to published forms.

The submission data is validated server-side using the form schema rather than relying on browser-side validation.

Authenticated form owners can:

* View submissions
* Search submissions
* Paginate submissions
* View submission details
* Export submissions as CSV

---

# Installation

## Requirements

* PHP 8.2+
* Composer
* Node.js / NPM
* MySQL 8
* Laravel-supported PHP extensions

## Clone

```bash
git clone https://github.com/KirthanKumar/AI-Powered-Form-Builder.git
cd AI-Powered-Form-Builder
```

## Backend dependencies

```bash
composer install
```

## Frontend dependencies

```bash
npm install
```

## Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the database and required AI/API credentials in `.env`.

Generate the Laravel application key:

```bash
php artisan key:generate
```

## Database

Run migrations:

```bash
php artisan migrate
```

## Frontend

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Run Laravel

```bash
php artisan serve
```

The application will then be available at the configured local URL.

---

# Environment Variables

Sensitive credentials must not be committed to Git.

The repository includes `.env.example` containing the required environment variable names.

Typical configuration includes:

```text
APP_NAME
APP_URL

DB_CONNECTION
DB_HOST
DB_PORT
DB_DATABASE
DB_USERNAME
DB_PASSWORD

AI / LLM provider configuration
AI_PROVIDER
AI_MODEL
AI_API_KEY
AI_API_URL
```

---

# Known Limitations

* Word/Excel import is not implemented.
* Additional Part D improvements is limited by the assessment time window.
* AI behavior depends on the configured LLM provider and its availability.
* Large-scale production deployment would benefit from additional infrastructure such as queues, Redis, monitoring, and more extensive automated test coverage.