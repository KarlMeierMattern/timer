import type { WorkoutConfig } from "./types";

export const DEFAULT_EMOM: WorkoutConfig = {
  id: "preset-emom",
  name: "EMOM",
  mode: "workout",
  prepSeconds: 3,
  workSeconds: 60,
  workRounds: 4,
  restSeconds: 60,
  restPlacement: "afterBlock",
  blockRepeats: 3,
  timerSeconds: 300,
  timerDirection: "down",
};

export const DEFAULT_TIMER: WorkoutConfig = {
  id: "preset-timer",
  name: "Timer",
  mode: "timer",
  prepSeconds: 0,
  workSeconds: 0,
  workRounds: 1,
  restSeconds: 0,
  restPlacement: "afterBlock",
  blockRepeats: 1,
  timerSeconds: 300,
  timerDirection: "down",
};

export const PRESET_OPTIONS = [
  { id: "emom", label: "EMOM", config: DEFAULT_EMOM },
  { id: "timer", label: "Timer", config: DEFAULT_TIMER },
] as const;
