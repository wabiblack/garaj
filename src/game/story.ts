import type { GameState, Stage, StoryId } from './types';
import type { RNG } from './rng';

export interface StoryChoice { label: string; money?: number; reputation?: number; skill?: number; note: string }
export interface Story { stage: Stage; who: string; text: string; choices: StoryChoice[] }

/** Aşamalara göre kısa hayat sahneleri. Her biri bir kez çıkar. */
export const STORIES: Record<StoryId, Story> = {
  okul: {
    stage: 1, who: 'Öğretmen Nermin Hanım',
    text: 'Kerem, karne yaklaşıyor. Bu hafta pazara gideceğine biraz ders çalışsan?',
    choices: [
      { label: 'Derse çalış', reputation: 3, note: 'Ders çalıştın; mahallede “akıllı çocuk” diye anılıyorsun' },
      { label: 'Pazara git', money: 300, note: 'Pazarda ufak bir iş çevirdin' },
    ],
  },
  kardes: {
    stage: 1, who: 'Küçük kardeşin Ela',
    text: 'Abi, okul gezisine gitmek istiyorum ama annemde para yok…',
    choices: [
      { label: 'Gezi parasını ver (500 TL)', money: -500, reputation: 6, note: 'Ela geziye gitti; komşular duydu' },
      { label: 'Şimdi olmaz', note: 'Ela biraz küstü' },
    ],
  },
  dede: {
    stage: 1, who: 'Deden',
    text: 'Gençken ben de at alıp satardım. Sana bir sır vereyim mi: malın kusurunu saklayan, müşterisini kaybeder.',
    choices: [
      { label: 'Dinle, not al', reputation: 4, note: 'Dedenin öğüdünü aklına yazdın' },
      { label: 'Harçlık iste', money: 400, note: 'Deden gülüp harçlık verdi' },
    ],
  },
  ehliyet: {
    stage: 2, who: 'Trafik polisi',
    text: 'Delikanlı, motor ehliyetin var mı? Bu sefer uyarıyorum.',
    choices: [
      { label: 'Kursa yazıl (8.000 TL)', money: -8000, reputation: 5, note: 'Motor ehliyetini aldın' },
      { label: 'Boş ver', reputation: -6, note: 'Ehliyetsiz motorcu diye laf çıktı' },
    ],
  },
  cirak: {
    stage: 2, who: 'Sanayiden Rıza Usta',
    text: 'Elin yatkın. Hafta sonları dükkâna gel, sana motor açmayı öğreteyim.',
    choices: [
      { label: 'Çırak ol', skill: 15, money: -3000, note: 'Rıza Usta’dan tamir öğrendin (hafta sonu kazancın gitti)' },
      { label: 'Teşekkür et', note: 'Rıza Usta “kapım açık” dedi' },
    ],
  },
  'amca-borc': {
    stage: 3, who: 'Amcan',
    text: 'Garaj artık senin. Ama sanayideki yedek parçacıya eski bir borcum kaldı…',
    choices: [
      { label: 'Borcu kapat (150.000 TL)', money: -150000, reputation: 10, note: 'Amcanın borcunu kapattın; sanayide adın temiz' },
      { label: 'Sonra bakarız', reputation: -5, note: 'Parçacı amcanın borcunu herkese anlattı' },
    ],
  },
  dugun: {
    stage: 3, who: 'Kuzenin Burak',
    text: 'Düğünüm var! Gelin arabası olarak galeriden bir araba verir misin?',
    choices: [
      { label: 'Bedava ver', reputation: 8, money: -20000, note: 'Düğünde herkes galerini sordu (temizlik masrafı)' },
      { label: 'Kiraya ver', money: 40000, reputation: -3, note: 'Kuzenine araba kiraladın; aile biraz bozuldu' },
    ],
  },
  vergi: {
    stage: 3, who: 'Vergi müfettişi',
    text: 'Galerinizin defterlerini incelememiz gerekiyor.',
    choices: [
      { label: 'Muhasebeci tut (60.000 TL)', money: -60000, reputation: 5, note: 'Defterler tertemiz çıktı' },
      { label: 'Kendin hallet', reputation: -4, money: -20000, note: 'Eksik evrak için ceza yedin' },
    ],
  },
  'cevdet-ortak': {
    stage: 3, who: 'Rakibin Cevdet',
    text: 'Kerem, mahalleden beri yarışıyoruz. Gel ortak olalım; payına 300.000 TL veririm.',
    choices: [
      { label: 'Parayı al, ortak ol', money: 300000, reputation: -5, note: 'Cevdet’le ortak oldun; müşteriler kafası karıştı' },
      { label: 'Kendi yolumdan giderim', reputation: 6, note: 'Bağımsız kaldın; sanayi seni takdir etti' },
    ],
  },
  roportaj: {
    stage: 4, who: 'Ekonomi gazetesi',
    text: 'Bisikletten holdinge… Okurlarımız hikâyenizi merak ediyor.',
    choices: [
      { label: 'Röportaj ver', reputation: 5, note: 'Hikâyen gazetede manşet oldu' },
      { label: 'Burs fonu kur (1.000.000 TL)', money: -1000000, reputation: 10, note: 'Mahallendeki çocuklar için burs fonu kurdun' },
    ],
  },
};

const STORY_CHANCE = 0.35;

export function pickStory(state: GameState, rng: RNG): StoryId | null {
  if (state.story.pending) return null;
  const free = (Object.keys(STORIES) as StoryId[]).filter((id) => STORIES[id].stage === state.stage && !state.story.seen.includes(id));
  if (free.length === 0 || !rng.chance(STORY_CHANCE)) return null;
  return free[0];
}

export function canChoose(state: GameState, choice: StoryChoice): boolean {
  return state.money + (choice.money ?? 0) >= 0;
}

export function applyStoryChoice(state: GameState, index: number): GameState | null {
  const id = state.story.pending;
  const choice = id ? STORIES[id].choices[index] : undefined;
  if (!id || !choice || !canChoose(state, choice)) return null;
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const money = choice.money ?? 0;
  return {
    ...state,
    money: state.money + money,
    reputation: clamp(state.reputation + (choice.reputation ?? 0)),
    skill: clamp(state.skill + (choice.skill ?? 0)),
    story: { seen: [...state.story.seen, id], pending: null },
    summary: {
      ...state.summary,
      notes: [...state.summary.notes, choice.note],
      ...(money < 0 ? { spent: state.summary.spent - money } : money > 0 ? { earned: state.summary.earned + money } : {}),
    },
  };
}
