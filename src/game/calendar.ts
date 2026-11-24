// Takvim: her tur bir hafta. Oyun haziran sonunda (yaz tatilinde) başlar; 52 haftada bir yaş büyür.
import type { GameState, Season } from './types';

export const WEEKS_PER_YEAR = 52;
/** Oyunun ilk haftası, yılın kaçıncı haftası (haziran sonu). */
export const START_WEEK = 25;
export const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'] as const;
const MONTH_SEASON: Season[] = ['kis', 'kis', 'ilkbahar', 'ilkbahar', 'ilkbahar', 'yaz', 'yaz', 'yaz', 'sonbahar', 'sonbahar', 'sonbahar', 'kis'];
/** Okul haftalarında reşit olmayanın haftalık iş hakkı. */
export const SCHOOL_ACTIONS = 4;
export const ADULT_AGE = 18;

/** Turun yılın kaçıncı haftası olduğu (1–52). */
export function weekOfYear(day: number): number {
  return ((day - 1 + START_WEEK - 1) % WEEKS_PER_YEAR) + 1;
}

function monthIndex(day: number): number {
  return Math.min(11, Math.floor(((weekOfYear(day) - 1) * 12) / WEEKS_PER_YEAR));
}

export function monthOf(day: number): (typeof MONTHS)[number] {
  return MONTHS[monthIndex(day)];
}

export function seasonOfWeek(day: number): Season {
  return MONTH_SEASON[monthIndex(day)];
}

/**
 * Okul haftası mı: ocak (yılbaşı haftası hariç), yarıyıl tatili (şubat başı) hariç haziran ortasına kadar
 * ve eylülün ikinci haftasından aralık sonuna kadar. Yaz tatili ve yılbaşı serbest.
 */
export function isSchoolWeek(day: number): boolean {
  const w = weekOfYear(day);
  return (w >= 2 && w <= 4) || (w >= 7 && w <= 24) || (w >= 37 && w <= 51);
}

/** Bir sonraki doğum gününe kalan hafta (doğum günü, oyuna başlanan haftanın yıl dönümü). */
export function weeksToBirthday(day: number): number {
  return WEEKS_PER_YEAR * Math.ceil(day / WEEKS_PER_YEAR) + 1 - day;
}

/** Bu tur doğum günü mü (oyunun ilk turu hariç). */
export function isBirthday(day: number): boolean {
  return day > 1 && (day - 1) % WEEKS_PER_YEAR === 0;
}

/** Bu hafta kalan iş hakkı: okul haftasında reşit olmayana sınırlı, yoksa sınırsız. */
export function actionsLeft(s: Pick<GameState, 'age' | 'day' | 'used'>): number {
  if (s.age >= ADULT_AGE || !isSchoolWeek(s.day)) return Infinity;
  return Math.max(0, SCHOOL_ACTIONS - (s.used ?? 0));
}
