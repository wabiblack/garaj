import type { GameState } from '../../game/types';
import { formatTL } from '../../game/format';
import { Button } from '../components/Button';

export function EndScreen({ state, onContinue }: { state: GameState; onContinue(): void }) {
  return (
    <div className="overlay overlay--center" role="dialog" aria-modal="true" aria-label="Tebrikler">
      <div className="overlay__inner overlay__inner--center">
        <p className="overlay__kicker">Gün {state.day}</p>
        <h1 className="transition__title">Şehrin en büyük galericisi oldun!</h1>
        <p className="muted">12 yaşında bir bisikletle başladın. Bugün kasanda {formatTL(state.money)} var.</p>
        <Button variant="primary" block onClick={onContinue}>Devam et</Button>
      </div>
    </div>
  );
}
