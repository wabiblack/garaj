// Ses (Web Audio ile üretilir, dosya yok) ve titreşim. Ayar cihazda saklanır.
const KEY = 'garaj.ses';

export function isSoundOn(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== 'kapali';
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean): void {
  try {
    window.localStorage.setItem(KEY, on ? 'acik' : 'kapali');
  } catch {
    // depolama kapalı: ayar bu oturumluk kalır
  }
}

export type Cue = 'coin' | 'deal' | 'error' | 'achievement' | 'hammer' | 'hit' | 'miss';

const NOTES: Record<Cue, [freq: number, start: number, dur: number][]> = {
  coin: [[988, 0, 0.08], [1319, 0.08, 0.18]],
  deal: [[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.2]],
  error: [[196, 0, 0.18]],
  achievement: [[659, 0, 0.1], [784, 0.1, 0.1], [988, 0.2, 0.1], [1319, 0.3, 0.3]],
  hammer: [[147, 0, 0.12], [110, 0.14, 0.25]],
  hit: [[1568, 0, 0.06]],
  miss: [[262, 0, 0.1]],
};
const VIBRATION: Record<Cue, number[]> = { coin: [30], deal: [20, 40, 20], error: [80], achievement: [30, 50, 30, 50, 60], hammer: [60, 40, 90], hit: [15], miss: [40] };

let ctx: AudioContext | null = null;

export function cue(kind: Cue): void {
  if (!isSoundOn()) return;
  try {
    navigator.vibrate?.(VIBRATION[kind]);
  } catch {
    // titreşim desteklenmiyor (ör. iPhone)
  }
  const AC = (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext;
  if (!AC) return;
  try {
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    for (const [freq, start, dur] of NOTES[kind]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = kind === 'error' || kind === 'miss' ? 'sawtooth' : kind === 'hammer' ? 'square' : 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.18, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    }
  } catch {
    // ses çalınamadı: oyun sessiz devam eder
  }
}
