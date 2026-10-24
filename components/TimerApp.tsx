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
import { Runner } from "./Runner";
import { Setup } from "./Setup";

type Screen = "setup" | "run";

export function TimerApp() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [config, setConfig] = useState<WorkoutConfig>(DEFAULT_EMOM);
  const [prefs, setPrefs] = useState<Preferences>({
    soundEnabled: true,
    prepEnabled: true,
  });
  const [saved, setSaved] = useState<SavedWorkout[]>([]);
  const [clock, setClock] = useState<SessionClock | null>(null);
  const [nowMs, setNowMs] = useState(0);
  const [flash, setFlash] = useState(false);
  const lastPhaseRef = useRef<string | null>(null);

  const running = screen === "run" && clock !== null;
  useWakeLock(running && clock !== null && !clock.isPaused);

  useEffect(() => {
    const storedConfig = loadLastConfig();
    const storedPrefs = loadPreferences();
    const storedWorkouts = loadSavedWorkouts();
    queueMicrotask(() => {
      setConfig(storedConfig);
      setPrefs(storedPrefs);
      setSaved(storedWorkouts);
    });
  }, []);

  useEffect(() => {
    if (!running || !clock) return undefined;
    const id = window.setInterval(() => setNowMs(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [running, clock]);

  useEffect(() => {
    if (!clock || screen !== "run") return;
    const view = resolveSession(clock, nowMs);
    if (!view) return;

    const key = `${view.segmentIndex}-${view.segment.phase}`;
    if (lastPhaseRef.current === null) {
      lastPhaseRef.current = key;
      return;
    }
    if (lastPhaseRef.current === key) return;

    lastPhaseRef.current = key;
    setFlash(true);
    window.setTimeout(() => setFlash(false), 120);

    if (!prefs.soundEnabled) return;
    if (view.segment.phase === "done") {
      playCompleteCue();
    } else {
      playPhaseCue();
    }
  }, [clock, nowMs, prefs.soundEnabled, screen]);

  const handleStart = useCallback(() => {
    unlockAudio();
    const session = createSession(config, Date.now(), prefs.prepEnabled);
    saveLastConfig(config);
    savePreferences(prefs);
    lastPhaseRef.current = null;
    setClock(session);
    setNowMs(Date.now());
    setScreen("run");
  }, [config, prefs]);

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
          onStart={handleStart}
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
            onResume={() => {
              setNowMs(Date.now());
              setClock((current) =>
                current ? resumeSession(current, Date.now()) : current,
              );
            }}
            onSkip={() => {
              setNowMs(Date.now());
              setClock((current) =>
                current ? skipSegment(current, Date.now()) : current,
              );
            }}
            onEnd={handleEnd}
          />
        )
      )}
    </div>
  );
}
