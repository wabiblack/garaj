// Takvim: her tur bir ay. Oyun haziranda (yaz tatilinde) başlar; 12 ayda bir yaş büyür.
import type { GameState, Season } from './types';

export const PERIODS_PER_YEAR = 12;
/** Oyunun ilk ayı (1 = ocak): haziran. */
export const START_MONTH = 6;
/** Oyunun başladığı yıl (yalnız tarih göstermek için). */
export const START_YEAR = 2026;
export const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'] as const;
const MONTH_SEASON: Season[] = ['kis', 'kis', 'ilkbahar', 'ilkbahar', 'ilkbahar', 'yaz', 'yaz', 'yaz', 'sonbahar', 'sonbahar', 'sonbahar', 'kis'];
/** Yaz tatili ayları: haziran, temmuz, ağustos. */
const HOLIDAY = [6, 7, 8];
/** Okul aylarında reşit olmayanın aylık iş hakkı. */
export const SCHOOL_ACTIONS = 6;
export const ADULT_AGE = 18;

/** Turun yılın kaçıncı ayı olduğu (1–12). */
export function monthOfYear(day: number): number {
  return ((day - 1 + START_MONTH - 1) % PERIODS_PER_YEAR) + 1;
}

export function monthOf(day: number): (typeof MONTHS)[number] {
  return MONTHS[monthOfYear(day) - 1];
}

export function yearOf(day: number): number {
  return START_YEAR + Math.floor((day - 1 + START_MONTH - 1) / PERIODS_PER_YEAR);
}

/** "Haziran 2026" */
export function dateLabel(day: number): string {
  return `${monthOf(day)} ${yearOf(day)}`;
}

export function seasonOf(day: number): Season {
  return MONTH_SEASON[monthOfYear(day) - 1];
}

/** Okul ayı mı: yaz tatili (haziran–ağustos) dışındaki aylar. */
export function isSchoolMonth(day: number): boolean {
  return !HOLIDAY.includes(monthOfYear(day));
}

/** Bir sonraki doğum gününe kalan ay (doğum günü, oyuna başlanan ayın yıl dönümü). */
export function monthsToBirthday(day: number): number {
  return PERIODS_PER_YEAR * Math.ceil(day / PERIODS_PER_YEAR) + 1 - day;
}

/** Bu tur doğum günü mü (oyunun ilk turu hariç). */
export function isBirthday(day: number): boolean {
  return day > 1 && (day - 1) % PERIODS_PER_YEAR === 0;
}

/** Bu ay kalan iş hakkı: okul aylarında reşit olmayana sınırlı, yoksa sınırsız. */
export function actionsLeft(s: Pick<GameState, 'age' | 'day' | 'used'>): number {
  if (s.age >= ADULT_AGE || !isSchoolMonth(s.day)) return Infinity;
  return Math.max(0, SCHOOL_ACTIONS - (s.used ?? 0));
}
