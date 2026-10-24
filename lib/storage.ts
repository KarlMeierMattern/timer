import { DEFAULT_EMOM } from "./presets";
import type { Preferences, SavedWorkout, WorkoutConfig } from "./types";

const PREFS_KEY = "timer:prefs";
const SAVED_KEY = "timer:saved";
const LAST_CONFIG_KEY = "timer:last-config";

const defaultPrefs: Preferences = {
  soundEnabled: true,
  prepEnabled: true,
  theme: "light",
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadPreferences(): Preferences {
  return { ...defaultPrefs, ...readJson(PREFS_KEY, defaultPrefs) };
}

export function savePreferences(prefs: Preferences): void {
  writeJson(PREFS_KEY, prefs);
}

export function loadLastConfig(): WorkoutConfig {
  return readJson(LAST_CONFIG_KEY, DEFAULT_EMOM);
}

export function saveLastConfig(config: WorkoutConfig): void {
  writeJson(LAST_CONFIG_KEY, config);
}

export function loadSavedWorkouts(): SavedWorkout[] {
  return readJson<SavedWorkout[]>(SAVED_KEY, []);
}

export function saveWorkout(entry: SavedWorkout): SavedWorkout[] {
  const existing = loadSavedWorkouts();
  const next = [
    entry,
    ...existing.filter((item) => item.id !== entry.id),
  ].slice(0, 8);
  writeJson(SAVED_KEY, next);
  return next;
}

export function deleteSavedWorkout(id: string): SavedWorkout[] {
  const next = loadSavedWorkouts().filter((item) => item.id !== id);
  writeJson(SAVED_KEY, next);
  return next;
}
