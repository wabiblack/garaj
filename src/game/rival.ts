import type { GameState, Listing, Season } from './types';
import type { RNG } from './rng';
import { marketValue } from './pricing';
import { itemName } from './selling';

export const RIVAL = 'Cevdet';
const EYE_CHANCE = 0.45;

/** Cevdet bazı günler en kârlı görünen ilana göz koyar (mezat hariç, en çok bir ilan). */
export function markRivalTarget(listings: Listing[], season: Season, rng: RNG): Listing[] {
  const pool = listings.filter((l) => l.special !== 'mezat');
  if (pool.length === 0 || !rng.chance(EYE_CHANCE)) return listings;
  const ratio = (l: Listing) => marketValue(l.item, season) / Math.max(1, l.askPrice);
  const best = pool.reduce((a, b) => (ratio(b) > ratio(a) ? b : a));
  return listings.map((l) => (l.id === best.id ? { ...l, rivalEye: true } : l));
}

/** Oyuncu başka bir ilanla uğraşırken Cevdet göz koyduğu ilanı kapar. */
export function rivalMove(state: GameState, actingListingId: string): { state: GameState; message: string | null } {
  const target = state.listings.find((l) => l.rivalEye && l.id !== actingListingId);
  if (!target) return { state, message: null };
  const message = `${RIVAL} “${itemName(target.item)}” ilanını senden önce kaptı`;
  return {
    state: {
      ...state,
      listings: state.listings.filter((l) => l.id !== target.id),
      stats: { ...state.stats, rivalTaken: state.stats.rivalTaken + 1 },
      summary: { ...state.summary, notes: [...state.summary.notes, message] },
    },
    message,
  };
}
