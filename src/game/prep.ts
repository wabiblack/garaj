import type { Defect, GameState, Item } from './types';
import { round10 } from './pricing';

type PrepResult = { item: Item; cost: number } | null;

export function repairCost(defect: Defect, state: GameState): number {
  return round10(defect.repairCost * (1 - state.skill / 200) * (state.employees.usta ? 0.8 : 1));
}

export function repair(item: Item, defectId: string, state: GameState): PrepResult {
  const defect = item.defects.find((d) => d.id === defectId);
  if (!defect || !defect.known) return null;
  return { item: { ...item, defects: item.defects.filter((d) => d.id !== defectId) }, cost: repairCost(defect, state) };
}

export function cleanCost(item: Item): number {
  return round10(item.baseValue * 0.02);
}

export function clean(item: Item): PrepResult {
  if (item.cleaned) return null;
  return { item: { ...item, cleaned: true, condition: Math.min(100, item.condition + 10) }, cost: cleanCost(item) };
}

export function paintCost(item: Item, state: GameState): number {
  return round10(item.baseValue * 0.06 * (state.employees.boyaci ? 0.7 : 1));
}

export function paint(item: Item, state: GameState): PrepResult {
  if (item.category !== 'araba' || item.painted) return null;
  return { item: { ...item, painted: true, condition: Math.min(100, item.condition + 20) }, cost: paintCost(item, state) };
}

/** Tamir oyunu: ibre bu aralıkta durursa isabet. */
export const HIT_ZONE = [0.38, 0.62] as const;
export const isHit = (pos: number) => pos >= HIT_ZONE[0] && pos <= HIT_ZONE[1];
/** Her isabet tamiri %10 ucuzlatır (en çok 3 isabet). */
export function repairDiscount(hits: number): number {
  return Math.max(0, Math.min(3, Math.floor(Number.isFinite(hits) ? hits : 0))) * 0.1;
}

export const MAX_CARE = 5;

export function careCost(item: Item): number {
  return round10(item.baseValue * 0.03);
}

export function care(item: Item): PrepResult {
  if (item.category !== 'guvercin' || item.caredToday || item.careCount >= MAX_CARE) return null;
  return {
    item: {
      ...item,
      baseValue: round10(item.baseValue * 1.05),
      condition: Math.min(100, item.condition + 5),
      careCount: item.careCount + 1,
      caredToday: true,
    },
    cost: careCost(item),
  };
}
