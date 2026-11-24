import { STOCKS, STOCK_FEE, buyStock, initialStocks, portfolioValue, sellStock, stepStocks } from '../../src/game/stocks';
import { initialMarket } from '../../src/game/market';
import { createRng } from '../../src/game/rng';
import { gameReducer, type GameView } from '../../src/game/reducer';
import { startNextDay } from '../../src/game/day';
import { loadGame, SAVE_KEY } from '../../src/game/save';
import type { GameState } from '../../src/game/types';
import { makeState } from '../helpers';

const adult = (over: Partial<GameState> = {}) => makeState({ stage: 3, age: 18, money: 100_000, ...over });
const ok = (x: GameState | string | null): GameState => { if (typeof x !== 'object' || x === null) throw new Error(String(x)); return x; };
const price = (s: GameState, id: keyof GameState['stocks']['owned']) => s.stocks.prices[id].at(-1)!;

test('dört kurgusal şirket, fiyatlar her gün oynar ama sıfırın altına düşmez', () => {
  expect(STOCKS.map((s) => s.id)).toEqual(['lastik', 'parca', 'galeri', 'lojistik']);
  let st = initialStocks();
  const rng = createRng(4);
  for (let i = 0; i < 200; i++) st = stepStocks(st, initialMarket(), initialMarket(), rng);
  for (const s of STOCKS) {
    expect(st.prices[s.id].length).toBe(30);
    expect(Math.min(...st.prices[s.id])).toBeGreaterThan(0);
  }
});

test('piyasa yükselince bağlı şirket de yükselme eğiliminde', () => {
  const before = initialMarket();
  const after = { ...initialMarket(), araba: [1, 1.3] };
  let up = 0;
  for (let seed = 1; seed <= 50; seed++) {
    const st = stepStocks(initialStocks(), before, after, createRng(seed));
    if (st.prices.galeri.at(-1)! > st.prices.galeri[0]) up++;
  }
  expect(up).toBeGreaterThan(40);
});

test('hisse al, sat: komisyon düşülür, maliyet izlenir', () => {
  const s0 = adult();
  const p = price(s0, 'galeri');
  const a = ok(buyStock(s0, 'galeri', 10));
  const fee = Math.max(1, Math.round(p * 10 * STOCK_FEE));
  expect(a.money).toBe(s0.money - p * 10 - fee);
  expect(a.stocks.owned.galeri).toBe(10);
  expect(a.stocks.cost.galeri).toBe(p * 10 + fee);
  expect(portfolioValue(a)).toBe(p * 10);
  const b = ok(sellStock(a, 'galeri', 4));
  expect(b.stocks.owned.galeri).toBe(6);
  expect(b.money).toBe(a.money + p * 4 - Math.max(1, Math.round(p * 4 * STOCK_FEE)));
  expect(b.stocks.cost.galeri).toBe(Math.round(a.stocks.cost.galeri * 0.6));
  expect(sellStock(b, 'galeri', 7)).toBe('yetersiz-hisse');
  expect(buyStock(adult({ money: 10 }), 'galeri', 10)).toBe('yetersiz-para');
});

test('borsa reşit olmayana kapalı', () => {
  expect(buyStock(makeState({ money: 1e6 }), 'lastik', 1)).toBe('resit-degil');
});

test('reducer ve yeni gün', () => {
  const v: GameView = { state: adult(), message: null, lastOffer: null };
  expect(gameReducer(v, { type: 'buyStock', id: 'lastik', shares: 5 }).state.stocks.owned.lastik).toBe(5);
  const next = startNextDay(adult({ phase: 'evening' }));
  expect(next.stocks.prices.lastik.length).toBe(2);
});

test('eski kayda borsa eklenir', () => {
  const old = makeState() as unknown as Record<string, unknown>;
  delete old.stocks;
  localStorage.setItem(SAVE_KEY, JSON.stringify(old));
  const r = loadGame(localStorage);
  expect(r.kind === 'ok' && r.state.stocks).toEqual(initialStocks());
});
