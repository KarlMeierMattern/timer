"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSession,
  pauseSession,
  resolveSession,
  resumeSession,
  skipSegment,
} from "@/lib/engine";
import { unlockAudio, playCompleteCue, playPhaseCue } from "@/lib/audio";
import { DEFAULT_EMOM } from "@/lib/presets";
import {
  deleteSavedWorkout,
  loadLastConfig,
  loadPreferences,
  loadSavedWorkouts,
  saveLastConfig,
  savePreferences,
  saveWorkout,
} from "@/lib/storage";
import type { Preferences, SavedWorkout, SessionClock, WorkoutConfig } from "@/lib/types";
import { useWakeLock } from "@/hooks/useWakeLock";
import { applyTheme } from "@/lib/theme";
import { Runner } from "./Runner";
import { Setup } from "./Setup";

type Screen = "setup" | "run";

export function TimerApp() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [config, setConfig] = useState<WorkoutConfig>(DEFAULT_EMOM);
  const [prefs, setPrefs] = useState<Preferences>({
    soundEnabled: true,
    prepEnabled: true,
    theme: "light",
  });
  const [saved, setSaved] = useState<SavedWorkout[]>([]);
  const [clock, setClock] = useState<SessionClock | null>(null);
  const [nowMs, setNowMs] = useState(0);
  const [flash, setFlash] = useState(false);
  const lastPhaseRef = useRef<string | null>(null);
  const clockRef = useRef<SessionClock | null>(null);
  const soundEnabledRef = useRef(true);

  const running = screen === "run" && clock !== null;
  useWakeLock(running && clock !== null && !clock.isPaused);

  useEffect(() => {
    clockRef.current = clock;
  }, [clock]);

  useEffect(() => {
    soundEnabledRef.current = prefs.soundEnabled;
  }, [prefs.soundEnabled]);

  useEffect(() => {
    const storedConfig = loadLastConfig();
    const storedPrefs = loadPreferences();
    const storedWorkouts = loadSavedWorkouts();
    queueMicrotask(() => {
      setConfig(storedConfig);
      setPrefs(storedPrefs);
      setSaved(storedWorkouts);
      applyTheme(storedPrefs.theme);
    });
  }, []);

  useEffect(() => {
    applyTheme(prefs.theme);
  }, [prefs.theme]);

  const notifyPhaseChange = useCallback((phase: string) => {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 120);

    if (!soundEnabledRef.current) return;

    if (phase === "done") {
      void playCompleteCue();
    } else {
      void playPhaseCue();
    }
  }, []);

  const syncPhaseFromClock = useCallback(
    (activeClock: SessionClock, atMs: number) => {
      const view = resolveSession(activeClock, atMs);
      if (!view) return;

      const key = `${view.segmentIndex}-${view.segment.phase}`;
      if (lastPhaseRef.current === null) {
        lastPhaseRef.current = key;
        return;
      }
      if (lastPhaseRef.current === key) return;

      lastPhaseRef.current = key;
      notifyPhaseChange(view.segment.phase);
    },
    [notifyPhaseChange],
  );

  useEffect(() => {
    if (!running || !clock) return undefined;
    const id = window.setInterval(() => {
      const atMs = Date.now();
      setNowMs(atMs);
      const activeClock = clockRef.current;
      if (activeClock) {
        syncPhaseFromClock(activeClock, atMs);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [running, clock, syncPhaseFromClock]);

  const handleStart = useCallback(async () => {
    if (prefs.soundEnabled) {
      await unlockAudio();
    }
    const session = createSession(config, Date.now(), prefs.prepEnabled);
    saveLastConfig(config);
    savePreferences(prefs);
    lastPhaseRef.current = null;
    setClock(session);
    clockRef.current = session;
    const atMs = Date.now();
    setNowMs(atMs);
    setScreen("run");
    syncPhaseFromClock(session, atMs);
  }, [config, prefs, syncPhaseFromClock]);

  const handleEnd = useCallback(() => {
    setClock(null);
    setScreen("setup");
    lastPhaseRef.current = null;
  }, []);

  const handleSaveWorkout = useCallback(
    (name: string) => {
      const entry: SavedWorkout = {
        id: `saved-${Date.now()}`,
        name,
        config: { ...config, name, id: `saved-${Date.now()}` },
      };
      setSaved(saveWorkout(entry));
    },
    [config],
  );

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      {screen === "setup" ? (
        <Setup
          config={config}
          prefs={prefs}
          saved={saved}
          onConfigChange={(next) => {
            setConfig(next);
            saveLastConfig(next);
          }}
          onPrefsChange={(next) => {
            setPrefs(next);
            savePreferences(next);
          }}
          onSaveWorkout={handleSaveWorkout}
          onLoadSaved={(workout) => {
            setConfig(workout.config);
            saveLastConfig(workout.config);
          }}
          onDeleteSaved={(id) => setSaved(deleteSavedWorkout(id))}
          onStart={() => void handleStart()}
          onTestSound={() => {
            void unlockAudio().then(() => playPhaseCue());
          }}
        />
      ) : (
        clock && (
          <Runner
            clock={clock}
            nowMs={nowMs}
            flash={flash}
            onPause={() =>
              setClock((current) =>
                current ? pauseSession(current, Date.now()) : current,
              )
            }
            onResume={async () => {
              if (prefs.soundEnabled) {
                await unlockAudio();
              }
              const atMs = Date.now();
              setNowMs(atMs);
              setClock((current) => {
                const next = current ? resumeSession(current, atMs) : current;
                if (next) {
                  clockRef.current = next;
                  syncPhaseFromClock(next, atMs);
                }
                return next;
              });
            }}
            onSkip={() => {
              const atMs = Date.now();
              setNowMs(atMs);
              setClock((current) => {
                const next = current ? skipSegment(current, atMs) : current;
                if (next) {
                  clockRef.current = next;
                  syncPhaseFromClock(next, atMs);
                }
                return next;
              });
            }}
            onEnd={handleEnd}
          />
        )
      )}
    </div>
  );
}
