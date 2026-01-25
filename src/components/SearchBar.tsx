interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search workflows...' }: SearchBarProps) {
    return (
        <div className="mb-4">
            <input
                type="text"
                placeholder={placeholder}
                className="input input-bordered w-full"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
