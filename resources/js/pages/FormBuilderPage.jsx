import { useParams } from 'react-router-dom';

export default function FormBuilderPage() {

    const { formId } = useParams();

    return (
        <div className="container py-5">
            <h1>Form Builder</h1>

            <p className="text-muted">
                Editing form: {formId}
            </p>
        </div>
    );
}