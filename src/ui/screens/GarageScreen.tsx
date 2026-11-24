import { useState } from 'react';
import type { Action, GameView } from '../../game/reducer';
import { storageLimit } from '../../game/negotiation';
import { ANIMALS, PAINTABLE, careCost, cleanCost, MAX_CARE, paintCost, repairCost } from '../../game/prep';
import { scrapValue } from '../../game/workshop';
import { inTransit } from '../../game/realism';
import { PaintSheet } from './PaintSheet';
import { PetsPanel } from '../components/PetsPanel';
import { marketValue } from '../../game/pricing';
import { marketIndex } from '../../game/market';
import { formatTL } from '../../game/format';
import { LOCATIONS } from '../../game/growth';
import { ItemCard } from '../components/ItemCard';
import { Button } from '../components/Button';
import { SellSheet } from './SellSheet';
import { WorkshopSheet } from './WorkshopSheet';
import { defectInfo } from '../../game/workshop';
import { orderMatches, orderPrice } from '../../game/orders';
import { Place } from '../components/Place';
import { genitive } from '../../game/turkish';
import type { GameState } from '../../game/types';

export function placeName(state: Pick<GameState, 'stage' | 'locationLevel' | 'player'>): string {
  if (state.stage === 1) return `${genitive(state.player.name)} odası`;
  if (state.stage === 2) return 'Apartman altı';
  if (state.stage === 4) return `${state.player.name} Holding`;
  return LOCATIONS[state.locationLevel];
}

export function GarageScreen({ view, dispatch }: { view: GameView; dispatch(a: Action): void }) {
  const { state } = view;
  const [selling, setSelling] = useState<string | null>(null);
  const [painting, setPainting] = useState<string | null>(null);
  const paintItem = state.inventory.find((i) => i.id === painting);
  const [fixing, setFixing] = useState<{ itemId: string; defectId: string } | null>(null);
  const sellItem = state.inventory.find((i) => i.id === selling);
  const fixItem = state.inventory.find((i) => i.id === fixing?.itemId);
  const fixDefect = fixItem?.defects.find((d) => d.id === fixing?.defectId);
  const place = placeName(state);
  return (
    <section>
      <div className="place"><Place state={state} label={place} /></div>
      <div className="section-head">
        <h1>Garaj</h1>
        <span className="muted">{place} · {state.inventory.length}/{storageLimit(state)}</span>
      </div>
      <PetsPanel state={state} dispatch={dispatch} />
      {state.inventory.length === 0 ? (
        <div className="empty">Garajın boş. İlanlardan bir şey al.</div>
      ) : (
        <div className="list">
          {state.inventory.map((item) => {
            const sale = state.forSale.find((f) => f.itemId === item.id);
            const mv = marketValue(item, state.season, marketIndex(state.market, item.category));
            const profit = mv - item.boughtFor;
            const transit = inTransit(item, state.day);
            return (
              <ItemCard
                key={item.id}
                item={item}
                price={mv}
                priceLabel="Piyasa"
                subtitle={<>Alış {formatTL(item.boughtFor)} · <span className={profit >= 0 ? 'pos' : 'neg'}>{profit >= 0 ? '+' : ''}{formatTL(profit)}</span></>}
                badge={transit ? <span className="tag tag--info">Kargoda</span> : sale ? <span className="tag tag--accent">Satışta</span> : null}
              >
                {transit ? <p className="hint">Kargoda: gelecek ay gelecek. Gelince hazırlayıp satabilirsin.</p> : <>
                {item.defects.filter((d) => d.known).map((d) => {
                  const order = state.parts.find((p) => p.itemId === item.id && p.defectId === d.id);
                  const label = order
                    ? (order.arrives <= state.day ? `Parçayı tak: ${d.name}` : `Kargoda: ${d.name}`)
                    : `${defectInfo(d.name).kind === 'hayvan' ? 'Tedavi et' : 'Tamir et'}: ${d.name} · ${formatTL(repairCost(d, state))}`;
                  return (
                    <Button key={d.id} small variant={order && order.arrives <= state.day ? 'primary' : undefined} onClick={() => setFixing({ itemId: item.id, defectId: d.id })}>
                      {label}
                    </Button>
                  );
                })}
                {!item.cleaned ? (
                  <Button small onClick={() => dispatch({ type: 'clean', itemId: item.id })}>{`Temizle · ${formatTL(cleanCost(item))}`}</Button>
                ) : null}
                {PAINTABLE.includes(item.category) && !item.painted ? (
                  <Button small onClick={() => setPainting(item.id)}>{`Boya · ${formatTL(paintCost(item, state))}`}</Button>
                ) : null}
                {ANIMALS.includes(item.category) && item.careCount < MAX_CARE && !item.caredToday ? (
                  <Button small onClick={() => dispatch({ type: 'care', itemId: item.id })}>{`Bak · ${formatTL(careCost(item))}`}</Button>
                ) : null}
                {item.category === 'kopek' && !state.pets.dog ? (
                  <Button small onClick={() => dispatch({ type: 'keepPet', itemId: item.id })}>Yanında tut</Button>
                ) : null}
                {scrapValue(item) > 0 && (item.condition < 40 || item.defects.length >= 2) ? (
                  <Button small onClick={() => dispatch({ type: 'scrap', itemId: item.id })}>{`Parça parça sat · ${formatTL(scrapValue(item))}`}</Button>
                ) : null}
                {state.orders.filter((o) => orderMatches(o, item)).map((o) => (
                  <Button key={o.id} small variant="good" onClick={() => dispatch({ type: 'fulfillOrder', orderId: o.id, itemId: item.id })}>
                    {`${o.buyerName}’e sat · ${formatTL(orderPrice(o, item, state.season))}`}
                  </Button>
                ))}
                <Button small variant="primary" onClick={() => setSelling(item.id)}>{sale ? 'Fiyatı değiştir' : 'Satışa koy'}</Button>
                </>}
              </ItemCard>
            );
          })}
        </div>
      )}
      {fixItem && fixDefect ? (
        <WorkshopSheet item={fixItem} defect={fixDefect} state={state} dispatch={dispatch} onClose={() => setFixing(null)} />
      ) : null}
      {paintItem ? <PaintSheet item={paintItem} state={state} dispatch={dispatch} onClose={() => setPainting(null)} /> : null}
      {sellItem ? <SellSheet item={sellItem} state={state} dispatch={dispatch} onClose={() => setSelling(null)} /> : null}
    </section>
  );
}
