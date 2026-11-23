import { repair, repairCost, clean, paint, care } from '../../src/game/prep';
import { makeItem, makeState } from '../helpers';

const d = (known: boolean) => ({ id: 'd1', name: 'Fren', repairCost: 1000, valueHit: 0.2, known });

describe('repair', () => {
  test('bilinmeyen kusur onarılamaz', () => {
    expect(repair(makeItem({ defects: [d(false)] }), 'd1', makeState())).toBeNull();
    expect(repair(makeItem({ defects: [d(true)] }), 'yok', makeState())).toBeNull();
  });
  test('bilinen kusur onarılır, kusur listeden çıkar', () => {
    const res = repair(makeItem({ defects: [d(true)] }), 'd1', makeState())!;
    expect(res.cost).toBe(1000);
    expect(res.item.defects).toHaveLength(0);
  });
  test('beceri ve usta maliyeti düşürür', () => {
    expect(repairCost(d(true), makeState({ skill: 100 }))).toBe(500);
    expect(repairCost(d(true), makeState({ skill: 50, employees: { usta: true, boyaci: false, satis: false, cirak: false } }))).toBe(600);
  });
});

describe('clean', () => {
  test('%2 maliyet, durum +10 en çok 100, bir kez', () => {
    const res = clean(makeItem({ baseValue: 2000, condition: 95 }))!;
    expect(res.cost).toBe(40);
    expect(res.item.condition).toBe(100);
    expect(res.item.cleaned).toBe(true);
    expect(clean(res.item)).toBeNull();
  });
});

describe('paint', () => {
  test('yalnız araba, %6 maliyet, durum +20, bir kez', () => {
    expect(paint(makeItem(), makeState())).toBeNull();
    const car = makeItem({ category: 'araba', baseValue: 100000, condition: 50 });
    const res = paint(car, makeState())!;
    expect(res.cost).toBe(6000);
    expect(res.item.condition).toBe(70);
    expect(paint(res.item, makeState())).toBeNull();
  });
  test('boyacı %30 ucuzlatır', () => {
    const car = makeItem({ category: 'araba', baseValue: 100000 });
    expect(paint(car, makeState({ employees: { usta: false, boyaci: true, satis: false, cirak: false } }))!.cost).toBe(4200);
  });
});

describe('care', () => {
  test('yalnız güvercin; %3 maliyet, değer %5 artar, durum +5', () => {
    expect(care(makeItem())).toBeNull();
    const res = care(makeItem({ category: 'guvercin', baseValue: 1000, condition: 50 }))!;
    expect(res.cost).toBe(30);
    expect(res.item.baseValue).toBe(1050);
    expect(res.item.condition).toBe(55);
    expect(res.item.careCount).toBe(1);
    expect(res.item.caredToday).toBe(true);
  });
  test('günde bir, toplam en çok 5', () => {
    expect(care(makeItem({ category: 'guvercin', caredToday: true }))).toBeNull();
    expect(care(makeItem({ category: 'guvercin', careCount: 5 }))).toBeNull();
  });
});
