import { OFFER_LO, OFFER_HI, buyerCount, generateOffers, counterOffer, settleSale } from '../../src/game/selling';
import { createRng } from '../../src/game/rng';
import { makeItem, makeState } from '../helpers';

const emp = (o: Partial<{ usta: boolean; boyaci: boolean; satis: boolean }>) => ({ usta: false, boyaci: false, satis: false, ...o });

test('buyerCount', () => {
  expect(buyerCount(makeState())).toBe(2);
  expect(buyerCount(makeState({ reputation: 61, locationLevel: 2, employees: emp({ satis: true }) }))).toBe(6);
});

describe('generateOffers', () => {
  test('piyasa değerinde fiyatlanan eşyaya en az bir teklif gelir (tohum sabit)', () => {
    const item = makeItem({ baseValue: 2000, condition: 100 });
    const s = makeState({ reputation: 80, locationLevel: 2, inventory: [item], forSale: [{ itemId: item.id, price: 2000, disclosed: false }] });
    const offers = generateOffers(s, createRng(1));
    expect(offers.length).toBeGreaterThan(0);
    for (const o of offers) {
      expect(o.itemId).toBe(item.id);
      expect(o.amount).toBeGreaterThanOrEqual(2000 * OFFER_LO * 1.06 - 10);
      expect(o.amount).toBeLessThanOrEqual(2000 * OFFER_HI * 1.06 + 10);
      expect(o.buyerName).toBeTruthy();
    }
  });
  test('çok pahalı eşyaya nadiren teklif gelir', () => {
    const item = makeItem({ baseValue: 2000, condition: 100 });
    const s = makeState({ inventory: [item], forSale: [{ itemId: item.id, price: 10000, disclosed: false }] });
    const r = createRng(5);
    let total = 0;
    for (let i = 0; i < 200; i++) total += generateOffers(s, r).length;
    expect(total).toBeLessThan(25);
  });
  test('klasik eşyaya %15 fazla teklif', () => {
    const item = makeItem({ baseValue: 2000, condition: 100, tags: ['klasik'] });
    const s = makeState({ inventory: [item], forSale: [{ itemId: item.id, price: 2000, disclosed: false }] });
    const r = createRng(8);
    const all = Array.from({ length: 50 }, () => generateOffers(s, r)).flat();
    expect(all.length).toBeGreaterThan(0);
    for (const o of all) expect(o.amount).toBeGreaterThanOrEqual(2000 * OFFER_LO * 1.15 - 10);
  });
});

describe('counterOffer', () => {
  const offer = { id: 'o', itemId: 'i', amount: 1000, buyerName: 'Ali' };
  test('%5e kadar kabul', () => expect(counterOffer(offer, 1050, createRng(1))).toEqual({ kind: 'accepted', amount: 1050 }));
  test('%12 üstü ayrılır', () => expect(counterOffer(offer, 1130, createRng(1))).toEqual({ kind: 'left' }));
  test('arada yarı yarıya', () => {
    const r = createRng(3);
    const res = Array.from({ length: 200 }, () => counterOffer(offer, 1100, r).kind);
    const acc = res.filter((k) => k === 'accepted').length;
    expect(acc).toBeGreaterThan(70);
    expect(acc).toBeLessThan(130);
  });
});

describe('settleSale', () => {
  const sold = (itemOver = {}, disclosed = false, rep = 50) => {
    const item = makeItem(itemOver);
    const s = makeState({
      reputation: rep, money: 100, inventory: [item, makeItem({ id: 'other' })],
      forSale: [{ itemId: item.id, price: 2000, disclosed }],
      offers: [{ id: 'a', itemId: item.id, amount: 1900, buyerName: 'A' }, { id: 'b', itemId: 'other', amount: 5, buyerName: 'B' }],
    });
    return settleSale(s, item.id, 1900, createRng(1));
  };
  test('para artar, eşya ve teklifleri temizlenir, özet güncellenir', () => {
    const s = sold();
    expect(s.money).toBe(2000);
    expect(s.inventory.map((i) => i.id)).toEqual(['other']);
    expect(s.forSale).toEqual([]);
    expect(s.offers.map((o) => o.id)).toEqual(['b']);
    expect(s.summary.sold).toBe(1);
    expect(s.summary.earned).toBe(1900);
  });
  test('kusursuz satış itibar +1, belirtilmiş kusurlu +2, 100ü geçmez', () => {
    expect(sold().reputation).toBe(51);
    const defect = { id: 'd', name: 'Fren', repairCost: 1, valueHit: 0.1, known: true };
    expect(sold({ defects: [defect] }, true).reputation).toBe(52);
    expect(sold({}, false, 100).reputation).toBe(100);
  });
  test('gizlenen kusur yaklaşık %40 ihtimalle pendingCatch e düşer', () => {
    const defect = { id: 'd', name: 'Fren', repairCost: 1, valueHit: 0.1, known: false };
    const r = createRng(12);
    let caught = 0;
    for (let i = 0; i < 300; i++) {
      const item = makeItem({ defects: [defect] });
      const s = settleSale(makeState({ inventory: [item], forSale: [{ itemId: item.id, price: 1, disclosed: false }] }), item.id, 1, r);
      expect(s.reputation).toBe(50);
      caught += s.pendingCatch.length;
    }
    expect(caught).toBeGreaterThan(90);
    expect(caught).toBeLessThan(150);
  });
  test('olmayan eşya için durum değişmez', () => {
    const s = makeState();
    expect(settleSale(s, 'yok', 100, createRng(1))).toBe(s);
  });
});
