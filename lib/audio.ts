let audioContext: AudioContext | null = null;

import type { Phase } from "./types";

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext ||
    null
  );
}

async function ensureContext(): Promise<AudioContext | null> {
  const Ctx = getAudioContextClass();
  if (!Ctx) return null;

  if (!audioContext) {
    audioContext = new Ctx();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  return audioContext;
}

async function playTone(
  frequency: number,
  durationMs: number,
  peakGain = 0.4,
): Promise<void> {
  const ctx = await ensureContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  const start = ctx.currentTime;
  const end = start + durationMs / 1000;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peakGain, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.05);

  await new Promise<void>((resolve) => {
    oscillator.onended = () => resolve();
    window.setTimeout(resolve, durationMs + 80);
  });
}

/** Call from a tap handler before the workout starts (required on iOS). */
export async function unlockAudio(): Promise<void> {
  await playTone(440, 40, 0.02);
}

export async function playPhaseCue(phase: Phase): Promise<void> {
  switch (phase) {
    case "work":
      await playTone(880, 170, 0.45);
      break;
    case "rest":
      await playTone(520, 200, 0.4);
      break;
    case "prep":
      await playTone(660, 130, 0.35);
      break;
    case "timer":
      await playTone(740, 150, 0.42);
      break;
    default:
      await playTone(880, 160, 0.45);
  }
}

/** Short tick for the last three displayed seconds of an interval. */
export async function playCountdownTick(secondsLeft: number): Promise<void> {
  const frequency = secondsLeft === 1 ? 880 : 660;
  const gain = secondsLeft === 1 ? 0.32 : 0.22;
  await playTone(frequency, 70, gain);
}

export async function playCompleteCue(): Promise<void> {
  await playTone(660, 220, 0.45);
  await playTone(880, 320, 0.5);
}
