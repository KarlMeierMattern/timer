"use client";

import { PRESET_OPTIONS } from "@/lib/presets";
import { formatDurationLabel } from "@/lib/format";
import type { Preferences, WorkoutConfig } from "@/lib/types";
import { SegmentedControl } from "./SegmentedControl";
import { Stepper } from "./Stepper";

interface SetupProps {
  config: WorkoutConfig;
  prefs: Preferences;
  onConfigChange: (config: WorkoutConfig) => void;
  onPrefsChange: (prefs: Preferences) => void;
  onStart: () => void;
}

function presetIdForConfig(config: WorkoutConfig): string {
  return config.mode === "timer" ? "timer" : "emom";
}

export function Setup({
  config,
  prefs,
  onConfigChange,
  onPrefsChange,
  onStart,
}: SetupProps) {
  const activePreset = presetIdForConfig(config);

  const setPreset = (id: string) => {
    const preset = PRESET_OPTIONS.find((item) => item.id === id);
    if (!preset) return;
    onConfigChange({ ...preset.config, id: `custom-${Date.now()}` });
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

      <section className="flex flex-col gap-1 rounded-lg border border-border px-4 py-1">
        <label className="flex min-h-12 items-center justify-between gap-4 text-sm">
          <span className="text-secondary">3s get ready</span>
          <input
            type="checkbox"
            checked={prefs.prepEnabled}
            onChange={(e) =>
              onPrefsChange({ ...prefs, prepEnabled: e.target.checked })
            }
            className="h-5 w-5 accent-foreground"
          />
        </label>
        <label className="flex min-h-12 items-center justify-between gap-4 border-t border-border text-sm">
          <span className="text-secondary">Sound</span>
          <input
            type="checkbox"
            checked={prefs.soundEnabled}
            onChange={(e) =>
              onPrefsChange({ ...prefs, soundEnabled: e.target.checked })
            }
            className="h-5 w-5 accent-foreground"
          />
        </label>
      </section>

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
