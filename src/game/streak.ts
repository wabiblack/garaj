import type { Stage } from './types';
import { QUEST_REWARD } from './career';

export interface Streak { last: string; count: number }
/** Ödül en çok bu kadar günlük seride artar. */
export const STREAK_CAP = 5;

/** Yerel tarih (YYYY-AA-GG). */
export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function prevDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d - 1));
}

/** Bugün açılışı seriye işler. `fresh` yalnız bugün ilk açılışta true. */
export function nextStreak(prev: Streak | null, today: string): { streak: Streak; fresh: boolean } {
  if (prev?.last === today) return { streak: prev, fresh: false };
  const count = prev && prev.last === prevDay(today) ? prev.count + 1 : 1;
  return { streak: { last: today, count }, fresh: true };
}

/** Seri ödülü: ilk gün yok, sonra görev ödülünün beşte biri kadar artar. */
export function streakBonus(stage: Stage, count: number): number {
  if (count < 2) return 0;
  return Math.round((QUEST_REWARD[stage] * Math.min(count, STREAK_CAP)) / STREAK_CAP);
}
