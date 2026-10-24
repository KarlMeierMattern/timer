import { DEFAULT_EMOM, DEFAULT_TIMER } from "./presets";
import type { Preferences, WorkoutConfig } from "./types";

const PREFS_KEY = "timer:prefs";
const PREFS_DEFAULTS_FLAG = "timer:prefs-defaults-v2";
const EMOM_CONFIG_KEY = "timer:emom-config";
const TIMER_CONFIG_KEY = "timer:timer-config";
const LEGACY_CONFIG_KEY = "timer:last-config";

export const DEFAULT_PREFERENCES: Preferences = {
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

function migrateLegacyConfig(): void {
  if (typeof window === "undefined") return;
  const legacy = window.localStorage.getItem(LEGACY_CONFIG_KEY);
  if (!legacy) return;

  try {
    const parsed = JSON.parse(legacy) as WorkoutConfig;
    if (parsed.mode === "timer") {
      writeJson(TIMER_CONFIG_KEY, parsed);
    } else {
      writeJson(EMOM_CONFIG_KEY, parsed);
    }
  } catch {
    // ignore invalid legacy data
  }

  window.localStorage.removeItem(LEGACY_CONFIG_KEY);
}

function migratePreferenceDefaults(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(PREFS_DEFAULTS_FLAG)) return;

  const prefs: Preferences = {
    ...DEFAULT_PREFERENCES,
    ...readJson<Partial<Preferences>>(PREFS_KEY, {}),
    soundEnabled: true,
    prepEnabled: true,
  };
  writeJson(PREFS_KEY, prefs);
  window.localStorage.setItem(PREFS_DEFAULTS_FLAG, "1");
}

export function loadPreferences(): Preferences {
  migratePreferenceDefaults();
  const stored = readJson<Partial<Preferences>>(PREFS_KEY, {});
  return {
    soundEnabled: stored.soundEnabled ?? DEFAULT_PREFERENCES.soundEnabled,
    prepEnabled: stored.prepEnabled ?? DEFAULT_PREFERENCES.prepEnabled,
  };
}

export function savePreferences(prefs: Preferences): void {
  writeJson(PREFS_KEY, prefs);
}

export function loadEmomConfig(): WorkoutConfig {
  migrateLegacyConfig();
  const stored = readJson<Partial<WorkoutConfig> | null>(EMOM_CONFIG_KEY, null);
  return {
    ...DEFAULT_EMOM,
    ...stored,
    mode: "workout",
    name: "EMOM",
    restPlacement: "afterBlock",
  };
}

export function loadTimerConfig(): WorkoutConfig {
  migrateLegacyConfig();
  const stored = readJson<Partial<WorkoutConfig> | null>(TIMER_CONFIG_KEY, null);
  return {
    ...DEFAULT_TIMER,
    ...stored,
    mode: "timer",
    name: "Timer",
  };
}

export function saveEmomConfig(config: WorkoutConfig): void {
  writeJson(EMOM_CONFIG_KEY, {
    ...config,
    mode: "workout",
    name: "EMOM",
    restPlacement: "afterBlock",
  });
}

export function saveTimerConfig(config: WorkoutConfig): void {
  writeJson(TIMER_CONFIG_KEY, {
    ...config,
    mode: "timer",
    name: "Timer",
  });
}

export function saveConfig(config: WorkoutConfig): void {
  if (config.mode === "timer") {
    saveTimerConfig(config);
  } else {
    saveEmomConfig(config);
  }
}
