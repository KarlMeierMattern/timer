export type RestPlacement = "afterBlock" | "afterEachRound";

export type AppMode = "workout" | "timer";

export type TimerDirection = "down" | "up";

export type Phase = "prep" | "work" | "rest" | "timer" | "done";

export interface WorkoutConfig {
  id: string;
  name: string;
  mode: AppMode;
  prepSeconds: number;
  workSeconds: number;
  workRounds: number;
  restSeconds: number;
  restPlacement: RestPlacement;
  blockRepeats: number;
  timerSeconds: number;
  timerDirection: TimerDirection;
}

export interface TimelineSegment {
  phase: Phase;
  durationMs: number;
  blockIndex: number;
  roundIndex: number;
  blockTotal: number;
  roundTotal: number;
}

export interface SegmentView {
  segment: TimelineSegment;
  segmentIndex: number;
  remainingMs: number;
  elapsedInSegmentMs: number;
  totalRemainingMs: number;
  sessionProgress: number;
  nextLabel: string | null;
}

export interface SessionClock {
  config: WorkoutConfig;
  anchorMs: number;
  pausedTotalMs: number;
  skipOffsetMs: number;
  isPaused: boolean;
  pauseBeginMs: number | null;
}

export type Theme = "light" | "dark";

export interface Preferences {
  soundEnabled: boolean;
  prepEnabled: boolean;
  theme: Theme;
}

export interface SavedWorkout {
  id: string;
  name: string;
  config: WorkoutConfig;
}
