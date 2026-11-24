// Hayatın kendisi: ehliyet sınavı, okul karnesi ve 18 yaşta meslek seçimi.
import type { CareerId, GameState, Stage } from './types';
import { isSchoolWeek, weekOfYear } from './calendar';
import { ADULT_AGE } from './calendar';

export interface ExamQuestion { q: string; options: string[]; answer: number }

/** Ehliyet sınavı soruları: 2 = motor (16 yaş), 3 = araba (18 yaş). */
export const EXAMS: Record<2 | 3, ExamQuestion[]> = {
  2: [
    { q: 'Motorla trafiğe çıkarken kask takmak…', options: ['Zorunludur', 'Yalnız şehir dışında gerekir', 'İsteğe bağlıdır'], answer: 0 },
    { q: 'Sarı ışık yandığında ne yapılır?', options: ['Hızlanıp geçilir', 'Durmaya hazırlanılır', 'Korna çalınır'], answer: 1 },
    { q: 'Yaya geçidinde karşıya geçen biri varsa…', options: ['Korna çalınır', 'Hızla geçilir', 'Durulur, yol verilir'], answer: 2 },
    { q: 'Öndeki araçla aradaki takip mesafesi neden önemlidir?', options: ['Ani frende durabilmek için', 'Yakıt tasarrufu için', 'Şeritte kalmak için'], answer: 0 },
    { q: 'Yağmurlu havada motor kullanırken…', options: ['Hız artırılır', 'Hız düşürülür, fren yumuşak yapılır', 'Farlar kapatılır'], answer: 1 },
  ],
  3: [
    { q: 'Emniyet kemerini kimler takmalıdır?', options: ['Yalnız sürücü', 'Yalnız ön koltuktakiler', 'Araçtaki herkes'], answer: 2 },
    { q: 'Şehir içinde otomobil için genel hız sınırı?', options: ['50 km/s', '90 km/s', '120 km/s'], answer: 0 },
    { q: 'Siren çalan ambulans arkadan geliyorsa…', options: ['Hızlanılır', 'Sağa çekilip yol verilir', 'Önünde gidilir'], answer: 1 },
    { q: 'Alkollü araç kullanmak…', options: ['Az içince serbesttir', 'Gece serbesttir', 'Yasaktır ve çok tehlikelidir'], answer: 2 },
    { q: 'Araç kullanırken telefonla mesajlaşmak…', options: ['Kırmızı ışıkta serbesttir', 'Yasaktır', 'Yavaş giderken serbesttir'], answer: 1 },
  ],
};
/** Sınavı geçmek için gereken doğru sayısı (3 sorudan). */
export const EXAM_PASS = 2;

/** Bu haftanın sınav soruları (haftaya göre değişir). */
export function examFor(stage: 2 | 3, day: number): ExamQuestion[] {
  const pool = EXAMS[stage];
  return [0, 1, 2].map((k) => pool[(day + k * 2) % pool.length]);
}

/** Sınavda kalınca geçiş bir hafta ertelenir. */
export function failExam(s: GameState): GameState {
  return { ...s, pendingTransition: null, examRetry: s.day + 1 };
}

/** Karne dönemleri: yarıyıl (4. hafta) ve yıl sonu (24. hafta). */
const REPORT_WEEKS = [4, 24];
export type Grade = 'Pekiyi' | 'İyi' | 'Orta';

/** Okul haftalarında haftada ortalama kaç iş yaptın: az iş, iyi not. */
export function gradeFor(term: { weeks: number; used: number }): Grade {
  const avg = term.weeks ? term.used / term.weeks : 0;
  return avg <= 2.5 ? 'Pekiyi' : avg <= 3.5 ? 'İyi' : 'Orta';
}
const GRADE_TRUST: Record<Grade, number> = { Pekiyi: 10, İyi: 5, Orta: -5 };

/** Biten haftayı döneme yazar; karne haftasıysa notu verir. Yalnız reşit olmayana. */
export function settleSchool(s: GameState): GameState {
  if (s.age >= ADULT_AGE || !isSchoolWeek(s.day)) return s;
  const term = { weeks: s.term.weeks + 1, used: s.term.used + s.used };
  if (!REPORT_WEEKS.includes(weekOfYear(s.day))) return { ...s, term };
  const grade = gradeFor(term);
  const trust = Math.max(0, Math.min(100, s.family.trust + GRADE_TRUST[grade]));
  const text = grade === 'Orta' ? 'ailen biraz üzüldü' : 'ailen gurur duydu';
  return {
    ...s, term: { weeks: 0, used: 0 }, family: { ...s.family, trust },
    summary: { ...s.summary, notes: [...s.summary.notes, `Karne günü: ${grade}! ${text[0].toUpperCase()}${text.slice(1)}`] },
  };
}

/** 18 yaşta meslek seçimi: bir yeteneği artırır ya da bir puan verir. */
export const CAREERS: Record<CareerId, { name: string; text: string; talent?: 'tamir' | 'pazarlik' | 'karizma' }> = {
  otomotiv: { name: 'Otomotiv bölümü', text: 'Meslek yüksekokulunda motor ve kaporta okursun: Tamircilik +1.', talent: 'tamir' },
  isletme: { name: 'İşletme', text: 'Hesap kitap, ticaret öğrenirsin: Pazarlık +1.', talent: 'pazarlik' },
  iletisim: { name: 'Halkla ilişkiler', text: 'İnsanlarla konuşmayı öğrenirsin: Karizma +1.', talent: 'karizma' },
  calis: { name: 'Doğrudan işe atıl', text: 'Okumaz, tam gün çalışırsın: 1 yetenek puanı.' },
};

export function chooseCareer(s: GameState, id: CareerId): GameState | null {
  if (s.player.career || s.age < ADULT_AGE) return null;
  const c = CAREERS[id];
  const talents = c.talent
    ? { ...s.talents, ranks: { ...s.talents.ranks, [c.talent]: Math.min(3, s.talents.ranks[c.talent] + 1) } }
    : { ...s.talents, points: s.talents.points + 1 };
  return { ...s, talents, player: { ...s.player, career: id } };
}

/** Bu aşamaya geçerken ehliyet sınavı var mı. */
export const needsExam = (stage: Stage): stage is 2 | 3 => stage === 2 || stage === 3;
