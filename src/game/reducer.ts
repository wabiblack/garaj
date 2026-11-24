import type { Employees, GameState, Item, Listing } from './types';
import { createRng } from './rng';
import { canBuy, inspect, inspectionCost, respondToOffer, type BuyBlock, type OfferResult } from './negotiation';
import { care, clean, paint, repair, repairDiscount } from './prep';
import { rivalMove } from './rival';
import { orderMatches, orderPrice } from './orders';
import { applyStoryChoice } from './story';
import { rivalsWillRaise } from './auction';
import { round10 } from './pricing';
import { counterOffer, settleSale } from './selling';
import { endDay, startNextDay } from './day';
import { checkProgress, completeTransition, isBankrupt, restartStage } from './progression';
import { fire, hire, openBranch, upgradeCapacity, upgradeLocation, type GrowthBlock } from './growth';
import { deposit, repayLoan, takeLoan, withdraw, type BankBlock } from './bank';
import { familyBorrow, familyPay, familyRepay, type FamilyBlock } from './family';
import { buyStock, sellStock, type StockBlock } from './stocks';
import type { CareerId, PartSource, StockId, TalentId } from './types';
import { installPart, orderPart, scrap, treat, type WorkshopBlock } from './workshop';
import { adoptCat, feedPets, keepPet, type PetBlock } from './pets';
import { XP, gainXp, learnTalent, talentRank } from './talents';
import { newGame, type StartStage } from './newGame';
import { checkAchievements, recordPurchase, recordSale, unlockAchievement } from './career';
import type { RNG } from './rng';
import { streakBonus } from './streak';
import { cleanPlayer, type Player } from './player';
import { formatTL } from './format';
import { marketIndex } from './market';
import { inTransit, notaryFee } from './realism';
import { chooseCareer, failExam } from './life';
import { actionsLeft } from './calendar';

export type Action =
  | { type: 'offer'; listingId: string; amount: number }
  | { type: 'inspect'; listingId: string }
  | { type: 'repair'; itemId: string; defectId: string; quality?: number }
  | { type: 'clean' | 'care'; itemId: string }
  | { type: 'paint'; itemId: string; quality?: number }
  | { type: 'keepPet' | 'scrap'; itemId: string } | { type: 'adoptCat' } | { type: 'feedPets' }
  | { type: 'listForSale'; itemId: string; price: number; disclosed: boolean }
  | { type: 'unlist'; itemId: string }
  | { type: 'acceptOffer'; offerId: string }
  | { type: 'counterOffer'; offerId: string; amount: number }
  | { type: 'rejectOffer'; offerId: string }
  | { type: 'endDay' } | { type: 'startNextDay' } | { type: 'completeTransition' } | { type: 'dismissWin' }
  | { type: 'upgradeCapacity' } | { type: 'upgradeLocation' }
  | { type: 'hire' | 'fire'; role: keyof Employees }
  | { type: 'takeLoan'; amount: number } | { type: 'repayLoan' }
  | { type: 'deposit' | 'withdraw'; amount: number }
  | { type: 'buyStock' | 'sellStock'; id: StockId; shares: number }
  | { type: 'learnTalent'; id: TalentId }
  | { type: 'failExam' } | { type: 'chooseCareer'; id: CareerId }
  | { type: 'orderPart'; itemId: string; defectId: string; source: PartSource }
  | { type: 'installPart' | 'treat'; itemId: string; defectId: string; quality: number }
  | { type: 'familyPay' } | { type: 'familyBorrow'; amount: number } | { type: 'familyRepay' }
  | { type: 'restartStage' }
  | { type: 'fulfillOrder'; orderId: string; itemId: string }
  | { type: 'storyChoice'; index: number }
  | { type: 'winAuction'; listingId: string; price: number }
  | { type: 'auctionLost'; listingId: string }
  | { type: 'openBranch' }
  | { type: 'load'; state: GameState }
  | { type: 'streakBonus'; days: number }
  | { type: 'setPlayer'; player: Player }
  | { type: 'newGame'; seed: number; hard?: boolean; player?: Player; stage?: StartStage };

export interface GameView { state: GameState; message: string | null; lastOffer: OfferResult | null }

const BLOCK_MESSAGE: Record<NonNullable<BuyBlock | GrowthBlock | BankBlock | FamilyBlock | StockBlock | WorkshopBlock | PetBlock> | 'okul' | 'kargo', string> = {
  'yetersiz-para': 'Paran yetmiyor',
  'depo-dolu': 'Depon dolu',
  'asama-2-degil': 'Çırak motor işine girince alınır',
  'asama-3-degil': 'Bu özellik galerici olunca açılır',
  'en-ust-seviye': 'Zaten en üst seviyede',
  'zaten-var': 'Zaten çalışıyor',
  'kredi-var': 'Önce mevcut krediyi öde',
  'resit-degil': '18 yaşından önce kredi çekemez, borsada işlem yapamazsın',
  'itibar-dusuk': 'İtibarın düşük: banka kredi vermiyor',
  'gecmis-yok': 'Banka en az 5 satışlık geçmiş istiyor',
  'limit-asimi': 'Bu tutar limiti aşıyor',
  'resit': 'Artık reşitsin: borç için bankaya git',
  'guven-dusuk': 'Ailenin sana güveni az: önce verdiğin sözleri tut',
  'borc-var': 'Önce aileye olan borcunu öde',
  'yetersiz-hisse': 'O kadar hissen yok',
  'parca-yolda': 'Parça henüz gelmedi; hafta sonu kargoda',
  'parca-yok': 'Önce parçayı sipariş et',
  'asama-4-degil': 'Şubeler holding kurunca açılır',
  'okul': 'Bu hafta okul var: iş hakkın bitti. Haftayı bitir',
  'kargo': 'Bu eşya kargoda; hafta sonu gelecek',
};

const validAmount = (n: number) => Number.isFinite(n) && n > 0;

function spend(s: GameState, cost: number): GameState {
  return { ...s, money: s.money - cost, summary: { ...s.summary, spent: s.summary.spent + cost } };
}

function replaceItem(s: GameState, item: Item): GameState {
  return { ...s, inventory: s.inventory.map((i) => (i.id === item.id ? item : i)) };
}

/** İlanı satın alır: parayı düşer, malı depoya koyar, kariyere işler. */
function buy(s: GameState, listing: Listing, price: number): GameState {
  const arrives = listing.remote ? { arrives: s.day + 1 } : {};
  const bought = spend(
    { ...s, inventory: [...s.inventory, { ...listing.item, ...arrives, boughtFor: price }], listings: s.listings.filter((l) => l.id !== listing.id) },
    price + notaryFee(listing.item, price),
  );
  const counted = { ...bought, used: bought.used + 1, summary: { ...bought.summary, bought: bought.summary.bought + 1 } };
  const recorded = gainXp(recordPurchase(counted, listing, price), XP.buy);
  return listing.rivalEye ? unlockAchievement(recorded, 'rakip') : recorded;
}

/** Zaman geçer: Cevdet göz koyduğu ilanı kapabilir. */
function withRival(v: GameView, listingId: string): GameView {
  const r = rivalMove(v.state, listingId);
  return r.message ? { ...v, state: r.state, message: v.message ?? r.message } : v;
}

/** Satışı tamamlar ve kariyere (istatistik, görev, başarım) işler. */
function sell(s: GameState, itemId: string, amount: number, rng: RNG): GameState {
  const item = s.inventory.find((i) => i.id === itemId);
  if (!item) return s;
  const disclosed = s.forSale.find((f) => f.itemId === itemId)?.disclosed ?? false;
  const honest = disclosed && item.defects.some((d) => d.known);
  return gainXp(recordSale(settleSale(s, itemId, amount, rng), item, amount, disclosed), XP.sale + (honest ? XP.honest : 0));
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
      if (listing.special === 'mezat' && listing.auctionMax !== undefined) return same();
      const amount = Math.round(action.amount);
      if (listing.lastRejected === amount) return same();
      if (actionsLeft(s) <= 0) return same(BLOCK_MESSAGE.okul);
      const block = canBuy(s, amount);
      if (block) return same(BLOCK_MESSAGE[block]);
      const { result, listing: updated } = respondToOffer(listing, amount);
      if (result.kind === 'accepted') {
        if (listing.risk === 'sahte') {
          const lost = spend({ ...s, listings: s.listings.filter((l) => l.id !== listing.id) }, result.price);
          return { state: lost, message: 'Dolandırıldın! Satıcı kaporayı alıp ortadan kayboldu.', lastOffer: result };
        }
        return withRival({ state: buy(s, listing, result.price), message: null, lastOffer: result }, listing.id);
      }
      const listings = result.kind === 'walked'
        ? s.listings.filter((l) => l.id !== listing.id)
        : s.listings.map((l) => (l.id === listing.id ? updated : l));
      return withRival({ state: { ...s, listings }, message: null, lastOffer: result }, listing.id);
    }
    case 'inspect': {
      const listing = s.listings.find((l) => l.id === action.listingId);
      if (!day || !listing || listing.inspected) return same();
      const eye = talentRank(s, 'goz');
      if (s.money < inspectionCost(listing, s.stage, s.season, eye)) return same(BLOCK_MESSAGE['yetersiz-para']);
      const rng = createRng(s.rngState);
      const res = inspect(listing, s.stage, rng, s.season, eye);
      const next = spend({ ...s, listings: s.listings.map((l) => (l.id === listing.id ? res.listing : l)), rngState: rng.state() }, res.cost);
      return withRival(to(next), listing.id);
    }
    case 'repair':
    case 'clean':
    case 'paint':
    case 'care': {
      const item = s.inventory.find((i) => i.id === action.itemId);
      if (!day || !item) return same();
      if (inTransit(item, s.day)) return same(BLOCK_MESSAGE.kargo);
      if (actionsLeft(s) <= 0) return same(BLOCK_MESSAGE.okul);
      const res =
        action.type === 'repair' ? repair(item, action.defectId, s)
        : action.type === 'clean' ? clean(item)
        : action.type === 'paint' ? paint(item, s, action.quality ?? 1)
        : care(item);
      if (!res) return same();
      const cost = action.type === 'repair' ? round10(res.cost * (1 - repairDiscount(action.quality ?? 0))) : res.cost;
      if (s.money < cost) return same(BLOCK_MESSAGE['yetersiz-para']);
      let next = { ...spend(replaceItem(s, res.item), cost), used: s.used + 1 };
      if (action.type === 'repair' && s.stage >= 2) next = { ...next, skill: Math.min(100, s.skill + 2) };
      if (action.type === 'repair') next = gainXp(next, XP.repair);
      return to(next);
    }
    case 'listForSale': {
      const target = s.inventory.find((i) => i.id === action.itemId);
      if (!target || !validAmount(action.price)) return same();
      if (inTransit(target, s.day)) return same(BLOCK_MESSAGE.kargo);
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
      return to({ ...s, wonSeen: true, finalSeen: s.finalSeen || s.branches >= 3 });
    case 'upgradeCapacity':
    case 'upgradeLocation':
    case 'hire':
    case 'takeLoan':
    case 'repayLoan':
    case 'deposit':
    case 'withdraw':
    case 'familyPay':
    case 'familyBorrow':
    case 'familyRepay':
    case 'buyStock':
    case 'sellStock': {
      const res =
        action.type === 'upgradeCapacity' ? upgradeCapacity(s)
        : action.type === 'upgradeLocation' ? upgradeLocation(s)
        : action.type === 'hire' ? hire(s, action.role)
        : action.type === 'takeLoan' ? takeLoan(s, Math.round(action.amount))
        : action.type === 'deposit' ? deposit(s, Math.round(action.amount))
        : action.type === 'withdraw' ? withdraw(s, Math.round(action.amount))
        : action.type === 'familyPay' ? familyPay(s)
        : action.type === 'familyBorrow' ? familyBorrow(s, Math.round(action.amount))
        : action.type === 'familyRepay' ? familyRepay(s)
        : action.type === 'buyStock' ? buyStock(s, action.id, action.shares)
        : action.type === 'sellStock' ? sellStock(s, action.id, action.shares)
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
      return { state: newGame(action.seed, { ...(action.hard ? { hard: true, achievements: s.achievements } : {}), player: action.player, stage: action.stage }), message: null, lastOffer: null };
    case 'setPlayer':
      return to({ ...s, player: cleanPlayer(action.player) });
    case 'streakBonus': {
      const bonus = streakBonus(s.stage, action.days);
      if (bonus <= 0) return same();
      return to({ ...s, money: s.money + bonus }, `Günlük seri: ${action.days} gün · +${formatTL(bonus)}`);
    }
    case 'load':
      return { state: action.state, message: 'Kayıt yüklendi', lastOffer: null };
    case 'fulfillOrder': {
      const order = s.orders.find((o) => o.id === action.orderId);
      const item = s.inventory.find((i) => i.id === action.itemId);
      if (!day || !order || !item || !orderMatches(order, item)) return same();
      const rng = createRng(s.rngState);
      const sold = sell(s, item.id, orderPrice(order, item, s.season, marketIndex(s.market, item.category)), rng);
      const next = {
        ...sold,
        reputation: Math.min(100, sold.reputation + 3),
        orders: sold.orders.filter((o) => o.id !== order.id),
        rngState: rng.state(),
      };
      return to(unlockAchievement(next, 'siparisci'), `${order.buyerName} çok memnun kaldı`);
    }
    case 'orderPart':
    case 'installPart':
    case 'treat': {
      if (!day) return same();
      const counts = action.type !== 'orderPart';
      if (counts && actionsLeft(s) <= 0) return same(BLOCK_MESSAGE.okul);
      const res = action.type === 'orderPart' ? orderPart(s, action.itemId, action.defectId, action.source)
        : action.type === 'installPart' ? installPart(s, action.itemId, action.defectId, action.quality)
        : treat(s, action.itemId, action.defectId, action.quality);
      if (res === null) return same();
      if (typeof res === 'string') return same(BLOCK_MESSAGE[res]);
      return to(counts ? { ...res, used: res.used + 1 } : res);
    }
    case 'keepPet':
    case 'adoptCat':
    case 'feedPets':
    case 'scrap': {
      const res = action.type === 'keepPet' ? keepPet(s, action.itemId)
        : action.type === 'adoptCat' ? adoptCat(s)
        : action.type === 'feedPets' ? feedPets(s)
        : day ? scrap(s, action.itemId) : null;
      if (res === null) return same();
      if (typeof res === 'string') return same(BLOCK_MESSAGE[res]);
      return to(res);
    }
    case 'failExam':
      return s.pendingTransition === null ? same() : to(failExam(s), 'Sınavı geçemedin. Haftaya tekrar girebilirsin.');
    case 'chooseCareer': {
      const next = chooseCareer(s, action.id);
      return next ? to(next) : same();
    }
    case 'learnTalent': {
      const next = learnTalent(s, action.id);
      return next ? to(next) : same();
    }
    case 'storyChoice': {
      const next = applyStoryChoice(s, action.index);
      return next ? to(next) : same();
    }
    case 'winAuction': {
      const listing = s.listings.find((l) => l.id === action.listingId);
      if (!day || !listing || listing.special !== 'mezat' || listing.auctionMax === undefined) return same();
      if (!validAmount(action.price) || rivalsWillRaise(listing, action.price)) return same();
      const price = Math.round(action.price);
      if (actionsLeft(s) <= 0) return same(BLOCK_MESSAGE.okul);
      const block = canBuy(s, price);
      if (block) return same(BLOCK_MESSAGE[block]);
      return to(unlockAchievement(buy(s, listing, price), 'mezatci'));
    }
    case 'auctionLost':
      if (!s.listings.some((l) => l.id === action.listingId)) return same();
      return to({ ...s, listings: s.listings.filter((l) => l.id !== action.listingId) });
    case 'openBranch': {
      const res = openBranch(s);
      if (res === null) return same();
      if (typeof res === 'string') return same(BLOCK_MESSAGE[res]);
      return to(res);
    }
  }
}

export function gameReducer(view: GameView, action: Action): GameView {
  const next = step(view, action);
  if (next.state === view.state) return next;
  return { ...next, state: checkAchievements(checkProgress(next.state)) };
}
