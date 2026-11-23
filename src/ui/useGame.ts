import { useCallback, useEffect, useReducer } from 'react';
import { gameReducer, type Action, type GameView } from '../game/reducer';
import { loadGame, saveGame } from '../game/save';
import { newGame } from '../game/newGame';

type Root = { view: GameView | null; broken: boolean };

const randomSeed = () => (Date.now() ^ Math.floor(Math.random() * 2 ** 32)) >>> 0;

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function init(): Root {
  const st = storage();
  const res = st ? loadGame(st) : ({ kind: 'empty' } as const);
  if (res.kind === 'ok') return { view: { state: res.state, message: null, lastOffer: null }, broken: false };
  if (res.kind === 'broken') return { view: null, broken: true };
  return { view: { state: newGame(randomSeed()), message: null, lastOffer: null }, broken: false };
}

function rootReducer(root: Root, action: Action): Root {
  if (action.type === 'newGame') return { view: { state: newGame(action.seed), message: null, lastOffer: null }, broken: false };
  if (!root.view) return root;
  return { view: gameReducer(root.view, action), broken: false };
}

export function useGame(): { view: GameView | null; broken: boolean; dispatch(a: Action): void; reset(): void } {
  const [root, dispatch] = useReducer(rootReducer, undefined, init);
  const state = root.view?.state;
  useEffect(() => {
    const st = storage();
    if (state && st) saveGame(st, state);
  }, [state]);
  const reset = useCallback(() => dispatch({ type: 'newGame', seed: randomSeed() }), []);
  return { view: root.view, broken: root.broken, dispatch, reset };
}
