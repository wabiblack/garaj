// Banka: birikim hesabı (herkese açık) ve taksitli kredi (yalnız reşit olana, koşullu).
import type { GameState, Loan, Stage } from './types';
import { formatTL } from './format';

/** Birikimin günlük faizi. */
export const SAVINGS_RATE = 0.003;
export const ADULT_AGE = 18;
export const CREDIT_MIN_REP = 40;
export const CREDIT_MIN_SALES = 5;
/** Kredi bu kadar günde, günlük eşit taksitle ödenir. */
export const LOAN_DAYS = 10;
/** Vadenin toplam faizi. */
export const LOAN_INTEREST = 0.1;
/** Ödenmeyen taksitin borca eklenen cezası. */
export const LATE_PENALTY = 0.05;
export const LATE_REP = 3;
const CREDIT_BASE: Record<Stage, number> = { 1: 0, 2: 0, 3: 3_000_000, 4: 30_000_000 };

export type BankBlock = 'resit-degil' | 'itibar-dusuk' | 'gecmis-yok' | 'limit-asimi' | 'kredi-var' | 'yetersiz-para' | null;
export type CreditCheck = { ok: true; limit: number } | { ok: false; reason: 'resit-degil' | 'itibar-dusuk' | 'gecmis-yok' };

const round1000 = (x: number) => Math.floor(x / 1000) * 1000;

/** Bankanın kredi kararı: reşit, itibarlı ve satış geçmişi olan oyuncuya itibarına göre limit. */
export function creditCheck(s: GameState): CreditCheck {
  if (s.age < ADULT_AGE) return { ok: false, reason: 'resit-degil' };
  if (s.reputation < CREDIT_MIN_REP) return { ok: false, reason: 'itibar-dusuk' };
  if (s.stats.sales < CREDIT_MIN_SALES) return { ok: false, reason: 'gecmis-yok' };
  const history = Math.min(1, 0.5 + s.stats.sales / 40);
  return { ok: true, limit: round1000(CREDIT_BASE[s.stage] * (s.reputation / 100) * history) };
}

export function newLoan(amount: number): Loan {
  const debt = Math.round(amount * (1 + LOAN_INTEREST));
  return { debt, installment: Math.ceil(debt / LOAN_DAYS / 10) * 10, daysLeft: LOAN_DAYS, late: 0 };
}

export function takeLoan(s: GameState, amount: number): GameState | BankBlock {
  if (s.loan) return 'kredi-var';
  const check = creditCheck(s);
  if (!check.ok) return check.reason;
  if (!Number.isFinite(amount) || amount <= 0 || amount > check.limit) return 'limit-asimi';
  return { ...s, money: s.money + amount, loan: newLoan(amount) };
}

/** Kalan borcu bir kerede kapatır. */
export function repayLoan(s: GameState): GameState | BankBlock {
  if (!s.loan) return null;
  if (s.money < s.loan.debt) return 'yetersiz-para';
  return { ...s, money: s.money - s.loan.debt, loan: null, summary: { ...s.summary, spent: s.summary.spent + s.loan.debt } };
}

export function deposit(s: GameState, amount: number): GameState | BankBlock {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (s.money < amount) return 'yetersiz-para';
  return { ...s, money: s.money - amount, bank: { savings: s.bank.savings + amount } };
}

export function withdraw(s: GameState, amount: number): GameState | BankBlock {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (s.bank.savings < amount) return 'yetersiz-para';
  return { ...s, money: s.money + amount, bank: { savings: s.bank.savings - amount } };
}

/** Gün başında: birikime faiz işler, kredinin taksiti tahsil edilir. */
export function settleBank(s: GameState): GameState {
  const savings = s.bank.savings + Math.round(s.bank.savings * SAVINGS_RATE);
  if (!s.loan) return { ...s, bank: { savings } };
  const notes = [...s.summary.notes];
  const due = Math.min(s.loan.installment, s.loan.debt);
  const paid = Math.min(s.money, due);
  let debt = s.loan.debt - paid;
  let late = s.loan.late;
  let reputation = s.reputation;
  if (paid < due) {
    debt += Math.round((due - paid) * LATE_PENALTY);
    late += 1;
    reputation = Math.max(0, reputation - LATE_REP);
    notes.push(`Kredi taksiti ödenemedi: ceza borca eklendi, itibarın düştü`);
  }
  const daysLeft = Math.max(0, s.loan.daysLeft - 1);
  const summary = { ...s.summary, notes, spent: s.summary.spent + paid };
  if (debt <= 0) {
    return { ...s, money: s.money - paid, reputation, bank: { savings }, loan: null, summary: { ...summary, notes: [...notes, 'Kredi bitti: borcun kalmadı'] } };
  }
  // Vade dolduysa kalan borç bir sonraki gün tek seferde istenir.
  const installment = daysLeft === 0 ? debt : s.loan.installment;
  if (daysLeft === 0 && paid < due) notes.push(`Vade doldu: kalan borç ${formatTL(debt)}`);
  return { ...s, money: s.money - paid, reputation, bank: { savings }, loan: { debt, installment, daysLeft, late }, summary };
}
