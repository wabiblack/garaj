import { CATALOG, CATEGORY_LABEL, categoriesFor } from '../../src/game/catalog';
import { generateListings } from '../../src/game/day';
import { createRng } from '../../src/game/rng';

const at = (stage: 1 | 2 | 3 | 4, age: number) => categoriesFor({ stage, age });

test('pazar yaşla genişler: her yaş yeni türler açar, eskiler kaybolmaz', () => {
  expect(at(1, 12)).toEqual(expect.arrayContaining(['bisiklet', 'guvercin', 'kaykay', 'kart', 'kus', 'balik']));
  expect(at(1, 12)).not.toContain('telefon');
  expect(at(1, 13)).toEqual(expect.arrayContaining(['telefon', 'scooter', 'kulaklik']));
  expect(at(1, 14)).toEqual(expect.arrayContaining(['konsol', 'kopek']));
  expect(at(1, 15)).toEqual(expect.arrayContaining(['escooter', 'bilgisayar', 'kamera', 'gitar']));
  expect(at(1, 15)).not.toContain('motor');
  expect(at(2, 16)).toEqual(expect.arrayContaining(['motor', 'telefon', 'konsol', 'bilgisayar', 'kopek']));
  expect(at(3, 18)).toEqual(expect.arrayContaining(['araba', 'motor', 'karavan', 'tekne']));
  expect(at(3, 18)).not.toContain('bisiklet');
  expect(at(3, 18)).not.toContain('ismakinesi');
  expect(at(4, 22)).toContain('ismakinesi');
});

test('her türün adı, en az iki modeli ve kusurları var', () => {
  for (const [c, t] of Object.entries(CATALOG)) {
    expect(CATEGORY_LABEL[c as keyof typeof CATALOG], c).toBeTruthy();
    expect(t.models.length, c).toBeGreaterThanOrEqual(2);
    expect(t.defects.length, c).toBeGreaterThanOrEqual(2);
  }
});

test('aşamanın asıl türü ilanlarda ağırlıklı çıkar', () => {
  let motor = 0, all = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const ls = generateListings({ stage: 2, age: 16, season: 'yaz' }, createRng(seed));
    all += ls.length;
    motor += ls.filter((l) => l.item.category === 'motor').length;
  }
  expect(motor / all).toBeGreaterThan(0.4);
  expect(motor / all).toBeLessThan(0.9);
});
