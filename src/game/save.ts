import type { GameState, Listing } from './types';
import { createRng } from './rng';
import { emptyStats, generateQuests } from './career';

export const SAVE_KEY = 'garaj.save';
export type LoadResult = { kind: 'ok'; state: GameState } | { kind: 'empty' } | { kind: 'broken' };

function looksValid(s: unknown): s is GameState {
  if (typeof s !== 'object' || s === null) return false;
  const g = s as Record<string, unknown>;
  return (
    (g.version === 1 || g.version === 2) &&
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
    return looksValid(parsed) ? { kind: 'ok', state: migrate(parsed) } : { kind: 'broken' };
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

/** Sürüm 1 kaydını (kariyer özellikleri öncesi) sürüm 2'ye taşır. */
function migrate(s: GameState): GameState {
  if ((s.version as number) === 2) return s;
  const base: GameState = {
    ...s,
    version: 2,
    event: null,
    quests: [],
    stats: emptyStats(),
    achievements: [],
    listings: s.listings.map((l: Listing) => ({ ...l, personality: l.personality ?? 'normal' })),
  };
  return { ...base, quests: generateQuests(base, createRng(s.rngState)) };
}
