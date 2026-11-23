import type { Employees, GameState } from './types';
export { CAPACITY } from './negotiation';

export const CAPACITY_COST: readonly number[] = [400_000, 1_200_000, 3_000_000];
export const LOCATIONS = ['Sanayi garajı', 'Mahalle galerisi', 'Ana cadde showroom'] as const;
export const LOCATION_COST: readonly number[] = [2_500_000, 8_000_000];
export const SALARY: Record<keyof Employees, number> = { usta: 3000, boyaci: 2500, satis: 3500 };
export const ROLE_LABEL: Record<keyof Employees, string> = { usta: 'Usta', boyaci: 'Boyacı', satis: 'Satış elemanı' };
export const LOAN_OPTIONS = [1_000_000, 3_000_000] as const;
const LOAN_RATE = 0.01;
/** Para yetmezse bu sırayla işten ayrılırlar. */
const QUIT_ORDER: (keyof Employees)[] = ['satis', 'boyaci', 'usta'];

function spent(s: GameState, cost: number): GameState['summary'] {
  return { ...s.summary, spent: s.summary.spent + cost };
}

export type GrowthBlock = 'asama-3-degil' | 'yetersiz-para' | 'en-ust-seviye' | 'zaten-var' | 'kredi-var' | null;

export function upgradeCapacity(s: GameState): GameState | GrowthBlock {
  if (s.stage !== 3) return 'asama-3-degil';
  if (s.capacityLevel >= 3) return 'en-ust-seviye';
  const cost = CAPACITY_COST[s.capacityLevel];
  if (s.money < cost) return 'yetersiz-para';
  return { ...s, money: s.money - cost, summary: spent(s, cost), capacityLevel: (s.capacityLevel + 1) as GameState['capacityLevel'] };
}

export function upgradeLocation(s: GameState): GameState | GrowthBlock {
  if (s.stage !== 3) return 'asama-3-degil';
  if (s.locationLevel >= 2) return 'en-ust-seviye';
  const cost = LOCATION_COST[s.locationLevel];
  if (s.money < cost) return 'yetersiz-para';
  return { ...s, money: s.money - cost, summary: spent(s, cost), locationLevel: (s.locationLevel + 1) as GameState['locationLevel'] };
}

export function hire(s: GameState, role: keyof Employees): GameState | GrowthBlock {
  if (s.stage !== 3) return 'asama-3-degil';
  if (s.employees[role]) return 'zaten-var';
  if (s.money < SALARY[role]) return 'yetersiz-para';
  return { ...s, employees: { ...s.employees, [role]: true } };
}

export function fire(s: GameState, role: keyof Employees): GameState {
  return { ...s, employees: { ...s.employees, [role]: false } };
}

export function takeLoan(s: GameState, amount: number): GameState | GrowthBlock {
  if (s.stage !== 3) return 'asama-3-degil';
  if (s.loan) return 'kredi-var';
  if (!(LOAN_OPTIONS as readonly number[]).includes(amount)) return 'yetersiz-para';
  return { ...s, money: s.money + amount, loan: { principal: amount, dailyRate: LOAN_RATE } };
}

export function repayLoan(s: GameState): GameState | GrowthBlock {
  if (!s.loan) return null;
  if (s.money < s.loan.principal) return 'yetersiz-para';
  return { ...s, money: s.money - s.loan.principal, loan: null };
}

export function dailySalaries(e: Employees): number {
  return (Object.keys(SALARY) as (keyof Employees)[]).reduce((sum, r) => sum + (e[r] ? SALARY[r] : 0), 0);
}

export function applyDailyCosts(s: GameState): GameState {
  const employees = { ...s.employees };
  const notes = [...s.summary.notes];
  for (const role of QUIT_ORDER) {
    if (dailySalaries(employees) <= s.money) break;
    if (employees[role]) {
      employees[role] = false;
      notes.push(`${ROLE_LABEL[role]} maaşını alamadığı için ayrıldı`);
    }
  }
  const salaries = dailySalaries(employees);
  let money = s.money - salaries;
  let loan = s.loan;
  if (loan) {
    const interest = Math.round(loan.principal * loan.dailyRate);
    const paid = Math.min(money, interest);
    money -= paid;
    if (paid < interest) {
      loan = { ...loan, principal: loan.principal + interest - paid };
      notes.push('Faiz ödenemedi, borca eklendi');
    }
  }
  const paid = s.money - money;
  return { ...s, money, employees, loan, summary: { ...s.summary, notes, spent: s.summary.spent + paid } };
}
