import type { Employees, GameState, Stage } from './types';
export { CAPACITY } from './negotiation';

export const CAPACITY_COST: readonly number[] = [400_000, 1_200_000, 3_000_000];
export const LOCATIONS = ['Sanayi garajı', 'Mahalle galerisi', 'Ana cadde showroom'] as const;
export const LOCATION_COST: readonly number[] = [2_500_000, 8_000_000];
export const SALARY: Record<keyof Employees, number> = { cirak: 400, usta: 3000, boyaci: 2500, satis: 3500 };
/** Çırak motor işinde (2. aşama) açılır, diğerleri galeride. */
export const ROLE_STAGE: Record<keyof Employees, Stage> = { cirak: 2, usta: 3, boyaci: 3, satis: 3 };
export const ROLE_LABEL: Record<keyof Employees, string> = { cirak: 'Çırak', usta: 'Usta', boyaci: 'Boyacı', satis: 'Satış elemanı' };
/** 4. aşama şubeleri: sırayla açılır, her biri günlük gelir ve +1 alıcı getirir. */
export const BRANCHES = [
  { city: 'İzmir', cost: 15_000_000, income: 150_000 },
  { city: 'Ankara', cost: 30_000_000, income: 300_000 },
  { city: 'Antalya', cost: 60_000_000, income: 600_000 },
] as const;

export function branchIncome(branches: number): number {
  return BRANCHES.slice(0, branches).reduce((sum, b) => sum + b.income, 0);
}

export function openBranch(s: GameState): GameState | GrowthBlock {
  if (s.stage < 4) return 'asama-4-degil';
  const next = BRANCHES[s.branches];
  if (!next) return 'en-ust-seviye';
  if (s.money < next.cost) return 'yetersiz-para';
  return { ...s, money: s.money - next.cost, summary: spent(s, next.cost), branches: s.branches + 1 };
}
/** Para yetmezse bu sırayla işten ayrılırlar. */
const QUIT_ORDER: (keyof Employees)[] = ['satis', 'boyaci', 'usta', 'cirak'];

function spent(s: GameState, cost: number): GameState['summary'] {
  return { ...s.summary, spent: s.summary.spent + cost };
}

export type GrowthBlock = 'asama-2-degil' | 'asama-3-degil' | 'asama-4-degil' | 'yetersiz-para' | 'en-ust-seviye' | 'zaten-var' | null;

export function upgradeCapacity(s: GameState): GameState | GrowthBlock {
  if (s.stage < 3) return 'asama-3-degil';
  if (s.capacityLevel >= 3) return 'en-ust-seviye';
  const cost = CAPACITY_COST[s.capacityLevel];
  if (s.money < cost) return 'yetersiz-para';
  return { ...s, money: s.money - cost, summary: spent(s, cost), capacityLevel: (s.capacityLevel + 1) as GameState['capacityLevel'] };
}

export function upgradeLocation(s: GameState): GameState | GrowthBlock {
  if (s.stage < 3) return 'asama-3-degil';
  if (s.locationLevel >= 2) return 'en-ust-seviye';
  const cost = LOCATION_COST[s.locationLevel];
  if (s.money < cost) return 'yetersiz-para';
  return { ...s, money: s.money - cost, summary: spent(s, cost), locationLevel: (s.locationLevel + 1) as GameState['locationLevel'] };
}

export function hire(s: GameState, role: keyof Employees): GameState | GrowthBlock {
  if (s.stage < ROLE_STAGE[role]) return ROLE_STAGE[role] === 2 ? 'asama-2-degil' : 'asama-3-degil';
  if (s.employees[role]) return 'zaten-var';
  if (s.money < SALARY[role]) return 'yetersiz-para';
  return { ...s, employees: { ...s.employees, [role]: true } };
}

export function fire(s: GameState, role: keyof Employees): GameState {
  return { ...s, employees: { ...s.employees, [role]: false } };
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
  const income = branchIncome(s.branches);
  if (income > 0) notes.push(`Şubelerden gelir: ${income.toLocaleString('tr-TR')} TL`);
  const money = s.money + income - salaries;
  return { ...s, money, employees, summary: { ...s.summary, notes, spent: s.summary.spent + salaries, earned: s.summary.earned + income } };
}
