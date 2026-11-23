import { upgradeCapacity, upgradeLocation, hire, fire, takeLoan, repayLoan, applyDailyCosts, CAPACITY_COST, LOCATION_COST } from '../../src/game/growth';
import { startNextDay } from '../../src/game/day';
import { makeState } from '../helpers';
import type { GameState } from '../../src/game/types';

const s3 = (over: Partial<GameState> = {}) => makeState({ stage: 3, money: 100_000_000, ...over });
const ok = (r: GameState | string | null): GameState => {
  if (typeof r !== 'object' || r === null) throw new Error('engellendi: ' + r);
  return r;
};

describe('engeller', () => {
  test('aşama 3 değilse', () => {
    expect(upgradeCapacity(makeState({ stage: 2, money: 1e9 }))).toBe('asama-3-degil');
    expect(upgradeLocation(makeState({ stage: 1, money: 1e9 }))).toBe('asama-3-degil');
    expect(hire(makeState({ stage: 2, money: 1e9 }), 'usta')).toBe('asama-3-degil');
    expect(takeLoan(makeState({ stage: 2 }), 1_000_000)).toBe('asama-3-degil');
  });
  test('para yetmezse', () => {
    expect(upgradeCapacity(s3({ money: 399_999 }))).toBe('yetersiz-para');
    expect(upgradeLocation(s3({ money: 1 }))).toBe('yetersiz-para');
  });
  test('son seviye', () => {
    expect(upgradeCapacity(s3({ capacityLevel: 3 }))).toBe('en-ust-seviye');
    expect(upgradeLocation(s3({ locationLevel: 2 }))).toBe('en-ust-seviye');
  });
});

test('kapasite ve mekân yükseltme parayı düşer', () => {
  const a = ok(upgradeCapacity(s3({ money: 1_000_000 })));
  expect(a).toMatchObject({ capacityLevel: 1, money: 1_000_000 - CAPACITY_COST[0] });
  const b = ok(upgradeLocation(s3({ money: 3_000_000, locationLevel: 0 })));
  expect(b).toMatchObject({ locationLevel: 1, money: 3_000_000 - LOCATION_COST[0] });
});

test('işe alma ve çıkarma', () => {
  const a = ok(hire(s3(), 'usta'));
  expect(a.employees.usta).toBe(true);
  expect(hire(a, 'usta')).toBe('zaten-var');
  expect(fire(a, 'usta').employees.usta).toBe(false);
});

describe('kredi', () => {
  test('al ve öde', () => {
    const a = ok(takeLoan(s3({ money: 0 }), 1_000_000));
    expect(a.money).toBe(1_000_000);
    expect(a.loan).toEqual({ principal: 1_000_000, dailyRate: 0.01 });
    expect(takeLoan(a, 1_000_000)).toBe('kredi-var');
    expect(repayLoan({ ...a, money: 999_999 })).toBe('yetersiz-para');
    const b = ok(repayLoan(a));
    expect(b).toMatchObject({ money: 0, loan: null });
  });
  test('geçersiz tutar reddedilir', () => {
    expect(takeLoan(s3(), 5)).toBe('yetersiz-para');
  });
});

describe('applyDailyCosts', () => {
  const all = { usta: true, boyaci: true, satis: true };
  test('maaş ve faiz düşülür', () => {
    const s = applyDailyCosts(s3({ money: 100_000, employees: all, loan: { principal: 1_000_000, dailyRate: 0.01 } }));
    expect(s.money).toBe(100_000 - 9000 - 10_000);
    expect(s.loan!.principal).toBe(1_000_000);
  });
  test('maaşı ödenemeyen çalışan sırayla ayrılır, para eksiye düşmez', () => {
    const s = applyDailyCosts(s3({ money: 5000, employees: all }));
    expect(s.employees).toEqual({ usta: true, boyaci: false, satis: false });
    expect(s.money).toBe(2000);
    expect(s.summary.notes.some((n) => n.includes('Satış elemanı'))).toBe(true);
  });
  test('ödenemeyen faiz borca eklenir', () => {
    const s = applyDailyCosts(s3({ money: 3000, loan: { principal: 1_000_000, dailyRate: 0.01 } }));
    expect(s.money).toBe(0);
    expect(s.loan!.principal).toBe(1_007_000);
  });
  test('startNextDay giderleri uygular', () => {
    const s = startNextDay(s3({ phase: 'evening', money: 10_000, employees: { usta: true, boyaci: false, satis: false } }));
    expect(s.summary.spent).toBe(3000);
  });
});

describe('fix M4 ve M6', () => {
  test('bir günlük maaşa parası yetmeyen işe alamaz', () => {
    expect(hire(s3({ money: 2999 }), 'usta')).toBe('yetersiz-para');
    expect(typeof hire(s3({ money: 3000 }), 'usta')).toBe('object');
  });
  test('yükseltmeler harcanana yazılır', () => {
    const a = ok(upgradeCapacity(s3({ money: 1_000_000 })));
    expect(a.summary.spent).toBe(400_000);
    const b = ok(upgradeLocation(s3({ money: 3_000_000 })));
    expect(b.summary.spent).toBe(2_500_000);
  });
  test('maaş ve ödenen faiz harcanana yazılır', () => {
    const s = applyDailyCosts(s3({ money: 100_000, employees: { usta: true, boyaci: false, satis: false }, loan: { principal: 1_000_000, dailyRate: 0.01 } }));
    expect(s.summary.spent).toBe(3000 + 10_000);
  });
});
