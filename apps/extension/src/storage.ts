import { INITIAL_STATE, resolveDue } from '@/catalog/settings';
import type { State } from '@/catalog/settings';
import type { SurfaceId } from '@/catalog/surfaces';
import type { Passes } from '@/engine/plan';
import { storage } from 'wxt/utils/storage';

export const stateItem = storage.defineItem<State>('local:state', {
  fallback: INITIAL_STATE,
  version: 1,
});

/** Temporary access granted by continuing past the prompt. Kept separate so passes never touch settings. */
export const passesItem = storage.defineItem<Passes>('local:passes', { fallback: {} });

/** Read-modify-write of the settings state, with due pending changes applied first. */
export async function updateState(update: (state: State, now: number) => State): Promise<State> {
  const now = Date.now();
  const next = update(resolveDue(await stateItem.getValue(), now), now);
  await stateItem.setValue(next);
  return next;
}

export async function grantPass(id: SurfaceId, until: number): Promise<void> {
  const now = Date.now();
  const live = Object.entries(await passesItem.getValue()).filter(([, end]) => end > now);
  await passesItem.setValue({ ...Object.fromEntries(live), [id]: until });
}
