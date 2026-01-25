import type { Workflow } from '../types';
import { useState } from 'react';

interface WorkflowCardProps {
    workflow: Workflow;
    onTrigger: (workflowId: number, workflowName: string) => void;
    loading?: boolean;
}

export function WorkflowCard({ workflow, onTrigger, loading }: WorkflowCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const updatedDate = new Date(workflow.updated_at).toLocaleDateString();
    const createdDate = new Date(workflow.created_at).toLocaleDateString();

    const stateColor = workflow.state === 'active' ? 'badge-success' : 'badge-warning';
    const stateText = workflow.state === 'active' ? 'Active' : 'Disabled';

    return (
        <div
            className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition-shadow"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="card-body">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h2 className="card-title text-lg">{workflow.name}</h2>
                        <p className="text-sm text-base-content/60 font-mono">{workflow.path}</p>
                    </div>
                    <div className={`badge ${stateColor} text-white`}>{stateText}</div>
                    <p>Created: {createdDate}</p>
                    <p>Updated: {updatedDate}</p>
                </div>

                {isHovered && workflow.state === 'active' && (
                    <div className="card-actions justify-end mt-4">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onTrigger(workflow.id, workflow.name)}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-xs"></span>
                                </>
                            ) : (
                                'Trigger'
                            )}
                        </button>
                        <a
                            href={workflow.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                        >
                            View on GitHub
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
