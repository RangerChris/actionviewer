import { useEffect, useState } from 'react';

interface TriggerModalProps {
    isOpen: boolean;
    workflowName: string;
    onTrigger: (inputs: Record<string, string>) => void;
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
    const [branch, setBranch] = useState('main');

    useEffect(() => {
        if (!isOpen) {
            setInputs({});
            setBranch('main');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const allInputs = { ref: branch, ...inputs };
        onTrigger(allInputs);
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-full max-w-md" role="dialog">
                <h3 className="font-bold text-lg mb-4">Trigger: {workflowName}</h3>

                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text">Branch/Ref</span>
                    </label>
                    <input
                        type="text"
                        placeholder="main"
                        className="input input-bordered"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="modal-action">
                    <button
                        className="btn"
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
