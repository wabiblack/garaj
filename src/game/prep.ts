import { TALENT_EFFECT, talentRank } from './talents';
import type { Defect, GameState, Item } from './types';
import { round10 } from './pricing';

type PrepResult = { item: Item; cost: number } | null;

export function repairCost(defect: Defect, state: GameState): number {
  return round10(defect.repairCost * (1 - state.skill / 200) * (state.employees.usta ? 0.8 : 1) * (1 - TALENT_EFFECT.tamir * talentRank(state, 'tamir')));
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

/** Boyanabilen türler. */
export const PAINTABLE: Item['category'][] = ['araba', 'motor', 'karavan', 'tekne'];

/** quality: boya mini oyunundaki işçilik (0–1); iyi boya durumu daha çok artırır. */
export function paint(item: Item, state: GameState, quality = 1): PrepResult {
  if (!PAINTABLE.includes(item.category) || item.painted) return null;
  const q = Math.max(0, Math.min(1, quality));
  return { item: { ...item, painted: true, condition: Math.min(100, item.condition + Math.round(10 + 10 * q)) }, cost: paintCost(item, state) };
}

/** Tamir oyunu: ibre bu aralıkta durursa isabet. */
export const HIT_ZONE = [0.38, 0.62] as const;
/** İbre çizgisinin kalınlığı kadar pay: kenara değen ibre de isabet sayılır. */
export const HIT_GRACE = 0.03;
export const isHit = (pos: number, grace = 0) => pos >= HIT_ZONE[0] - grace && pos <= HIT_ZONE[1] + grace;
/** Her isabet tamiri %10 ucuzlatır (en çok 3 isabet). */
export function repairDiscount(hits: number): number {
  return Math.max(0, Math.min(3, Math.floor(Number.isFinite(hits) ? hits : 0))) * 0.1;
}

export const MAX_CARE = 5;
/** Bakım yapılabilen hayvanlar. */
export const ANIMALS: Item['category'][] = ['guvercin', 'kus', 'balik', 'kopek'];

export function careCost(item: Item): number {
  return round10(item.baseValue * 0.03);
}

export function care(item: Item): PrepResult {
  if (!ANIMALS.includes(item.category) || item.caredToday || item.careCount >= MAX_CARE) return null;
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
