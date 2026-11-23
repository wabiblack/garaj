import type { GameState } from './types';
import { createRng } from './rng';
import { emptySummary, generateListings } from './day';

export function newGame(seed: number): GameState {
  const rng = createRng(seed);
  const base: GameState = {
    version: 1, rngState: 0, day: 1, phase: 'day', stage: 1, age: 12, money: 2000, season: 'ilkbahar',
    inventory: [], listings: [], forSale: [], offers: [], reputation: 50, skill: 0,
    capacityLevel: 0, locationLevel: 0, employees: { usta: false, boyaci: false, satis: false }, loan: null,
    pendingCatch: [], summary: emptySummary(1), pendingTransition: null, won: false, wonSeen: false,
  };
  const listings = generateListings(base, rng);
  return { ...base, listings, rngState: rng.state() };
}
