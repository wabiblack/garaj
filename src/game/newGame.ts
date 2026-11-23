import type { GameState } from './types';
import { createRng } from './rng';
import { emptySummary, listingsFor } from './day';
import { emptyStats, generateQuests } from './career';

import type { AchievementId } from './types';
import { DEFAULT_PLAYER, type Player } from './player';

/** Zor modda başlangıç parası. */
export const HARD_START_MONEY = 1000;

/** Yeni oyun. Zor mod (Yeni Oyun+) başarımları korur. */
export function newGame(seed: number, opts: { hard?: boolean; achievements?: AchievementId[]; player?: Player } = {}): GameState {
  const hard = opts.hard ?? false;
  const rng = createRng(seed);
  const base: GameState = {
    version: 3, rngState: 0, day: 1, phase: 'day', stage: 1, age: 12, money: hard ? HARD_START_MONEY : 2000, season: 'ilkbahar',
    inventory: [], listings: [], forSale: [], offers: [], reputation: 50, skill: 0,
    capacityLevel: 0, locationLevel: 0, employees: { usta: false, boyaci: false, satis: false, cirak: false }, loan: null,
    pendingCatch: [], summary: emptySummary(1), pendingTransition: null, won: false, wonSeen: false,
    event: null, quests: [], stats: emptyStats(), achievements: opts.achievements ?? [],
    orders: [], story: { seen: [], pending: null }, history: [], branches: 0, finalSeen: false, hard, prices: {}, player: opts.player ?? DEFAULT_PLAYER,
  };
  const listings = listingsFor(base, rng);
  const quests = generateQuests(base, rng);
  return { ...base, listings, quests, rngState: rng.state() };
}
