// Borsa: dört uydurma otomotiv şirketi. Fiyatlar bağlı oldukları piyasa endeksiyle birlikte oynar.
// Yalnız reşit olan alıp satabilir; fiyatlar baştan beri işler.
import type { Category, GameState, Market, StockId, Stocks } from './types';
import type { RNG } from './rng';
import { marketIndex } from './market';
import { ADULT_AGE } from './bank';

export const STOCKS: { id: StockId; name: string; sector: string; links: Category[]; base: number; vol: number; beta: number }[] = [
  { id: 'lastik', name: 'Kara Lastik', sector: 'Lastik fabrikası', links: ['motor', 'araba'], base: 120, vol: 0.04, beta: 0.5 },
  { id: 'parca', name: 'Usta Parça', sector: 'Yedek parça üreticisi', links: ['motor', 'araba'], base: 80, vol: 0.05, beta: 0.6 },
  { id: 'galeri', name: 'Yıldız Oto', sector: 'Oto galeri zinciri', links: ['araba'], base: 250, vol: 0.05, beta: 0.8 },
  { id: 'lojistik', name: 'Hızlı Kurye', sector: 'Kurye ve taşımacılık', links: [], base: 50, vol: 0.03, beta: 0 },
];
/** Alım ve satımda ödenen komisyon. */
export const STOCK_FEE = 0.005;
const DRIFT = 0.002;
const STOCK_DAYS = 30;

export type StockBlock = 'resit-degil' | 'yetersiz-para' | 'yetersiz-hisse' | null;

const perStock = <T,>(f: (id: StockId) => T) => Object.fromEntries(STOCKS.map((s) => [s.id, f(s.id)])) as Record<StockId, T>;

export function initialStocks(): Stocks {
  return { prices: perStock((id) => [STOCKS.find((s) => s.id === id)!.base]), owned: perStock(() => 0), cost: perStock(() => 0) };
}

export function fillStocks(st: Partial<Stocks> | undefined): Stocks {
  const base = initialStocks();
  if (!st) return base;
  for (const { id } of STOCKS) {
    if (st.prices?.[id]?.length) base.prices[id] = st.prices[id];
    base.owned[id] = st.owned?.[id] ?? 0;
    base.cost[id] = st.cost?.[id] ?? 0;
  }
  return base;
}

export const stockPrice = (st: Stocks, id: StockId) => st.prices[id][st.prices[id].length - 1];

/** Bir gün: piyasadaki değişime (before → after) göre fiyatlar oynar. */
export function stepStocks(st: Stocks, before: Market, after: Market, rng: RNG): Stocks {
  const prices = perStock((id) => {
    const s = STOCKS.find((x) => x.id === id)!;
    const link = s.links.length
      ? s.links.reduce((sum, c) => sum + marketIndex(after, c) / marketIndex(before, c) - 1, 0) / s.links.length
      : 0;
    const change = s.beta * link + rng.range(-s.vol, s.vol) + DRIFT;
    return [...st.prices[id], Math.max(1, Math.round(stockPrice(st, id) * (1 + change)))].slice(-STOCK_DAYS);
  });
  return { ...st, prices };
}

const fee = (amount: number) => Math.max(1, Math.round(amount * STOCK_FEE));

export function buyStock(s: GameState, id: StockId, shares: number): GameState | StockBlock {
  if (s.age < ADULT_AGE) return 'resit-degil';
  if (!Number.isInteger(shares) || shares <= 0) return null;
  const amount = stockPrice(s.stocks, id) * shares;
  const total = amount + fee(amount);
  if (s.money < total) return 'yetersiz-para';
  const st = s.stocks;
  return {
    ...s, money: s.money - total,
    stocks: { ...st, owned: { ...st.owned, [id]: st.owned[id] + shares }, cost: { ...st.cost, [id]: st.cost[id] + total } },
  };
}

export function sellStock(s: GameState, id: StockId, shares: number): GameState | StockBlock {
  if (!Number.isInteger(shares) || shares <= 0) return null;
  const st = s.stocks;
  if (st.owned[id] < shares) return 'yetersiz-hisse';
  const amount = stockPrice(st, id) * shares;
  const left = st.owned[id] - shares;
  return {
    ...s, money: s.money + amount - fee(amount),
    stocks: { ...st, owned: { ...st.owned, [id]: left }, cost: { ...st.cost, [id]: left === 0 ? 0 : Math.round((st.cost[id] * left) / st.owned[id]) } },
  };
}

/** Elindeki hisselerin bugünkü değeri. */
export function portfolioValue(s: GameState): number {
  return STOCKS.reduce((sum, { id }) => sum + s.stocks.owned[id] * stockPrice(s.stocks, id), 0);
}
