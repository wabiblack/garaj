import type { GameState, Item, Listing } from '../src/game/types';
import { initialMarket } from '../src/game/market';

export function makeItem(over: Partial<Item> = {}): Item {
  return {
    id: 'it-1', category: 'bisiklet', brand: 'Serçe', model: 'Şehir 26', baseValue: 2000, condition: 100,
    defects: [], tags: [], cleaned: false, painted: false, careCount: 0, caredToday: false, boughtFor: 0, ...over,
  };
}

export function makeListing(over: Partial<Listing> = {}): Listing {
  return {
    id: 'l-1', item: makeItem(), askPrice: 2400, minPrice: 1800, patience: 3, inspected: false,
    special: null, sellerName: 'Ahmet', personality: 'normal', ...over,
  };
}

export function makeState(over: Partial<GameState> = {}): GameState {
  return {
    version: 3, rngState: 1, day: 1, phase: 'day', stage: 1, age: 12, money: 2000, season: 'ilkbahar',
    inventory: [], listings: [], forSale: [], offers: [], reputation: 50, skill: 0,
    capacityLevel: 0, locationLevel: 0, employees: { usta: false, boyaci: false, satis: false, cirak: false }, loan: null,
    pendingCatch: [], summary: { day: 1, bought: 0, sold: 0, spent: 0, earned: 0, notes: [] },
    pendingTransition: null, won: false, wonSeen: false,
    event: null, quests: [], achievements: [],
    stats: { sales: 0, profit: 0, bestProfit: 0, bestItem: null, disclosedSales: 0, rivalTaken: 0, categorySales: { bisiklet: 0, guvercin: 0, konsol: 0, telefon: 0, motor: 0, araba: 0 }, stageDay: { 2: null, 3: null, 4: null } },
    orders: [], story: { seen: [], pending: null }, history: [], branches: 0, finalSeen: false, hard: false, prices: {}, player: { name: 'Kerem', look: { skin: 1, hair: 0, color: 0, glasses: false } },
    market: initialMarket(), ledger: [],
    ...over,
  };
}
