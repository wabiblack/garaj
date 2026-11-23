// Rekor kartı: tuval üzerine çizilen PNG. Telefon destekliyorsa paylaşım menüsü açılır, yoksa indirilir.
import type { GameState } from '../game/types';
import { formatTL } from '../game/format';
import { STAGE_LABEL } from './components/TopBar';

const W = 1080, H = 1350;

export function recordLines(state: GameState): [label: string, value: string][] {
  const s = state.stats;
  return [
    ['Toplam satış', String(s.sales)],
    ['Toplam kâr', formatTL(s.profit)],
    ['En kârlı satış', s.bestItem ? `${formatTL(s.bestProfit)} · ${s.bestItem}` : '—'],
    ['Başarım', String(state.achievements.length)],
    ['Kasa', formatTL(state.money)],
  ];
}

export function drawRecordCard(state: GameState): HTMLCanvasElement | null {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  if (!g) return null;
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1b2230');
  bg.addColorStop(1, '#0e1116');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#f5b301';
  g.fillRect(80, 120, 120, 12);
  g.font = '700 96px system-ui, sans-serif';
  g.fillStyle = '#ffffff';
  g.fillText('Garaj', 80, 250);
  g.font = '500 44px system-ui, sans-serif';
  g.fillStyle = '#9aa4b2';
  g.fillText(`${state.player.name} · ${state.age} yaş · ${STAGE_LABEL[state.stage]} · Gün ${state.day}${state.hard ? ' · Zor mod' : ''}`, 80, 320);
  let y = 470;
  for (const [label, value] of recordLines(state)) {
    g.font = '500 40px system-ui, sans-serif';
    g.fillStyle = '#9aa4b2';
    g.fillText(label, 80, y);
    g.font = '700 64px system-ui, sans-serif';
    g.fillStyle = '#ffffff';
    let v = value;
    while (g.measureText(v).width > W - 160 && v.length > 4) v = v.slice(0, -2) + '…';
    g.fillText(v, 80, y + 76);
    y += 165;
  }
  g.font = '500 36px system-ui, sans-serif';
  g.fillStyle = '#f5b301';
  g.fillText('wabiblack.github.io/garaj', 80, H - 80);
  return c;
}

export async function shareRecordCard(state: GameState): Promise<string> {
  const canvas = drawRecordCard(state);
  if (!canvas) return 'Bu cihazda kart çizilemedi.';
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) return 'Bu cihazda kart çizilemedi.';
  const file = new File([blob], 'garaj-rekor.png', { type: 'image/png' });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Garaj rekorlarım' });
      return 'Paylaşıldı.';
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'Paylaşım iptal edildi.';
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'garaj-rekor.png';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'Kart indirildi.';
}
