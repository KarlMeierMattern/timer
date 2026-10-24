import type {
  Phase,
  SegmentView,
  SessionClock,
  TimelineSegment,
  WorkoutConfig,
} from "./types";

function pushSegment(
  segments: TimelineSegment[],
  partial: Omit<TimelineSegment, "blockTotal" | "roundTotal"> & {
    blockTotal: number;
    roundTotal: number;
  },
) {
  segments.push(partial);
}

export function buildTimeline(config: WorkoutConfig): TimelineSegment[] {
  if (config.mode === "timer") {
    const durationMs =
      config.timerDirection === "down"
        ? config.timerSeconds * 1000
        : Number.MAX_SAFE_INTEGER;
    return [
      {
        phase: "timer",
        durationMs,
        blockIndex: 1,
        roundIndex: 1,
        blockTotal: 1,
        roundTotal: 1,
      },
    ];
  }

  const segments: TimelineSegment[] = [];
  const blockTotal = config.blockRepeats;

  if (config.prepSeconds > 0) {
    pushSegment(segments, {
      phase: "prep",
      durationMs: config.prepSeconds * 1000,
      blockIndex: 0,
      roundIndex: 0,
      blockTotal,
      roundTotal: config.workRounds,
    });
  }

  for (let block = 1; block <= config.blockRepeats; block += 1) {
    for (let round = 1; round <= config.workRounds; round += 1) {
      pushSegment(segments, {
        phase: "work",
        durationMs: config.workSeconds * 1000,
        blockIndex: block,
        roundIndex: round,
        blockTotal,
        roundTotal: config.workRounds,
      });

      const isLastRound = round === config.workRounds;
      const isLastBlock = block === config.blockRepeats;

      if (config.restPlacement === "afterEachRound" && config.restSeconds > 0) {
        if (!isLastRound || !isLastBlock) {
          pushSegment(segments, {
            phase: "rest",
            durationMs: config.restSeconds * 1000,
            blockIndex: block,
            roundIndex: round,
            blockTotal,
            roundTotal: config.workRounds,
          });
        }
      }
    }

    if (
      config.restPlacement === "afterBlock" &&
      config.restSeconds > 0 &&
      block < config.blockRepeats
    ) {
      pushSegment(segments, {
        phase: "rest",
        durationMs: config.restSeconds * 1000,
        blockIndex: block,
        roundIndex: config.workRounds,
        blockTotal,
        roundTotal: config.workRounds,
      });
    }
  }

  return segments;
}

export function getTimelineDurationMs(segments: TimelineSegment[]): number {
  if (segments.length === 0) return 0;
  const last = segments[segments.length - 1];
  if (last.phase === "timer" && last.durationMs === Number.MAX_SAFE_INTEGER) {
    return 0;
  }
  return segments.reduce((sum, s) => sum + s.durationMs, 0);
}

function segmentStarts(segments: TimelineSegment[]): number[] {
  const starts: number[] = [];
  let cursor = 0;
  for (const segment of segments) {
    starts.push(cursor);
    if (segment.durationMs === Number.MAX_SAFE_INTEGER) {
      cursor += 0;
    } else {
      cursor += segment.durationMs;
    }
  }
  return starts;
}

export function getEffectiveElapsedMs(clock: SessionClock, nowMs: number): number {
  const pauseDelta =
    clock.isPaused && clock.pauseBeginMs !== null
      ? nowMs - clock.pauseBeginMs
      : 0;
  return nowMs - clock.anchorMs - clock.pausedTotalMs - pauseDelta + clock.skipOffsetMs;
}

export function resolveSession(
  clock: SessionClock,
  nowMs: number,
): SegmentView | null {
  const segments = buildTimeline(clock.config);
  if (segments.length === 0) return null;

  const elapsed = getEffectiveElapsedMs(clock, nowMs);
  const starts = segmentStarts(segments);
  const totalDuration = getTimelineDurationMs(segments);

  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    const start = starts[i];
    const end =
      segment.durationMs === Number.MAX_SAFE_INTEGER
        ? Number.POSITIVE_INFINITY
        : start + segment.durationMs;

    if (elapsed < end) {
      const elapsedInSegment = Math.max(0, elapsed - start);
      const remainingMs =
        segment.durationMs === Number.MAX_SAFE_INTEGER
          ? Number.POSITIVE_INFINITY
          : Math.max(0, segment.durationMs - elapsedInSegment);

      const totalRemainingMs =
        segment.durationMs === Number.MAX_SAFE_INTEGER
          ? Number.POSITIVE_INFINITY
          : Math.max(0, totalDuration - elapsed);

      const next = segments[i + 1];
      return {
        segment,
        segmentIndex: i,
        remainingMs,
        elapsedInSegmentMs: elapsedInSegment,
        totalRemainingMs,
        sessionProgress:
          totalDuration > 0 ? Math.min(1, elapsed / totalDuration) : 0,
        nextLabel: next ? phaseLabel(next) : null,
      };
    }
  }

  const last = segments[segments.length - 1];
  return {
    segment: { ...last, phase: "done" as Phase },
    segmentIndex: segments.length,
    remainingMs: 0,
    elapsedInSegmentMs: last.durationMs,
    totalRemainingMs: 0,
    sessionProgress: 1,
    nextLabel: null,
  };
}

export function phaseLabel(segment: TimelineSegment): string {
  switch (segment.phase) {
    case "prep":
      return "Get ready";
    case "work":
      return "Work";
    case "rest":
      return "Rest";
    case "timer":
      return "Timer";
    default:
      return "Done";
  }
}

export function createSession(
  config: WorkoutConfig,
  nowMs: number,
  prepEnabled: boolean,
): SessionClock {
  const sessionConfig = prepEnabled
    ? config
    : { ...config, prepSeconds: 0 };

  return {
    config: sessionConfig,
    anchorMs: nowMs,
    pausedTotalMs: 0,
    skipOffsetMs: 0,
    isPaused: false,
    pauseBeginMs: null,
  };
}

export function pauseSession(clock: SessionClock, nowMs: number): SessionClock {
  if (clock.isPaused) return clock;
  return {
    ...clock,
    isPaused: true,
    pauseBeginMs: nowMs,
  };
}

export function resumeSession(clock: SessionClock, nowMs: number): SessionClock {
  if (!clock.isPaused || clock.pauseBeginMs === null) return clock;
  return {
    ...clock,
    isPaused: false,
    pausedTotalMs: clock.pausedTotalMs + (nowMs - clock.pauseBeginMs),
    pauseBeginMs: null,
  };
}

export function skipSegment(clock: SessionClock, nowMs: number): SessionClock {
  const view = resolveSession(clock, nowMs);
  if (!view || view.segment.phase === "done") return clock;
  if (!Number.isFinite(view.remainingMs)) return clock;

  return {
    ...clock,
    skipOffsetMs: clock.skipOffsetMs + view.remainingMs,
  };
}
