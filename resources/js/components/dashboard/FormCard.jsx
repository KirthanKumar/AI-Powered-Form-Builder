import { Link } from 'react-router-dom';

export default function FormCard({ form }) {
    return (
        <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">

                <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">
                        {form.title}
                    </h5>

                    <span
                        className={`badge ${form.status === 'published'
                            ? 'text-bg-success'
                            : 'text-bg-secondary'
                            }`}
                    >
                        {form.status}
                    </span>
                </div>

                <p className="card-text text-muted">
                    {form.description || 'No description'}
                </p>

                <div className="small text-muted mb-3">
                    Version {form.current_version?.version_number ?? 1}
                </div>

                <div className="mt-auto d-flex gap-2">
                    <Link
                        to={`/forms/${form.id}/builder`}
                        className="btn btn-primary"
                    >
                        Edit form
                    </Link>
                    <Link
                        to={`/forms/${form.id}/submissions`}
                        className="btn btn-sm btn-outline-primary"
                    >
                        Submissions
                    </Link>
                </div>

            </div>
        </div>
    );
}