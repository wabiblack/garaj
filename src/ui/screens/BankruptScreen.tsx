import { dateLabel } from '../../game/calendar';
import type { GameState } from '../../game/types';
import { STAGE_RESTART_MONEY } from '../../game/progression';
import { formatTL } from '../../game/format';
import { Button } from '../components/Button';

export function BankruptScreen({ state, onRestart }: { state: GameState; onRestart(): void }) {
  return (
    <div className="overlay overlay--center" role="dialog" aria-modal="true" aria-label="İflas">
      <div className="overlay__inner overlay__inner--center">
        <p className="overlay__kicker">{dateLabel(state.day)}</p>
        <h1 className="transition__title">İflas ettin</h1>
        <p className="muted">
          Elinde satacak bir şey yok ve paran hiçbir ilana yetmiyor.
          {state.loan ? ' Banka yeni kredi vermiyor.' : ''} Aşamaya {formatTL(STAGE_RESTART_MONEY[state.stage])} ile yeniden başlayabilirsin; borcun ve çalışanların silinir.
        </p>
        <Button variant="primary" block onClick={onRestart}>Aşamayı yeniden başlat</Button>
      </div>
    </div>
  );
}
