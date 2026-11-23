// Günlük seri cihazda saklanır (oyun kaydından ayrı: yeni oyunda da sürer).
import type { Streak } from '../game/streak';

const KEY = 'garaj.seri';

export function loadStreak(): Streak | null {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? 'null') as Streak | null;
    return raw && typeof raw.last === 'string' && typeof raw.count === 'number' ? raw : null;
  } catch {
    return null;
  }
}

export function saveStreak(s: Streak): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // depolama kapalı: seri bu oturumluk kalır
  }
}
