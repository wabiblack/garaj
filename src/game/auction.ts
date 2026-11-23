import type { Listing } from './types';
import { round10 } from './pricing';

export const AUCTION_BIDDERS = ['Cevdet', 'Selim Usta', 'Galerici Necmi', 'Hacı Bey'];
/** Son tekliften sonra çekiç bu kadar sürede iner (ms). */
export const HAMMER_MS = 3000;

export function startPrice(l: Listing): number {
  return l.askPrice;
}

export function auctionStep(l: Listing): number {
  return Math.max(10, round10(l.askPrice * 0.1));
}

/** Rakipler bu fiyattan bir adım yukarı çıkabilir mi? */
export function rivalsWillRaise(l: Listing, current: number): boolean {
  return current + auctionStep(l) <= (l.auctionMax ?? 0);
}
