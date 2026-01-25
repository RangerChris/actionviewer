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
            className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition-shadow cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="card-body p-5">
                {/* Header: Name and Badge */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <h2 className="card-title text-lg truncate">{workflow.name}</h2>
                    </div>
                    <div className={`badge ${stateColor} badge-lg`}>{stateText}</div>
                </div>

                {/* Path */}
                <p className="text-sm text-base-content/60 font-mono truncate mb-3">{workflow.path}</p>

                {/* Dates */}
                <div className="text-xs text-base-content/50 space-y-1 mb-4">
                    <p>Created: <span className="font-medium">{createdDate}</span></p>
                    <p>Updated: <span className="font-medium">{updatedDate}</span></p>
                </div>

                {/* Action Buttons */}
                {isHovered && workflow.state === 'active' && (
                    <div className="card-actions gap-2 pt-2 border-t border-base-300">
                        <button
                            className="btn btn-primary btn-sm flex-1"
                            onClick={() => onTrigger(workflow.id, workflow.name)}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-xs"></span>
                                    Triggering...
                                </>
                            ) : (
                                'Trigger'
                            )}
                        </button>
                        <a
                            href={workflow.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm flex-1"
                        >
                            GitHub
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
