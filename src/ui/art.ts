import type { GameState } from '../game/types';
export { portraitUrl } from './portrait';

type PlaceKey = 'oda' | 'apartman' | 'sanayi' | 'galeri' | 'showroom' | 'holding';

// Mekân çizimleri; aynı adda PNG/WebP varsa SVG'nin önüne geçer (bkz. docs/gorsel-istegi.md).
const PLACE_FILES = import.meta.glob('../assets/places/*.{png,webp,svg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const PLACE_URL = new Map<string, { url: string; raster: boolean }>();
for (const [path, url] of Object.entries(PLACE_FILES)) {
  const [, name, ext] = path.match(/\/([^/]+)\.(png|webp|svg)$/)!;
  if (!PLACE_URL.has(name) || ext !== 'svg') PLACE_URL.set(name, { url, raster: ext !== 'svg' });
}

function placeKey(state: Pick<GameState, 'stage' | 'locationLevel'>): PlaceKey {
  if (state.stage === 1) return 'oda';
  if (state.stage === 2) return 'apartman';
  if (state.stage === 4) return 'holding';
  return (['sanayi', 'galeri', 'showroom'] as const)[state.locationLevel];
}

export function placeUrl(state: Pick<GameState, 'stage' | 'locationLevel'>): string {
  return PLACE_URL.get(placeKey(state))!.url;
}

/** Mekân çizimindeki boş tabelanın yeri (çizim 320×140); oyuncunun adı üstüne yazılır. */
const PLACE_SIGN: Partial<Record<PlaceKey, { x: number; y: number; w: number; size: number; ink: string; suffix: string }>> = {
  galeri: { x: 100, y: 42, w: 120, size: 13, ink: '#f5b700', suffix: 'OTO' },
  showroom: { x: 96, y: 20, w: 128, size: 13, ink: '#1a1400', suffix: 'MOTORS' },
  holding: { x: 118, y: 4, w: 84, size: 9, ink: '#1a1400', suffix: 'HOLDİNG' },
};

/** Hazır görselde tabela yeri bilinmez: ad, üst ortada ayrı bir levhaya yazılır. */
const RASTER_SIGN = { x: 96, y: 8, w: 128, size: 12, ink: '#f5b700', plate: '#1f2530' };

export function placeSign(state: Pick<GameState, 'stage' | 'locationLevel' | 'player'>) {
  const key = placeKey(state);
  const drawn = PLACE_SIGN[key];
  if (!drawn) return null;
  const raster = PLACE_URL.get(key)!.raster;
  const sign = raster ? { ...RASTER_SIGN, suffix: drawn.suffix } : { ...drawn, plate: null as string | null };
  const text = `${state.player.name.toLocaleUpperCase('tr-TR')} ${sign.suffix}`;
  // Uzun isim tabelaya sığmazsa harfler sıkıştırılır.
  const natural = text.length * sign.size * 0.68;
  return { ...sign, text, fit: natural > sign.w - 8 ? sign.w - 8 : undefined };
}
