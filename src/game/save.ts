import type { GameState } from './types';

export const SAVE_KEY = 'garaj.save';
export type LoadResult = { kind: 'ok'; state: GameState } | { kind: 'empty' } | { kind: 'broken' };

function looksValid(s: unknown): s is GameState {
  if (typeof s !== 'object' || s === null) return false;
  const g = s as Record<string, unknown>;
  return (
    g.version === 1 &&
    typeof g.money === 'number' && typeof g.day === 'number' && typeof g.rngState === 'number' &&
    [1, 2, 3].includes(g.stage as number) &&
    Array.isArray(g.inventory) && Array.isArray(g.listings) && Array.isArray(g.forSale) && Array.isArray(g.offers) &&
    typeof g.employees === 'object' && g.employees !== null &&
    (g.phase === 'day' || g.phase === 'evening') &&
    typeof g.summary === 'object' && g.summary !== null &&
    Array.isArray((g.summary as Record<string, unknown>).notes)
  );
}

export function loadGame(storage: Storage): LoadResult {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (raw === null) return { kind: 'empty' };
    const parsed: unknown = JSON.parse(raw);
    return looksValid(parsed) ? { kind: 'ok', state: parsed } : { kind: 'broken' };
  } catch {
    return { kind: 'broken' };
  }
}

export function saveGame(storage: Storage, state: GameState): void {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Depolama dolu veya kapalı: oyun kayıtsız devam eder.
  }
}
