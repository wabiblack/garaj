import { makeListing as buildListing, respondToOffer } from '../../src/game/negotiation';
import { generateListings, startNextDay } from '../../src/game/day';
import { generateQuests, recordSale, recordPurchase, checkAchievements, ACHIEVEMENTS, QUEST_REWARD } from '../../src/game/career';
import { buyerCount } from '../../src/game/selling';
import { generateItem } from '../../src/game/catalog';
import { createRng } from '../../src/game/rng';
import { marketValue } from '../../src/game/pricing';
import { makeItem, makeListing, makeState } from '../helpers';

describe('satıcı kişilikleri', () => {
  test('aceleci: sabır 2, en düşük fiyat normale göre %15 düşük', () => {
    const item = makeItem();
    const a = buildListing(item, 'ilkbahar', createRng(1), null, 'acele');
    const n = buildListing(item, 'ilkbahar', createRng(1), null, 'normal');
    expect(a.patience).toBe(2);
    expect(a.minPrice).toBe(Math.round((n.minPrice * 0.85) / 10) * 10);
    expect(a.personality).toBe('acele');
  });
  test('inatçı: sabır 4, karşı teklif yavaş iner', () => {
    const l = buildListing(makeItem(), 'ilkbahar', createRng(1), null, 'inatci');
    expect(l.patience).toBe(4);
    const { result } = respondToOffer({ ...l, askPrice: 2400, minPrice: 1800 }, 1600);
    expect(result).toMatchObject({ kind: 'counter', price: 2200 });
  });
  test('kurnaz: istenen fiyat %10 yüksek', () => {
    const item = makeItem();
    const k = buildListing(item, 'ilkbahar', createRng(1), null, 'kurnaz');
    const n = buildListing(item, 'ilkbahar', createRng(1), null, 'normal');
    expect(k.askPrice).toBe(Math.round((n.askPrice * 1.1) / 10) * 10);
  });
  test('kurnaz satıcının ilanında en az bir gizli kusur vardır; kişilik dağılımı karışık', () => {
    const r = createRng(5);
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      for (const l of generateListings(makeState(), r)) {
        seen.add(l.personality);
        if (l.personality === 'kurnaz') expect(l.item.defects.some((d) => !d.known)).toBe(true);
      }
    }
    expect([...seen].sort()).toEqual(['acele', 'inatci', 'kurnaz', 'normal']);
  });
});

describe('olaylar', () => {
  test('fuar alıcı sayısını 2 artırır, durgunluk 1 azaltır (en az 1)', () => {
    expect(buyerCount(makeState({ event: 'fuar' }))).toBe(4);
    expect(buyerCount(makeState({ event: 'durgun' }))).toBe(1);
  });
  test('yeni günde yaklaşık %30 olay çıkar ve not düşülür; hediye para verir, ceza eksiye düşürmez', () => {
    let events = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const s = startNextDay(makeState({ phase: 'evening', rngState: seed, money: 100 }));
      if (s.event) {
        events++;
        expect(s.summary.notes.length).toBeGreaterThan(0);
        if (s.event === 'hediye') expect(s.money).toBe(100 + 500);
        if (s.event === 'ceza') expect(s.money).toBe(0);
      }
    }
    expect(events).toBeGreaterThan(60);
    expect(events).toBeLessThan(120);
  });
});

describe('koleksiyon', () => {
  test('nadir etiketi aşama-1 eşyalarında da çıkar', () => {
    const r = createRng(2);
    let rare = 0;
    for (let i = 0; i < 1000; i++) if (generateItem('telefon', r).tags.includes('nadir')) rare++;
    expect(rare).toBeGreaterThan(15);
    expect(rare).toBeLessThan(80);
  });
  test('nadir ve klasik eşyanın değeri her gün %3 artar, en çok 15 gün', () => {
    const item = makeItem({ tags: ['nadir'], baseValue: 1000 });
    let s = makeState({ phase: 'evening', inventory: [item] });
    s = startNextDay(s);
    expect(s.inventory[0].baseValue).toBe(1030);
    for (let i = 0; i < 30; i++) s = startNextDay({ ...s, phase: 'evening' });
    expect(s.inventory[0].heldDays).toBe(15);
    expect(s.inventory[0].baseValue).toBeLessThan(1000 * 1.03 ** 15 + 50);
  });
});

describe('görevler', () => {
  test('aşamaya göre 3 görev üretilir', () => {
    const qs = generateQuests(makeState(), createRng(1));
    expect(qs).toHaveLength(3);
    for (const q of qs) {
      expect(q.reward).toBe(QUEST_REWARD[1]);
      expect(q.progress).toBe(0);
      expect(q.done).toBe(false);
    }
  });
  test('satış görevi ilerler, bitince ödül verilir', () => {
    const quest = { id: 'q', kind: 'sat' as const, target: 2, progress: 1, reward: 1000, done: false, title: '2 eşya sat' };
    const item = makeItem({ boughtFor: 1000 });
    const s = recordSale(makeState({ money: 0, quests: [quest] }), item, 1500, false);
    expect(s.quests[0]).toMatchObject({ progress: 2, done: true });
    expect(s.money).toBe(1000);
    expect(s.summary.notes).toContain('Görev tamamlandı: 2 eşya sat (+1.000 TL)');
    const again = recordSale(s, item, 1500, false);
    expect(again.money).toBe(1000);
  });
  test('kâr, temiz, dürüst ve kategori görevleri', () => {
    const q = (kind: 'kar' | 'temiz' | 'durust' | 'kategori', target: number, category?: 'guvercin') =>
      ({ id: kind, kind, target, progress: 0, reward: 10, done: false, title: kind, category });
    const defect = { id: 'd', name: 'x', repairCost: 1, valueHit: 0.1, known: true };
    let s = makeState({ quests: [q('kar', 500), q('temiz', 1), q('durust', 1), q('kategori', 1, 'guvercin')] });
    s = recordSale(s, makeItem({ boughtFor: 1000, defects: [defect] }), 1400, true);
    expect(s.quests.map((x) => x.done)).toEqual([false, false, true, false]);
    s = recordSale(s, makeItem({ category: 'guvercin', boughtFor: 100 }), 700, false);
    expect(s.quests.map((x) => x.done)).toEqual([true, true, true, true]);
  });
  test('yeni günde biten görevlerin yerine yenisi gelir', () => {
    const done = { id: 'q', kind: 'sat' as const, target: 1, progress: 1, reward: 1, done: true, title: 'x' };
    const s = startNextDay(makeState({ phase: 'evening', quests: [done] }));
    expect(s.quests).toHaveLength(3);
    expect(s.quests.every((q) => !q.done)).toBe(true);
  });
});

describe('rekorlar ve başarımlar', () => {
  test('recordSale istatistikleri günceller', () => {
    const s = recordSale(makeState(), makeItem({ boughtFor: 1000, defects: [{ id: 'd', name: 'x', repairCost: 1, valueHit: 0.1, known: true }] }), 1600, true);
    expect(s.stats).toMatchObject({ sales: 1, profit: 600, bestProfit: 600, bestItem: 'Serçe Şehir 26', disclosedSales: 1 });
    expect(s.achievements).toContain('ilk-satis');
  });
  test('nadir parça satışı koleksiyoncu, büyük kâr büyük vurgun', () => {
    const s = recordSale(makeState(), makeItem({ tags: ['nadir'], boughtFor: 0 }), 150000, false);
    expect(s.achievements).toEqual(expect.arrayContaining(['koleksiyoncu', 'buyuk-vurgun']));
  });
  test('ucuz alım pazarlıkçı', () => {
    const l = makeListing({ askPrice: 2000 });
    expect(recordPurchase(makeState(), l, 1400).achievements).toContain('pazarlikci');
    expect(recordPurchase(makeState(), l, 1500).achievements).not.toContain('pazarlikci');
  });
  test('duruma bağlı başarımlar, tekrar eklenmez', () => {
    const s = checkAchievements(makeState({ stage: 3, locationLevel: 2, won: true, stats: { ...makeState().stats, disclosedSales: 5 } }));
    expect(s.achievements).toEqual(expect.arrayContaining(['motorcu', 'galerici', 'showroom', 'sampiyon', 'durust-esnaf']));
    expect(checkAchievements(s).achievements).toHaveLength(s.achievements.length);
    expect(Object.keys(ACHIEVEMENTS)).toHaveLength(10);
  });
  test('aşama geçiş günü kaydedilir', () => {
    const s = checkAchievements(makeState({ stage: 2, day: 9 }));
    expect(s.stats.stageDay).toEqual({ 2: 9, 3: null });
  });
});

test('piyasa değeri kişilikten etkilenmez', () => {
  const item = makeItem();
  expect(marketValue(item, 'ilkbahar')).toBe(2000);
});
