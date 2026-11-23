import type { GameState } from '../../game/types';
import { ItemCard } from '../components/ItemCard';
import { storageLimit } from '../../game/negotiation';

const SPECIAL_LABEL = { mezat: 'Mezat', hurdalik: 'Hurdalık', klasik: 'Nadir klasik' } as const;

export function ListingsScreen({ state, onOpen }: { state: GameState; onOpen(id: string): void }) {
  return (
    <section>
      <div className="section-head">
        <h1>İlanlar</h1>
        <span className="muted">Depo {state.inventory.length}/{storageLimit(state)}</span>
      </div>
      {state.summary.notes.length > 0 ? (
        <div className="notice">
          {state.summary.notes.map((n, i) => <p key={i}>{n}</p>)}
        </div>
      ) : null}
      {state.listings.length === 0 ? (
        <div className="empty">Bugünlük ilan kalmadı. Günü bitirip yarını bekle.</div>
      ) : (
        <div className="list">
          {state.listings.map((l) => (
            <ItemCard
              key={l.id}
              item={l.item}
              price={l.askPrice}
              subtitle={l.sellerName}
              badge={l.special ? <span className="tag tag--accent">{SPECIAL_LABEL[l.special]}</span> : null}
              onClick={() => onOpen(l.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
