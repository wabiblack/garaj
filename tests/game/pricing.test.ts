import type { Item } from '../../src/game/types';
import { marketValue, trueValue, seasonForDay } from '../../src/game/pricing';
import { generateItem } from '../../src/game/catalog';
import { createRng } from '../../src/game/rng';

const base = (over: Partial<Item> = {}): Item => ({
  id: 'i', category: 'araba', brand: 'Doruk', model: 'X', baseValue: 100000, condition: 100,
  defects: [], tags: [], cleaned: false, painted: false, careCount: 0, caredToday: false, boughtFor: 0, ...over,
});

test('kusursuz, tam durum, etiketsiz = temel değer', () => expect(marketValue(base(), 'ilkbahar')).toBe(100000));
test('durum 0 iken %40', () => expect(marketValue(base({ condition: 0 }), 'ilkbahar')).toBe(40000));
test('4x4 kışın %20 fazla, yazın %10 eksik', () => {
  expect(marketValue(base({ tags: ['4x4'] }), 'kis')).toBe(120000);
  expect(marketValue(base({ tags: ['4x4'] }), 'yaz')).toBe(90000);
});
test('cabrio yazın %20 fazla, kışın %15 eksik', () => {
  expect(marketValue(base({ tags: ['cabrio'] }), 'yaz')).toBe(120000);
  expect(marketValue(base({ tags: ['cabrio'] }), 'kis')).toBe(85000);
});
test('klasik etiketinde mevsim etkisi yok', () => {
  expect(marketValue(base({ tags: ['klasik', 'cabrio'] }), 'kis')).toBe(100000);
});
test('marketValue yalnız bilinen kusurları düşer, trueValue hepsini', () => {
  const it = base({ defects: [{ id: 'd', name: 'x', repairCost: 1, valueHit: 0.2, known: false }] });
  expect(marketValue(it, 'ilkbahar')).toBe(100000);
  expect(trueValue(it, 'ilkbahar')).toBe(80000);
});
test('mevsim aya göre: 1. tur haziran (yaz)', () => {
  expect(seasonForDay(1)).toBe('yaz');
  expect(seasonForDay(4)).toBe('sonbahar');
  expect(seasonForDay(7)).toBe('kis');
  expect(seasonForDay(10)).toBe('ilkbahar');
  expect(seasonForDay(13)).toBe('yaz');
});
test('generateItem kategoriye uygun ve değer aralığında', () => {
  const r = createRng(7);
  for (let i = 0; i < 50; i++) {
    const it = generateItem('bisiklet', r);
    expect(it.category).toBe('bisiklet');
    expect(it.baseValue).toBeGreaterThanOrEqual(500);
    expect(it.baseValue).toBeLessThanOrEqual(8000);
    expect(it.condition).toBeGreaterThanOrEqual(30);
    expect(it.condition).toBeLessThanOrEqual(90);
    expect(it.defects.length).toBeLessThanOrEqual(2);
  }
});
test('hurdalık eşyası düşük durumlu ve çok kusurlu', () => {
  const r = createRng(3);
  for (let i = 0; i < 20; i++) {
    const it = generateItem('araba', r, { special: 'hurdalik' });
    expect(it.condition).toBeLessThanOrEqual(30);
    expect(it.defects.length).toBeGreaterThanOrEqual(2);
  }
});
test('klasik özel eşya klasik etiketli', () => {
  expect(generateItem('araba', createRng(5), { special: 'klasik' }).tags).toContain('klasik');
});
test('bir eşyada aynı kusur iki kez çıkmaz', () => {
  const r = createRng(11);
  for (let i = 0; i < 100; i++) {
    const names = generateItem('guvercin', r, { special: 'hurdalik' }).defects.map((d) => d.name);
    expect(new Set(names).size).toBe(names.length);
  }
});
