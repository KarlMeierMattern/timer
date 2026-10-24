import { DEFAULT_EMOM } from "./presets";
import type { Preferences, WorkoutConfig } from "./types";

const PREFS_KEY = "timer:prefs";
const LAST_CONFIG_KEY = "timer:last-config";

const defaultPrefs: Preferences = {
  soundEnabled: true,
  prepEnabled: true,
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
  const stored = readJson<Partial<Preferences>>(PREFS_KEY, defaultPrefs);
  return {
    soundEnabled: stored.soundEnabled ?? defaultPrefs.soundEnabled,
    prepEnabled: stored.prepEnabled ?? defaultPrefs.prepEnabled,
  };
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
