import type { GameState } from './types';
import { createRng } from './rng';
import { marketValue, round10 } from './pricing';
import { generateListings } from './day';

export const STAGE_GOALS: Record<1 | 2, number> = { 1: 50000, 2: 500000 };
const STAGE_AGE = { 2: 16, 3: 18 } as const;

export function hasWon(state: GameState): boolean {
  return state.stage === 3 && state.locationLevel === 2 && state.reputation >= 90;
}

export function checkProgress(state: GameState): GameState {
  if (state.pendingTransition !== null) return state;
  if (state.stage !== 3 && state.money >= STAGE_GOALS[state.stage]) {
    return { ...state, pendingTransition: state.stage === 1 ? 2 : 3 };
  }
  if (!state.won && hasWon(state)) return { ...state, won: true };
  return state;
}

export function completeTransition(state: GameState): GameState {
  const stage = state.pendingTransition;
  if (stage === null || stage === 1) return state;
  const sellOff = state.inventory.reduce((sum, i) => sum + round10(marketValue(i, state.season) * 0.8), 0);
  const notes = state.inventory.length > 0 ? [...state.summary.notes, 'Kerem eski eşyalarını elden çıkardı'] : state.summary.notes;
  const rng = createRng(state.rngState);
  const listings = generateListings({ stage, season: state.season }, rng);
  return {
    ...state,
    stage,
    age: STAGE_AGE[stage],
    money: state.money + sellOff,
    inventory: [],
    forSale: [],
    offers: [],
    listings,
    pendingTransition: null,
    summary: { ...state.summary, notes },
    rngState: rng.state(),
  };
}
