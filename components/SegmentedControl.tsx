"use client";

interface Option {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-md border border-border p-1 bg-surface">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`h-10 rounded-[4px] text-sm font-medium transition-colors ${
              selected
                ? "bg-foreground text-background"
                : "text-secondary hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
