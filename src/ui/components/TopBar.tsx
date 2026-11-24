import type { GameState } from '../../game/types';
import { STAGE_GOALS } from '../../game/progression';
import { BRANCHES, LOCATIONS } from '../../game/growth';
import { AnimatedMoney } from './AnimatedMoney';
import { formatTL } from '../../game/format';

export const STAGE_LABEL = { 1: 'Mahalle çocuğu', 2: 'Motorcu', 3: 'Galerici', 4: 'Holding patronu' } as const;
const SEASON_LABEL = { ilkbahar: 'İlkbahar', yaz: 'Yaz', sonbahar: 'Sonbahar', kis: 'Kış' } as const;

function goal(state: GameState): { label: string; pct: number } {
  if (state.stage === 1 || state.stage === 2) {
    const target = STAGE_GOALS[state.stage];
    return { label: `Hedef ${formatTL(target)} · ${state.stage === 1 ? 'Motora geç' : 'Galerici ol'}`, pct: Math.min(100, (state.money / target) * 100) };
  }
  if (state.stage === 4) {
    return { label: `Şubeler ${state.branches}/${BRANCHES.length} · ${BRANCHES.map((b) => b.city).join(', ')}`, pct: (state.branches / BRANCHES.length) * 100 };
  }
  if (state.won) {
    return { label: `Hedef ${formatTL(STAGE_GOALS[3])} · Holding kur`, pct: Math.min(100, (state.money / STAGE_GOALS[3]) * 100) };
  }
  const pct = ((state.locationLevel / 2) * 0.5 + Math.min(1, state.reputation / 90) * 0.5) * 100;
  return { label: `Hedef: ${LOCATIONS[2]} + itibar 90`, pct };
}

export function TopBar({ state, hint, onEndDay }: { state: GameState; hint?: boolean; onEndDay(): void }) {
  const g = goal(state);
  return (
    <header className="topbar">
      <div className="topbar__row">
        <div>
          <div className="topbar__who">{state.player.name} · {state.age} yaş · {STAGE_LABEL[state.stage]}</div>
          <div className="topbar__day">Gün {state.day} · {SEASON_LABEL[state.season]}</div>
        </div>
        <div className="topbar__money"><AnimatedMoney value={state.money} /></div>
      </div>
      <div className="topbar__row topbar__row--goal">
        <div className="goal">
          <div className="goal__label">{g.label}</div>
          <div className="goal__track"><div className="goal__fill" style={{ width: `${g.pct}%` }} /></div>
        </div>
        {state.phase === 'day' ? (
          <button type="button" className={'btn btn--primary btn--small' + (hint ? ' btn--hint' : '')} onClick={onEndDay}>Günü bitir</button>
        ) : null}
      </div>
    </header>
  );
}
