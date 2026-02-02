interface FilterBarProps {
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    sortOrder: 'asc' | 'desc' | '';
    onSortChange: (order: 'asc' | 'desc' | '') => void;
}

export function FilterBar({ selectedStatus, onStatusChange, sortOrder, onSortChange }: FilterBarProps) {
    return (
        <div className="mb-4 flex gap-2 items-center flex-wrap">
            <span className="label-text font-semibold text-base-content">Filter by:</span>
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
            <span className="label-text font-semibold text-base-content ml-2">Sort by:</span>
            <select
                className="select select-bordered select-sm"
                value={sortOrder}
                onChange={(e) => onSortChange(e.target.value as 'asc' | 'desc' | '')}
                aria-label="Sort workflows by name"
            >
                <option value="asc">Name (A-Z)</option>
                <option value="desc">Name (Z-A)</option>
            </select>
        </div>
    );
}
