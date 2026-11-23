import { gameReducer, type GameView } from '../../src/game/reducer';
import { isBankrupt } from '../../src/game/progression';
import { makeItem, makeListing, makeState } from '../helpers';
import type { GameState } from '../../src/game/types';

const view = (over: Partial<GameState> = {}): GameView => ({ state: makeState(over), message: null, lastOffer: null });

describe('offer', () => {
  test('kabulde para düşer, eşya boughtFor ile envantere girer, ilan silinir', () => {
    const v = gameReducer(view({ listings: [makeListing()] }), { type: 'offer', listingId: 'l-1', amount: 1900 });
    expect(v.state.money).toBe(100);
    expect(v.state.inventory[0]).toMatchObject({ id: 'it-1', boughtFor: 1900 });
    expect(v.state.listings).toEqual([]);
    expect(v.state.summary).toMatchObject({ bought: 1, spent: 1900 });
    expect(v.lastOffer).toEqual({ kind: 'accepted', price: 1900 });
  });
  test('para yetmezse reddedilir', () => {
    const start = view({ money: 1000, listings: [makeListing()] });
    const v = gameReducer(start, { type: 'offer', listingId: 'l-1', amount: 1900 });
    expect(v.state).toBe(start.state);
    expect(v.message).toBe('Paran yetmiyor');
  });
  test('depo doluysa reddedilir', () => {
    const v = gameReducer(view({ money: 1e6, listings: [makeListing()], inventory: [makeItem({ id: 'a' }), makeItem({ id: 'b' }), makeItem({ id: 'c' })] }), { type: 'offer', listingId: 'l-1', amount: 1900 });
    expect(v.message).toBe('Depon dolu');
    expect(v.state.inventory).toHaveLength(3);
  });
  test('karşı teklifte ilan güncellenir; vazgeçince silinir', () => {
    const v = gameReducer(view({ listings: [makeListing()] }), { type: 'offer', listingId: 'l-1', amount: 1600 });
    expect(v.state.listings[0].askPrice).toBe(2000);
    expect(v.lastOffer).toMatchObject({ kind: 'counter' });
    const w = gameReducer(view({ listings: [makeListing({ patience: 1 })] }), { type: 'offer', listingId: 'l-1', amount: 1600 });
    expect(w.state.listings).toEqual([]);
    expect(w.lastOffer).toEqual({ kind: 'walked' });
  });
  test('geçersiz tutar reddedilir', () => {
    const start = view({ listings: [makeListing()] });
    expect(gameReducer(start, { type: 'offer', listingId: 'l-1', amount: -5 }).state).toBe(start.state);
    expect(gameReducer(start, { type: 'offer', listingId: 'l-1', amount: NaN }).state).toBe(start.state);
  });
});

describe('çift dokunma ve olmayan hedefler', () => {
  test('aynı teklif iki kez kabul edilince para bir kez artar', () => {
    const item = makeItem();
    const start = view({ phase: 'evening', money: 0, inventory: [item], forSale: [{ itemId: item.id, price: 2000, disclosed: false }], offers: [{ id: 'o1', itemId: item.id, amount: 2000, buyerName: 'Ali' }] });
    const a = gameReducer(start, { type: 'acceptOffer', offerId: 'o1' });
    const b = gameReducer(a, { type: 'acceptOffer', offerId: 'o1' });
    expect(a.state.money).toBe(2000);
    expect(b.state).toBe(a.state);
  });
  test('aynı ilan iki kez alınamaz', () => {
    const a = gameReducer(view({ money: 1e5, listings: [makeListing()] }), { type: 'offer', listingId: 'l-1', amount: 1900 });
    const b = gameReducer(a, { type: 'offer', listingId: 'l-1', amount: 1900 });
    expect(b.state).toBe(a.state);
  });
  test('olmayan id ile eylemler durumu değiştirmez', () => {
    const start = view();
    for (const a of [
      { type: 'inspect', listingId: 'x' }, { type: 'repair', itemId: 'x', defectId: 'y' }, { type: 'clean', itemId: 'x' },
      { type: 'listForSale', itemId: 'x', price: 5, disclosed: false }, { type: 'unlist', itemId: 'x' },
      { type: 'acceptOffer', offerId: 'x' }, { type: 'counterOffer', offerId: 'x', amount: 5 }, { type: 'rejectOffer', offerId: 'x' },
    ] as const) expect(gameReducer(start, a).state).toBe(start.state);
  });
});

test('50.000 TLyi geçen satış geçişi tetikler', () => {
  const item = makeItem();
  const v = gameReducer(view({ phase: 'evening', money: 49000, inventory: [item], offers: [{ id: 'o', itemId: item.id, amount: 2000, buyerName: 'A' }] }), { type: 'acceptOffer', offerId: 'o' });
  expect(v.state.pendingTransition).toBe(2);
});

test('akşam alım ve hazırlık reddedilir', () => {
  const start = view({ phase: 'evening', listings: [makeListing()], inventory: [makeItem({ id: 'z' })] });
  expect(gameReducer(start, { type: 'offer', listingId: 'l-1', amount: 1900 }).state).toBe(start.state);
  expect(gameReducer(start, { type: 'clean', itemId: 'z' }).state).toBe(start.state);
});

describe('hazırlık', () => {
  const defect = { id: 'd', name: 'Fren', repairCost: 1000, valueHit: 0.2, known: true };
  test('aşama ≥2 tamir beceriyi +2 artırır, aşama 1 artırmaz', () => {
    const it = makeItem({ defects: [defect] });
    expect(gameReducer(view({ stage: 2, money: 1e5, inventory: [it] }), { type: 'repair', itemId: it.id, defectId: 'd' }).state.skill).toBe(2);
    expect(gameReducer(view({ stage: 1, money: 1e5, inventory: [it] }), { type: 'repair', itemId: it.id, defectId: 'd' }).state.skill).toBe(0);
  });
  test('para yetmezse hazırlık yapılmaz', () => {
    const it = makeItem({ defects: [defect] });
    const v = gameReducer(view({ money: 10, inventory: [it] }), { type: 'repair', itemId: it.id, defectId: 'd' });
    expect(v.state.inventory[0].defects).toHaveLength(1);
    expect(v.message).toBe('Paran yetmiyor');
  });
  test('temizlik parayı düşer', () => {
    const it = makeItem({ baseValue: 2000 });
    const v = gameReducer(view({ inventory: [it] }), { type: 'clean', itemId: it.id });
    expect(v.state.money).toBe(1960);
    expect(v.state.summary.spent).toBe(40);
  });
});

describe('satış listesi', () => {
  test('listForSale ekler veya günceller, unlist çıkarır', () => {
    const it = makeItem();
    const a = gameReducer(view({ inventory: [it] }), { type: 'listForSale', itemId: it.id, price: 2500, disclosed: true });
    expect(a.state.forSale).toEqual([{ itemId: it.id, price: 2500, disclosed: true }]);
    const b = gameReducer(a, { type: 'listForSale', itemId: it.id, price: 2400, disclosed: false });
    expect(b.state.forSale).toEqual([{ itemId: it.id, price: 2400, disclosed: false }]);
    expect(gameReducer(b, { type: 'unlist', itemId: it.id }).state.forSale).toEqual([]);
  });
  test('sıfır veya negatif fiyat reddedilir', () => {
    const it = makeItem();
    const s = view({ inventory: [it] });
    expect(gameReducer(s, { type: 'listForSale', itemId: it.id, price: 0, disclosed: false }).state).toBe(s.state);
  });
});

test('karşı teklif ve ret', () => {
  const it = makeItem();
  const base = { phase: 'evening' as const, money: 0, inventory: [it], offers: [{ id: 'o', itemId: it.id, amount: 1000, buyerName: 'Ali' }] };
  expect(gameReducer(view(base), { type: 'counterOffer', offerId: 'o', amount: 1050 }).state.money).toBe(1050);
  const left = gameReducer(view(base), { type: 'counterOffer', offerId: 'o', amount: 5000 });
  expect(left.state.offers).toEqual([]);
  expect(left.message).toBe('Ali vazgeçti');
  expect(gameReducer(view(base), { type: 'rejectOffer', offerId: 'o' }).state.offers).toEqual([]);
});

test('gün akışı ve geçiş eylemleri', () => {
  const a = gameReducer(view(), { type: 'endDay' });
  expect(a.state.phase).toBe('evening');
  expect(gameReducer(a, { type: 'startNextDay' }).state.day).toBe(2);
  const t = gameReducer(view({ money: 60000, pendingTransition: 2 }), { type: 'completeTransition' });
  expect(t.state.stage).toBe(2);
  expect(gameReducer(view({ won: true }), { type: 'dismissWin' }).state.wonSeen).toBe(true);
});

test('büyüme engeli mesaj verir', () => {
  const v = gameReducer(view({ stage: 3, money: 0 }), { type: 'upgradeCapacity' });
  expect(v.message).toBe('Paran yetmiyor');
  expect(gameReducer(view({ stage: 3, money: 1e9 }), { type: 'upgradeCapacity' }).state.capacityLevel).toBe(1);
});

test('yeni oyun', () => {
  const v = gameReducer(view({ money: 5 }), { type: 'newGame', seed: 3 });
  expect(v.state.money).toBe(2000);
});

describe('fix I1: aynı reddedilen teklif tekrar sabır yemez', () => {
  test('aynı tutar ikinci kez gönderilince durum değişmez', () => {
    const a = gameReducer(view({ listings: [makeListing()] }), { type: 'offer', listingId: 'l-1', amount: 800 });
    expect(a.state.listings[0].patience).toBe(1);
    const b = gameReducer(a, { type: 'offer', listingId: 'l-1', amount: 800 });
    expect(b.state).toBe(a.state);
  });
});

describe('fix I3: iflas', () => {
  test('eşyasız, parası en ucuz ilana yetmeyen ve kredi alamayan oyuncu iflas eder', () => {
    expect(isBankrupt(makeState({ stage: 3, money: 1000, loan: { principal: 1e6, dailyRate: 0.01 }, listings: [makeListing({ minPrice: 90000 })] }))).toBe(true);
    expect(isBankrupt(makeState({ stage: 3, money: 1000, loan: null, listings: [makeListing({ minPrice: 90000 })] }))).toBe(false);
    expect(isBankrupt(makeState({ stage: 2, money: 1000, listings: [makeListing({ minPrice: 9000 })] }))).toBe(true);
    expect(isBankrupt(makeState({ stage: 2, money: 1000, inventory: [makeItem()], listings: [makeListing({ minPrice: 9000 })] }))).toBe(false);
    expect(isBankrupt(makeState({ stage: 2, money: 9000, listings: [makeListing({ minPrice: 9000 })] }))).toBe(false);
    expect(isBankrupt(makeState({ stage: 1, money: 2000, listings: [makeListing()] }))).toBe(false);
  });
  test('restartStage aşamanın başlangıç parasıyla devam ettirir, borç ve çalışanlar silinir', () => {
    const v = gameReducer(view({ stage: 3, age: 18, money: 10, day: 40, loan: { principal: 2e6, dailyRate: 0.01 }, employees: { usta: true, boyaci: false, satis: false, cirak: false }, listings: [makeListing({ minPrice: 90000 })] }), { type: 'restartStage' });
    expect(v.state).toMatchObject({ stage: 3, age: 18, money: 500000, loan: null, employees: { usta: false, boyaci: false, satis: false, cirak: false }, day: 40 });
    expect(v.state.listings.every((l) => l.item.category === 'araba')).toBe(true);
  });
  test('iflas değilken restartStage bir şey yapmaz', () => {
    const start = view();
    expect(gameReducer(start, { type: 'restartStage' }).state).toBe(start.state);
  });
});

describe('kariyer entegrasyonu', () => {
  test('teklif kabulü satışı kaydeder ve görev ilerletir', () => {
    const it = makeItem({ boughtFor: 1000 });
    const quest = { id: 'q', kind: 'sat' as const, target: 1, progress: 0, reward: 1000, done: false, title: '1 eşya sat' };
    const v = gameReducer(view({ phase: 'evening', money: 0, inventory: [it], quests: [quest], offers: [{ id: 'o', itemId: it.id, amount: 2000, buyerName: 'A' }] }), { type: 'acceptOffer', offerId: 'o' });
    expect(v.state.money).toBe(3000);
    expect(v.state.stats.sales).toBe(1);
    expect(v.state.achievements).toContain('ilk-satis');
  });
  test('kredi kapatmak borçsuz başarımı verir', () => {
    const v = gameReducer(view({ stage: 3, money: 2e6, loan: { principal: 1e6, dailyRate: 0.01 } }), { type: 'repayLoan' });
    expect(v.state.achievements).toContain('borcsuz');
  });
});
