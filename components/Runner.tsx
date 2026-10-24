"use client";

import { formatClock } from "@/lib/format";
import { phaseLabel, resolveSession } from "@/lib/engine";
import type { SessionClock, WorkoutConfig } from "@/lib/types";

interface RunnerProps {
  clock: SessionClock;
  nowMs: number;
  flash: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onEnd: () => void;
}

function displayTime(
  config: WorkoutConfig,
  remainingMs: number,
  elapsedInSegmentMs: number,
): string {
  if (config.mode === "timer" && config.timerDirection === "up") {
    return formatClock(elapsedInSegmentMs);
  }
  if (!Number.isFinite(remainingMs)) {
    return formatClock(elapsedInSegmentMs);
  }
  return formatClock(remainingMs);
}

const controlButtonClass =
  "flex h-12 min-h-12 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium disabled:opacity-40";

export function Runner({
  clock,
  nowMs,
  flash,
  onPause,
  onResume,
  onSkip,
  onEnd,
}: RunnerProps) {
  const view = resolveSession(clock, nowMs);
  if (!view) return null;

  const { segment, remainingMs, totalRemainingMs, sessionProgress, nextLabel } =
    view;
  const isDone = segment.phase === "done";
  const isRest = segment.phase === "rest";
  const phase = isDone ? "Done" : phaseLabel(segment);

  const progressPercent = Math.round(sessionProgress * 100);

  return (
    <div
      className={`relative flex min-h-0 flex-1 flex-col ${
        flash ? "bg-foreground/[0.06]" : ""
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-border" aria-hidden>
        <div
          className={`h-full transition-none ${isRest ? "bg-accent" : "bg-foreground"}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-6 px-1 pt-2">
        <p
          className={`text-center text-xs uppercase tracking-[0.16em] ${
            isRest ? "text-accent" : "text-secondary"
          }`}
        >
          {phase}
        </p>

        <p
          className={`text-center font-mono text-[clamp(4.75rem,26vw,7.5rem)] leading-[0.9] tabular-nums tracking-tight ${
            isRest ? "text-accent" : "text-foreground"
          }`}
        >
          {displayTime(clock.config, remainingMs, view.elapsedInSegmentMs)}
        </p>

        {!isDone &&
          clock.config.mode === "workout" &&
          segment.phase !== "prep" && (
            <div className="flex w-full flex-col gap-4 px-2">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.14em] text-secondary">
                  Round
                </p>
                <p className="mt-1 font-mono tabular-nums leading-none">
                  <span className="text-4xl font-medium text-foreground">
                    {segment.roundIndex}
                  </span>
                  <span className="text-xl text-secondary">
                    {" "}
                    / {segment.roundTotal}
                  </span>
                </p>
              </div>
              {segment.blockTotal > 1 && (
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.14em] text-secondary">
                    Block
                  </p>
                  <p className="mt-1 font-mono tabular-nums leading-none">
                    <span className="text-4xl font-medium text-foreground">
                      {segment.blockIndex}
                    </span>
                    <span className="text-xl text-secondary">
                      {" "}
                      / {segment.blockTotal}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

        {!isDone && nextLabel && (
          <p className="text-center text-xs uppercase tracking-[0.12em] text-secondary">
            Next · {nextLabel}
          </p>
        )}

        {!isDone &&
          Number.isFinite(totalRemainingMs) &&
          clock.config.mode === "workout" && (
            <p className="text-center font-mono text-sm tabular-nums text-secondary">
              {formatClock(totalRemainingMs)} left in session
            </p>
          )}
      </div>

      <div className="flex flex-col gap-2.5 pb-1">
        {clock.isPaused ? (
          <>
            <button
              type="button"
              onClick={onResume}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-foreground text-base font-medium text-background"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={onEnd}
              className={`${controlButtonClass} w-full text-secondary`}
            >
              End
            </button>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={onPause}
                disabled={isDone}
                className={controlButtonClass}
              >
                Pause
              </button>
              <button
                type="button"
                onClick={onSkip}
                disabled={isDone}
                className={controlButtonClass}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={onEnd}
                className={`${controlButtonClass} text-secondary`}
              >
                End
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
