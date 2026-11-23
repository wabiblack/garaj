import type { GameState } from '../game/types';
import kerem12 from '../assets/portraits/kerem-12.svg';
import kerem16 from '../assets/portraits/kerem-16.svg';
import kerem18 from '../assets/portraits/kerem-18.svg';
import kerem25 from '../assets/portraits/kerem-25.svg';
import oda from '../assets/places/oda.svg';
import apartman from '../assets/places/apartman.svg';
import sanayi from '../assets/places/sanayi.svg';
import galeri from '../assets/places/galeri.svg';
import showroom from '../assets/places/showroom.svg';
import holding from '../assets/places/holding.svg';

export function portraitUrl(age: number): string {
  return age >= 25 ? kerem25 : age >= 18 ? kerem18 : age >= 16 ? kerem16 : kerem12;
}

export function placeUrl(state: Pick<GameState, 'stage' | 'locationLevel'>): string {
  if (state.stage === 1) return oda;
  if (state.stage === 2) return apartman;
  if (state.stage === 4) return holding;
  return [sanayi, galeri, showroom][state.locationLevel];
}
