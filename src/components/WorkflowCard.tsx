import type { Workflow } from '../types';

interface WorkflowCardProps {
    workflow: Workflow;
    onTrigger: (workflowId: number, workflowName: string) => void;
    loading?: boolean;
}

export function WorkflowCard({ workflow, onTrigger, loading }: WorkflowCardProps) {
    const stateColor = workflow.state === 'active' ? 'badge-success' : 'badge-warning';
    const stateText = workflow.state === 'active' ? 'Active' : 'Disabled';

    return (
        <div className="flex items-center gap-4 p-4 bg-base-100 border border-base-300 rounded-lg hover:bg-base-200 transition-colors">
            {/* Name */}
            <div className="flex-[2] min-w-0">
                <h3 className="font-semibold text-base truncate">{workflow.name}</h3>
            </div>

            {/* Status Badge */}
            <div className={`badge ${stateColor} flex-shrink-0`}>{stateText}</div>

            {/* Path */}
            <div className="flex-[3] min-w-0">
                <p className="text-sm text-base-content/60 font-mono truncate">{workflow.path}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
                <div className="tooltip" data-tip={workflow.canTrigger === false ? "Workflow cannot be manually triggered (missing workflow_dispatch)" : ""}>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onTrigger(workflow.id, workflow.name)}
                        disabled={loading || workflow.state !== 'active' || workflow.canTrigger === false}
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
                </div>
                <a
                    href={workflow.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                >
                    GitHub
                </a>
            </div>
        </div>
    );
}
