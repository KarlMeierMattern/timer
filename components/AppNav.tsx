"use client";

import type { Preferences } from "@/lib/types";
import { SettingsMenu } from "./SettingsMenu";

interface AppNavProps {
  prefs: Preferences;
  onPrefsChange: (prefs: Preferences) => void;
}

export function AppNav({ prefs, onPrefsChange }: AppNavProps) {
  return (
    <nav className="mb-6" aria-label="App">
      <p className="text-xs uppercase tracking-[0.14em] text-secondary">
        Workout timer
      </p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h1 className="text-[1.75rem] font-medium tracking-tight">Timer</h1>
        <SettingsMenu prefs={prefs} onPrefsChange={onPrefsChange} />
      </div>
    </nav>
  );
}
