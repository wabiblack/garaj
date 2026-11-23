import type { GameState } from '../../game/types';
import { formatTL } from '../../game/format';
import { Button } from '../components/Button';
import { portraitUrl } from '../art';
import { STAGE_GOALS } from '../../game/progression';

export function EndScreen({ state, onContinue, onHardMode }: { state: GameState; onContinue(): void; onHardMode(): void }) {
  return (
    <div className="overlay overlay--center" role="dialog" aria-modal="true" aria-label="Tebrikler">
      <div className="overlay__inner overlay__inner--center">
        <p className="overlay__kicker">Gün {state.day}</p>
        <img className="story__face" src={portraitUrl(state.age, state.player.look)} alt="" />
        <h1 className="transition__title">{state.stage === 4 ? `${state.player.name} Holding üç şehirde!` : 'Şehrin en büyük galericisi oldun!'}</h1>
        <p className="muted">12 yaşında bir bisikletle başladın. Bugün kasanda {formatTL(state.money)} var.</p>
        {state.stage === 3 ? <p className="muted">İstersen devam et: {formatTL(STAGE_GOALS[3])} biriktirince holding kurarsın.</p> : null}
        <Button variant="primary" block onClick={onContinue}>Devam et</Button>
        <p className="muted">Ya da zor modda baştan başla: daha az para, daha sert satıcı, daha az alıcı. Başarımların kalır.</p>
        <Button block onClick={onHardMode}>Zor modda baştan başla</Button>
      </div>
    </div>
  );
}
