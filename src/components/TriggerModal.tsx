import { useState } from 'react';
import { loadWorkflowInputs } from '../storage';

interface TriggerModalProps {
    workflowName: string;
    onTrigger: (inputs: Record<string, string>, ref?: string) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function TriggerModal({
    workflowName,
    onTrigger,
    onCancel,
    loading,
}: TriggerModalProps) {
    const getInitialBranch = () => {
        const savedInputs = loadWorkflowInputs();
        if (savedInputs && savedInputs.workflowName === workflowName) {
            return savedInputs.inputs['ref'] || 'dev';
        }
        return 'dev';
    };

    const [branch, setBranch] = useState(getInitialBranch());

    const handleSubmit = () => {
        // Remove ref from inputs if it exists, and pass it separately
        onTrigger({}, branch);
    };

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
