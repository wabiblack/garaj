import type { Category, GameState, Listing } from './types';
import { round10 } from './pricing';

/** Her 5 satış bir uzmanlık seviyesi; en çok 3. */
export const EXPERT_STEP = 5;
export const EXPERT_MAX = 3;
/** Seviye başına satıcının inebileceği en düşük fiyattaki indirim. */
export const EXPERT_DISCOUNT = 0.04;
/** Zor modda satıcılar bu kadar daha sert. */
export const HARD_SELLER = 1.1;

export function expertLevel(state: Pick<GameState, 'stats'>, category: Category): number {
  return Math.min(EXPERT_MAX, Math.floor((state.stats.categorySales[category] ?? 0) / EXPERT_STEP));
}

/** Uzmanlık ve zor moda göre satıcının en düşük fiyatını ayarlar (mezat hariç). */
export function adjustListing(listing: Listing, ctx: Partial<Pick<GameState, 'stats' | 'hard'>>): Listing {
  if (listing.special === 'mezat') return listing;
  const level = ctx.stats ? expertLevel({ stats: ctx.stats }, listing.item.category) : 0;
  const factor = (ctx.hard ? HARD_SELLER : 1) * (1 - EXPERT_DISCOUNT * level);
  if (factor === 1) return listing;
  return { ...listing, minPrice: Math.min(listing.askPrice, round10(listing.minPrice * factor)) };
}
