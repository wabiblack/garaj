import { useCallback, useEffect, useReducer } from 'react';
import { gameReducer, type Action, type GameView } from '../game/reducer';
import { loadGame, saveGame } from '../game/save';
import { newGame, type StartStage } from '../game/newGame';
import type { Player } from '../game/player';

type Root = { view: GameView | null; broken: boolean; fresh: boolean };

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
  if (res.kind === 'ok') return { view: { state: res.state, message: null, lastOffer: null }, broken: false, fresh: false };
  if (res.kind === 'broken') return { view: null, broken: true, fresh: false };
  return { view: { state: newGame(randomSeed()), message: null, lastOffer: null }, broken: false, fresh: true };
}

function rootReducer(root: Root, action: Action): Root {
  if (action.type === 'newGame') {
    const keep = action.hard && root.view ? { hard: true, achievements: root.view.state.achievements } : {};
    return { view: { state: newGame(action.seed, { ...keep, player: action.player, stage: action.stage }), message: null, lastOffer: null }, broken: false, fresh: true };
  }
  if (!root.view) return root;
  return { view: gameReducer(root.view, action), broken: false, fresh: root.fresh };
}

export function useGame(): { view: GameView | null; broken: boolean; fresh: boolean; dispatch(a: Action): void; reset(hard?: boolean, player?: Player, stage?: StartStage): void } {
  const [root, dispatch] = useReducer(rootReducer, undefined, init);
  const state = root.view?.state;
  useEffect(() => {
    const st = storage();
    if (state && st) saveGame(st, state);
  }, [state]);
  const reset = useCallback((hard = false, player?: Player, stage?: StartStage) => dispatch({ type: 'newGame', seed: randomSeed(), hard, player, stage }), []);
  return { view: root.view, broken: root.broken, fresh: root.fresh, dispatch, reset };
}
