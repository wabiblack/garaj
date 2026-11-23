// İlk oyun rehberi: ilk 3 günde duruma göre tek ipucu gösterir. Kapatılınca cihazda hatırlanır.
import type { GameState } from '../game/types';

const KEY = 'garaj.rehber';
export const COACH_DAYS = 3;

export function coachDismissed(): boolean {
  try {
    return window.localStorage.getItem(KEY) === 'bitti';
  } catch {
    return false;
  }
}

export function dismissCoach(): void {
  try {
    window.localStorage.setItem(KEY, 'bitti');
  } catch {
    // depolama kapalı: rehber bu oturumluk kapanır
  }
}

/** Oyuncunun bir sonraki adımı için ipucu; rehber bittiyse null. */
export function coachTip(state: GameState): string | null {
  if (state.stage !== 1 || state.day > COACH_DAYS || state.hard) return null;
  if (state.stats.sales > 0 && state.day > 1) return null;
  if (state.forSale.length > 0) return 'Satışa koydun. Sağ üstten “Günü bitir”e bas: akşam alıcılar teklif getirir.';
  if (state.inventory.length > 0) return 'Garaj sekmesine geç. Temizle, kusurunu tamir et, sonra satışa koy.';
  return 'Bir ilana dokun. İstenenin altında teklif ver; satıcı kabul etmezse karşı teklif yapar.';
}
