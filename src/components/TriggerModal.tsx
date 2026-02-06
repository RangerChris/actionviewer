import { useEffect, useState } from 'react';
import { loadWorkflowInputs } from '../storage';

interface TriggerModalProps {
    isOpen: boolean;
    workflowName: string;
    onTrigger: (inputs: Record<string, string>, ref?: string) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function TriggerModal({
    isOpen,
    workflowName,
    onTrigger,
    onCancel,
    loading,
}: TriggerModalProps) {
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [branch, setBranch] = useState('dev');

    useEffect(() => {
        if (isOpen) {
            // Try to load previously saved inputs for the same workflow
            const savedInputs = loadWorkflowInputs();
            if (savedInputs && savedInputs.workflowName === workflowName) {
                // Remove ref from saved inputs (it should be stored as branch, not in inputs)
                const cleanInputs = { ...savedInputs.inputs };
                delete cleanInputs.ref;
                setInputs(cleanInputs);
                setBranch(savedInputs.inputs['ref'] || 'dev');
            }
        } else {
            setInputs({});
            setBranch('dev');
        }
    }, [isOpen, workflowName]);

    const handleSubmit = () => {
        // Remove ref from inputs if it exists, and pass it separately
        const cleanInputs = { ...inputs };
        delete cleanInputs.ref;
        onTrigger(cleanInputs, branch);
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-full max-w-md bg-base-100 text-base-content" role="dialog">
                <h3 className="font-bold text-lg mb-4 text-base-content">Trigger: {workflowName}</h3>

                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text">Branch/Ref</span>
                    </label>
                    <input
                        type="text"
                        placeholder="dev"
                        className="input input-bordered bg-base-100 text-base-content"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="modal-action">
                    <button
                        className="btn btn-primary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                            </>
                        ) : (
                            'Trigger'
                        )}
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onCancel}></div>
        </div>
    );
}
