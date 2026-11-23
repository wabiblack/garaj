import { fireEvent, render, screen } from '@testing-library/react';
import App from '../../src/ui/App';
import { SAVE_KEY } from '../../src/game/save';
import type { GameState } from '../../src/game/types';

export function seedSave(state: GameState) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

beforeEach(() => localStorage.clear());

/** Uygulamayı açar ve ana menüden oyuna geçer. */
export function renderGame() {
  const r = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /^(Devam et|Oyuna başla)/ }));
  const create = screen.queryByRole('button', { name: 'Hikâyeye başla' });
  if (create) fireEvent.click(create);
  return r;
}
