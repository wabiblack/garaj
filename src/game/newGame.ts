import type { GameState } from './types';
import { createRng } from './rng';
import { emptySummary, generateListings } from './day';
import { emptyStats, generateQuests } from './career';

export function newGame(seed: number): GameState {
  const rng = createRng(seed);
  const base: GameState = {
    version: 2, rngState: 0, day: 1, phase: 'day', stage: 1, age: 12, money: 2000, season: 'ilkbahar',
    inventory: [], listings: [], forSale: [], offers: [], reputation: 50, skill: 0,
    capacityLevel: 0, locationLevel: 0, employees: { usta: false, boyaci: false, satis: false }, loan: null,
    pendingCatch: [], summary: emptySummary(1), pendingTransition: null, won: false, wonSeen: false,
    event: null, quests: [], stats: emptyStats(), achievements: [],
  };
  const listings = generateListings(base, rng);
  const quests = generateQuests(base, rng);
  return { ...base, listings, quests, rngState: rng.state() };
}
