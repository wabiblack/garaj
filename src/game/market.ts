// Canlı piyasa: her türün fiyat endeksi her gün biraz oynar, ortalamaya (1) doğru çekilir.
import type { Category, GameEventId, Market } from './types';
import type { RNG } from './rng';
import { CATEGORY_LABEL } from './catalog';

export const MARKET_MIN = 0.75;
export const MARKET_MAX = 1.35;
/** Tutulan geçmiş (gün). */
export const MARKET_DAYS = 30;
const PULL = 0.2;
const NOISE = 0.07;
const EVENT_PUSH: Partial<Record<GameEventId, number>> = { fuar: 0.04, durgun: -0.04 };
const NEWS_CHANCE = 0.1;
const NEWS_SHOCK = 0.12;

const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

export function initialMarket(): Market {
  return Object.fromEntries(CATEGORIES.map((c) => [c, [1]])) as Market;
}

/** Eksik türleri 1 ile tamamlar (eski kayıtlar için). */
export function fillMarket(m: Partial<Market> | undefined): Market {
  const base = initialMarket();
  for (const c of CATEGORIES) if (m?.[c]?.length) base[c] = m[c]!;
  return base;
}

export function marketIndex(m: Market | undefined, c: Category): number {
  const h = m?.[c];
  return h && h.length > 0 ? h[h.length - 1] : 1;
}

/** Son günün değişimi (0.05 = %5 artış). */
export function marketChange(m: Market | undefined, c: Category): number {
  const h = m?.[c];
  if (!h || h.length === 0) return 0;
  return h[h.length - 1] / (h.length > 1 ? h[h.length - 2] : 1) - 1;
}

const clamp = (x: number) => Math.min(MARKET_MAX, Math.max(MARKET_MIN, x));

/** Bir gün ilerletir. Dünün olayı (fuar/durgun) bütün piyasayı iter; arada bir tek türü haber sarsar. */
export function stepMarket(m: Market, rng: RNG, event: GameEventId | null): { market: Market; note: string | null } {
  const push = (event && EVENT_PUSH[event]) || 0;
  const news = rng.chance(NEWS_CHANCE) ? { c: rng.pick(CATEGORIES), up: rng.chance(0.5) } : null;
  const market = {} as Market;
  for (const c of CATEGORIES) {
    const cur = marketIndex(m, c);
    let next = cur + PULL * (1 - cur) + rng.range(-NOISE, NOISE) + push;
    if (news?.c === c) next += news.up ? NEWS_SHOCK : -NEWS_SHOCK;
    market[c] = [...(m[c] ?? []), Math.round(clamp(next) * 1000) / 1000].slice(-MARKET_DAYS);
  }
  const note = news ? `Piyasa haberi: ${CATEGORY_LABEL[news.c].toLocaleLowerCase('tr-TR')} fiyatları ${news.up ? 'yükseliyor' : 'düşüyor'}` : null;
  return { market, note };
}
