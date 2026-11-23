import type { GameState } from './types';
import { createRng } from './rng';
import { marketValue, round10 } from './pricing';
import { generateListings } from './day';
import { generateQuests } from './career';

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
    event: null,
    summary: { ...state.summary, notes },
    rngState: rng.state(),
  };
}

/** Aşama yeniden başlarken verilen sermaye. */
export const STAGE_RESTART_MONEY: Record<1 | 2 | 3, number> = { 1: 2000, 2: STAGE_GOALS[1], 3: STAGE_GOALS[2] };

/** Elinde eşya yok, bugünkü hiçbir ilana parası yetmiyor ve kredi de alamıyor: ilerleyemez. */
export function isBankrupt(state: GameState): boolean {
  if (state.phase !== 'day' || state.pendingTransition !== null) return false;
  if (state.inventory.length > 0 || state.forSale.length > 0) return false;
  if (state.stage === 3 && state.loan === null) return false;
  if (state.listings.length === 0) return false;
  return state.listings.every((l) => state.money < l.minPrice);
}

export function restartStage(state: GameState): GameState {
  const rng = createRng(state.rngState);
  const money = STAGE_RESTART_MONEY[state.stage];
  // Yeniden başlayan oyuncu en az bir ilana yetmeli; yoksa hemen yine iflas eder.
  let listings = generateListings(state, rng);
  for (let i = 0; i < 50 && listings.every((l) => money < l.minPrice); i++) listings = generateListings(state, rng);
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
