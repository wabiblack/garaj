import { CREDIT_MIN_SALES, LOAN_DAYS, LOAN_INTEREST, SAVINGS_RATE, creditCheck, deposit, repayLoan, settleBank, takeLoan, withdraw } from '../../src/game/bank';
import { gameReducer, type GameView } from '../../src/game/reducer';
import { isBankrupt } from '../../src/game/progression';
import { loadGame, SAVE_KEY } from '../../src/game/save';
import { makeListing, makeState } from '../helpers';

const adult = (over = {}) => makeState({
  stage: 3, age: 18, money: 100_000, reputation: 80,
  stats: { ...makeState().stats, sales: 20 }, ...over,
});
const ok = <T,>(x: T | string | null): T => { if (typeof x === 'string' || x === null) throw new Error(String(x)); return x; };
const view = (over = {}): GameView => ({ state: adult(over), message: null, lastOffer: null });

describe('kredi koşulları', () => {
  test('reşit olmayan kredi çekemez', () => {
    expect(creditCheck(makeState({ stage: 2, age: 16, reputation: 90, stats: { ...makeState().stats, sales: 50 } }))).toEqual({ ok: false, reason: 'resit-degil' });
  });
  test('itibar düşükse ya da satış geçmişi yoksa kredi yok', () => {
    expect(creditCheck(adult({ reputation: 30 }))).toEqual({ ok: false, reason: 'itibar-dusuk' });
    expect(creditCheck(adult({ stats: { ...makeState().stats, sales: CREDIT_MIN_SALES - 1 } }))).toEqual({ ok: false, reason: 'gecmis-yok' });
  });
  test('limit itibarla ve satış geçmişiyle artar', () => {
    const low = creditCheck(adult({ reputation: 50 }));
    const high = creditCheck(adult({ reputation: 100 }));
    expect(low.ok && high.ok && high.limit > low.limit).toBe(true);
  });
});

describe('kredi', () => {
  test('çekilir: para gelir, borç faiziyle taksitlere bölünür', () => {
    const lim = creditCheck(adult());
    if (!lim.ok) throw new Error();
    const a = ok(takeLoan(adult(), 1_000_000));
    expect(a.money).toBe(1_100_000);
    expect(a.loan).toEqual({ debt: 1_000_000 * (1 + LOAN_INTEREST), installment: Math.ceil(1_100_000 / LOAN_DAYS / 10) * 10, daysLeft: LOAN_DAYS, late: 0 });
    expect(takeLoan(a, 1_000_000)).toBe('kredi-var');
    expect(takeLoan(adult(), lim.limit + 10)).toBe('limit-asimi');
  });
  test('her gün taksit ödenir, bitince kredi kapanır', () => {
    let s = ok(takeLoan(adult({ money: 20_000 }), 100_000));
    for (let i = 0; i < LOAN_DAYS; i++) s = settleBank(s);
    expect(s.loan).toBeNull();
    expect(s.money).toBe(10_000);
    expect(s.summary.notes.some((n) => n.includes('Kredi bitti'))).toBe(true);
  });
  test('ödenemeyen taksit gecikmedir: ceza borca eklenir, itibar düşer', () => {
    const s = settleBank(adult({ money: 0, loan: { debt: 110_000, installment: 11_000, daysLeft: 10, late: 0 } }));
    expect(s.loan).toMatchObject({ late: 1, daysLeft: 9 });
    expect(s.loan!.debt).toBeGreaterThan(110_000);
    expect(s.reputation).toBe(77);
    expect(s.summary.notes.some((n) => n.includes('taksit'))).toBe(true);
  });
  test('erken kapatma kalan borcu öder ve borçsuz başarımı verir', () => {
    const v = gameReducer(view({ money: 200_000, loan: { debt: 110_000, installment: 11_000, daysLeft: 10, late: 0 } }), { type: 'repayLoan' });
    expect(v.state).toMatchObject({ money: 90_000, loan: null });
    expect(v.state.achievements).toContain('borcsuz');
    expect(repayLoan(adult({ money: 10, loan: { debt: 110_000, installment: 11_000, daysLeft: 10, late: 0 } }))).toBe('yetersiz-para');
  });
});

describe('birikim hesabı', () => {
  test('yatır, çek, faiz al', () => {
    const a = ok(deposit(adult({ money: 10_000 }), 10_000));
    expect(a).toMatchObject({ money: 0, bank: { savings: 10_000 } });
    expect(deposit(a, 1)).toBe('yetersiz-para');
    const b = settleBank(a);
    expect(b.bank.savings).toBe(10_000 + Math.round(10_000 * SAVINGS_RATE));
    const c = ok(withdraw(b, 5000));
    expect(c).toMatchObject({ money: 5000 });
    expect(withdraw(c, 1e9)).toBe('yetersiz-para');
  });
  test('reşit olmayan da birikim yapabilir', () => {
    expect(typeof deposit(makeState({ money: 500 }), 500)).toBe('object');
  });
});

test('bankada parası olan iflas etmiş sayılmaz; kredisi olabilecek de', () => {
  const broke = { stage: 3 as const, age: 18, money: 1000, listings: [makeListing({ minPrice: 90000 })] };
  expect(isBankrupt(makeState({ ...broke, bank: { savings: 100_000 } }))).toBe(false);
  expect(isBankrupt(adult({ ...broke }))).toBe(false);
  expect(isBankrupt(makeState({ ...broke }))).toBe(true);
});

test('eski kredi kaydı yeni biçime çevrilir, birikim hesabı eklenir', () => {
  const old = adult() as unknown as Record<string, unknown>;
  old.loan = { principal: 1_000_000, dailyRate: 0.01 };
  delete old.bank;
  localStorage.setItem(SAVE_KEY, JSON.stringify(old));
  const r = loadGame(localStorage);
  if (r.kind !== 'ok') throw new Error();
  expect(r.state.loan).toEqual({ debt: 1_100_000, installment: Math.ceil(1_100_000 / LOAN_DAYS / 10) * 10, daysLeft: LOAN_DAYS, late: 0 });
  expect(r.state.bank).toEqual({ savings: 0 });
});
