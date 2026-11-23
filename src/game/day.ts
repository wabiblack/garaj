import type { DaySummary, GameState, Listing, SpecialKind } from './types';
import { createRng, type RNG } from './rng';
import { CATEGORIES_BY_STAGE, generateItem } from './catalog';
import { makeListing } from './negotiation';
import { seasonForDay } from './pricing';
import { generateOffers } from './selling';

export function emptySummary(day: number): DaySummary {
  return { day, bought: 0, sold: 0, spent: 0, earned: 0, notes: [] };
}

export function generateListings(state: Pick<GameState, 'stage' | 'season'>, rng: RNG): Listing[] {
  const cats = CATEGORIES_BY_STAGE[state.stage];
  const count = rng.int(4, 6);
  const listings: Listing[] = [];
  for (let i = 0; i < count; i++) listings.push(makeListing(generateItem(rng.pick(cats), rng), state.season, rng, null));
  if (state.stage === 3 && rng.chance(0.2)) {
    const kind = rng.pick<SpecialKind>(['mezat', 'hurdalik', 'klasik']);
    const item = generateItem('araba', rng, kind === 'mezat' ? {} : { special: kind });
    listings.unshift(makeListing(item, state.season, rng, kind));
  }
  return listings;
}

export function endDay(state: GameState): GameState {
  if (state.phase !== 'day') return state;
  const rng = createRng(state.rngState);
  const offers = generateOffers(state, rng);
  return { ...state, phase: 'evening', offers, rngState: rng.state() };
}

export function startNextDay(state: GameState): GameState {
  if (state.phase !== 'evening') return state;
  const day = state.day + 1;
  const notes = state.pendingCatch.map((c) => `${c.itemName} satışında gizlenen kusur ortaya çıktı`);
  const next: GameState = {
    ...state,
    day,
    phase: 'day',
    season: seasonForDay(day),
    offers: [],
    reputation: Math.max(0, state.reputation - 15 * state.pendingCatch.length),
    pendingCatch: [],
    inventory: state.inventory.map((i) => (i.caredToday ? { ...i, caredToday: false } : i)),
    summary: { ...emptySummary(day), notes },
  };
  const rng = createRng(state.rngState);
  return { ...next, listings: generateListings(next, rng), rngState: rng.state() };
}
