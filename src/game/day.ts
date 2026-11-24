import type { DaySummary, GameEventId, GameState, Listing, Personality, Season, SpecialKind, Stage } from './types';
import { createRng, type RNG } from './rng';
import { addHiddenDefect, generateItem, pickCategory } from './catalog';
import { makeListing } from './negotiation';
import { round10, seasonForDay } from './pricing';
import { formatTL } from './format';
import { generateQuests } from './career';
import { generateOffers } from './selling';
import { applyDailyCosts } from './growth';
import { settleBank } from './bank';
import { isBirthday } from './calendar';
import { settleFamily } from './family';
import { stepStocks } from './stocks';
import { updateOrders } from './orders';
import { markRivalTarget } from './rival';
import { pickStory } from './story';
import { adjustListing } from './expertise';
import { marketIndex, stepMarket } from './market';
import { riskListing, settleRisks, settleVehicles, weekNote } from './realism';

export function emptySummary(day: number): DaySummary {
  return { day, bought: 0, sold: 0, spent: 0, earned: 0, notes: [] };
}

function rollPersonality(rng: RNG): Personality {
  const r = rng.float();
  return r < 0.5 ? 'normal' : r < 0.7 ? 'acele' : r < 0.85 ? 'inatci' : 'kurnaz';
}

export const EVENT_INFO: Record<GameEventId, { title: string; text: string }> = {
  fuar: { title: 'Fuar haftası', text: 'Bu hafta fuar var: alıcılar her zamankinden kalabalık.' },
  durgun: { title: 'Piyasa durgun', text: 'Piyasa durgun: bu hafta alıcı az.' },
  firsat: { title: 'Nakit sıkıntısı', text: 'Satıcılar nakit sıkıntısında: bu hafta pazarlık daha kolay.' },
  hediye: { title: 'Hediye', text: 'Komşun yardımların için para verdi' },
  ceza: { title: 'Park cezası', text: 'Park cezası yedin' },
};

/** Ceza yaşa göre değişir: çocuk park cezası yemez. */
const CEZA_BY_STAGE: Partial<Record<Stage, { title: string; text: string }>> = {
  1: { title: 'Kırık cam', text: 'Top oynarken komşunun camını kırdın, parasını sen ödedin' },
  2: { title: 'Trafik cezası', text: 'Motorla kaskı unuttun, trafik cezası yedin' },
};

export function eventInfo(event: GameEventId, stage: Stage): { title: string; text: string } {
  return (event === 'ceza' && CEZA_BY_STAGE[stage]) || EVENT_INFO[event];
}
export const EVENT_MONEY: Record<Stage, number> = { 1: 500, 2: 5000, 3: 50000, 4: 200000 };
const HISTORY_DAYS = 60;
const EVENT_CHANCE = 0.3;
const APPRECIATION = 1.03;
const MAX_HELD_DAYS = 15;

/** Mevsim değişince günün notuna düşülür. */
export const SEASON_NOTE: Record<Season, string> = {
  ilkbahar: 'İlkbahar geldi: fiyatlar normale döndü.',
  yaz: 'Yaz geldi: bisiklet ve motor daha değerli, üstü açık arabalar aranıyor.',
  sonbahar: 'Sonbahar geldi: fiyatlar normale döndü.',
  kis: 'Kış geldi: bisiklet ve motor ucuzladı, 4x4 aranıyor.',
};

export type ListingContext = Pick<GameState, 'stage' | 'season'> & Partial<Pick<GameState, 'age' | 'stats' | 'hard' | 'market' | 'talents'>>;

export function generateListings(state: ListingContext, rng: RNG): Listing[] {
  const count = rng.int(4, 6);
  const listings: Listing[] = [];
  for (let i = 0; i < count; i++) {
    const personality = rollPersonality(rng);
    const category = pickCategory(state, rng);
    let item = generateItem(category, rng, state.stage === 4 && category === 'araba' ? { scale: 2 } : {});
    if (personality === 'kurnaz') item = addHiddenDefect(item, rng);
    listings.push(makeListing(item, state.season, rng, null, personality, marketIndex(state.market, item.category)));
  }
  if (state.stage === 2 && rng.chance(0.15)) {
    listings.unshift(makeListing(generateItem('motor', rng), state.season, rng, 'mezat', 'normal', marketIndex(state.market, 'motor')));
  } else if (state.stage >= 3 && rng.chance(0.2)) {
    const kind = rng.pick<SpecialKind>(['mezat', 'hurdalik', 'klasik']);
    const item = generateItem('araba', rng, { ...(kind === 'mezat' ? {} : { special: kind }), ...(state.stage === 4 ? { scale: 2 } : {}) });
    listings.unshift(makeListing(item, state.season, rng, kind, 'normal', marketIndex(state.market, 'araba')));
  }
  return listings.map((l) => adjustListing(riskListing(l, rng), state));
}

/**
 * Elinde eşya olmayan oyuncuya en az bir parasının yettiği ilan çıkar (en çok 30 deneme).
 * Böylece talihsiz bir gün oyuncuyu kilitlemez.
 */
export function listingsFor(state: ListingContext & Pick<GameState, 'money' | 'inventory'>, rng: RNG): Listing[] {
  let listings = generateListings(state, rng);
  if (state.inventory.length > 0) return listings;
  for (let i = 0; i < 30 && listings.every((l) => l.minPrice > state.money); i++) listings = generateListings(state, rng);
  return listings;
}

export function endDay(state: GameState): GameState {
  if (state.phase !== 'day') return state;
  const rng = createRng(state.rngState);
  const offers = generateOffers(state, rng);
  return { ...state, phase: 'evening', offers, rngState: rng.state() };
}

export function startNextDay(evening: GameState): GameState {
  if (evening.phase !== 'evening') return evening;
  // Aile, biten günün durumuna bakar (alım sayısı, depo); ayrı zar akışı kullanır.
  const family = settleFamily(evening, createRng(evening.rngState ^ 0x2545f491));
  const familyNotes = family.summary.notes.slice(evening.summary.notes.length);
  const risky = settleRisks({ ...family, summary: evening.summary }, createRng(evening.rngState ^ 0x1b873593));
  const riskNotes = risky.summary.notes.slice(evening.summary.notes.length);
  const state = { ...risky, summary: evening.summary };
  const day = state.day + 1;
  const season = seasonForDay(day);
  const notes = state.pendingCatch.map((c) =>
    c.knowing === false ? `${c.itemName} alıcısı fark etmediğin bir kusur buldu` : `${c.itemName} satışında gizlenen kusur ortaya çıktı`,
  );
  // Piyasa ayrı bir zar akışıyla oynar; böylece günün ilan/olay zarları değişmez.
  const moved = stepMarket(state.market, createRng(state.rngState ^ 0x5bd1e995), state.event);
  if (moved.note) notes.push(moved.note);
  if (isBirthday(day)) notes.push(`İyi ki doğdun! ${state.player.name} artık ${state.age + 1} yaşına girdi`);
  notes.push(...familyNotes, ...riskNotes);
  const wn = weekNote(day);
  if (wn) notes.push(wn);
  const repLoss = state.pendingCatch.reduce((sum, c) => sum + (c.knowing === false ? 5 : 15), 0);
  const next: GameState = settleVehicles(settleBank(applyDailyCosts({
    ...state,
    day,
    phase: 'day',
    season,
    offers: [],
    reputation: Math.max(0, state.reputation - repLoss),
    pendingCatch: [],
    used: 0,
    age: isBirthday(day) ? state.age + 1 : state.age,
    market: moved.market,
    stocks: stepStocks(state.stocks, state.market, moved.market, createRng(state.rngState ^ 0x68e31da4)),
    inventory: state.inventory.map((i) => {
      const held = i.heldDays ?? 0;
      const appreciates = (i.tags.includes('nadir') || i.tags.includes('klasik')) && held < MAX_HELD_DAYS;
      return {
        ...i,
        caredToday: false,
        ...(appreciates ? { baseValue: round10(i.baseValue * APPRECIATION), heldDays: held + 1 } : {}),
      };
    }),
    summary: { ...emptySummary(day), notes: season !== state.season ? [...notes, SEASON_NOTE[season]] : notes },
  })));
  const rng = createRng(state.rngState);
  let listings = listingsFor(next, rng);
  let money = next.money;
  const dayNotes = [...next.summary.notes];
  const event: GameEventId | null = rng.chance(EVENT_CHANCE) ? rng.pick<GameEventId>(['fuar', 'durgun', 'firsat', 'hediye', 'ceza']) : null;
  if (event) {
    const amount = EVENT_MONEY[next.stage];
    if (event === 'firsat') listings = listings.map((l) => ({ ...l, minPrice: round10(l.minPrice * 0.9) }));
    if (event === 'hediye') money += amount;
    if (event === 'ceza') money -= Math.min(money, amount);
    const extra = event === 'hediye' || event === 'ceza' ? `: ${formatTL(amount)}` : '';
    dayNotes.push(eventInfo(event, next.stage).text + extra);
  }
  // Ceza parayı düşürdüyse elinde eşyası olmayan oyuncu yine en az bir ilanı alabilmeli.
  if (next.inventory.length === 0 && !listings.some((l) => l.minPrice <= money)) listings = listingsFor({ ...next, money }, rng);
  const quests = generateQuests(next, rng, next.quests.filter((q) => !q.done));
  const orders = updateOrders(next, rng);
  dayNotes.push(...orders.notes);
  listings = markRivalTarget(listings, next.season, rng);
  const pending = pickStory(next, rng);
  return {
    ...next, listings, money, event, quests, orders: orders.orders,
    story: { ...next.story, pending },
    history: [...state.history, { day: state.day, money: state.money }].slice(-HISTORY_DAYS),
    summary: { ...next.summary, notes: dayNotes }, rngState: rng.state(),
  };
}
