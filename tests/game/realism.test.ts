import { VEHICLES, demand, ownershipCost, riskOf, settleRisks, settleVehicles } from '../../src/game/realism';
import { generateItem } from '../../src/game/catalog';
import { createRng } from '../../src/game/rng';
import { generateListings, startNextDay } from '../../src/game/day';
import { gameReducer, type GameView } from '../../src/game/reducer';
import { weekOfYear } from '../../src/game/calendar';
import { makeItem, makeListing, makeState } from '../helpers';

const view = (over = {}): GameView => ({ state: makeState(over), message: null, lastOffer: null });
const dayOfWeek = (w: number) => Array.from({ length: 52 }, (_, i) => i + 1).find((d) => weekOfYear(d) === w)!;

test('araçlar model yaşı ve kilometreyle gelir; eski ve çok kullanılmış araç ucuzdur', () => {
  const rng = createRng(4);
  const cars = Array.from({ length: 200 }, () => generateItem('araba', rng));
  for (const c of cars) { expect(c.modelAge).toBeGreaterThanOrEqual(0); expect(c.km).toBeGreaterThanOrEqual(0); }
  const old = cars.filter((c) => (c.modelAge ?? 0) >= 10);
  const fresh = cars.filter((c) => (c.modelAge ?? 0) <= 2);
  const avg = (xs: typeof cars) => xs.reduce((s, c) => s + c.baseValue, 0) / xs.length;
  expect(avg(fresh)).toBeGreaterThan(avg(old));
  expect(generateItem('bisiklet', rng).km).toBeUndefined();
  expect(VEHICLES).toEqual(expect.arrayContaining(['motor', 'araba', 'karavan', 'tekne', 'ismakinesi']));
});

test('elde tutulan araç için haftalık sigorta ve vergi ödenir', () => {
  const car = makeItem({ category: 'araba', baseValue: 1_000_000 });
  expect(ownershipCost(car)).toBeGreaterThan(0);
  expect(ownershipCost(makeItem())).toBe(0);
  const s = settleVehicles(makeState({ money: 100_000, inventory: [car] }));
  expect(s.money).toBe(100_000 - ownershipCost(car));
  expect(s.summary.notes.some((n) => n.includes('sigorta'))).toBe(true);
});

test('okul açılışında bisiklet ve telefon aranır; bayram haftasında herkes alışverişte', () => {
  const school = makeState({ day: dayOfWeek(36) });
  expect(demand(school, 'bisiklet').buyers).toBeGreaterThan(0);
  expect(demand(school, 'motor').buyers).toBe(0);
  expect(demand(makeState({ day: dayOfWeek(14) }), 'motor').buyers).toBeGreaterThan(0);
  expect(demand(makeState({ day: dayOfWeek(30) }), 'bisiklet')).toEqual({ buyers: 0, note: null });
});

test('bazı ilanlar çalıntı ya da sahte; bakınca anlaşılır', () => {
  let stolen = 0, scam = 0;
  for (let seed = 1; seed <= 200; seed++) for (const l of generateListings(makeState(), createRng(seed))) {
    if (l.risk === 'calinti') stolen++;
    if (l.risk === 'sahte') scam++;
  }
  expect(stolen).toBeGreaterThan(5);
  expect(scam).toBeGreaterThan(5);
  expect(riskOf(makeListing({ risk: 'calinti', inspected: false }))).toBeNull();
  expect(riskOf(makeListing({ risk: 'calinti', inspected: true }))).toMatch(/belge/i);
  expect(riskOf(makeListing({ risk: 'sahte', inspected: true }))).toMatch(/kapora/i);
});

test('sahte ilan: para gider, mal gelmez', () => {
  const l = makeListing({ risk: 'sahte', minPrice: 1000, askPrice: 1500 });
  const v = gameReducer(view({ money: 5000, listings: [l] }), { type: 'offer', listingId: l.id, amount: 1200 });
  expect(v.state.money).toBe(3800);
  expect(v.state.inventory).toHaveLength(0);
  expect(v.message).toMatch(/dolandır/i);
});

test('çalıntı mal: hafta sonunda polis el koyabilir, itibar düşer', () => {
  const it = { ...makeItem(), stolen: true };
  let seized = 0;
  for (let seed = 1; seed <= 50; seed++) {
    const s = settleRisks(makeState({ inventory: [it], reputation: 50 }), createRng(seed));
    if (s.inventory.length === 0) { seized++; expect(s.reputation).toBeLessThan(50); }
  }
  expect(seized).toBeGreaterThan(15);
  expect(startNextDay(makeState({ phase: 'evening', inventory: [makeItem()] })).inventory).toHaveLength(1);
});
