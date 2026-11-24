import { SOURCES, defectInfo, installPart, orderPart, partPrice, treat, treatCost } from '../../src/game/workshop';
import { CATALOG } from '../../src/game/catalog';
import { repairCost } from '../../src/game/prep';
import { startNextDay } from '../../src/game/day';
import { gameReducer, type GameView } from '../../src/game/reducer';
import type { GameState } from '../../src/game/types';
import { makeItem, makeState } from '../helpers';

const defect = (name = 'Zincir paslı') => ({ id: 'd1', name, repairCost: 1000, valueHit: 0.12, known: true });
const ok = (x: GameState | string | null): GameState => { if (typeof x !== 'object' || x === null) throw new Error(String(x)); return x; };
const withItem = (over: Partial<GameState> = {}, d = defect()) => makeState({ money: 10_000, inventory: [makeItem({ id: 'i1', condition: 60, defects: [d] })], ...over });

test('katalogdaki her kusurun parçası, aleti ve türü tanımlı', () => {
  for (const t of Object.values(CATALOG)) for (const [name] of t.defects) {
    const info = defectInfo(name);
    expect(info.partName, name).toBeTruthy();
    if (info.kind === 'hayvan') expect(info.care!.length, name).toBeGreaterThan(0);
    else expect(info.part, name).toBeTruthy();
  }
  expect(defectInfo('Zincir paslı')).toMatchObject({ part: 'zincir', kind: 'mekanik' });
  expect(defectInfo('Hasta').kind).toBe('hayvan');
});

test('kendin yaparsan parça ustadan ucuz; orijinal hemen, muadil ve çıkma haftaya gelir', () => {
  const s = withItem();
  const usta = repairCost(defect(), s);
  expect(partPrice(defect(), s, 'orijinal')).toBeLessThan(usta);
  expect(partPrice(defect(), s, 'cikma')).toBeLessThan(partPrice(defect(), s, 'muadil'));
  const o = ok(orderPart(s, 'i1', 'd1', 'orijinal'));
  expect(o.money).toBe(10_000 - partPrice(defect(), s, 'orijinal'));
  expect(o.parts).toEqual([{ itemId: 'i1', defectId: 'd1', source: 'orijinal', arrives: s.day }]);
  expect(orderPart(o, 'i1', 'd1', 'orijinal')).toBe('zaten-var');
  const m = ok(orderPart(s, 'i1', 'd1', 'muadil'));
  expect(m.parts[0].arrives).toBe(s.day + SOURCES.muadil.weeks);
  expect(installPart(m, 'i1', 'd1', 1)).toBe('parca-yolda');
});

test('montaj kusuru giderir; iyi iş durumu artırır, kötü iş düşürür; çıkma parça biraz yıpratır', () => {
  const s = ok(orderPart(withItem(), 'i1', 'd1', 'orijinal'));
  const good = ok(installPart(s, 'i1', 'd1', 1));
  expect(good.inventory[0].defects).toHaveLength(0);
  expect(good.parts).toHaveLength(0);
  expect(good.inventory[0].condition).toBeGreaterThan(s.inventory[0].condition);
  expect(ok(installPart(s, 'i1', 'd1', 0)).inventory[0].condition).toBeLessThan(s.inventory[0].condition);
  const used = ok(orderPart(withItem({ day: 5 }), 'i1', 'd1', 'cikma'));
  const later = ok(installPart({ ...used, day: 6 }, 'i1', 'd1', 1));
  expect(later.inventory[0].condition).toBeLessThan(good.inventory[0].condition);
});

test('hayvanı kendin tedavi edersen veterinerden ucuz', () => {
  const sick = { id: 'd1', name: 'Hasta', repairCost: 1000, valueHit: 0.35, known: true };
  const s = makeState({ money: 5000, inventory: [makeItem({ id: 'i1', category: 'guvercin', defects: [sick] })] });
  expect(treatCost(sick, s)).toBeLessThan(repairCost(sick, s));
  const t = ok(treat(s, 'i1', 'd1', 1));
  expect(t.inventory[0].defects).toHaveLength(0);
  expect(treat(withItem(), 'i1', 'd1', 1)).toBeNull();
});

test('reducer: sipariş ve montaj iş hakkı harcar; eşya gidince bekleyen sipariş düşer', () => {
  const v: GameView = { state: withItem(), message: null, lastOffer: null };
  const a = gameReducer(v, { type: 'orderPart', itemId: 'i1', defectId: 'd1', source: 'orijinal' });
  expect(a.state.parts).toHaveLength(1);
  const b = gameReducer(a, { type: 'installPart', itemId: 'i1', defectId: 'd1', quality: 1 });
  expect(b.state.inventory[0].defects).toHaveLength(0);
  expect(b.state.used).toBe(1);
  const orphan = startNextDay({ ...withItem(), phase: 'evening', inventory: [], parts: [{ itemId: 'i1', defectId: 'd1', source: 'muadil', arrives: 2 }] });
  expect(orphan.parts).toHaveLength(0);
});
