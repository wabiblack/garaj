import type { Action } from '../../game/reducer';
import type { GameState } from '../../game/types';
import { formatTL } from '../../game/format';
import { Button } from './Button';
import { extraImage } from '../images';

const WHO = { anne: 'Annen', baba: 'Baban' } as const;

/** Açık aile görevi: kim istedi, ne istedi, kaç gün kaldı; para istiyorsa öde düğmesi. */
export function FamilyTaskCard({ state, dispatch }: { state: GameState; dispatch(a: Action): void }) {
  const task = state.family.task;
  if (!task) return null;
  const face = extraImage(`ui/${task.from}`);
  return (
    <section className="family-task" aria-label="Aile görevi">
      {face ? <img className="family-task__face" src={face} alt="" /> : <span className="family-task__icon" aria-hidden="true">🏠</span>}
      <div className="family-task__body">
        <div className="family-task__who">{WHO[task.from]} · {task.title} · {task.daysLeft} hafta</div>
        <p className="family-task__text">{task.text}</p>
        {task.amount !== undefined ? (
          <Button small variant="primary" disabled={state.money < task.amount} onClick={() => dispatch({ type: 'familyPay' })}>{`Ver: ${formatTL(task.amount)}`}</Button>
        ) : <p className="hint">Hafta sonunda kontrol edilir.</p>}
      </div>
    </section>
  );
}
