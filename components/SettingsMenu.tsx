"use client";

import { useEffect, useRef, useState } from "react";
import type { Preferences } from "@/lib/types";

interface SettingsMenuProps {
  prefs: Preferences;
  onPrefsChange: (prefs: Preferences) => void;
}

export function SettingsMenu({ prefs, onPrefsChange }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const update = (partial: Partial<Preferences>) => {
    const next = { ...prefs, ...partial };
    onPrefsChange(next);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-secondary hover:text-foreground"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+0.375rem)] z-30 w-56 rounded-lg border border-border bg-background p-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          role="menu"
        >
          <label
            className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md px-3 text-sm"
            role="menuitem"
          >
            <span>3s get ready</span>
            <input
              type="checkbox"
              checked={prefs.prepEnabled}
              onChange={(e) => update({ prepEnabled: e.target.checked })}
              className="h-5 w-5 accent-foreground"
            />
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md px-3 text-sm border-t border-border"
            role="menuitem"
          >
            <span>Sound</span>
            <input
              type="checkbox"
              checked={prefs.soundEnabled}
              onChange={(e) => update({ soundEnabled: e.target.checked })}
              className="h-5 w-5 accent-foreground"
            />
          </label>
        </div>
      )}
    </div>
  );
}
