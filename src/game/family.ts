// Aile: anne-babanın verdiği küçük sorumluluklar, güven, haftalık harçlık ve reşit olmayana aileden borç.
// Ana hedefin (al-tamir et-sat-büyü) yanında küçük bir yan katman; oyunu kilitlemez.
import type { FamilyTask, FamilyTaskKind, GameState, Stage } from './types';
import type { RNG } from './rng';
import { formatTL } from './format';
import { ADULT_AGE } from './bank';
import { XP, gainXp } from './talents';

export const FAMILY_START: GameState['family'] = { trust: 60, task: null, debt: 0, debtDays: 0 };
export const TRUST_GAIN = 8;
export const TRUST_LOSS = 10;
export const DEBT_TRUST_LOSS = 15;
/** Harçlık her ay. */
export const ALLOWANCE_EVERY = 1;
export const FAMILY_MIN_TRUST = 50;
export const FAMILY_DEBT_DAYS = 2;
const TASK_DAYS = 2;
const TASK_CHANCE_MINOR = 0.35;
const TASK_CHANCE_ADULT = 0.1;
const ALLOWANCE: Record<Stage, number> = { 1: 400, 2: 4000, 3: 0, 4: 0 };
const FAMILY_LIMIT: Record<Stage, number> = { 1: 2000, 2: 20000, 3: 0, 4: 0 };
const TASK_MONEY: Record<Stage, number> = { 1: 200, 2: 2000, 3: 20000, 4: 200000 };

export type FamilyBlock = 'yetersiz-para' | 'resit' | 'guven-dusuk' | 'borc-var' | 'limit-asimi' | null;

const clampTrust = (t: number) => Math.max(0, Math.min(100, t));
const minor = (s: GameState) => s.age < ADULT_AGE;
const WHO = { anne: 'Annen', baba: 'Baban' } as const;

function makeTask(kind: FamilyTaskKind, stage: Stage): FamilyTask {
  const amount = TASK_MONEY[stage];
  switch (kind) {
    case 'katki': return { kind, from: 'baba', title: 'Eve katkı', text: `Bu ay masraflar çok. Eve ${formatTL(amount)} katkı verebilir misin?`, amount, daysLeft: TASK_DAYS };
    case 'kardes': return { kind, from: 'anne', title: 'Kardeşinin gezisi', text: `Kardeşinin okul gezisi var. ${formatTL(amount)} ile yardım eder misin?`, amount, daysLeft: TASK_DAYS };
    case 'ders': return { kind, from: 'baba', title: 'Sınav dönemi', text: 'Derslerine odaklan: bu ay en çok 1 şey al.', daysLeft: TASK_DAYS };
    case 'duzen': return { kind, from: 'anne', title: 'Garajı topla', text: 'Garaj çok dağınık. Ay sonunda depoda en çok 1 eşya kalsın.', daysLeft: TASK_DAYS };
  }
}

/** Bu hafta verilecek harçlık (yalnız reşit olmayana, her ALLOWANCE_EVERY günde bir). */
export function allowance(s: GameState): number {
  if (!minor(s) || s.day % ALLOWANCE_EVERY !== 0) return 0;
  return Math.round((ALLOWANCE[s.stage] * s.family.trust) / 100 / 10) * 10;
}

/** Ailenin verebileceği en çok borç: yalnız reşit olmayana, güven yeterliyse. */
export function familyLimit(s: GameState): number {
  if (!minor(s) || s.family.trust < FAMILY_MIN_TRUST) return 0;
  return Math.floor((FAMILY_LIMIT[s.stage] * s.family.trust) / 100 / 100) * 100;
}

export function familyPay(s: GameState): GameState | FamilyBlock {
  const task = s.family.task;
  if (!task || task.amount === undefined) return null;
  if (s.money < task.amount) return 'yetersiz-para';
  return gainXp({
    ...s, money: s.money - task.amount,
    family: { ...s.family, task: null, trust: clampTrust(s.family.trust + TRUST_GAIN) },
    summary: { ...s.summary, spent: s.summary.spent + task.amount },
  }, XP.family);
}

export function familyBorrow(s: GameState, amount: number): GameState | FamilyBlock {
  if (!minor(s)) return 'resit';
  if (s.family.trust < FAMILY_MIN_TRUST) return 'guven-dusuk';
  if (s.family.debt > 0) return 'borc-var';
  if (!Number.isFinite(amount) || amount <= 0 || amount > familyLimit(s)) return 'limit-asimi';
  return { ...s, money: s.money + amount, family: { ...s.family, debt: amount, debtDays: FAMILY_DEBT_DAYS } };
}

export function familyRepay(s: GameState): GameState | FamilyBlock {
  if (s.family.debt <= 0) return null;
  if (s.money < s.family.debt) return 'yetersiz-para';
  return { ...s, money: s.money - s.family.debt, family: { ...s.family, debt: 0, debtDays: 0 } };
}

/** Biten günün sonunda: görev kontrolü, harçlık, borç vadesi, yeni görev. */
export function settleFamily(s: GameState, rng: RNG): GameState {
  const notes = [...s.summary.notes];
  let { trust, task, debt, debtDays } = s.family;
  let money = s.money;
  const hadTask = task !== null;
  let earned = false;

  if (task) {
    const done = (task.kind === 'ders' && s.summary.bought <= 1) || (task.kind === 'duzen' && s.inventory.length <= 1);
    if (done) {
      trust += TRUST_GAIN;
      notes.push(`${WHO[task.from]} memnun: “${task.title}” tamam`);
      earned = true;
      task = null;
    } else if (task.daysLeft <= 1) {
      trust -= TRUST_LOSS;
      notes.push(`${WHO[task.from]} kırıldı: “${task.title}” yapılmadı`);
      task = null;
    } else task = { ...task, daysLeft: task.daysLeft - 1 };
  }

  const pocket = allowance(s);
  if (pocket > 0) {
    money += pocket;
    notes.push(`Aylık harçlık: ${formatTL(pocket)}`);
  }

  if (debt > 0) {
    debtDays -= 1;
    if (debtDays <= 0) {
      const paid = Math.min(money, debt);
      money -= paid;
      debt -= paid;
      if (debt > 0) {
        trust -= DEBT_TRUST_LOSS;
        debtDays = 3;
        notes.push(`Aileye borcun ödenmedi: ${formatTL(debt)} kaldı, güven düştü`);
      } else notes.push('Aileye borcun kapandı');
    }
  }

  if (!hadTask && rng.chance(minor(s) ? TASK_CHANCE_MINOR : TASK_CHANCE_ADULT)) {
    const kinds: FamilyTaskKind[] = minor(s) ? ['katki', 'kardes', 'ders', 'duzen'] : ['katki', 'kardes'];
    task = makeTask(rng.pick(kinds), s.stage);
    notes.push(`${WHO[task.from]} bir şey istiyor: ${task.title}`);
  }

  const next = { ...s, money, family: { trust: clampTrust(trust), task, debt, debtDays }, summary: { ...s.summary, notes } };
  return earned ? gainXp(next, XP.family) : next;
}
