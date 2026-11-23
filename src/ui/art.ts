import type { GameState } from '../game/types';
import oda from '../assets/places/oda.svg';
import apartman from '../assets/places/apartman.svg';
import sanayi from '../assets/places/sanayi.svg';
import galeri from '../assets/places/galeri.svg';
import showroom from '../assets/places/showroom.svg';
import holding from '../assets/places/holding.svg';

export { portraitUrl } from './portrait';

type PlaceKey = 'oda' | 'apartman' | 'sanayi' | 'galeri' | 'showroom' | 'holding';
const PLACE_URL: Record<PlaceKey, string> = { oda, apartman, sanayi, galeri, showroom, holding };

function placeKey(state: Pick<GameState, 'stage' | 'locationLevel'>): PlaceKey {
  if (state.stage === 1) return 'oda';
  if (state.stage === 2) return 'apartman';
  if (state.stage === 4) return 'holding';
  return (['sanayi', 'galeri', 'showroom'] as const)[state.locationLevel];
}

export function placeUrl(state: Pick<GameState, 'stage' | 'locationLevel'>): string {
  return PLACE_URL[placeKey(state)];
}

/** Mekân çizimindeki boş tabelanın yeri (çizim 320×140); oyuncunun adı üstüne yazılır. */
const PLACE_SIGN: Partial<Record<PlaceKey, { x: number; y: number; w: number; size: number; ink: string; suffix: string }>> = {
  galeri: { x: 100, y: 42, w: 120, size: 13, ink: '#f5b700', suffix: 'OTO' },
  showroom: { x: 96, y: 20, w: 128, size: 13, ink: '#1a1400', suffix: 'MOTORS' },
  holding: { x: 118, y: 4, w: 84, size: 9, ink: '#1a1400', suffix: 'HOLDİNG' },
};

export function placeSign(state: Pick<GameState, 'stage' | 'locationLevel' | 'player'>) {
  const sign = PLACE_SIGN[placeKey(state)];
  if (!sign) return null;
  const text = `${state.player.name.toLocaleUpperCase('tr-TR')} ${sign.suffix}`;
  // Uzun isim tabelaya sığmazsa harfler sıkıştırılır.
  const natural = text.length * sign.size * 0.68;
  return { ...sign, text, fit: natural > sign.w - 8 ? sign.w - 8 : undefined };
}
