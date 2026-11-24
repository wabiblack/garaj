import { useState } from 'react';
import type { GameState } from '../../game/types';
import { TUTORIAL_STEPS, dismissTutorial, tutorialDismissed, tutorialStep } from '../tutorial';
import { extraImage } from '../images';

/** Öğretici kartı: dedenin ağzından bir sonraki adım. */
export function Tutorial({ state, onClose }: { state: GameState; onClose?(): void }) {
  const [hidden, setHidden] = useState(tutorialDismissed);
  const step = hidden ? null : tutorialStep(state);
  if (step === null) return null;
  const face = extraImage('ui/dede');
  return (
    <aside className="coach" aria-label="Rehber">
      {face ? <img className="coach__face" src={face} alt="" /> : <span className="coach__icon" aria-hidden="true">💡</span>}
      <div className="coach__body">
        <div className="coach__step">
          Adım {step + 1}/{TUTORIAL_STEPS.length}
          <span className="coach__dots" aria-hidden="true">
            {TUTORIAL_STEPS.map((s, i) => <span key={s.id} className={'coach__dot' + (i <= step ? ' coach__dot--on' : '')} />)}
          </span>
        </div>
        <p className="coach__text">{TUTORIAL_STEPS[step].text}</p>
      </div>
      <button type="button" className="coach__close" aria-label="Rehberi kapat" onClick={() => { dismissTutorial(); setHidden(true); onClose?.(); }}>×</button>
    </aside>
  );
}

/** Öğreticinin vurguladığı yer (sekme ya da Günü bitir). Kapatıldıysa hiçbir şey. */
export function tutorialTarget(state: GameState): (typeof TUTORIAL_STEPS)[number] | null {
  if (tutorialDismissed()) return null;
  const step = tutorialStep(state);
  return step === null ? null : TUTORIAL_STEPS[step];
}
