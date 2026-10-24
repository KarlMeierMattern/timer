"use client";

interface StepperProps {
  label: string;
  displayValue: string;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
}

export function Stepper({
  label,
  displayValue,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
}: StepperProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-border">
      <span className="text-xs uppercase tracking-[0.12em] text-secondary">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={decreaseDisabled}
          onClick={onDecrease}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-lg text-foreground disabled:opacity-30"
        >
          −
        </button>
        <span className="min-w-[4.5rem] text-center font-mono text-base tabular-nums">
          {displayValue}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={increaseDisabled}
          onClick={onIncrease}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-lg text-foreground disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
