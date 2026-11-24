import type { Item, Season } from './types';

const SEASONS: Season[] = ['ilkbahar', 'yaz', 'sonbahar', 'kis'];

export function seasonForDay(day: number): Season {
  return SEASONS[Math.floor((day - 1) / 10) % 4];
}

export function round10(x: number): number {
  return Math.round(x / 10) * 10;
}

/** Türe göre mevsim etkisi: yazın bisiklet ve motor aranır, kışın ucuzlar. */
export const CATEGORY_SEASON: Partial<Record<Item['category'], Partial<Record<Season, number>>>> = {
  bisiklet: { yaz: 1.15, kis: 0.85 },
  motor: { yaz: 1.1, kis: 0.9 },
};

function seasonFactor(item: Item, season: Season): number {
  if (item.tags.includes('klasik')) return 1;
  const cat = CATEGORY_SEASON[item.category]?.[season];
  if (cat) return cat;
  if (item.tags.includes('4x4')) return season === 'kis' ? 1.2 : season === 'yaz' ? 0.9 : 1;
  if (item.tags.includes('cabrio')) return season === 'yaz' ? 1.2 : season === 'kis' ? 0.85 : 1;
  return 1;
}

function value(item: Item, season: Season, onlyKnown: boolean, index: number): number {
  const defectFactor = item.defects
    .filter((d) => !onlyKnown || d.known)
    .reduce((f, d) => f * (1 - d.valueHit), 1);
  return round10(item.baseValue * (0.4 + (0.6 * item.condition) / 100) * seasonFactor(item, season) * defectFactor * index);
}

/** Alıcının gördüğü değer: yalnız bilinen kusurlar düşülür. index: türün piyasa endeksi. */
export function marketValue(item: Item, season: Season, index = 1): number {
  return value(item, season, true, index);
}

/** Gerçek değer: tüm kusurlar düşülür. */
export function trueValue(item: Item, season: Season, index = 1): number {
  return value(item, season, false, index);
}
