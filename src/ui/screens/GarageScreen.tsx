import { useState } from 'react';
import type { Action, GameView } from '../../game/reducer';
import { storageLimit } from '../../game/negotiation';
import { careCost, cleanCost, MAX_CARE, paintCost, repairCost } from '../../game/prep';
import { marketValue } from '../../game/pricing';
import { formatTL } from '../../game/format';
import { LOCATIONS } from '../../game/growth';
import { ItemCard } from '../components/ItemCard';
import { Button } from '../components/Button';
import { SellSheet } from './SellSheet';

const PLACE = { 1: 'Kerem’in odası', 2: 'Apartman altı' } as const;

export function GarageScreen({ view, dispatch }: { view: GameView; dispatch(a: Action): void }) {
  const { state } = view;
  const [selling, setSelling] = useState<string | null>(null);
  const sellItem = state.inventory.find((i) => i.id === selling);
  const place = state.stage === 3 ? LOCATIONS[state.locationLevel] : PLACE[state.stage];
  return (
    <section>
      <div className="section-head">
        <h1>Garaj</h1>
        <span className="muted">{place} · {state.inventory.length}/{storageLimit(state)}</span>
      </div>
      {state.inventory.length === 0 ? (
        <div className="empty">Garajın boş. İlanlardan bir şey al.</div>
      ) : (
        <div className="list">
          {state.inventory.map((item) => {
            const sale = state.forSale.find((f) => f.itemId === item.id);
            const mv = marketValue(item, state.season);
            const profit = mv - item.boughtFor;
            return (
              <ItemCard
                key={item.id}
                item={item}
                price={mv}
                priceLabel="Piyasa"
                subtitle={<>Alış {formatTL(item.boughtFor)} · <span className={profit >= 0 ? 'pos' : 'neg'}>{profit >= 0 ? '+' : ''}{formatTL(profit)}</span></>}
                badge={sale ? <span className="tag tag--accent">Satışta</span> : null}
              >
                {item.defects.filter((d) => d.known).map((d) => (
                  <Button key={d.id} small onClick={() => dispatch({ type: 'repair', itemId: item.id, defectId: d.id })}>
                    {`Tamir et: ${d.name} · ${formatTL(repairCost(d, state))}`}
                  </Button>
                ))}
                {!item.cleaned ? (
                  <Button small onClick={() => dispatch({ type: 'clean', itemId: item.id })}>{`Temizle · ${formatTL(cleanCost(item))}`}</Button>
                ) : null}
                {item.category === 'araba' && !item.painted ? (
                  <Button small onClick={() => dispatch({ type: 'paint', itemId: item.id })}>{`Boya · ${formatTL(paintCost(item, state))}`}</Button>
                ) : null}
                {item.category === 'guvercin' && item.careCount < MAX_CARE && !item.caredToday ? (
                  <Button small onClick={() => dispatch({ type: 'care', itemId: item.id })}>{`Bak · ${formatTL(careCost(item))}`}</Button>
                ) : null}
                <Button small variant="primary" onClick={() => setSelling(item.id)}>{sale ? 'Fiyatı değiştir' : 'Satışa koy'}</Button>
              </ItemCard>
            );
          })}
        </div>
      )}
      {sellItem ? <SellSheet item={sellItem} state={state} dispatch={dispatch} onClose={() => setSelling(null)} /> : null}
    </section>
  );
}
