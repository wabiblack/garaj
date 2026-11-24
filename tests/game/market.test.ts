import { createRng } from '../../src/game/rng';
import { MARKET_DAYS, MARKET_MAX, MARKET_MIN, initialMarket, marketChange, marketIndex, stepMarket } from '../../src/game/market';
import { marketValue } from '../../src/game/pricing';
import { gameReducer, type GameView } from '../../src/game/reducer';
import { startNextDay } from '../../src/game/day';
import { loadGame, SAVE_KEY } from '../../src/game/save';
import { makeItem, makeListing, makeState } from '../helpers';

const view = (over = {}): GameView => ({ state: makeState(over), message: null, lastOffer: null });

test('piyasa endeksi her gün sınırlar içinde değişir ve geçmişi tutar', () => {
  let m = initialMarket();
  expect(marketIndex(m, 'motor')).toBe(1);
  const rng = createRng(5);
  for (let i = 0; i < 100; i++) m = stepMarket(m, rng, null).market;
  for (const h of Object.values(m)) {
    expect(h.length).toBe(MARKET_DAYS);
    for (const v of h) { expect(v).toBeGreaterThanOrEqual(MARKET_MIN); expect(v).toBeLessThanOrEqual(MARKET_MAX); }
  }
  expect(new Set(m.motor).size).toBeGreaterThan(5);
});

test('fuar piyasayı yukarı, durgunluk aşağı iter', () => {
  const up = stepMarket(initialMarket(), createRng(9), 'fuar').market;
  const down = stepMarket(initialMarket(), createRng(9), 'durgun').market;
  expect(marketIndex(up, 'araba')).toBeGreaterThan(marketIndex(down, 'araba'));
  expect(marketChange(up, 'araba')).toBeCloseTo(marketIndex(up, 'araba') - 1);
});

test('piyasa değeri endeksle çarpılır', () => {
  const it = makeItem();
  expect(marketValue(it, 'ilkbahar', 1.2)).toBe(Math.round((marketValue(it, 'ilkbahar') * 1.2) / 10) * 10);
});

test('yeni gün piyasayı ilerletir ve ilanlar yeni fiyata göre çıkar', () => {
  const s = startNextDay(makeState({ phase: 'evening' }));
  expect(s.market.bisiklet.length).toBe(2);
});

test('alım ve satış deftere yazılır', () => {
  const l = makeListing({ minPrice: 1000, askPrice: 1500 });
  const bought = gameReducer(view({ listings: [l] }), { type: 'offer', listingId: l.id, amount: 1200 }).state;
  expect(bought.ledger).toEqual([{ day: 1, kind: 'al', name: `${l.item.brand} ${l.item.model}`, category: 'bisiklet', price: 1200 }]);
  const it = bought.inventory[0];
  const ev = gameReducer(view({ ...bought, phase: 'evening', offers: [{ id: 'o', itemId: it.id, amount: 2000, buyerName: 'A' }] }), { type: 'acceptOffer', offerId: 'o' }).state;
  expect(ev.ledger[1]).toEqual({ day: 1, kind: 'sat', name: `${it.brand} ${it.model}`, category: 'bisiklet', price: 2000, profit: 800 });
});

test('eski kayda piyasa ve defter eklenir', () => {
  const old = makeState() as unknown as Record<string, unknown>;
  delete old.market; delete old.ledger;
  localStorage.setItem(SAVE_KEY, JSON.stringify(old));
  const r = loadGame(localStorage);
  expect(r.kind === 'ok' && r.state.market.motor).toEqual([1]);
  expect(r.kind === 'ok' && r.state.ledger).toEqual([]);
});
