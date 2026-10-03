/**
 * Settings and the rule that makes them hard to loosen on impulse: a change that weakens
 * protection waits WEAKEN_DELAY_MS before it takes effect, while tightening is immediate.
 * Everything here is pure, so any platform can follow the same rules.
 */
import { MODES, SURFACES, isSurfaceId, modeIsSupported, strength } from './surfaces';
import type { Mode, SurfaceId } from './surfaces';

export const WEAKEN_DELAY_MS = 24 * 60 * 60 * 1000;

export const WAIT_SECONDS_OPTIONS = [3, 5, 10, 15, 30] as const;
export const PASS_MINUTES_OPTIONS = [1, 3, 5, 10, 15, 30] as const;

export interface Settings {
  /** Mode per surface ID. Missing surfaces use their default. Unknown IDs are kept, untouched. */
  surfaces: Record<string, Mode>;
  /** How long the prompt waits before "Continue" unlocks. */
  waitSeconds: number;
  /** How long a surface stays open after you continue past the prompt. */
  passMinutes: number;
}

export const DEFAULT_SETTINGS: Settings = { surfaces: {}, waitSeconds: 15, passMinutes: 5 };

export type Change =
  | { setting: 'mode'; surface: string; value: Mode }
  | { setting: 'waitSeconds'; value: number }
  | { setting: 'passMinutes'; value: number };

export interface PendingChange {
  change: Change;
  effectiveAt: number;
}

export interface State {
  settings: Settings;
  /** Weakening changes waiting to take effect, at most one per setting. */
  pending: PendingChange[];
}

export const INITIAL_STATE: State = { settings: DEFAULT_SETTINGS, pending: [] };

export function modeOf(settings: Settings, id: SurfaceId): Mode {
  const mode = settings.surfaces[id];
  return mode !== undefined && modeIsSupported(id, mode) ? mode : SURFACES[id].defaultMode;
}

/** Identifies the setting a change targets, so a newer request replaces an older one. */
export const changeKey = (change: Change): string =>
  change.setting === 'mode' ? `mode:${change.surface}` : change.setting;

export function weakens(settings: Settings, change: Change): boolean {
  switch (change.setting) {
    case 'mode':
      // Surfaces this platform doesn't know have no effect here, so they never wait.
      return (
        isSurfaceId(change.surface) &&
        strength(change.value) < strength(modeOf(settings, change.surface))
      );
    case 'waitSeconds':
      return change.value < settings.waitSeconds;
    case 'passMinutes':
      return change.value > settings.passMinutes;
  }
}

function applyChange(settings: Settings, change: Change): Settings {
  switch (change.setting) {
    case 'mode':
      return { ...settings, surfaces: { ...settings.surfaces, [change.surface]: change.value } };
    case 'waitSeconds':
      return { ...settings, waitSeconds: change.value };
    case 'passMinutes':
      return { ...settings, passMinutes: change.value };
  }
}

const sameChange = (a: Change, b: Change): boolean =>
  changeKey(a) === changeKey(b) && a.value === b.value;

/**
 * Requests a change. Tightening (or keeping the current value) applies now and cancels any
 * pending change to the same setting. Loosening is scheduled WEAKEN_DELAY_MS from now; asking
 * again for the same pending value keeps its original schedule.
 */
export function requestChange(state: State, change: Change, now: number): State {
  const key = changeKey(change);
  const existing = state.pending.find((p) => changeKey(p.change) === key);
  const others = state.pending.filter((p) => p !== existing);

  if (!weakens(state.settings, change)) {
    return { settings: applyChange(state.settings, change), pending: others };
  }
  if (existing && sameChange(existing.change, change)) return state;
  return {
    settings: state.settings,
    pending: [...others, { change, effectiveAt: now + WEAKEN_DELAY_MS }],
  };
}

export function cancelPending(state: State, key: string): State {
  return { ...state, pending: state.pending.filter((p) => changeKey(p.change) !== key) };
}

/** Applies the pending changes whose time has come. */
export function resolveDue(state: State, now: number): State {
  const due = state.pending.filter((p) => p.effectiveAt <= now);
  if (due.length === 0) return state;
  return {
    settings: due.reduce((settings, p) => applyChange(settings, p.change), state.settings),
    pending: state.pending.filter((p) => p.effectiveAt > now),
  };
}

export function nextDueAt(state: State): number | null {
  return state.pending.length ? Math.min(...state.pending.map((p) => p.effectiveAt)) : null;
}

export function pendingFor(state: State, key: string): PendingChange | undefined {
  return state.pending.find((p) => changeKey(p.change) === key);
}

/* Settings files: export on one device, import on another. */

export const SETTINGS_FILE_FORMAT = 'auctor-settings';
export const SETTINGS_FILE_VERSION = 1;

export interface SettingsFile {
  format: typeof SETTINGS_FILE_FORMAT;
  version: typeof SETTINGS_FILE_VERSION;
  settings: Settings;
}

export function toSettingsFile(settings: Settings): SettingsFile {
  return { format: SETTINGS_FILE_FORMAT, version: SETTINGS_FILE_VERSION, settings };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode);

/**
 * Reads a settings file as a list of changes. Importing goes through `requestChange` like any
 * other edit, so a file can't loosen protection any faster than the settings screen can.
 */
export function parseSettingsFile(input: unknown): { changes: Change[] } | { error: string } {
  if (!isRecord(input) || input.format !== SETTINGS_FILE_FORMAT || !isRecord(input.settings)) {
    return { error: 'This is not an Auctor settings file.' };
  }
  if (input.version !== SETTINGS_FILE_VERSION) {
    return { error: `Unsupported settings file version: ${String(input.version)}.` };
  }

  const { surfaces, waitSeconds, passMinutes } = input.settings;
  const changes: Change[] = [];

  if (isRecord(surfaces)) {
    for (const [id, mode] of Object.entries(surfaces)) {
      if (!isMode(mode)) continue;
      if (isSurfaceId(id) && !modeIsSupported(id, mode)) continue;
      changes.push({ setting: 'mode', surface: id, value: mode });
    }
  }
  if (WAIT_SECONDS_OPTIONS.includes(waitSeconds as never)) {
    changes.push({ setting: 'waitSeconds', value: waitSeconds as number });
  }
  if (PASS_MINUTES_OPTIONS.includes(passMinutes as never)) {
    changes.push({ setting: 'passMinutes', value: passMinutes as number });
  }
  return { changes };
}
