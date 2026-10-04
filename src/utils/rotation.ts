import type { Frequency } from '@/types';

/**
 * Rotation math for tasks. Pure functions over plain Dates, all in the device's local time.
 *
 * A rotation is anchored: the period starting on `anchorDate` belongs to
 * `rotation[anchorIndex]`, and each following period belongs to the next one in the list.
 */
export interface Rotation {
  rotation: string[];
  frequency: Frequency;
  // Turns last `interval` units of `frequency` (e.g. weekly + 3 = every 3 weeks)
  interval: number;
  anchorDate: Date;
  anchorIndex: number;
}

export type RotationState =
  | { status: 'empty' }
  // First turn starts in the future
  | { status: 'upcoming'; startsAt: Date; firstIndex: number }
  | {
      status: 'active';
      currentIndex: number;
      periodStart: Date;
      // null for a fixed responsibility (single assignee)
      nextIndex: number | null;
      nextChange: Date | null;
    };

const DAY_MS = 86_400_000;
const PERIOD_DAYS = { daily: 1, weekly: 7, biweekly: 14 } as const;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Calendar day count, immune to DST changes
function dayNumber(date: Date): number {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

// Jan 31 + 1 month = Feb 28/29, not Mar 3
function addMonthsClamped(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

export function getPeriodStart(
  anchorDate: Date,
  frequency: Frequency,
  period: number,
  interval = 1,
): Date {
  const anchor = startOfDay(anchorDate);
  if (frequency === 'monthly') return addMonthsClamped(anchor, period * interval);
  const start = new Date(anchor);
  start.setDate(start.getDate() + period * PERIOD_DAYS[frequency] * interval);
  return start;
}

/** Whole periods since the anchor (negative before it starts). */
export function getPeriodsElapsed(
  anchorDate: Date,
  now: Date,
  frequency: Frequency,
  interval = 1,
): number {
  const anchor = startOfDay(anchorDate);
  if (frequency === 'monthly') {
    let months =
      (now.getFullYear() - anchor.getFullYear()) * 12 + (now.getMonth() - anchor.getMonth());
    if (addMonthsClamped(anchor, months) > now) months--;
    return Math.floor(months / interval);
  }
  return Math.floor((dayNumber(now) - dayNumber(anchor)) / (PERIOD_DAYS[frequency] * interval));
}

const mod = (value: number, length: number) => ((value % length) + length) % length;

export function getRotationState(task: Rotation, now: Date): RotationState {
  const length = task.rotation.length;
  if (length === 0) return { status: 'empty' };

  const elapsed = getPeriodsElapsed(task.anchorDate, now, task.frequency, task.interval);
  if (elapsed < 0) {
    return {
      status: 'upcoming',
      startsAt: startOfDay(task.anchorDate),
      firstIndex: mod(task.anchorIndex, length),
    };
  }

  const isFixed = length === 1;
  return {
    status: 'active',
    currentIndex: mod(task.anchorIndex + elapsed, length),
    periodStart: getPeriodStart(task.anchorDate, task.frequency, elapsed, task.interval),
    nextIndex: isFixed ? null : mod(task.anchorIndex + elapsed + 1, length),
    nextChange: isFixed
      ? null
      : getPeriodStart(task.anchorDate, task.frequency, elapsed + 1, task.interval),
  };
}

/**
 * Applies a new rotation list while preserving the current turn: the current assignee keeps
 * their turn, or, if they were removed, the next one in line who is still in the list takes over.
 */
export function reanchor(task: Rotation, newRotation: string[], now: Date): Rotation {
  const state = getRotationState(task, now);
  let anchorDate = startOfDay(task.anchorDate);
  let fromIndex = 0;

  if (state.status === 'active') {
    anchorDate = state.periodStart;
    fromIndex = state.currentIndex;
  } else if (state.status === 'upcoming') {
    fromIndex = state.firstIndex;
  }

  let anchorIndex = 0;
  for (let step = 0; step < task.rotation.length; step++) {
    const index = newRotation.indexOf(task.rotation[(fromIndex + step) % task.rotation.length]);
    if (index !== -1) {
      anchorIndex = index;
      break;
    }
  }

  return { ...task, rotation: newRotation, anchorDate, anchorIndex };
}

/**
 * Shape used by the task form: the rotation reordered so the current (or first) assignee comes
 * first, starting on the current period. Saving it back with anchorIndex 0 changes nothing.
 */
export function toEditableRotation(
  task: Rotation,
  now: Date,
): { rotation: string[]; startDate: Date } {
  const state = getRotationState(task, now);
  if (state.status === 'empty') return { rotation: [], startDate: startOfDay(now) };

  const first = state.status === 'active' ? state.currentIndex : state.firstIndex;
  const startDate = state.status === 'active' ? state.periodStart : state.startsAt;
  return {
    rotation: [...task.rotation.slice(first), ...task.rotation.slice(0, first)],
    startDate,
  };
}
