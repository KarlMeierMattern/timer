"use client";

import type { Preferences } from "@/lib/types";
import { SettingsMenu } from "./SettingsMenu";

interface AppNavProps {
  prefs: Preferences;
  onPrefsChange: (prefs: Preferences) => void;
}

export function AppNav({ prefs, onPrefsChange }: AppNavProps) {
  return (
    <nav
      className="mb-6 flex h-10 shrink-0 items-center justify-end"
      aria-label="App"
    >
      <SettingsMenu prefs={prefs} onPrefsChange={onPrefsChange} />
    </nav>
  );
}
