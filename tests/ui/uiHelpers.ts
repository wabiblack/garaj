import { SAVE_KEY } from '../../src/game/save';
import type { GameState } from '../../src/game/types';

export function seedSave(state: GameState) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

beforeEach(() => localStorage.clear());
