import { newGame } from '../../src/game/newGame';
import { generateListings, endDay, startNextDay } from '../../src/game/day';
import { CATEGORIES_BY_STAGE } from '../../src/game/catalog';
import { createRng } from '../../src/game/rng';
import { makeItem, makeState } from '../helpers';

test('newGame başlangıç değerleri', () => {
  const s = newGame(123);
  expect(s).toMatchObject({ age: 12, money: 2000, stage: 1, day: 1, phase: 'day', reputation: 50, skill: 0, season: 'ilkbahar' });
  expect(s.listings.length).toBeGreaterThanOrEqual(4);
  expect(s.listings.length).toBeLessThanOrEqual(6);
  for (const l of s.listings) expect(CATEGORIES_BY_STAGE[1]).toContain(l.item.category);
  expect(newGame(123)).toEqual(s);
});

describe('generateListings', () => {
  test('aşamanın kategorilerinden 4–6 ilan', () => {
    const r = createRng(2);
    for (let i = 0; i < 20; i++) {
      const ls = generateListings(makeState({ stage: 2 }), r);
      const normal = ls.filter((l) => l.special === null);
      expect(normal.length).toBeGreaterThanOrEqual(4);
      expect(normal.length).toBeLessThanOrEqual(6);
      for (const l of ls) expect(l.item.category).toBe('motor');
      expect(ls.every((l) => l.special === null || l.special === 'mezat')).toBe(true);
    }
  });
  test('aşama 3te yaklaşık %20 ihtimalle bir özel ilan eklenir', () => {
    const r = createRng(3);
    let special = 0;
    for (let i = 0; i < 300; i++) {
      const ls = generateListings(makeState({ stage: 3 }), r);
      const sp = ls.filter((l) => l.special !== null);
      expect(sp.length).toBeLessThanOrEqual(1);
      expect(ls.length - sp.length).toBeGreaterThanOrEqual(4);
      special += sp.length;
    }
    expect(special).toBeGreaterThan(35);
    expect(special).toBeLessThan(85);
  });
});

describe('endDay', () => {
  test('akşama geçer ve teklif üretir; akşamken değişmez', () => {
    const item = makeItem({ baseValue: 2000, condition: 100 });
    const s = makeState({ reputation: 90, locationLevel: 2, inventory: [item], forSale: [{ itemId: item.id, price: 1500, disclosed: false }] });
    const e = endDay(s);
    expect(e.phase).toBe('evening');
    expect(e.offers.length).toBeGreaterThan(0);
    expect(e.rngState).not.toBe(s.rngState);
    expect(endDay(e)).toBe(e);
  });
});

describe('startNextDay', () => {
  const evening = (over = {}) => makeState({ phase: 'evening', day: 10, ...over });
  test('gün ilerler, sezon değişir, teklifler silinir, ilanlar yenilenir, bakım sıfırlanır', () => {
    const s = evening({
      offers: [{ id: 'o', itemId: 'x', amount: 1, buyerName: 'A' }],
      inventory: [makeItem({ category: 'guvercin', caredToday: true })],
      summary: { day: 10, bought: 2, sold: 1, spent: 5, earned: 9, notes: ['eski'] },
    });
    const n = startNextDay(s);
    expect(n).toMatchObject({ day: 11, phase: 'day', season: 'yaz', offers: [] });
    expect(n.listings.length).toBeGreaterThanOrEqual(4);
    expect(n.inventory[0].caredToday).toBe(false);
    expect(n.summary).toMatchObject({ day: 11, bought: 0, sold: 0, spent: 0, earned: 0 });
    expect(n.summary.notes).not.toContain('eski');
  });
  test('gizlenen kusur yakalanınca itibar −15 ve not', () => {
    const n = startNextDay(evening({ reputation: 50, pendingCatch: [{ itemName: 'Serçe Şehir 26' }, { itemName: 'Kanat BMX' }] }));
    expect(n.reputation).toBe(20);
    expect(n.pendingCatch).toEqual([]);
    expect(n.summary.notes).toContain('Serçe Şehir 26 satışında gizlenen kusur ortaya çıktı');
  });
  test('itibar 0ın altına inmez', () => {
    expect(startNextDay(evening({ reputation: 5, pendingCatch: [{ itemName: 'X' }] })).reputation).toBe(0);
  });
  test('gündüz çağrılırsa değişmez', () => {
    const s = makeState();
    expect(startNextDay(s)).toBe(s);
  });
});

test('fix M5: bilmeden satılan kusur −5, bilerek saklanan −15', () => {
  const s = startNextDay(makeState({ phase: 'evening', reputation: 50, pendingCatch: [{ itemName: 'A', knowing: false }, { itemName: 'B', knowing: true }] }));
  expect(s.reputation).toBe(30);
  expect(s.summary.notes).toContain('A alıcısı fark etmediğin bir kusur buldu');
  expect(s.summary.notes).toContain('B satışında gizlenen kusur ortaya çıktı');
});
