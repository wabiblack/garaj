// Karakter gelişimi: iş yaptıkça tecrübe, tecrübeyle seviye, her seviyede bir yetenek puanı.
// Kişilik (oyun başında seçilir) bir yeteneği 1'den başlatır ya da tecrübeyi artırır.
import type { GameState, TalentId, Talents, TraitId } from './types';

export const TALENT_MAX = 3;
/** Yetenek seviyesi başına etki. */
export const TALENT_EFFECT: Record<TalentId, number> = { pazarlik: 0.03, goz: 0.25, tamir: 0.06, karizma: 0.02 };
export const TALENTS: Record<TalentId, { name: string; text: string }> = {
  pazarlik: { name: 'Pazarlık', text: 'Satıcılar her seviyede %3 daha aşağı iner.' },
  goz: { name: 'Göz', text: 'Ekspertiz her seviyede %25 ucuzlar; gizli kusurları daha kolay görürsün.' },
  tamir: { name: 'Tamircilik', text: 'Tamir masrafı her seviyede %6 azalır.' },
  karizma: { name: 'Karizma', text: 'Alıcılar her seviyede %2 daha yüksek teklif verir.' },
};
export const TRAITS: Record<TraitId, { name: string; story: string; talent?: TalentId; xpBonus?: number }> = {
  hesapli: { name: 'Hesaplı', story: 'Annesinden pazarda pazarlık etmeyi öğrendi.', talent: 'pazarlik' },
  dikkatli: { name: 'Dikkatli', story: 'Babası gibi her şeyi iki kez kontrol eder.', talent: 'goz' },
  tamirci: { name: 'Tamirci ruhlu', story: 'Dedesinin tezgâhının başında büyüdü.', talent: 'tamir' },
  girisken: { name: 'Girişken', story: 'Mahallede herkes onu tanır, herkesle konuşur.', talent: 'karizma' },
  caliskan: { name: 'Çalışkan', story: 'Okulda da işte de hırslı; her işten daha çok şey öğrenir.', xpBonus: 0.25 },
};
/** Tecrübe kazandıran işler. */
export const XP = { buy: 5, sale: 10, honest: 5, repair: 3, family: 10 } as const;

/** Bu seviyeye ulaşmak için gereken toplam tecrübe (seviye 1 = 0). */
export function xpForLevel(level: number): number {
  return 25 * (level - 1) * level;
}

export function levelFor(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function initialTalents(trait?: TraitId): Talents {
  const ranks: Record<TalentId, number> = { pazarlik: 0, goz: 0, tamir: 0, karizma: 0 };
  const t = trait ? TRAITS[trait]?.talent : undefined;
  if (t) ranks[t] = 1;
  return { xp: 0, level: 1, points: 0, ranks };
}

export function talentRank(s: Partial<Pick<GameState, 'talents'>>, id: TalentId): number {
  return s.talents?.ranks[id] ?? 0;
}

export function gainXp(s: GameState, amount: number): GameState {
  const bonus = (s.player.trait && TRAITS[s.player.trait]?.xpBonus) || 0;
  const xp = s.talents.xp + Math.round(amount * (1 + bonus));
  const level = levelFor(xp);
  const gained = level - s.talents.level;
  const talents = { ...s.talents, xp, level, points: s.talents.points + Math.max(0, gained) };
  if (gained <= 0) return { ...s, talents };
  const notes = [...s.summary.notes, `Seviye ${level}! Yetenek puanı kazandın (Profil)`];
  return { ...s, talents, summary: { ...s.summary, notes } };
}

export function learnTalent(s: GameState, id: TalentId): GameState | null {
  if (s.talents.points <= 0 || s.talents.ranks[id] >= TALENT_MAX) return null;
  return { ...s, talents: { ...s.talents, points: s.talents.points - 1, ranks: { ...s.talents.ranks, [id]: s.talents.ranks[id] + 1 } } };
}
