// İlk oyun öğreticisi: al → hazırla → sat → günü bitir → teklifi kabul et.
// Adım oyunun durumundan çıkar; kapatılınca cihazda hatırlanır.
import type { GameState } from '../game/types';
import type { Tab } from './components/TabBar';

const KEY = 'garaj.rehber';
/** Bu günden sonra öğretici kendiliğinden kaybolur. */
export const TUTORIAL_DAYS = 5;

export const TUTORIAL_STEPS: { id: string; text: string; tab?: Tab; endDay?: boolean }[] = [
  { id: 'al', text: 'Bir ilana dokun, istenenin altında teklif ver.', tab: 'ilanlar' },
  { id: 'hazirla', text: 'Garaj’a geç ve aldığın eşyayı temizle. Kusuru varsa tamir et.', tab: 'garaj' },
  { id: 'sat', text: 'Garaj’da “Satışa koy”a bas, fiyatını belirle.', tab: 'garaj' },
  { id: 'gun', text: 'Sağ üstten “Haftayı bitir”e bas; hafta sonu alıcılar teklif getirir.', endDay: true },
  { id: 'teklif', text: 'Gelen teklifi kabul et ya da karşı teklif ver.' },
];

export function tutorialDismissed(): boolean {
  try {
    return window.localStorage.getItem(KEY) === 'bitti';
  } catch {
    return false;
  }
}

export function dismissTutorial(): void {
  try {
    window.localStorage.setItem(KEY, 'bitti');
  } catch {
    // depolama kapalı: öğretici bu oturumluk kapanır
  }
}

/** Oyuncunun şu anki öğretici adımı (0'dan); öğretici bittiyse null. */
export function tutorialStep(state: GameState): number | null {
  if (state.hard || state.stats.sales > 0 || state.day > TUTORIAL_DAYS) return null;
  if (state.phase === 'evening') return 4;
  if (state.forSale.length > 0) return 3;
  if (state.inventory.length === 0) return 0;
  return state.inventory.some((i) => i.cleaned) ? 2 : 1;
}
