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

      <div className="flex flex-1 flex-col justify-center gap-5 px-1 pt-8">
        <p
          className={`text-center text-xs uppercase tracking-[0.16em] ${
            isRest ? "text-accent" : "text-secondary"
          }`}
        >
          {phase}
        </p>

        <p
          className={`text-center font-mono text-[clamp(3.25rem,17vw,5.25rem)] leading-none tabular-nums tracking-tight ${
            isRest ? "text-accent" : "text-foreground"
          }`}
        >
          {displayTime(clock.config, remainingMs, view.elapsedInSegmentMs)}
        </p>

        {!isDone &&
          clock.config.mode === "workout" &&
          segment.phase !== "prep" && (
            <p className="text-center text-sm leading-relaxed text-secondary">
              Round {segment.roundIndex} of {segment.roundTotal}
              {segment.blockTotal > 1 && (
                <>
                  {" "}
                  · Block {segment.blockIndex} of {segment.blockTotal}
                </>
              )}
            </p>
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
