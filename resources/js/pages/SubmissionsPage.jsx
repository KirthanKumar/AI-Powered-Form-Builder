import { useParams } from 'react-router-dom';

export default function SubmissionsPage() {

    const { formId } = useParams();

    return (
        <div className="container py-5">
            <h1>Submissions</h1>

            <p className="text-muted">
                Submissions for form: {formId}
            </p>
        </div>
    );
}