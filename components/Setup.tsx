"use client";

import { useMemo, useState } from "react";
import { PRESET_OPTIONS } from "@/lib/presets";
import { formatDurationLabel } from "@/lib/format";
import type { Preferences, SavedWorkout, WorkoutConfig } from "@/lib/types";
import { SegmentedControl } from "./SegmentedControl";
import { Stepper } from "./Stepper";

interface SetupProps {
  config: WorkoutConfig;
  prefs: Preferences;
  saved: SavedWorkout[];
  onConfigChange: (config: WorkoutConfig) => void;
  onPrefsChange: (prefs: Preferences) => void;
  onSaveWorkout: (name: string) => void;
  onLoadSaved: (workout: SavedWorkout) => void;
  onDeleteSaved: (id: string) => void;
  onStart: () => void;
}

function presetIdForConfig(config: WorkoutConfig): string {
  if (config.mode === "timer") return "timer";
  if (config.restPlacement === "afterEachRound") return "tabata";
  return "emom";
}

export function Setup({
  config,
  prefs,
  saved,
  onConfigChange,
  onPrefsChange,
  onSaveWorkout,
  onLoadSaved,
  onDeleteSaved,
  onStart,
}: SetupProps) {
  const [customName, setCustomName] = useState(config.name);
  const activePreset = useMemo(() => presetIdForConfig(config), [config]);

  const setPreset = (id: string) => {
    const preset = PRESET_OPTIONS.find((item) => item.id === id);
    if (!preset) return;
    const next = { ...preset.config, id: `custom-${Date.now()}` };
    setCustomName(next.name);
    onConfigChange(next);
  };

  const patch = (partial: Partial<WorkoutConfig>) => {
    onConfigChange({ ...config, ...partial, name: customName || config.name });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.14em] text-secondary">
          Workout timer
        </p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight">Timer</h1>
      </header>

      <SegmentedControl
        options={PRESET_OPTIONS.map((p) => ({ id: p.id, label: p.label }))}
        value={activePreset}
        onChange={setPreset}
      />

      {config.mode === "workout" ? (
        <section className="rounded-md border border-border bg-surface px-4">
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
          />
        </section>
      ) : (
        <section className="rounded-md border border-border bg-surface px-4">
          <div className="flex items-center justify-between gap-3 border-b border-border py-3">
            <span className="text-xs uppercase tracking-[0.12em] text-secondary">
              Direction
            </span>
            <div className="grid grid-cols-2 gap-1 rounded-md border border-border p-1">
              {(["down", "up"] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  onClick={() => patch({ timerDirection: direction })}
                  className={`h-9 rounded-[4px] text-sm capitalize ${
                    config.timerDirection === direction
                      ? "bg-foreground text-background"
                      : "text-secondary"
                  }`}
                >
                  {direction}
                </button>
              ))}
            </div>
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
            />
          )}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <label className="text-xs uppercase tracking-[0.12em] text-secondary">
          Name
        </label>
        <input
          value={customName}
          onChange={(e) => {
            setCustomName(e.target.value);
            onConfigChange({ ...config, name: e.target.value });
          }}
          className="h-12 rounded-md border border-border bg-surface px-3 font-sans text-base outline-none focus:border-foreground"
          placeholder="Workout name"
        />
        <button
          type="button"
          onClick={() => onSaveWorkout(customName || "Custom")}
          className="h-12 rounded-md border border-border text-sm text-secondary"
        >
          Save to this phone
        </button>
      </section>

      {saved.length > 0 && (
        <section>
          <p className="mb-2 text-xs uppercase tracking-[0.12em] text-secondary">
            Saved
          </p>
          <ul className="flex flex-col gap-2">
            {saved.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-md border border-border bg-surface p-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setCustomName(item.name);
                    onLoadSaved(item);
                  }}
                  className="min-h-11 flex-1 text-left px-2 text-sm"
                >
                  {item.name}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => onDeleteSaved(item.id)}
                  className="h-11 w-11 text-secondary"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2 border-t border-border pt-4">
        <label className="flex items-center justify-between text-sm">
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
        <label className="flex items-center justify-between text-sm">
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
        className="mt-auto h-12 w-full rounded-md bg-foreground text-base font-medium text-background"
      >
        Start
      </button>
    </div>
  );
}
