import type { GameState } from '../game/types';
import oda from '../assets/places/oda.svg';
import apartman from '../assets/places/apartman.svg';
import sanayi from '../assets/places/sanayi.svg';
import galeri from '../assets/places/galeri.svg';
import showroom from '../assets/places/showroom.svg';
import holding from '../assets/places/holding.svg';

export { portraitUrl } from './portrait';

export function placeUrl(state: Pick<GameState, 'stage' | 'locationLevel'>): string {
  if (state.stage === 1) return oda;
  if (state.stage === 2) return apartman;
  if (state.stage === 4) return holding;
  return [sanayi, galeri, showroom][state.locationLevel];
}
