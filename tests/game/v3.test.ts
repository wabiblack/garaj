import { makeItem, makeListing, makeState } from '../helpers';
import { gameReducer, type GameView } from '../../src/game/reducer';
import { loadGame, SAVE_KEY, exportSave, importSave } from '../../src/game/save';
import { newGame } from '../../src/game/newGame';
import { createRng } from '../../src/game/rng';
import { markRivalTarget } from '../../src/game/rival';
import { orderMatches, orderPrice, updateOrders } from '../../src/game/orders';
import { STORIES, pickStory } from '../../src/game/story';
import { auctionStep, startPrice } from '../../src/game/auction';
import { repairDiscount, isHit } from '../../src/game/prep';
import { checkProgress, completeTransition, STAGE_GOALS } from '../../src/game/progression';
import { BRANCHES, openBranch, applyDailyCosts } from '../../src/game/growth';
import { endDay, startNextDay } from '../../src/game/day';
import { marketValue } from '../../src/game/pricing';
import type { GameState } from '../../src/game/types';

const view = (state: GameState): GameView => ({ state, message: null, lastOffer: null });
const run = (state: GameState, ...actions: Parameters<typeof gameReducer>[1][]) =>
  actions.reduce((v, a) => gameReducer(v, a), view(state));

function memStorage(init: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(init));
  return {
    get length() { return m.size; }, clear: () => m.clear(), getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null, removeItem: (k) => void m.delete(k), setItem: (k, v) => void m.set(k, String(v)),
  };
}

describe('kayıt sürüm 3', () => {
  test('sürüm 2 kaydı sürüm 3e taşınır', () => {
    const g = newGame(4);
    const { orders: _o, story: _s, history: _h, branches: _b, finalSeen: _f, ...v2 } = { ...g, version: 2 } as Record<string, unknown>;
    const res = loadGame(memStorage({ [SAVE_KEY]: JSON.stringify(v2) }));
    expect(res.kind).toBe('ok');
    if (res.kind !== 'ok') return;
    expect(res.state.version).toBe(3);
    expect(res.state.orders).toEqual([]);
    expect(res.state.story).toEqual({ seen: [], pending: null });
    expect(res.state.history).toEqual([]);
    expect(res.state.branches).toBe(0);
    expect(res.state.stats.rivalTaken).toBe(0);
  });
  test('yedek kodu dışa aktarılıp geri yüklenir (Türkçe karakterler dahil)', () => {
    const g = newGame(9);
    expect(importSave(exportSave(g))).toEqual(g);
  });
  test('bozuk yedek kodu null döner', () => {
    expect(importSave('çöp')).toBeNull();
    expect(importSave(btoa('{"version":3}'))).toBeNull();
  });
});

describe('rakip Cevdet', () => {
  test('göz koyduğu ilanı oyuncunun başka ilana hamlesinde kapar', () => {
    const eyed = makeListing({ id: 'l-eye', rivalEye: true });
    const other = makeListing({ id: 'l-2', minPrice: 1800 });
    const v = run(makeState({ listings: [eyed, other], money: 5000 }), { type: 'offer', listingId: 'l-2', amount: 100 });
    expect(v.state.listings.map((l) => l.id)).toEqual(['l-2']);
    expect(v.state.stats.rivalTaken).toBe(1);
    expect(v.message).toMatch(/Cevdet/);
  });
  test('oyuncu göz konan ilana hamle yaparsa kapamaz', () => {
    const eyed = makeListing({ id: 'l-eye', rivalEye: true });
    const v = run(makeState({ listings: [eyed], money: 5000 }), { type: 'offer', listingId: 'l-eye', amount: 1900 });
    expect(v.state.inventory).toHaveLength(1);
    expect(v.state.stats.rivalTaken).toBe(0);
  });
  test('en kârlı ilana göz koyar, en fazla bir ilana', () => {
    const cheap = makeListing({ id: 'a', askPrice: 1000 });
    const pricey = makeListing({ id: 'b', askPrice: 3000 });
    let marked = 0;
    for (let seed = 1; seed < 40; seed++) {
      const out = markRivalTarget([pricey, cheap], 'ilkbahar', createRng(seed));
      const eyed = out.filter((l) => l.rivalEye);
      expect(eyed.length).toBeLessThanOrEqual(1);
      if (eyed.length) { marked++; expect(eyed[0].id).toBe('a'); }
    }
    expect(marked).toBeGreaterThan(5);
  });
});

describe('müşteri siparişi', () => {
  const order = { id: 'or-1', buyerName: 'Derya', category: 'bisiklet' as const, minCondition: 60, bonus: 0.3, daysLeft: 3 };
  test('uyan mal: tür, durum, etiket, bilinen kusur yok', () => {
    expect(orderMatches(order, makeItem({ condition: 70 }))).toBe(true);
    expect(orderMatches(order, makeItem({ condition: 50 }))).toBe(false);
    expect(orderMatches(order, makeItem({ category: 'konsol' }))).toBe(false);
    expect(orderMatches(order, makeItem({ defects: [{ id: 'd', name: 'x', repairCost: 1, valueHit: 0.1, known: true }] }))).toBe(false);
    expect(orderMatches({ ...order, tag: 'nadir' }, makeItem())).toBe(false);
  });
  test('siparişe verince piyasa değerinin %30 fazlasına satılır', () => {
    const item = makeItem({ boughtFor: 1000 });
    const v = run(makeState({ inventory: [item], orders: [order] }), { type: 'fulfillOrder', orderId: 'or-1', itemId: 'it-1' });
    expect(v.state.money).toBe(2000 + orderPrice(order, item, 'ilkbahar'));
    expect(orderPrice(order, item, 'ilkbahar')).toBe(Math.round(marketValue(item, 'ilkbahar') * 1.3 / 10) * 10);
    expect(v.state.orders).toEqual([]);
    expect(v.state.inventory).toEqual([]);
    expect(v.state.achievements).toContain('siparisci');
  });
  test('uymayan mal siparişe verilemez', () => {
    const s = makeState({ inventory: [makeItem({ condition: 10 })], orders: [order] });
    expect(run(s, { type: 'fulfillOrder', orderId: 'or-1', itemId: 'it-1' }).state).toBe(s);
  });
  test('süresi dolan sipariş düşer, en çok 2 sipariş olur', () => {
    const rng = createRng(3);
    const s = makeState({ orders: [{ ...order, daysLeft: 1 }] });
    const out = updateOrders(s, rng);
    expect(out.orders.every((o) => o.id !== 'or-1')).toBe(true);
    expect(out.notes.join()).toMatch(/Derya/);
    let st = makeState();
    for (let i = 0; i < 30; i++) st = { ...st, orders: updateOrders(st, rng).orders };
    expect(st.orders.length).toBeLessThanOrEqual(2);
  });
});

describe('hikâye', () => {
  test('aşamaya uyan görülmemiş sahne seçilir', () => {
    const s = makeState({ stage: 2, story: { seen: [], pending: null } });
    let got = null;
    for (let seed = 1; seed < 30 && !got; seed++) got = pickStory(s, createRng(seed));
    expect(got).not.toBeNull();
    expect(STORIES[got!].stage).toBe(2);
    expect(pickStory({ ...s, story: { seen: ['ehliyet', 'cirak'], pending: null } }, createRng(1))).toBeNull();
  });
  test('seçim etkisi uygulanır, sahne görülmüş olur', () => {
    const s = makeState({ stage: 1, money: 2000, reputation: 50, story: { seen: [], pending: 'kardes' } });
    const choice = STORIES.kardes.choices[0];
    const v = run(s, { type: 'storyChoice', index: 0 });
    expect(v.state.money).toBe(2000 + (choice.money ?? 0));
    expect(v.state.reputation).toBe(50 + (choice.reputation ?? 0));
    expect(v.state.story).toEqual({ seen: ['kardes'], pending: null });
  });
  test('parası yetmeyen seçim yapılamaz', () => {
    const s = makeState({ stage: 1, money: 0, story: { seen: [], pending: 'kardes' } });
    expect(run(s, { type: 'storyChoice', index: 0 }).state).toBe(s);
  });
});

describe('mezat', () => {
  const mezat = makeListing({ id: 'mz', special: 'mezat', askPrice: 1000, minPrice: 1000, auctionMax: 1600 });
  test('mezat ilanına pazarlık teklifi geçmez', () => {
    const s = makeState({ listings: [mezat], money: 5000 });
    expect(run(s, { type: 'offer', listingId: 'mz', amount: 5000 }).state.inventory).toEqual([]);
  });
  test('rakiplerin sınırını geçen teklifle kazanılır', () => {
    const v = run(makeState({ listings: [mezat], money: 5000 }), { type: 'winAuction', listingId: 'mz', price: 1700 });
    expect(v.state.inventory).toHaveLength(1);
    expect(v.state.money).toBe(3300);
    expect(v.state.achievements).toContain('mezatci');
  });
  test('sınırın altında kazanma geçersiz', () => {
    const s = makeState({ listings: [mezat], money: 5000 });
    expect(run(s, { type: 'winAuction', listingId: 'mz', price: 1500 }).state).toBe(s);
  });
  test('kaybedilen mezat ilanı kalkar', () => {
    const v = run(makeState({ listings: [mezat] }), { type: 'auctionLost', listingId: 'mz' });
    expect(v.state.listings).toEqual([]);
  });
  test('başlangıç fiyatı ve artış adımı', () => {
    expect(startPrice(mezat)).toBe(1000);
    expect(auctionStep(mezat)).toBe(100);
  });
});

describe('tamir oyunu', () => {
  test('isabet bölgesi ve indirim', () => {
    expect(isHit(0.5)).toBe(true);
    expect(isHit(0.1)).toBe(false);
    expect(repairDiscount(3)).toBeCloseTo(0.3);
    expect(repairDiscount(0)).toBe(0);
  });
  test('3 isabetle tamir %30 ucuz', () => {
    const d = { id: 'd1', name: 'Zincir', repairCost: 1000, valueHit: 0.1, known: true };
    const s = makeState({ inventory: [makeItem({ defects: [d] })], money: 5000 });
    expect(run(s, { type: 'repair', itemId: 'it-1', defectId: 'd1', quality: 3 }).state.money).toBe(4300);
    expect(run(s, { type: 'repair', itemId: 'it-1', defectId: 'd1' }).state.money).toBe(4000);
    expect(run(s, { type: 'repair', itemId: 'it-1', defectId: 'd1', quality: 9 }).state.money).toBe(4300);
  });
});

describe('4. aşama: holding', () => {
  test('şampiyon galerici 20M olunca holding aşamasına geçer', () => {
    const s = makeState({ stage: 3, won: true, wonSeen: true, money: STAGE_GOALS[3] });
    const p = checkProgress(s);
    expect(p.pendingTransition).toBe(4);
    const t = completeTransition(p);
    expect(t.stage).toBe(4);
    expect(t.age).toBe(25);
    expect(t.locationLevel).toBe(s.locationLevel);
  });
  test('şampiyon olmadan geçmez', () => {
    expect(checkProgress(makeState({ stage: 3, money: STAGE_GOALS[3] })).pendingTransition).toBeNull();
  });
  test('şube açılır, günlük gelir getirir', () => {
    const s = makeState({ stage: 4, money: BRANCHES[0].cost + 10 });
    const o = openBranch(s);
    expect(typeof o).toBe('object');
    if (typeof o !== 'object' || o === null) return;
    expect(o.branches).toBe(1);
    expect(o.money).toBe(10);
    expect(applyDailyCosts(o).money).toBe(10 + BRANCHES[0].income);
    expect(openBranch(makeState({ stage: 3, money: 1e9 }))).toBe('asama-4-degil');
  });
  test('3 şube holding başarımını açar', () => {
    const s = makeState({ stage: 4, branches: 2, money: BRANCHES[2].cost });
    const v = run(s, { type: 'openBranch' });
    expect(v.state.branches).toBe(3);
    expect(v.state.achievements).toContain('holding');
  });
});

describe('para geçmişi', () => {
  test('her gün sonunda para kaydedilir, en çok 60 gün', () => {
    let s = makeState({ money: 1234 });
    s = startNextDay(endDay(s));
    expect(s.history).toEqual([{ day: 1, money: 1234 }]);
    s = { ...s, history: Array.from({ length: 60 }, (_, i) => ({ day: i, money: i })) };
    s = startNextDay(endDay(s));
    expect(s.history).toHaveLength(60);
    expect(s.history[59].day).toBe(2);
  });
});
