import type { GameState } from './types';
import { createRng } from './rng';
import { marketValue, round10 } from './pricing';
import { generateListings, listingsFor } from './day';
import { generateQuests } from './career';

/** 3 → 4 geçişi için ayrıca şehrin en büyük galericisi olmak gerekir. */
export const STAGE_GOALS: Record<1 | 2 | 3, number> = { 1: 50000, 2: 500000, 3: 20_000_000 };
const STAGE_AGE = { 2: 16, 3: 18, 4: 25 } as const;

export function hasWon(state: GameState): boolean {
  return state.stage >= 3 && state.locationLevel === 2 && state.reputation >= 90;
}

export function checkProgress(state: GameState): GameState {
  if (state.pendingTransition !== null) return state;
  if ((state.stage === 1 || state.stage === 2) && state.money >= STAGE_GOALS[state.stage]) {
    return { ...state, pendingTransition: state.stage === 1 ? 2 : 3 };
  }
  if (state.stage === 3 && state.won && state.money >= STAGE_GOALS[3]) return { ...state, pendingTransition: 4 };
  if (!state.won && hasWon(state)) return { ...state, won: true };
  return state;
}

export function completeTransition(state: GameState): GameState {
  const stage = state.pendingTransition;
  if (stage === null || stage === 1) return state;
  if (stage === 4) {
    const rng4 = createRng(state.rngState);
    const listings4 = generateListings({ stage, season: state.season }, rng4);
    return {
      ...state, stage, age: STAGE_AGE[4], listings: listings4, pendingTransition: null, event: null, orders: [],
      quests: generateQuests({ ...state, stage }, rng4), rngState: rng4.state(),
    };
  }
  const sellOff = state.inventory.reduce((sum, i) => sum + round10(marketValue(i, state.season) * 0.8), 0);
  const notes = state.inventory.length > 0 ? [...state.summary.notes, 'Kerem eski eşyalarını elden çıkardı'] : state.summary.notes;
  const rng = createRng(state.rngState);
  const listings = generateListings({ stage, season: state.season }, rng);
  const quests = generateQuests({ ...state, stage }, rng);
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
    quests,
    orders: [],
    event: null,
    summary: { ...state.summary, notes },
    rngState: rng.state(),
  };
}

/** Aşama yeniden başlarken verilen sermaye. */
export const STAGE_RESTART_MONEY: Record<1 | 2 | 3 | 4, number> = { 1: 2000, 2: STAGE_GOALS[1], 3: STAGE_GOALS[2], 4: 2_000_000 };

/** Bu paranın altında aşamanın en ucuz eşyası bile alınamaz. */
export const BANKRUPT_FLOOR: Record<1 | 2 | 3 | 4, number> = { 1: 300, 2: 5000, 3: 40000, 4: 80000 };

/** Elinde eşya yok, parası aşamanın en ucuz eşyasına bile yetmiyor ve kredi de alamıyor: ilerleyemez. */
export function isBankrupt(state: GameState): boolean {
  if (state.phase !== 'day' || state.pendingTransition !== null) return false;
  if (state.inventory.length > 0 || state.forSale.length > 0) return false;
  if (state.stage >= 3 && state.loan === null) return false;
  return state.money < BANKRUPT_FLOOR[state.stage];
}

export function restartStage(state: GameState): GameState {
  const rng = createRng(state.rngState);
  const money = STAGE_RESTART_MONEY[state.stage];
  const listings = listingsFor({ ...state, money, inventory: [] }, rng);
  return {
    ...state,
    money,
    loan: null,
    employees: { usta: false, boyaci: false, satis: false },
    listings,
    offers: [],
    summary: { ...state.summary, notes: [...state.summary.notes, 'İflastan sonra yeniden başladın'] },
    rngState: rng.state(),
  };
}
