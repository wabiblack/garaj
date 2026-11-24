import type { GameState } from './types';
import { createRng } from './rng';
import { generateListings, listingsFor } from './day';
import { generateQuests } from './career';
import { creditCheck } from './bank';

/** 3 → 4 geçişi için ayrıca şehrin en büyük galericisi olmak gerekir. */
export const STAGE_GOALS: Record<1 | 2 | 3, number> = { 1: 50000, 2: 500000, 3: 20_000_000 };
/** Aşamaya geçmek için gereken en küçük yaş: motor 16, galeri 18, holding 22. */
export const STAGE_MIN_AGE = { 2: 16, 3: 18, 4: 22 } as const;

export function hasWon(state: GameState): boolean {
  return state.stage >= 3 && state.locationLevel === 2 && state.reputation >= 90;
}

export function checkProgress(state: GameState): GameState {
  if (state.pendingTransition !== null) return state;
  if ((state.stage === 1 || state.stage === 2) && state.money >= STAGE_GOALS[state.stage]) {
    const next = state.stage === 1 ? 2 : 3;
    if (state.age >= STAGE_MIN_AGE[next]) return { ...state, pendingTransition: next };
  }
  if (state.stage === 3 && state.won && state.money >= STAGE_GOALS[3] && state.age >= STAGE_MIN_AGE[4]) return { ...state, pendingTransition: 4 };
  if (!state.won && hasWon(state)) return { ...state, won: true };
  return state;
}

export function completeTransition(state: GameState): GameState {
  const stage = state.pendingTransition;
  if (stage === null || stage === 1) return state;
  if (stage === 4) {
    const rng4 = createRng(state.rngState);
    const listings4 = generateListings({ ...state, stage }, rng4);
    return {
      ...state, stage, listings: listings4, pendingTransition: null, event: null, orders: [],
      quests: generateQuests({ ...state, stage }, rng4), rngState: rng4.state(),
    };
  }
  const rng = createRng(state.rngState);
  const listings = generateListings({ ...state, stage }, rng);
  const quests = generateQuests({ ...state, stage }, rng);
  return {
    ...state,
    stage,
    listings,
    pendingTransition: null,
    quests,
    orders: [],
    event: null,
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
  if (state.loan === null && creditCheck(state).ok) return false;
  return state.money + state.bank.savings < BANKRUPT_FLOOR[state.stage];
}

export function restartStage(state: GameState): GameState {
  const rng = createRng(state.rngState);
  const money = STAGE_RESTART_MONEY[state.stage];
  const listings = listingsFor({ ...state, money, inventory: [] }, rng);
  return {
    ...state,
    money,
    loan: null,
    employees: { usta: false, boyaci: false, satis: false, cirak: false },
    listings,
    offers: [],
    summary: { ...state.summary, notes: [...state.summary.notes, 'İflastan sonra yeniden başladın'] },
    rngState: rng.state(),
  };
}
