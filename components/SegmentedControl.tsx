"use client";

interface Option {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  columns?: 2 | 3;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  columns = 2,
}: SegmentedControlProps) {
  const gridClass = columns === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div
      className={`grid ${gridClass} gap-1.5 rounded-lg border border-border bg-surface p-1.5`}
    >
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex h-11 min-h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors ${
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
