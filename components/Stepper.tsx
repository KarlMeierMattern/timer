"use client";

interface StepperProps {
  label: string;
  displayValue: string;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
  isLast?: boolean;
}

export function Stepper({
  label,
  displayValue,
  onDecrease,
  onIncrease,
  decreaseDisabled,
  increaseDisabled,
  isLast,
}: StepperProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-4 ${
        isLast ? "" : "border-b border-border"
      }`}
    >
      <span className="text-xs uppercase tracking-[0.12em] text-secondary">
        {label}
      </span>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={decreaseDisabled}
          onClick={onDecrease}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border text-xl leading-none text-foreground disabled:opacity-30"
        >
          −
        </button>
        <span className="min-w-[5rem] text-center font-mono text-base tabular-nums">
          {displayValue}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={increaseDisabled}
          onClick={onIncrease}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border text-xl leading-none text-foreground disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}
