import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  INITIAL_STATE,
  WAIT_SECONDS_OPTIONS,
  WEAKEN_DELAY_MS,
  cancelPending,
  modeOf,
  nextDueAt,
  parseSettingsFile,
  requestChange,
  resolveDue,
  toSettingsFile,
  upgradeState,
} from './settings';
import type { Change, State } from './settings';

const NOW = 1_700_000_000_000;
const shortsOff: Change = { setting: 'mode', surface: 'youtube.shorts', value: 'off' };
const commentsOff: Change = { setting: 'mode', surface: 'youtube.comments', value: 'off' };

describe('modeOf', () => {
  it('uses the catalogue default when nothing is set', () => {
    expect(modeOf(DEFAULT_SETTINGS, 'youtube.shorts')).toBe('remove');
    expect(modeOf(DEFAULT_SETTINGS, 'facebook.reels')).toBe('remove');
    expect(modeOf(DEFAULT_SETTINGS, 'youtube.home-feed')).toBe('off');
  });

  it('ignores a mode the surface does not support', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      surfaces: { 'youtube.home-feed': 'friction' as const },
    };
    expect(modeOf(settings, 'youtube.home-feed')).toBe('off');
  });
});

describe('requestChange', () => {
  it('delays a change that loosens protection', () => {
    const state = requestChange(INITIAL_STATE, shortsOff, NOW);
    expect(modeOf(state.settings, 'youtube.shorts')).toBe('remove');
    expect(state.pending).toEqual([{ change: shortsOff, effectiveAt: NOW + WEAKEN_DELAY_MS }]);
  });

  it('applies the delayed change once its time comes', () => {
    const state = requestChange(INITIAL_STATE, shortsOff, NOW);
    expect(resolveDue(state, NOW + WEAKEN_DELAY_MS - 1)).toBe(state);
    const resolved = resolveDue(state, NOW + WEAKEN_DELAY_MS);
    expect(modeOf(resolved.settings, 'youtube.shorts')).toBe('off');
    expect(resolved.pending).toEqual([]);
  });

  it('applies a change that tightens protection immediately', () => {
    const loose: State = {
      ...INITIAL_STATE,
      settings: { ...DEFAULT_SETTINGS, surfaces: { 'youtube.shorts': 'off' } },
    };
    const state = requestChange(
      loose,
      { setting: 'mode', surface: 'youtube.shorts', value: 'friction' },
      NOW,
    );
    expect(modeOf(state.settings, 'youtube.shorts')).toBe('friction');
    expect(state.pending).toEqual([]);
  });

  it('cancels a pending change when the current value is chosen again', () => {
    const pending = requestChange(INITIAL_STATE, shortsOff, NOW);
    const state = requestChange(pending, { ...shortsOff, value: 'remove' }, NOW + 1000);
    expect(state.pending).toEqual([]);
  });

  it('keeps the original schedule when the same change is requested again', () => {
    const first = requestChange(INITIAL_STATE, shortsOff, NOW);
    const again = requestChange(first, shortsOff, NOW + 60_000);
    expect(again.pending[0]?.effectiveAt).toBe(NOW + WEAKEN_DELAY_MS);
  });

  it('restarts the delay for a different loosening of the same setting', () => {
    const first = requestChange(INITIAL_STATE, shortsOff, NOW);
    const changed = requestChange(first, { ...shortsOff, value: 'friction' }, NOW + 60_000);
    expect(changed.pending).toEqual([
      { change: { ...shortsOff, value: 'friction' }, effectiveAt: NOW + 60_000 + WEAKEN_DELAY_MS },
    ]);
  });

  it('treats a shorter wait and a longer pass as loosening', () => {
    const longWait: State = {
      ...INITIAL_STATE,
      settings: { ...DEFAULT_SETTINGS, waitSeconds: 300 },
    };
    const shorterWait = requestChange(longWait, { setting: 'waitSeconds', value: 120 }, NOW);
    expect(shorterWait.settings.waitSeconds).toBe(300);
    expect(shorterWait.pending).toHaveLength(1);

    const longerPass = requestChange(INITIAL_STATE, { setting: 'passMinutes', value: 30 }, NOW);
    expect(longerPass.settings.passMinutes).toBe(5);
    expect(longerPass.pending).toHaveLength(1);
  });

  it('treats a longer wait and a shorter pass as tightening', () => {
    let state = requestChange(INITIAL_STATE, { setting: 'waitSeconds', value: 600 }, NOW);
    state = requestChange(state, { setting: 'passMinutes', value: 1 }, NOW);
    expect(state.settings).toMatchObject({ waitSeconds: 600, passMinutes: 1 });
    expect(state.pending).toEqual([]);
  });

  it('turns an optional limit back off at once, since off is its default', () => {
    const on = requestChange(INITIAL_STATE, { ...commentsOff, value: 'remove' }, NOW);
    const off = requestChange(on, commentsOff, NOW + 1000);
    expect(modeOf(off.settings, 'youtube.comments')).toBe('off');
    expect(off.pending).toEqual([]);
  });

  it('keeps surfaces from other platforms without delaying them', () => {
    const state = requestChange(
      INITIAL_STATE,
      { setting: 'mode', surface: 'instagram.reels', value: 'off' },
      NOW,
    );
    expect(state.settings.surfaces['instagram.reels']).toBe('off');
    expect(state.pending).toEqual([]);
  });
});

describe('pending changes', () => {
  it('can be cancelled', () => {
    const state = requestChange(INITIAL_STATE, shortsOff, NOW);
    expect(cancelPending(state, 'mode:youtube.shorts').pending).toEqual([]);
  });

  it('report when the next one is due', () => {
    expect(nextDueAt(INITIAL_STATE)).toBeNull();
    let state = requestChange(INITIAL_STATE, shortsOff, NOW);
    state = requestChange(state, { setting: 'passMinutes', value: 30 }, NOW - 5000);
    expect(nextDueAt(state)).toBe(NOW - 5000 + WEAKEN_DELAY_MS);
  });

  it('apply at once when they no longer need to wait', () => {
    // Turning an optional limit off was requested while it still waited 24 hours.
    const later = NOW + WEAKEN_DELAY_MS;
    const state: State = {
      settings: { ...DEFAULT_SETTINGS, surfaces: { 'youtube.comments': 'remove' } },
      pending: [
        { change: commentsOff, effectiveAt: later },
        { change: shortsOff, effectiveAt: later },
      ],
    };
    const resolved = resolveDue(state, NOW);
    expect(modeOf(resolved.settings, 'youtube.comments')).toBe('off');
    expect(resolved.pending).toEqual([{ change: shortsOff, effectiveAt: later }]);
  });
});

describe('the wait before Continue', () => {
  it('is never shorter than two minutes', () => {
    expect(Math.min(...WAIT_SECONDS_OPTIONS)).toBe(120);
    expect(DEFAULT_SETTINGS.waitSeconds).toBe(120);
  });

  it('is raised at once when saved under the old, shorter options', () => {
    const old: State = {
      settings: { ...DEFAULT_SETTINGS, waitSeconds: 15 },
      pending: [
        { change: { setting: 'waitSeconds', value: 3 }, effectiveAt: NOW },
        { change: shortsOff, effectiveAt: NOW },
      ],
    };
    expect(upgradeState(old)).toEqual({
      settings: { ...DEFAULT_SETTINGS, waitSeconds: 120 },
      pending: [{ change: shortsOff, effectiveAt: NOW }],
    });
  });

  it('is left alone when it already follows the current options', () => {
    const state: State = {
      settings: { ...DEFAULT_SETTINGS, waitSeconds: 300 },
      pending: [{ change: { setting: 'waitSeconds', value: 180 }, effectiveAt: NOW }],
    };
    expect(upgradeState(state)).toEqual(state);
  });
});

describe('settings files', () => {
  it('round-trip through export and import', () => {
    const settings = {
      surfaces: { 'youtube.shorts': 'friction' as const },
      waitSeconds: 300,
      passMinutes: 3,
    };
    expect(parseSettingsFile(JSON.parse(JSON.stringify(toSettingsFile(settings))))).toEqual({
      changes: [
        { setting: 'mode', surface: 'youtube.shorts', value: 'friction' },
        { setting: 'waitSeconds', value: 300 },
        { setting: 'passMinutes', value: 3 },
      ],
    });
  });

  it('rejects files that are not settings files', () => {
    expect(parseSettingsFile({ hello: 'world' })).toHaveProperty('error');
    expect(
      parseSettingsFile({ format: 'auctor-settings', version: 99, settings: {} }),
    ).toHaveProperty('error');
  });

  it('skips invalid values', () => {
    const file = {
      format: 'auctor-settings',
      version: 1,
      settings: {
        surfaces: {
          'youtube.home-feed': 'friction',
          'youtube.shorts': 'banana',
          'other.app': 'off',
        },
        // A wait from before the shortest one was 2 minutes.
        waitSeconds: 15,
        passMinutes: 600,
      },
    };
    expect(parseSettingsFile(file)).toEqual({
      changes: [{ setting: 'mode', surface: 'other.app', value: 'off' }],
    });
  });
});
