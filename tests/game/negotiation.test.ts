import { ASK_MIN, ASK_MAX, MIN_LO, MIN_HI, makeListing as buildListing, respondToOffer, storageLimit, canBuy, inspect, inspectionCost } from '../../src/game/negotiation';
import { marketValue, trueValue } from '../../src/game/pricing';
import { createRng } from '../../src/game/rng';
import { makeItem, makeListing, makeState } from '../helpers';

const defect = (known: boolean, id = 'd1') => ({ id, name: 'Fren tutmuyor', repairCost: 200, valueHit: 0.2, known });

describe('makeListing', () => {
  test('istenen ve en düşük fiyat aralıkta, sabır 3', () => {
    const r = createRng(4);
    for (let i = 0; i < 50; i++) {
      const item = makeItem({ defects: [defect(false)] });
      const l = buildListing(item, 'ilkbahar', r, null);
      const mv = marketValue(item, 'ilkbahar'), tv = trueValue(item, 'ilkbahar');
      expect(l.askPrice).toBeGreaterThanOrEqual(Math.floor(mv * ASK_MIN) - 10);
      expect(l.askPrice).toBeLessThanOrEqual(Math.ceil(mv * ASK_MAX) + 10);
      expect(l.minPrice).toBeGreaterThanOrEqual(Math.floor(tv * MIN_LO) - 10);
      expect(l.minPrice).toBeLessThanOrEqual(Math.ceil(tv * MIN_HI) + 10);
      expect(l.minPrice).toBeLessThanOrEqual(l.askPrice);
      expect(l.patience).toBe(3);
      expect(l.sellerName).toBeTruthy();
    }
  });
  test('mezat: açılış piyasa değerinin %50si, rakip sınırı %65–95', () => {
    const item = makeItem();
    const l = buildListing(item, 'ilkbahar', createRng(1), 'mezat');
    const mv = marketValue(item, 'ilkbahar');
    expect(l.askPrice).toBe(Math.round((mv * 0.5) / 10) * 10);
    expect(l.minPrice).toBe(l.askPrice);
    expect(l.auctionMax!).toBeGreaterThanOrEqual(mv * 0.65 - 10);
    expect(l.auctionMax!).toBeLessThanOrEqual(mv * 0.95 + 10);
  });
});

describe('respondToOffer', () => {
  test('en düşük fiyat veya üstü kabul edilir, teklif edilen fiyattan', () => {
    const { result } = respondToOffer(makeListing(), 1800);
    expect(result).toEqual({ kind: 'accepted', price: 1800 });
  });
  test('düşük teklife karşı teklif, sabır 1 azalır', () => {
    const { result, listing } = respondToOffer(makeListing(), 1600);
    expect(result).toEqual({ kind: 'counter', price: 2000, patienceLeft: 2 });
    expect(listing.askPrice).toBe(2000);
    expect(listing.patience).toBe(2);
  });
  test('karşı teklif en düşük fiyatın altına inmez', () => {
    const { result } = respondToOffer(makeListing({ askPrice: 1900, minPrice: 1800 }), 1500);
    expect(result).toMatchObject({ kind: 'counter', price: 1800 });
  });
  test('en düşüğün yarısının altı hakarettir: sabır 2 azalır', () => {
    const { result } = respondToOffer(makeListing(), 800);
    expect(result).toMatchObject({ kind: 'counter', patienceLeft: 1 });
  });
  test('sabır biterse satıcı vazgeçer', () => {
    expect(respondToOffer(makeListing({ patience: 1 }), 1600).result).toEqual({ kind: 'walked' });
    expect(respondToOffer(makeListing({ patience: 2 }), 500).result).toEqual({ kind: 'walked' });
  });
});

describe('depo ve alım engeli', () => {
  test('storageLimit aşamaya göre', () => {
    expect(storageLimit(makeState({ stage: 1 }))).toBe(3);
    expect(storageLimit(makeState({ stage: 2 }))).toBe(2);
    expect(storageLimit(makeState({ stage: 3, capacityLevel: 0 }))).toBe(1);
    expect(storageLimit(makeState({ stage: 3, capacityLevel: 3 }))).toBe(8);
  });
  test('canBuy', () => {
    expect(canBuy(makeState({ money: 1000 }), 1500)).toBe('yetersiz-para');
    expect(canBuy(makeState({ money: 5000, inventory: [makeItem(), makeItem(), makeItem()] }), 1500)).toBe('depo-dolu');
    expect(canBuy(makeState({ money: 5000 }), 1500)).toBeNull();
  });
});

describe('inspect', () => {
  test('aşama 1: ücretsiz, kusurlar kısmen görünür, ikinci kez değişmez', () => {
    const many = Array.from({ length: 40 }, (_, i) => defect(false, 'd' + i));
    const l = makeListing({ item: makeItem({ defects: many }) });
    const { listing, cost } = inspect(l, 1, createRng(2), 'ilkbahar');
    expect(cost).toBe(0);
    const known = listing.item.defects.filter((d) => d.known).length;
    expect(known).toBeGreaterThan(5);
    expect(known).toBeLessThan(35);
    expect(listing.inspected).toBe(true);
    const again = inspect(listing, 1, createRng(99), 'ilkbahar');
    expect(again.listing).toBe(listing);
    expect(again.cost).toBe(0);
  });
  test('aşama 2+: ekspertiz tüm kusurları gösterir ve ücretli', () => {
    const item = makeItem({ category: 'motor', baseValue: 100000, defects: [defect(false), defect(false, 'd2')] });
    const l = makeListing({ item });
    const { listing, cost } = inspect(l, 2, createRng(2), 'ilkbahar');
    expect(listing.item.defects.every((d) => d.known)).toBe(true);
    expect(cost).toBe(inspectionCost(l, 2, 'ilkbahar'));
    expect(cost).toBe(2000);
    expect(inspectionCost(makeListing(), 2, 'ilkbahar')).toBe(200);
    expect(inspectionCost(makeListing(), 1, 'ilkbahar')).toBe(0);
  });
});

describe('fix M3 ve I1', () => {
  test('istenenden fazla teklif istenen fiyattan kabul edilir', () => {
    expect(respondToOffer(makeListing(), 5000).result).toEqual({ kind: 'accepted', price: 2400 });
  });
  test('karşı teklif sonrası ilan reddedilen tutarı hatırlar', () => {
    expect(respondToOffer(makeListing(), 1600).listing.lastRejected).toBe(1600);
  });
});
