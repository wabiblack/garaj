import type { GameState } from './types';
import { createRng } from './rng';
import { emptySummary, listingsFor } from './day';
import { emptyStats, generateQuests } from './career';

import type { AchievementId } from './types';
import { DEFAULT_PLAYER, type Player } from './player';
import { STAGE_RESTART_MONEY } from './progression';
import { initialMarket } from './market';
import { FAMILY_START } from './family';
import { initialStocks } from './stocks';
import { initialTalents } from './talents';
import { seasonForDay } from './pricing';

/** Zor modda başlangıç parası. */
export const HARD_START_MONEY = STAGE_RESTART_MONEY[1] / 2;

/** Oyuncunun seçebildiği başlangıç aşamaları ve yaşları. 25 yaş (holding) oyunun sonu, başlangıç değil. */
export type StartStage = 1 | 2 | 3;
export const START_AGE: Record<StartStage, number> = { 1: 12, 2: 16, 3: 18 };

/** Yeni oyun. Zor mod (Yeni Oyun+) başarımları korur ve başlangıç parasını yarıya indirir. */
export function newGame(seed: number, opts: { hard?: boolean; achievements?: AchievementId[]; player?: Player; stage?: StartStage } = {}): GameState {
  const hard = opts.hard ?? false;
  const stage = opts.stage ?? 1;
  const money = hard ? STAGE_RESTART_MONEY[stage] / 2 : STAGE_RESTART_MONEY[stage];
  const rng = createRng(seed);
  const base: GameState = {
    version: 3, rngState: 0, day: 1, phase: 'day', stage, age: START_AGE[stage], money, season: seasonForDay(1), used: 0, parts: [], pets: { dog: null, cat: null }, term: { weeks: 0, used: 0 },
    inventory: [], listings: [], forSale: [], offers: [], reputation: 50, skill: 0,
    capacityLevel: 0, locationLevel: 0, employees: { usta: false, boyaci: false, satis: false, cirak: false }, loan: null,
    pendingCatch: [], summary: emptySummary(1), pendingTransition: null, won: false, wonSeen: false,
    event: null, quests: [], stats: emptyStats(), achievements: opts.achievements ?? [],
    orders: [], story: { seen: [], pending: null }, history: [], branches: 0, finalSeen: false, hard, prices: {}, player: opts.player ?? DEFAULT_PLAYER,
    market: initialMarket(), ledger: [], bank: { savings: 0 }, family: FAMILY_START, stocks: initialStocks(), talents: initialTalents(opts.player?.trait),
  };
  const listings = listingsFor(base, rng);
  const quests = generateQuests(base, rng);
  return { ...base, listings, quests, rngState: rng.state() };
}
