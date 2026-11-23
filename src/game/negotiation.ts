import type { GameState, Item, Listing, Season, SpecialKind, Stage } from './types';
import type { RNG } from './rng';
import { marketValue, round10, trueValue } from './pricing';

export type OfferResult =
  | { kind: 'accepted'; price: number }
  | { kind: 'counter'; price: number; patienceLeft: number }
  | { kind: 'walked' };

const SELLERS = ['Ahmet', 'Ayşe', 'Mehmet', 'Fatma', 'Hasan', 'Zeynep', 'Murat', 'Elif', 'Mustafa', 'Emine', 'Hüseyin', 'Selin', 'Kadir', 'Deniz', 'Osman'];

export function makeListing(item: Item, season: Season, rng: RNG, special: SpecialKind | null): Listing {
  const mv = marketValue(item, season);
  let askPrice: number;
  let minPrice: number;
  if (special === 'mezat') {
    askPrice = minPrice = round10(mv * 0.7);
  } else {
    askPrice = round10(mv * rng.range(1.05, 1.3));
    minPrice = Math.min(askPrice, round10(trueValue(item, season) * rng.range(0.8, 1.0)));
  }
  return {
    id: rng.id('l'), item, askPrice, minPrice, patience: 3, inspected: false, special,
    sellerName: special === 'mezat' ? 'Mezat' : special === 'hurdalik' ? 'Hurdacı ' + rng.pick(SELLERS) : rng.pick(SELLERS),
  };
}

export function respondToOffer(listing: Listing, amount: number): { result: OfferResult; listing: Listing } {
  if (amount >= listing.minPrice) return { result: { kind: 'accepted', price: amount }, listing };
  const patience = listing.patience - (amount < listing.minPrice * 0.5 ? 2 : 1);
  if (patience <= 0) return { result: { kind: 'walked' }, listing: { ...listing, patience: 0 } };
  const price = Math.max(listing.minPrice, round10((listing.askPrice + amount) / 2));
  return {
    result: { kind: 'counter', price, patienceLeft: patience },
    listing: { ...listing, askPrice: price, patience },
  };
}

export const CAPACITY = [1, 2, 4, 8] as const;

export function storageLimit(state: GameState): number {
  if (state.stage === 1) return 3;
  if (state.stage === 2) return 2;
  return CAPACITY[state.capacityLevel];
}

export type BuyBlock = 'yetersiz-para' | 'depo-dolu' | null;

export function canBuy(state: GameState, price: number): BuyBlock {
  if (state.money < price) return 'yetersiz-para';
  if (state.inventory.length >= storageLimit(state)) return 'depo-dolu';
  return null;
}

export function inspectionCost(listing: Listing, stage: Stage, season: Season): number {
  if (stage === 1) return 0;
  return Math.max(200, round10(marketValue(listing.item, season) * 0.02));
}

export function inspect(listing: Listing, stage: Stage, rng: RNG, season: Season): { listing: Listing; cost: number } {
  if (listing.inspected) return { listing, cost: 0 };
  const cost = inspectionCost(listing, stage, season);
  const defects = listing.item.defects.map((d) =>
    d.known ? d : { ...d, known: stage === 1 ? rng.chance(0.5) : true },
  );
  return { listing: { ...listing, inspected: true, item: { ...listing.item, defects } }, cost };
}
