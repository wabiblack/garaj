import type { GameState } from '../../../game/types';
import { formatTL } from '../../../game/format';

export function LedgerPanel({ state }: { state: GameState }) {
  const rows = [...state.ledger].reverse();
  const bought = state.ledger.filter((e) => e.kind === 'al').reduce((s, e) => s + e.price, 0);
  const sold = state.ledger.filter((e) => e.kind === 'sat').reduce((s, e) => s + e.price, 0);
  const profit = state.ledger.reduce((s, e) => s + (e.profit ?? 0), 0);
  return (
    <section aria-label="Al-sat defteri">
      <div className="panel">
        <div className="stats stats--flat">
          <div className="stat"><span>Alış</span><strong>{formatTL(bought)}</strong></div>
          <div className="stat"><span>Satış</span><strong>{formatTL(sold)}</strong></div>
          <div className="stat"><span>Net kâr</span><strong className={profit >= 0 ? 'good' : 'bad'}>{formatTL(profit)}</strong></div>
        </div>
      </div>
      {rows.length === 0 ? <p className="muted">Henüz alım satım yok. İlk ilanını al, burada görünsün.</p> : (
        <ul className="ledger">
          {rows.map((e, i) => (
            <li key={i} className="ledger__row">
              <span className={'tag ' + (e.kind === 'al' ? 'tag--accent' : 'tag--good')}>{e.kind === 'al' ? 'Alış' : 'Satış'}</span>
              <div className="ledger__main">
                <div className="row__title ellipsis">{e.name}</div>
                <div className="row__sub">Gün {e.day}</div>
              </div>
              <div className="ledger__side">
                <div>{formatTL(e.price)}</div>
                {e.profit !== undefined ? <div className={e.profit >= 0 ? 'good' : 'bad'}>{(e.profit >= 0 ? '+' : '−') + formatTL(Math.abs(e.profit))}</div> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
