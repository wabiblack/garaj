import type { GameState, Item, Listing, Personality, Season, SpecialKind, Stage } from './types';
import type { RNG } from './rng';
import { marketValue, round10, trueValue } from './pricing';

export type OfferResult =
  | { kind: 'accepted'; price: number }
  | { kind: 'counter'; price: number; patienceLeft: number }
  | { kind: 'walked' };

export const ASK_MIN = 1.0, ASK_MAX = 1.25, MIN_LO = 0.55, MIN_HI = 0.75;
const SELLERS = ['Ahmet', 'Ayşe', 'Mehmet', 'Fatma', 'Hasan', 'Zeynep', 'Murat', 'Elif', 'Mustafa', 'Emine', 'Hüseyin', 'Selin', 'Kadir', 'Deniz', 'Osman'];

export const PERSONALITY_LABEL: Record<Personality, string> = { normal: 'Normal', acele: 'Acelesi var', inatci: 'İnatçı', kurnaz: 'Kurnaz' };
const PATIENCE: Record<Personality, number> = { normal: 3, acele: 2, inatci: 4, kurnaz: 3 };

export function makeListing(item: Item, season: Season, rng: RNG, special: SpecialKind | null, personality: Personality = 'normal', index = 1): Listing {
  const mv = marketValue(item, season, index);
  let askPrice: number;
  let minPrice: number;
  let auctionMax: number | undefined;
  if (special === 'mezat') {
    askPrice = minPrice = round10(mv * 0.5);
    auctionMax = round10(mv * rng.range(0.65, 0.95));
  } else {
    askPrice = round10(mv * rng.range(ASK_MIN, ASK_MAX));
    minPrice = round10(trueValue(item, season, index) * rng.range(MIN_LO, MIN_HI));
    if (personality === 'acele') minPrice = round10(minPrice * 0.85);
    if (personality === 'inatci') minPrice = round10(minPrice * 1.1);
    if (personality === 'kurnaz') askPrice = round10(askPrice * 1.1);
    minPrice = Math.min(askPrice, minPrice);
  }
  return {
    id: rng.id('l'), item, askPrice, minPrice, patience: PATIENCE[personality], inspected: false, special, personality,
    ...(auctionMax !== undefined ? { auctionMax } : {}),
    sellerName: special === 'mezat' ? 'Mezat' : special === 'hurdalik' ? 'Hurdacı ' + rng.pick(SELLERS) : rng.pick(SELLERS),
  };
}

export function respondToOffer(listing: Listing, amount: number): { result: OfferResult; listing: Listing } {
  if (amount >= listing.minPrice) return { result: { kind: 'accepted', price: Math.min(amount, listing.askPrice) }, listing };
  const patience = listing.patience - (amount < listing.minPrice * 0.5 ? 2 : 1);
  if (patience <= 0) return { result: { kind: 'walked' }, listing: { ...listing, patience: 0 } };
  const step = listing.personality === 'inatci' ? 0.25 : 0.5;
  const price = Math.max(listing.minPrice, round10(listing.askPrice * (1 - step) + amount * step));
  return {
    result: { kind: 'counter', price, patienceLeft: patience },
    listing: { ...listing, askPrice: price, patience, lastRejected: amount },
  };
}

export const CAPACITY = [1, 2, 4, 8] as const;

export function storageLimit(state: GameState): number {
  if (state.stage === 1) return 3;
  if (state.stage === 2) return 3;
  return CAPACITY[state.capacityLevel];
}

export type BuyBlock = 'yetersiz-para' | 'depo-dolu' | null;

export function canBuy(state: GameState, price: number): BuyBlock {
  if (state.money < price) return 'yetersiz-para';
  if (state.inventory.length >= storageLimit(state)) return 'depo-dolu';
  return null;
}

/** eye: Göz yeteneği seviyesi; her seviye ekspertizi %25 ucuzlatır. */
export function inspectionCost(listing: Listing, stage: Stage, season: Season, eye = 0): number {
  if (stage === 1) return 0;
  return round10(Math.max(200, round10(marketValue(listing.item, season) * 0.02)) * (1 - 0.25 * eye));
}

export function inspect(listing: Listing, stage: Stage, rng: RNG, season: Season, eye = 0): { listing: Listing; cost: number } {
  if (listing.inspected) return { listing, cost: 0 };
  const cost = inspectionCost(listing, stage, season, eye);
  const defects = listing.item.defects.map((d) =>
    d.known ? d : { ...d, known: stage === 1 ? rng.chance(0.5 + 0.15 * eye) : true },
  );
  return { listing: { ...listing, inspected: true, item: { ...listing.item, defects } }, cost };
}
