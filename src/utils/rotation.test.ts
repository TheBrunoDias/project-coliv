import { describe, expect, it } from 'vitest';
import {
  getPeriodStart,
  getRotationState,
  reanchor,
  toEditableRotation,
  type Rotation,
} from './rotation';

// Local-time dates (month is 1-based here for readability)
const day = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h);

const weekly: Rotation = {
  rotation: ['ana', 'bia', 'caio'],
  frequency: 'weekly',
  interval: 1,
  anchorDate: day(2026, 10, 5, 0), // Monday
  anchorIndex: 0,
};

describe('getRotationState', () => {
  it('assigns the anchor person during the first period', () => {
    const state = getRotationState(weekly, day(2026, 10, 11));
    expect(state).toMatchObject({ status: 'active', currentIndex: 0, nextIndex: 1 });
    if (state.status !== 'active') throw new Error();
    expect(state.periodStart).toEqual(day(2026, 10, 5, 0));
    expect(state.nextChange).toEqual(day(2026, 10, 12, 0));
  });

  it('moves to the next person exactly at the start of the next period', () => {
    expect(getRotationState(weekly, day(2026, 10, 12, 0))).toMatchObject({ currentIndex: 1 });
    expect(getRotationState(weekly, day(2026, 10, 19, 0))).toMatchObject({ currentIndex: 2 });
  });

  it('wraps around the rotation', () => {
    expect(getRotationState(weekly, day(2026, 10, 26))).toMatchObject({
      currentIndex: 0,
      nextIndex: 1,
    });
  });

  it('respects anchorIndex', () => {
    const state = getRotationState({ ...weekly, anchorIndex: 2 }, day(2026, 10, 13));
    expect(state).toMatchObject({ currentIndex: 0, nextIndex: 1 });
  });

  it('counts calendar days across DST changes', () => {
    const daily: Rotation = { ...weekly, frequency: 'daily', anchorDate: day(2026, 3, 1, 0) };
    // 2026-03-01 -> 2026-04-15 is 45 days; 45 % 3 = 0
    expect(getRotationState(daily, day(2026, 4, 15, 0))).toMatchObject({ currentIndex: 0 });
    const biweekly: Rotation = { ...weekly, frequency: 'biweekly', anchorDate: day(2026, 10, 1, 0) };
    // 2026-10-01 -> 2026-11-12 is 42 days = 3 periods
    expect(getRotationState(biweekly, day(2026, 11, 12, 0))).toMatchObject({ currentIndex: 0 });
    expect(getRotationState(biweekly, day(2026, 11, 11, 23))).toMatchObject({ currentIndex: 2 });
  });

  it('uses calendar months and clamps to the end of shorter months', () => {
    const monthly: Rotation = { ...weekly, frequency: 'monthly', anchorDate: day(2026, 1, 31, 0) };
    expect(getPeriodStart(monthly.anchorDate, 'monthly', 1)).toEqual(day(2026, 2, 28, 0));
    expect(getPeriodStart(monthly.anchorDate, 'monthly', 2)).toEqual(day(2026, 3, 31, 0));
    expect(getRotationState(monthly, day(2026, 2, 27))).toMatchObject({ currentIndex: 0 });
    expect(getRotationState(monthly, day(2026, 2, 28))).toMatchObject({ currentIndex: 1 });
    expect(getRotationState(monthly, day(2026, 3, 30))).toMatchObject({ currentIndex: 1 });
    expect(getRotationState(monthly, day(2026, 3, 31))).toMatchObject({ currentIndex: 2 });
  });

  it('supports custom intervals', () => {
    const every3Weeks: Rotation = { ...weekly, interval: 3 };
    expect(getRotationState(every3Weeks, day(2026, 10, 25))).toMatchObject({ currentIndex: 0 });
    const state = getRotationState(every3Weeks, day(2026, 10, 26, 0));
    expect(state).toMatchObject({ currentIndex: 1 });
    if (state.status !== 'active') throw new Error();
    expect(state.nextChange).toEqual(day(2026, 11, 16, 0));

    const every2Days: Rotation = { ...weekly, frequency: 'daily', interval: 2 };
    expect(getRotationState(every2Days, day(2026, 10, 6))).toMatchObject({ currentIndex: 0 });
    expect(getRotationState(every2Days, day(2026, 10, 7))).toMatchObject({ currentIndex: 1 });

    const every2Months: Rotation = {
      ...weekly,
      frequency: 'monthly',
      interval: 2,
      anchorDate: day(2026, 1, 31, 0),
    };
    expect(getRotationState(every2Months, day(2026, 3, 30))).toMatchObject({ currentIndex: 0 });
    expect(getRotationState(every2Months, day(2026, 3, 31))).toMatchObject({ currentIndex: 1 });
    expect(getRotationState(every2Months, day(2026, 5, 31))).toMatchObject({ currentIndex: 2 });
  });

  it('reports a fixed responsibility without a next turn', () => {
    const state = getRotationState({ ...weekly, rotation: ['ana'] }, day(2027, 1, 1));
    expect(state).toMatchObject({
      status: 'active',
      currentIndex: 0,
      nextIndex: null,
      nextChange: null,
    });
  });

  it('reports upcoming and empty rotations', () => {
    expect(getRotationState(weekly, day(2026, 10, 4))).toMatchObject({
      status: 'upcoming',
      firstIndex: 0,
    });
    expect(getRotationState({ ...weekly, rotation: [] }, day(2026, 10, 4))).toEqual({
      status: 'empty',
    });
  });
});

describe('reanchor', () => {
  const now = day(2026, 10, 14); // bia's week (Oct 12-18)

  it('keeps the current assignee when the list changes', () => {
    const result = reanchor(weekly, ['caio', 'dani', 'bia', 'ana'], now);
    expect(result.anchorDate).toEqual(day(2026, 10, 12, 0));
    expect(result.rotation[result.anchorIndex]).toBe('bia');
    expect(getRotationState(result, now)).toMatchObject({ currentIndex: 2 });
  });

  it('gives the turn to the next in line when the current assignee is removed', () => {
    const result = reanchor(weekly, ['ana', 'caio'], now);
    expect(result.rotation[result.anchorIndex]).toBe('caio');
  });

  it('wraps around when looking for the next in line', () => {
    const result = reanchor({ ...weekly, anchorIndex: 2 }, ['bia'], now); // caio's turn
    expect(result.rotation[result.anchorIndex]).toBe('bia');
  });

  it('handles an empty result', () => {
    expect(reanchor(weekly, [], now)).toMatchObject({ rotation: [], anchorIndex: 0 });
  });
});

describe('toEditableRotation', () => {
  it('puts the current assignee first, starting on the current period', () => {
    const editable = toEditableRotation(weekly, day(2026, 10, 14));
    expect(editable).toEqual({ rotation: ['bia', 'caio', 'ana'], startDate: day(2026, 10, 12, 0) });

    // Saving it back unchanged keeps everyone's turns
    const saved: Rotation = { ...weekly, ...editable, anchorDate: editable.startDate, anchorIndex: 0 };
    for (const date of [day(2026, 10, 14), day(2026, 10, 20), day(2026, 11, 30)]) {
      const original = getRotationState(weekly, date);
      const roundTrip = getRotationState(saved, date);
      if (original.status !== 'active' || roundTrip.status !== 'active') throw new Error();
      expect(saved.rotation[roundTrip.currentIndex]).toBe(weekly.rotation[original.currentIndex]);
    }
  });
});
