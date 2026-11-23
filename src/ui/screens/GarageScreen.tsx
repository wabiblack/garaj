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
import { RepairSheet } from './RepairSheet';
import { orderMatches, orderPrice } from '../../game/orders';
import { placeUrl } from '../art';
import type { GameState } from '../../game/types';

export function placeName(state: Pick<GameState, 'stage' | 'locationLevel'>): string {
  if (state.stage === 1) return 'Kerem’in odası';
  if (state.stage === 2) return 'Apartman altı';
  if (state.stage === 4) return 'Kerem Holding';
  return LOCATIONS[state.locationLevel];
}

export function GarageScreen({ view, dispatch }: { view: GameView; dispatch(a: Action): void }) {
  const { state } = view;
  const [selling, setSelling] = useState<string | null>(null);
  const [fixing, setFixing] = useState<{ itemId: string; defectId: string } | null>(null);
  const sellItem = state.inventory.find((i) => i.id === selling);
  const fixItem = state.inventory.find((i) => i.id === fixing?.itemId);
  const fixDefect = fixItem?.defects.find((d) => d.id === fixing?.defectId);
  const place = placeName(state);
  return (
    <section>
      <div className="place"><img src={placeUrl(state)} alt={place} /></div>
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
                  <Button key={d.id} small onClick={() => setFixing({ itemId: item.id, defectId: d.id })}>
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
                {state.orders.filter((o) => orderMatches(o, item)).map((o) => (
                  <Button key={o.id} small variant="good" onClick={() => dispatch({ type: 'fulfillOrder', orderId: o.id, itemId: item.id })}>
                    {`${o.buyerName}’e sat · ${formatTL(orderPrice(o, item, state.season))}`}
                  </Button>
                ))}
                <Button small variant="primary" onClick={() => setSelling(item.id)}>{sale ? 'Fiyatı değiştir' : 'Satışa koy'}</Button>
              </ItemCard>
            );
          })}
        </div>
      )}
      {fixItem && fixDefect ? (
        <RepairSheet item={fixItem} defect={fixDefect} cost={repairCost(fixDefect, state)} money={state.money} dispatch={dispatch} onClose={() => setFixing(null)} />
      ) : null}
      {sellItem ? <SellSheet item={sellItem} state={state} dispatch={dispatch} onClose={() => setSelling(null)} /> : null}
    </section>
  );
}
