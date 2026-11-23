import type { BuyerOffer, GameState, Item } from './types';
import type { RNG } from './rng';
import { marketValue, round10 } from './pricing';

const BUYERS = ['Ali', 'Burak', 'Can', 'Derya', 'Ece', 'Ferhat', 'Gül', 'İsmail', 'Kemal', 'Leyla', 'Nihat', 'Oya', 'Serkan', 'Tuğba', 'Volkan', 'Yasemin'];

export function buyerCount(state: GameState): number {
  return 1 + (state.reputation > 60 ? 1 : 0) + state.locationLevel + (state.employees.satis ? 1 : 0);
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
    const p = Math.min(0.95, Math.max(0.05, 1.6 - sale.price / Math.max(1, value)));
    for (let i = 0; i < buyerCount(state); i++) {
      if (!rng.chance(p)) continue;
      let amount = sale.price * rng.range(0.85, 1) * (1 + 0.03 * state.locationLevel);
      if (item.tags.includes('klasik')) amount *= 1.15;
      offers.push({ id: rng.id('o'), itemId: item.id, amount: round10(amount), buyerName: rng.pick(BUYERS) });
    }
  }
  return offers;
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
  if (item.defects.length === 0) reputation += 1;
  else if (disclosed) reputation += 2;
  else if (rng.chance(0.4)) pendingCatch = [...pendingCatch, { itemName: itemName(item) }];
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
