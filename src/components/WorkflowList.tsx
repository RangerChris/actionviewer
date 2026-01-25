import type { Workflow } from '../types';
import { WorkflowCard } from './WorkflowCard';

interface WorkflowListProps {
    workflows: Workflow[];
    loading?: boolean;
    onTrigger: (workflowId: number, workflowName: string) => void;
}

export function WorkflowList({ workflows, loading, onTrigger }: WorkflowListProps) {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    if (workflows.length === 0) {
        return (
            <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>No workflows found. Try adjusting your filters or check the repository name.</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
                <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onTrigger={onTrigger}
                    loading={loading}
                />
            ))}
        </div>
    );
}
