import { useState } from 'react';
import type { Action, GameView } from '../../game/reducer';
import { buyerCount } from '../../game/selling';
import { ItemCard } from '../components/ItemCard';
import { Button } from '../components/Button';
import { SellSheet } from './SellSheet';

export function SalesScreen({ view, dispatch }: { view: GameView; dispatch(a: Action): void }) {
  const { state } = view;
  const [editing, setEditing] = useState<string | null>(null);
  const editItem = state.inventory.find((i) => i.id === editing);
  const rows = state.forSale.flatMap((sale) => {
    const item = state.inventory.find((i) => i.id === sale.itemId);
    return item ? [{ sale, item }] : [];
  });
  return (
    <section>
      <div className="section-head">
        <h1>Satış</h1>
        <span className="muted">Günde {buyerCount(state)} alıcı bakar</span>
      </div>
      {rows.length === 0 ? (
        <div className="empty">Satışta bir şey yok. Garajdan bir şeyi satışa koy.</div>
      ) : (
        <div className="list">
          {rows.map(({ sale, item }) => (
            <ItemCard
              key={item.id}
              item={item}
              price={sale.price}
              priceLabel="İlan"
              subtitle={sale.disclosed ? <span className="pos">Kusurlar belirtildi</span> : 'Teklifler hafta sonunda gelir'}
            >
              <Button small onClick={() => setEditing(item.id)}>Fiyatı değiştir</Button>
              <Button small variant="ghost" onClick={() => dispatch({ type: 'unlist', itemId: item.id })}>Satıştan çek</Button>
            </ItemCard>
          ))}
        </div>
      )}
      {editItem ? <SellSheet item={editItem} state={state} dispatch={dispatch} onClose={() => setEditing(null)} /> : null}
    </section>
  );
}
