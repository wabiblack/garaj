import type { GameState } from '../../game/types';
import { STAGE_GOALS, STAGE_MIN_AGE } from '../../game/progression';
import { PERIODS_PER_YEAR, SCHOOL_ACTIONS, actionsLeft, dateLabel, monthsToBirthday } from '../../game/calendar';

const monthsToAge = (s: GameState, age: number) => monthsToBirthday(s.day) + (age - s.age - 1) * PERIODS_PER_YEAR;
import { BRANCHES, LOCATIONS } from '../../game/growth';
import { AnimatedMoney } from './AnimatedMoney';
import { formatTL } from '../../game/format';

export const STAGE_LABEL = { 1: 'Mahalle çocuğu', 2: 'Motorcu', 3: 'Galerici', 4: 'Holding patronu' } as const;
/** Okul ayında kalan iş hakkı; tatilde 'tatil'. */
function school(s: GameState): string {
  if (s.age >= 18) return '';
  const left = actionsLeft(s);
  return left === Infinity ? ' · Yaz tatili' : ` · Okul: ${left}/${SCHOOL_ACTIONS} iş`;
}

function goal(state: GameState): { label: string; pct: number } {
  if (state.stage === 1 || state.stage === 2) {
    const target = STAGE_GOALS[state.stage];
    const needAge = STAGE_MIN_AGE[state.stage === 1 ? 2 : 3];
    if (state.money >= target && state.age < needAge) {
      return { label: `Para hazır · ${needAge} yaşını bekle (${monthsToAge(state, needAge)} ay)`, pct: 100 };
    }
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
          <div className="topbar__day">{dateLabel(state.day)}{school(state)}</div>
        </div>
        <div className="topbar__money"><AnimatedMoney value={state.money} /></div>
      </div>
      <div className="topbar__row topbar__row--goal">
        <div className="goal">
          <div className="goal__label">{g.label}</div>
          <div className="goal__track"><div className="goal__fill" style={{ width: `${g.pct}%` }} /></div>
        </div>
        {state.phase === 'day' ? (
          <button type="button" className={'btn btn--primary btn--small' + (hint ? ' btn--hint' : '')} onClick={onEndDay}>Ayı bitir</button>
        ) : null}
      </div>
    </header>
  );
}
