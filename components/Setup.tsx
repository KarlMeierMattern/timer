"use client";

import { PRESET_OPTIONS } from "@/lib/presets";
import { formatDurationLabel } from "@/lib/format";
import { loadEmomConfig, loadTimerConfig } from "@/lib/storage";
import type { WorkoutConfig } from "@/lib/types";
import { SegmentedControl } from "./SegmentedControl";
import { Stepper } from "./Stepper";

interface SetupProps {
  config: WorkoutConfig;
  onConfigChange: (config: WorkoutConfig) => void;
  onStart: () => void;
}

function presetIdForConfig(config: WorkoutConfig): string {
  return config.mode === "timer" ? "timer" : "emom";
}

export function Setup({ config, onConfigChange, onStart }: SetupProps) {
  const activePreset = presetIdForConfig(config);

  const setPreset = (id: string) => {
    if (id === "timer") {
      onConfigChange(loadTimerConfig());
      return;
    }
    onConfigChange(loadEmomConfig());
  };

  const patch = (partial: Partial<WorkoutConfig>) => {
    onConfigChange({ ...config, ...partial });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-8">
      <header className="pt-1">
        <p className="text-xs uppercase tracking-[0.14em] text-secondary">
          Workout timer
        </p>
        <h1 className="mt-2 text-[1.75rem] font-medium tracking-tight">
          Timer
        </h1>
      </header>

      <SegmentedControl
        options={PRESET_OPTIONS.map((p) => ({ id: p.id, label: p.label }))}
        value={activePreset}
        onChange={setPreset}
        columns={2}
      />

      {config.mode === "workout" ? (
        <section className="rounded-lg border border-border bg-surface px-4">
          <Stepper
            label="Work"
            displayValue={formatDurationLabel(config.workSeconds)}
            onDecrease={() =>
              patch({ workSeconds: Math.max(5, config.workSeconds - 5) })
            }
            onIncrease={() =>
              patch({ workSeconds: Math.min(600, config.workSeconds + 5) })
            }
          />
          <Stepper
            label="Rounds"
            displayValue={String(config.workRounds)}
            onDecrease={() =>
              patch({ workRounds: Math.max(1, config.workRounds - 1) })
            }
            onIncrease={() =>
              patch({ workRounds: Math.min(20, config.workRounds + 1) })
            }
          />
          <Stepper
            label="Rest"
            displayValue={formatDurationLabel(config.restSeconds)}
            onDecrease={() =>
              patch({ restSeconds: Math.max(0, config.restSeconds - 5) })
            }
            onIncrease={() =>
              patch({ restSeconds: Math.min(600, config.restSeconds + 5) })
            }
          />
          <Stepper
            label="Blocks"
            displayValue={String(config.blockRepeats)}
            onDecrease={() =>
              patch({ blockRepeats: Math.max(1, config.blockRepeats - 1) })
            }
            onIncrease={() =>
              patch({ blockRepeats: Math.min(20, config.blockRepeats + 1) })
            }
            isLast
          />
        </section>
      ) : (
        <section className="rounded-lg border border-border bg-surface px-4">
          <div className="flex flex-col gap-4 border-b border-border py-4">
            <span className="text-xs uppercase tracking-[0.12em] text-secondary">
              Direction
            </span>
            <SegmentedControl
              options={[
                { id: "down", label: "Down" },
                { id: "up", label: "Up" },
              ]}
              value={config.timerDirection}
              onChange={(id) =>
                patch({ timerDirection: id as "down" | "up" })
              }
              columns={2}
            />
          </div>
          {config.timerDirection === "down" && (
            <Stepper
              label="Duration"
              displayValue={formatDurationLabel(config.timerSeconds)}
              onDecrease={() =>
                patch({
                  timerSeconds: Math.max(5, config.timerSeconds - 5),
                })
              }
              onIncrease={() =>
                patch({
                  timerSeconds: Math.min(3600, config.timerSeconds + 5),
                })
              }
              isLast
            />
          )}
        </section>
      )}

      <button
        type="button"
        onClick={onStart}
        className="mt-auto h-12 w-full rounded-lg bg-foreground text-base font-medium text-background"
      >
        Start
      </button>
    </div>
  );
}
