interface FilterBarProps {
    selectedStatus: string;
    onStatusChange: (status: string) => void;
}

export function FilterBar({ selectedStatus, onStatusChange }: FilterBarProps) {
    return (
        <div className="mb-4 flex gap-2">
            <span className="label-text flex items-center font-semibold">Filter by:</span>
            <select
                className="select select-bordered select-sm"
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                aria-label="Filter workflows by status"
            >
                <option value="">All Workflows</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
            </select>
        </div>
    );
}
