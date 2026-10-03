import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  INITIAL_STATE,
  WEAKEN_DELAY_MS,
  cancelPending,
  modeOf,
  nextDueAt,
  parseSettingsFile,
  requestChange,
  resolveDue,
  toSettingsFile,
} from './settings';
import type { Change, State } from './settings';

const NOW = 1_700_000_000_000;
const shortsOff: Change = { setting: 'mode', surface: 'youtube.shorts', value: 'off' };

describe('modeOf', () => {
  it('uses the catalogue default when nothing is set', () => {
    expect(modeOf(DEFAULT_SETTINGS, 'youtube.shorts')).toBe('remove');
    expect(modeOf(DEFAULT_SETTINGS, 'facebook.reels')).toBe('friction');
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
    const shorterWait = requestChange(INITIAL_STATE, { setting: 'waitSeconds', value: 3 }, NOW);
    expect(shorterWait.settings.waitSeconds).toBe(15);
    expect(shorterWait.pending).toHaveLength(1);

    const longerPass = requestChange(INITIAL_STATE, { setting: 'passMinutes', value: 30 }, NOW);
    expect(longerPass.settings.passMinutes).toBe(5);
    expect(longerPass.pending).toHaveLength(1);
  });

  it('treats a longer wait and a shorter pass as tightening', () => {
    let state = requestChange(INITIAL_STATE, { setting: 'waitSeconds', value: 30 }, NOW);
    state = requestChange(state, { setting: 'passMinutes', value: 1 }, NOW);
    expect(state.settings).toMatchObject({ waitSeconds: 30, passMinutes: 1 });
    expect(state.pending).toEqual([]);
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
    state = requestChange(state, { setting: 'waitSeconds', value: 3 }, NOW - 5000);
    expect(nextDueAt(state)).toBe(NOW - 5000 + WEAKEN_DELAY_MS);
  });
});

describe('settings files', () => {
  it('round-trip through export and import', () => {
    const settings = {
      surfaces: { 'youtube.shorts': 'friction' as const },
      waitSeconds: 10,
      passMinutes: 3,
    };
    expect(parseSettingsFile(JSON.parse(JSON.stringify(toSettingsFile(settings))))).toEqual({
      changes: [
        { setting: 'mode', surface: 'youtube.shorts', value: 'friction' },
        { setting: 'waitSeconds', value: 10 },
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
        waitSeconds: 0,
        passMinutes: 600,
      },
    };
    expect(parseSettingsFile(file)).toEqual({
      changes: [{ setting: 'mode', surface: 'other.app', value: 'off' }],
    });
  });
});
