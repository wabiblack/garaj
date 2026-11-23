import type { DaySummary, GameEventId, GameState, Listing, Personality, SpecialKind, Stage } from './types';
import { createRng, type RNG } from './rng';
import { CATEGORIES_BY_STAGE, addHiddenDefect, generateItem } from './catalog';
import { makeListing } from './negotiation';
import { round10, seasonForDay } from './pricing';
import { formatTL } from './format';
import { generateQuests } from './career';
import { generateOffers } from './selling';
import { applyDailyCosts } from './growth';

export function emptySummary(day: number): DaySummary {
  return { day, bought: 0, sold: 0, spent: 0, earned: 0, notes: [] };
}

function rollPersonality(rng: RNG): Personality {
  const r = rng.float();
  return r < 0.5 ? 'normal' : r < 0.7 ? 'acele' : r < 0.85 ? 'inatci' : 'kurnaz';
}

export const EVENT_INFO: Record<GameEventId, { title: string; text: string }> = {
  fuar: { title: 'Fuar günü', text: 'Bugün fuar var: alıcılar her zamankinden kalabalık.' },
  durgun: { title: 'Piyasa durgun', text: 'Piyasa durgun: bugün alıcı az.' },
  firsat: { title: 'Nakit sıkıntısı', text: 'Satıcılar nakit sıkıntısında: bugün pazarlık daha kolay.' },
  hediye: { title: 'Hediye', text: 'Komşun yardımların için para verdi' },
  ceza: { title: 'Park cezası', text: 'Park cezası yedin' },
};
export const EVENT_MONEY: Record<Stage, number> = { 1: 500, 2: 5000, 3: 50000 };
const EVENT_CHANCE = 0.3;
const APPRECIATION = 1.03;
const MAX_HELD_DAYS = 15;

export function generateListings(state: Pick<GameState, 'stage' | 'season'>, rng: RNG): Listing[] {
  const cats = CATEGORIES_BY_STAGE[state.stage];
  const count = rng.int(4, 6);
  const listings: Listing[] = [];
  for (let i = 0; i < count; i++) {
    const personality = rollPersonality(rng);
    let item = generateItem(rng.pick(cats), rng);
    if (personality === 'kurnaz') item = addHiddenDefect(item, rng);
    listings.push(makeListing(item, state.season, rng, null, personality));
  }
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
  const next: GameState = applyDailyCosts({
    ...state,
    day,
    phase: 'day',
    season: seasonForDay(day),
    offers: [],
    reputation: Math.max(0, state.reputation - 15 * state.pendingCatch.length),
    pendingCatch: [],
    inventory: state.inventory.map((i) => {
      const held = i.heldDays ?? 0;
      const appreciates = (i.tags.includes('nadir') || i.tags.includes('klasik')) && held < MAX_HELD_DAYS;
      return {
        ...i,
        caredToday: false,
        ...(appreciates ? { baseValue: round10(i.baseValue * APPRECIATION), heldDays: held + 1 } : {}),
      };
    }),
    summary: { ...emptySummary(day), notes },
  });
  const rng = createRng(state.rngState);
  let listings = generateListings(next, rng);
  let money = next.money;
  const dayNotes = [...next.summary.notes];
  const event: GameEventId | null = rng.chance(EVENT_CHANCE) ? rng.pick<GameEventId>(['fuar', 'durgun', 'firsat', 'hediye', 'ceza']) : null;
  if (event) {
    const amount = EVENT_MONEY[next.stage];
    if (event === 'firsat') listings = listings.map((l) => ({ ...l, minPrice: round10(l.minPrice * 0.9) }));
    if (event === 'hediye') money += amount;
    if (event === 'ceza') money -= Math.min(money, amount);
    const extra = event === 'hediye' || event === 'ceza' ? `: ${formatTL(amount)}` : '';
    dayNotes.push(EVENT_INFO[event].text + extra);
  }
  const quests = generateQuests(next, rng, next.quests.filter((q) => !q.done));
  return { ...next, listings, money, event, quests, summary: { ...next.summary, notes: dayNotes }, rngState: rng.state() };
}
