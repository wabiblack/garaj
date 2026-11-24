// Oyuncunun karakteri: isim, görünüm ve kişilik. Görünüm yalnız seçenek sırası tutar; renkler UI'da.
import type { TraitId } from './types';
export interface Look {
  /** SKIN_TONES sırası */
  skin: number;
  /** HAIR_COLORS sırası */
  hair: number;
  /** FAV_COLORS sırası: şapka, ceket, tulum, kravat */
  color: number;
  /** GLASSES sırası (0 = yok) */
  glasses: number;
  /** HAIR_STYLES sırası */
  style: number;
  /** EYE_COLORS sırası */
  eyes: number;
  /** BROWS sırası */
  brows: number;
  freckles: boolean;
  /** ACCESSORIES sırası (0 = yok) */
  accessory: number;
}
export interface Player { name: string; look: Look; /** Kişilik: oyun başında seçilir. */ trait?: TraitId }

export const NAME_MAX = 14;
export const DEFAULT_NAME = 'Kerem';
export const DEFAULT_LOOK: Look = { skin: 1, hair: 0, color: 0, glasses: 0, style: 0, eyes: 0, brows: 0, freckles: false, accessory: 0 };
export const DEFAULT_PLAYER: Player = { name: DEFAULT_NAME, look: DEFAULT_LOOK };

export const SKIN_TONES: readonly [string, string][] = [
  ['#f3cfb3', '#dcae8e'],
  ['#e2a77f', '#c98a63'],
  ['#b97c55', '#9c6340'],
  ['#7f5236', '#653f28'],
];
export const HAIR_COLORS: readonly { name: string; hex: string }[] = [
  { name: 'Siyah', hex: '#2b1d16' },
  { name: 'Kahve', hex: '#5a3520' },
  { name: 'Kızıl', hex: '#a2461f' },
  { name: 'Sarı', hex: '#d9a640' },
  { name: 'Gri', hex: '#8d8f94' },
];
export const FAV_COLORS: readonly { name: string; hex: string }[] = [
  { name: 'Kırmızı', hex: '#d8452f' },
  { name: 'Mavi', hex: '#3a6db0' },
  { name: 'Yeşil', hex: '#2f9b62' },
  { name: 'Mor', hex: '#7b4bc2' },
  { name: 'Turuncu', hex: '#e7862a' },
  { name: 'Siyah', hex: '#2b2f36' },
];

export const HAIR_STYLES = ['Kısa', 'Kıvırcık', 'Uzun', 'Asker tıraşı'] as const;
export const EYE_COLORS: readonly { name: string; hex: string }[] = [
  { name: 'Kahve', hex: '#3b2516' },
  { name: 'Ela', hex: '#7a5523' },
  { name: 'Yeşil', hex: '#3f7a45' },
  { name: 'Mavi', hex: '#3a6db0' },
  { name: 'Gri', hex: '#5d6670' },
];
export const BROWS = ['İnce kaş', 'Kalın kaş'] as const;
export const GLASSES = ['Gözlüksüz', 'Yuvarlak', 'Köşeli', 'Güneş gözlüğü'] as const;
export const ACCESSORIES = ['Aksesuarsız', 'Küpe', 'Kulaklık', 'Yara bandı'] as const;
export const TRAIT_IDS = ['hesapli', 'dikkatli', 'tamirci', 'girisken', 'caliskan'] as const;

/** İsmi temizler: harf ve boşluk, en çok 14 karakter, ilk harf büyük. Boşsa Kerem. */
export function cleanName(raw: string): string {
  const s = raw.replace(/[^\p{L} ]/gu, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX).trim();
  if (!s) return DEFAULT_NAME;
  return s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1);
}

const clampIndex = (n: unknown, len: number, fallback: number) =>
  typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < len ? n : fallback;

/** Kayıttan ya da yedekten gelen karakteri doğrular; bozuk alan varsayılana döner. */
export function cleanPlayer(p: unknown): Player {
  const raw = (typeof p === 'object' && p !== null ? p : {}) as Partial<Player>;
  const look = (typeof raw.look === 'object' && raw.look !== null ? raw.look : {}) as Partial<Look>;
  const d = DEFAULT_PLAYER.look;
  return {
    name: typeof raw.name === 'string' ? cleanName(raw.name) : DEFAULT_NAME,
    look: {
      skin: clampIndex(look.skin, SKIN_TONES.length, d.skin),
      hair: clampIndex(look.hair, HAIR_COLORS.length, d.hair),
      color: clampIndex(look.color, FAV_COLORS.length, d.color),
      glasses: typeof look.glasses === 'boolean' ? (look.glasses ? 1 : 0) : clampIndex(look.glasses, GLASSES.length, d.glasses),
      style: clampIndex(look.style, HAIR_STYLES.length, d.style),
      eyes: clampIndex(look.eyes, EYE_COLORS.length, d.eyes),
      brows: clampIndex(look.brows, BROWS.length, d.brows),
      freckles: look.freckles === true,
      accessory: clampIndex(look.accessory, ACCESSORIES.length, d.accessory),
    },
    ...((TRAIT_IDS as readonly string[]).includes(raw.trait as string) ? { trait: raw.trait } : {}),
  };
}
