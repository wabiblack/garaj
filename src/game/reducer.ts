import type { Employees, GameState, Item } from './types';
import { createRng } from './rng';
import { canBuy, inspect, inspectionCost, respondToOffer, type BuyBlock, type OfferResult } from './negotiation';
import { care, clean, paint, repair } from './prep';
import { counterOffer, settleSale } from './selling';
import { endDay, startNextDay } from './day';
import { checkProgress, completeTransition, isBankrupt, restartStage } from './progression';
import { fire, hire, repayLoan, takeLoan, upgradeCapacity, upgradeLocation, type GrowthBlock } from './growth';
import { newGame } from './newGame';
import { checkAchievements, recordPurchase, recordSale, unlockAchievement } from './career';
import type { RNG } from './rng';

export type Action =
  | { type: 'offer'; listingId: string; amount: number }
  | { type: 'inspect'; listingId: string }
  | { type: 'repair'; itemId: string; defectId: string }
  | { type: 'clean' | 'paint' | 'care'; itemId: string }
  | { type: 'listForSale'; itemId: string; price: number; disclosed: boolean }
  | { type: 'unlist'; itemId: string }
  | { type: 'acceptOffer'; offerId: string }
  | { type: 'counterOffer'; offerId: string; amount: number }
  | { type: 'rejectOffer'; offerId: string }
  | { type: 'endDay' } | { type: 'startNextDay' } | { type: 'completeTransition' } | { type: 'dismissWin' }
  | { type: 'upgradeCapacity' } | { type: 'upgradeLocation' }
  | { type: 'hire' | 'fire'; role: keyof Employees }
  | { type: 'takeLoan'; amount: number } | { type: 'repayLoan' }
  | { type: 'restartStage' }
  | { type: 'newGame'; seed: number };

export interface GameView { state: GameState; message: string | null; lastOffer: OfferResult | null }

const BLOCK_MESSAGE: Record<NonNullable<BuyBlock | GrowthBlock>, string> = {
  'yetersiz-para': 'Paran yetmiyor',
  'depo-dolu': 'Depon dolu',
  'asama-3-degil': 'Bu özellik galerici olunca açılır',
  'en-ust-seviye': 'Zaten en üst seviyede',
  'zaten-var': 'Zaten çalışıyor',
  'kredi-var': 'Önce mevcut krediyi öde',
};

const validAmount = (n: number) => Number.isFinite(n) && n > 0;

function spend(s: GameState, cost: number): GameState {
  return { ...s, money: s.money - cost, summary: { ...s.summary, spent: s.summary.spent + cost } };
}

function replaceItem(s: GameState, item: Item): GameState {
  return { ...s, inventory: s.inventory.map((i) => (i.id === item.id ? item : i)) };
}

/** Satışı tamamlar ve kariyere (istatistik, görev, başarım) işler. */
function sell(s: GameState, itemId: string, amount: number, rng: RNG): GameState {
  const item = s.inventory.find((i) => i.id === itemId);
  if (!item) return s;
  const disclosed = s.forSale.find((f) => f.itemId === itemId)?.disclosed ?? false;
  return recordSale(settleSale(s, itemId, amount, rng), item, amount, disclosed);
}

function step(view: GameView, action: Action): GameView {
  const s = view.state;
  const same = (message: string | null = null): GameView => ({ ...view, message });
  const to = (state: GameState, message: string | null = null): GameView => ({ ...view, state, message });
  const day = s.phase === 'day';

  switch (action.type) {
    case 'offer': {
      const listing = s.listings.find((l) => l.id === action.listingId);
      if (!day || !listing || !validAmount(action.amount)) return same();
      const amount = Math.round(action.amount);
      if (listing.lastRejected === amount) return same();
      const block = canBuy(s, amount);
      if (block) return same(BLOCK_MESSAGE[block]);
      const { result, listing: updated } = respondToOffer(listing, amount);
      if (result.kind === 'accepted') {
        const bought = spend(
          {
            ...s,
            inventory: [...s.inventory, { ...listing.item, boughtFor: result.price }],
            listings: s.listings.filter((l) => l.id !== listing.id),
          },
          result.price,
        );
        const counted = { ...bought, summary: { ...bought.summary, bought: bought.summary.bought + 1 } };
        return { state: recordPurchase(counted, listing, result.price), message: null, lastOffer: result };
      }
      const listings = result.kind === 'walked'
        ? s.listings.filter((l) => l.id !== listing.id)
        : s.listings.map((l) => (l.id === listing.id ? updated : l));
      return { state: { ...s, listings }, message: null, lastOffer: result };
    }
    case 'inspect': {
      const listing = s.listings.find((l) => l.id === action.listingId);
      if (!day || !listing || listing.inspected) return same();
      if (s.money < inspectionCost(listing, s.stage, s.season)) return same(BLOCK_MESSAGE['yetersiz-para']);
      const rng = createRng(s.rngState);
      const res = inspect(listing, s.stage, rng, s.season);
      const next = spend({ ...s, listings: s.listings.map((l) => (l.id === listing.id ? res.listing : l)), rngState: rng.state() }, res.cost);
      return to(next);
    }
    case 'repair':
    case 'clean':
    case 'paint':
    case 'care': {
      const item = s.inventory.find((i) => i.id === action.itemId);
      if (!day || !item) return same();
      const res =
        action.type === 'repair' ? repair(item, action.defectId, s)
        : action.type === 'clean' ? clean(item)
        : action.type === 'paint' ? paint(item, s)
        : care(item);
      if (!res) return same();
      if (s.money < res.cost) return same(BLOCK_MESSAGE['yetersiz-para']);
      let next = spend(replaceItem(s, res.item), res.cost);
      if (action.type === 'repair' && s.stage >= 2) next = { ...next, skill: Math.min(100, s.skill + 2) };
      return to(next);
    }
    case 'listForSale': {
      if (!s.inventory.some((i) => i.id === action.itemId) || !validAmount(action.price)) return same();
      const entry = { itemId: action.itemId, price: Math.round(action.price), disclosed: action.disclosed };
      const exists = s.forSale.some((f) => f.itemId === action.itemId);
      return to({ ...s, forSale: exists ? s.forSale.map((f) => (f.itemId === action.itemId ? entry : f)) : [...s.forSale, entry] });
    }
    case 'unlist':
      if (!s.forSale.some((f) => f.itemId === action.itemId)) return same();
      return to({ ...s, forSale: s.forSale.filter((f) => f.itemId !== action.itemId) });
    case 'acceptOffer': {
      const offer = s.offers.find((o) => o.id === action.offerId);
      if (!offer) return same();
      const rng = createRng(s.rngState);
      return to({ ...sell(s, offer.itemId, offer.amount, rng), rngState: rng.state() });
    }
    case 'counterOffer': {
      const offer = s.offers.find((o) => o.id === action.offerId);
      if (!offer || !validAmount(action.amount)) return same();
      const rng = createRng(s.rngState);
      const res = counterOffer(offer, Math.round(action.amount), rng);
      if (res.kind === 'accepted') {
        return to({ ...sell(s, offer.itemId, res.amount, rng), rngState: rng.state() }, `${offer.buyerName} kabul etti`);
      }
      return to({ ...s, offers: s.offers.filter((o) => o.id !== offer.id), rngState: rng.state() }, `${offer.buyerName} vazgeçti`);
    }
    case 'rejectOffer':
      if (!s.offers.some((o) => o.id === action.offerId)) return same();
      return to({ ...s, offers: s.offers.filter((o) => o.id !== action.offerId) });
    case 'endDay':
      return to(endDay(s));
    case 'startNextDay':
      return { state: startNextDay(s), message: null, lastOffer: null };
    case 'completeTransition':
      return to(completeTransition(s));
    case 'dismissWin':
      return to({ ...s, wonSeen: true });
    case 'upgradeCapacity':
    case 'upgradeLocation':
    case 'hire':
    case 'takeLoan':
    case 'repayLoan': {
      const res =
        action.type === 'upgradeCapacity' ? upgradeCapacity(s)
        : action.type === 'upgradeLocation' ? upgradeLocation(s)
        : action.type === 'hire' ? hire(s, action.role)
        : action.type === 'takeLoan' ? takeLoan(s, action.amount)
        : repayLoan(s);
      if (res === null) return same();
      if (typeof res === 'string') return same(BLOCK_MESSAGE[res]);
      return to(action.type === 'repayLoan' ? unlockAchievement(res, 'borcsuz') : res);
    }
    case 'fire':
      return to(fire(s, action.role));
    case 'restartStage':
      return isBankrupt(s) ? { state: restartStage(s), message: null, lastOffer: null } : same();
    case 'newGame':
      return { state: newGame(action.seed), message: null, lastOffer: null };
  }
}

export function gameReducer(view: GameView, action: Action): GameView {
  const next = step(view, action);
  if (next.state === view.state) return next;
  return { ...next, state: checkAchievements(checkProgress(next.state)) };
}
