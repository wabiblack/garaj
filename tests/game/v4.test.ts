import { makeItem, makeListing, makeState } from '../helpers';
import { EXPERT_DISCOUNT, adjustListing, expertLevel } from '../../src/game/expertise';
import { newGame, HARD_START_MONEY } from '../../src/game/newGame';
import { buyerCount, generateOffers, CIRAK_BUYER } from '../../src/game/selling';
import { hire } from '../../src/game/growth';
import { createRng } from '../../src/game/rng';
import { marketValue } from '../../src/game/pricing';
import { startNextDay, SEASON_NOTE } from '../../src/game/day';
import { recordSale } from '../../src/game/career';
import { nextStreak, streakBonus } from '../../src/game/streak';
import { gameReducer } from '../../src/game/reducer';
import { importSave, exportSave } from '../../src/game/save';
import type { GameState } from '../../src/game/types';

const sales = (n: number) => ({ ...makeState().stats, categorySales: { ...makeState().stats.categorySales, bisiklet: n } });

test('uzmanlık her 5 satışta bir artar, en çok 3', () => {
  expect(expertLevel({ stats: sales(4) }, 'bisiklet')).toBe(0);
  expect(expertLevel({ stats: sales(5) }, 'bisiklet')).toBe(1);
  expect(expertLevel({ stats: sales(40) }, 'bisiklet')).toBe(3);
  expect(expertLevel({ stats: sales(40) }, 'konsol')).toBe(0);
});

test('uzman olunan türde satıcı daha aşağı iner; zor modda daha sert', () => {
  const l = makeListing({ minPrice: 1000, askPrice: 2400 });
  expect(adjustListing(l, { stats: sales(10) }).minPrice).toBe(1000 * (1 - 2 * EXPERT_DISCOUNT));
  expect(adjustListing(l, { hard: true }).minPrice).toBe(1100);
  expect(adjustListing(makeListing({ special: 'mezat', minPrice: 1000 }), { hard: true }).minPrice).toBe(1000);
});

test('zor mod: az parayla başlar, başarımlar korunur, alıcı bir eksik', () => {
  const g = newGame(7, { hard: true, achievements: ['ilk-satis'] });
  expect(g).toMatchObject({ hard: true, money: HARD_START_MONEY, achievements: ['ilk-satis'] });
  expect(buyerCount(makeState({ hard: true, reputation: 90 }))).toBe(buyerCount(makeState({ reputation: 90 })) - 1);
});

test('reducer newGame hard: başarımlar devreder', () => {
  const v = gameReducer({ state: makeState({ achievements: ['sampiyon'] }), message: null, lastOffer: null }, { type: 'newGame', seed: 3, hard: true });
  expect(v.state.hard).toBe(true);
  expect(v.state.achievements).toContain('sampiyon');
});

test('çırak motor işinde alınır, çocukken alınamaz', () => {
  expect(hire(makeState({ stage: 1 }), 'cirak')).toBe('asama-2-degil');
  const s = hire(makeState({ stage: 2, money: 10000 }), 'cirak') as GameState;
  expect(s.employees.cirak).toBe(true);
  expect(hire(makeState({ stage: 2, money: 10000 }), 'usta')).toBe('asama-3-degil');
});

test('çırak teklif gelmeyen mala piyasanın %90’ı kadar müşteri bulur', () => {
  const item = makeItem({ id: 'a', baseValue: 2000 });
  // Fiyat çok yüksek: normal alıcı gelmez.
  const s = makeState({ inventory: [item], forSale: [{ itemId: 'a', price: 99999, disclosed: false }], employees: { usta: false, boyaci: false, satis: false, cirak: true } });
  const offers = generateOffers(s, createRng(1));
  expect(offers).toHaveLength(1);
  expect(offers[0]).toMatchObject({ buyerName: CIRAK_BUYER, amount: 1800 });
  expect(generateOffers({ ...s, employees: { ...s.employees, cirak: false } }, createRng(1))).toHaveLength(0);
});

test('mevsim: bisiklet yazın pahalı, kışın ucuz; mevsim değişince not düşer', () => {
  const b = makeItem();
  expect(marketValue(b, 'yaz')).toBeGreaterThan(marketValue(b, 'ilkbahar'));
  expect(marketValue(b, 'kis')).toBeLessThan(marketValue(b, 'ilkbahar'));
  const next = startNextDay(makeState({ day: 10, phase: 'evening', season: 'ilkbahar' }));
  expect(next.season).toBe('yaz');
  expect(next.summary.notes).toContain(SEASON_NOTE.yaz);
});

test('satış fiyat geçmişine ve tür sayısına işlenir', () => {
  const item = makeItem({ boughtFor: 1000 });
  let s = recordSale(makeState({ day: 4 }), item, 2300, false);
  expect(s.prices['Serçe Şehir 26']).toEqual([{ day: 4, price: 2300 }]);
  expect(s.stats.categorySales.bisiklet).toBe(1);
  for (let i = 0; i < 6; i++) s = recordSale(s, item, 2000 + i, false);
  expect(s.prices['Serçe Şehir 26']).toHaveLength(5);
});

test('günlük seri: ardışık gün artar, gün atlanınca sıfırlanır', () => {
  expect(nextStreak(null, '2026-11-24')).toEqual({ streak: { last: '2026-11-24', count: 1 }, fresh: true });
  expect(nextStreak({ last: '2026-11-30', count: 2 }, '2026-12-01').streak.count).toBe(3);
  expect(nextStreak({ last: '2026-11-22', count: 4 }, '2026-11-24').streak.count).toBe(1);
  expect(nextStreak({ last: '2026-11-24', count: 4 }, '2026-11-24').fresh).toBe(false);
  expect(streakBonus(1, 1)).toBe(0);
  expect(streakBonus(1, 2)).toBe(400);
  expect(streakBonus(1, 9)).toBe(1000);
});

test('reducer streakBonus parayı ekler', () => {
  const v = gameReducer({ state: makeState({ money: 100 }), message: null, lastOffer: null }, { type: 'streakBonus', days: 3 });
  expect(v.state.money).toBe(700);
  expect(v.message).toMatch(/3 gün/);
});

test('yeni alanları olmayan eski sürüm 3 kaydı doldurulur', () => {
  const old = makeState() as Partial<GameState>;
  delete old.hard;
  delete old.prices;
  const loaded = importSave(exportSave({ ...old, employees: { usta: true, boyaci: false, satis: false }, stats: { ...makeState().stats, categorySales: undefined } } as unknown as GameState))!;
  expect(loaded).toMatchObject({ hard: false, prices: {}, employees: { usta: true, cirak: false } });
  expect(loaded.stats.categorySales.araba).toBe(0);
});

test('tamir: ibre yeşilin kenarına değiyorsa paylı isabet sayılır', async () => {
  const { isHit, HIT_ZONE, HIT_GRACE } = await import('../../src/game/prep');
  expect(isHit(HIT_ZONE[0] - 0.02)).toBe(false);
  expect(isHit(HIT_ZONE[0] - 0.02, HIT_GRACE)).toBe(true);
  expect(isHit(HIT_ZONE[1] + 0.05, HIT_GRACE)).toBe(false);
});
