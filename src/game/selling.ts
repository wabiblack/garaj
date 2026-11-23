import type { BuyerOffer, GameState, Item, SaleListing } from './types';
import type { RNG } from './rng';
import { marketValue, round10 } from './pricing';

export const OFFER_LO = 0.94, OFFER_HI = 1.05;
/** Alıcı, gözündeki değerin bu katından fazlasını asla teklif etmez. */
export const OFFER_CAP = 1.1;
const BUYERS = ['Ali', 'Burak', 'Can', 'Derya', 'Ece', 'Ferhat', 'Gül', 'İsmail', 'Kemal', 'Leyla', 'Nihat', 'Oya', 'Serkan', 'Tuğba', 'Volkan', 'Yasemin'];

export function buyerCount(state: GameState): number {
  const event = state.event === 'fuar' ? 2 : state.event === 'durgun' ? -1 : 0;
  const hard = state.hard ? -1 : 0;
  return Math.max(1, 2 + (state.reputation > 75 ? 1 : 0) + state.locationLevel + state.branches + (state.employees.satis ? 1 : 0) + event + hard);
}

/** Çırak, teklif gelmeyen en ucuz satıştaki mal için piyasa değerinin bu katında bir müşteri bulur. */
export const CIRAK_SHARE = 0.9;
export const CIRAK_BUYER = 'Çırağın müşterisi';

function cirakOffer(state: GameState, offers: BuyerOffer[], rng: RNG): BuyerOffer | null {
  const idle = state.forSale
    .filter((f) => !offers.some((o) => o.itemId === f.itemId))
    .map((f) => ({ f, item: state.inventory.find((i) => i.id === f.itemId) }))
    .filter((x): x is { f: SaleListing; item: Item } => x.item !== undefined)
    .sort((a, b) => a.f.price - b.f.price)[0];
  if (!idle) return null;
  const amount = round10(Math.min(idle.f.price, buyerValue(idle.item, idle.f.disclosed, state) * CIRAK_SHARE));
  return { id: rng.id('o'), itemId: idle.item.id, amount, buyerName: CIRAK_BUYER };
}

/** Alıcının gözündeki değer: kusurlar belirtildiyse bilinenler düşülür, değilse kusursuz sanılır. */
export function buyerValue(item: Item, disclosed: boolean, state: GameState): number {
  return marketValue(disclosed ? item : { ...item, defects: [] }, state.season);
}

export function generateOffers(state: GameState, rng: RNG): BuyerOffer[] {
  const offers: BuyerOffer[] = [];
  for (const sale of state.forSale) {
    const item = state.inventory.find((i) => i.id === sale.itemId);
    if (!item) continue;
    const value = buyerValue(item, sale.disclosed, state);
    const p = Math.min(0.95, Math.max(0, 1.8 - sale.price / Math.max(1, value)));
    const bonus = (1 + 0.03 * state.locationLevel) * (item.tags.includes('klasik') ? 1.15 : 1);
    const cap = value * OFFER_CAP * bonus;
    for (let i = 0; i < buyerCount(state); i++) {
      if (!rng.chance(p)) continue;
      const amount = Math.min(cap, sale.price * rng.range(OFFER_LO, OFFER_HI) * bonus);
      offers.push({ id: rng.id('o'), itemId: item.id, amount: round10(amount), buyerName: rng.pick(BUYERS) });
    }
  }
  const extra = state.employees.cirak ? cirakOffer(state, offers, rng) : null;
  return extra ? [...offers, extra] : offers;
}

export type CounterResult = { kind: 'accepted'; amount: number } | { kind: 'left' };

export function counterOffer(offer: BuyerOffer, amount: number, rng: RNG): CounterResult {
  if (amount <= offer.amount * 1.05) return { kind: 'accepted', amount };
  if (amount <= offer.amount * 1.12 && rng.chance(0.5)) return { kind: 'accepted', amount };
  return { kind: 'left' };
}

export function itemName(item: Item): string {
  return `${item.brand} ${item.model}`;
}

export function settleSale(state: GameState, itemId: string, amount: number, rng: RNG): GameState {
  const item = state.inventory.find((i) => i.id === itemId);
  if (!item) return state;
  const sale = state.forSale.find((s) => s.itemId === itemId);
  const disclosed = sale?.disclosed ?? false;
  let reputation = state.reputation;
  let pendingCatch = state.pendingCatch;
  const knownHidden = item.defects.some((d) => d.known) && !disclosed;
  if (item.defects.length === 0 || (disclosed && !item.defects.some((d) => !d.known))) reputation += 2;
  else if (knownHidden) {
    if (rng.chance(0.4)) pendingCatch = [...pendingCatch, { itemName: itemName(item), knowing: true }];
  } else if (rng.chance(0.15)) pendingCatch = [...pendingCatch, { itemName: itemName(item), knowing: false }];
  return {
    ...state,
    money: state.money + amount,
    reputation: Math.min(100, reputation),
    pendingCatch,
    inventory: state.inventory.filter((i) => i.id !== itemId),
    forSale: state.forSale.filter((s) => s.itemId !== itemId),
    offers: state.offers.filter((o) => o.itemId !== itemId),
    summary: { ...state.summary, sold: state.summary.sold + 1, earned: state.summary.earned + amount },
  };
}
