import { useRef, useState } from 'react';
import type { Action, GameView } from '../../game/reducer';
import type { Listing } from '../../game/types';
import { inspectionCost } from '../../game/negotiation';
import { marketValue, round10 } from '../../game/pricing';
import { formatTL } from '../../game/format';
import { itemName } from '../../game/selling';
import { Sheet } from '../components/Sheet';
import { Button } from '../components/Button';
import { Money } from '../components/Money';
import { ConditionBar, TagRow, itemImage } from '../components/ItemCard';

export const parseAmount = (s: string) => Number(s.replace(/\D/g, ''));

function Patience({ value }: { value: number }) {
  return (
    <span className="patience" aria-label={`Sabır ${value}/3`}>
      {[0, 1, 2].map((i) => <span key={i} className={'patience__dot' + (i < value ? ' patience__dot--on' : '')} />)}
    </span>
  );
}

export function NegotiationSheet({ listingId, view, dispatch, onClose, onGoGarage }: {
  listingId: string | null;
  view: GameView;
  dispatch(a: Action): void;
  onClose(): void;
  onGoGarage(): void;
}) {
  const { state } = view;
  const live = state.listings.find((l) => l.id === listingId) ?? null;
  const snapshot = useRef<Listing | null>(null);
  if (live) snapshot.current = live;
  const listing = live ?? snapshot.current;
  const [amount, setAmount] = useState(() => (live ? String(round10(live.askPrice * 0.85)) : ''));
  const [submitted, setSubmitted] = useState(false);

  if (!listingId || !listing) return null;
  const { item } = listing;
  const result = submitted ? view.lastOffer : null;
  const done = result?.kind === 'accepted' || result?.kind === 'walked';
  const cost = inspectionCost(listing, state.stage, state.season);
  const inspectLabel = state.stage === 1 ? 'Bir bakayım' : `Ekspertiz (${formatTL(cost)})`;
  const allKnown = item.defects.every((d) => d.known);
  const cantInspect = state.money < cost;
  const sameAsRejected = listing.lastRejected === parseAmount(amount);

  const submit = () => {
    setSubmitted(true);
    dispatch({ type: 'offer', listingId: listing.id, amount: parseAmount(amount) });
  };
  const quick = (f: number) => setAmount(String(f === 1 ? listing.askPrice : round10(listing.askPrice * f)));

  return (
    <Sheet open title="Pazarlık" onClose={onClose}>
      <div className="neg__hero">
        <img src={itemImage(item)} alt="" className="neg__img" />
        <div className="neg__info">
          <div className="neg__name">{itemName(item)}</div>
          <div className="neg__seller">Satıcı: {listing.sellerName}{listing.special === 'mezat' ? ' · Pazarlık yok' : ''}</div>
          <ConditionBar value={item.condition} />
        </div>
      </div>
      <TagRow item={item} />

      <dl className="kv">
        <div><dt>İstenen</dt><dd><Money value={listing.askPrice} className="money--accent" /></dd></div>
        <div><dt>Piyasa değeri</dt><dd><Money value={marketValue(item, state.season)} /></dd></div>
        <div><dt>Satıcının sabrı</dt><dd><Patience value={listing.patience} /></dd></div>
      </dl>

      {!done ? (
        <>
          {!listing.inspected ? (
            <>
              <Button block disabled={cantInspect} onClick={() => dispatch({ type: 'inspect', listingId: listing.id })}>{inspectLabel}</Button>
              {cantInspect ? <p className="hint">Ekspertize paran yetmiyor</p> : null}
            </>
          ) : (
            <p className="hint">{state.stage === 1 ? 'Baktın; gözden kaçan bir şey olabilir.' : allKnown ? 'Ekspertiz yapıldı. Tüm kusurlar yukarıda.' : ''}</p>
          )}
          <label className="field">
            <span className="field__label">Teklifin (TL)</span>
            <input
              className="field__input"
              inputMode="numeric"
              maxLength={10}
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            />
          </label>
          <div className="chips">
            <button type="button" className="chip" onClick={() => quick(0.8)}>−%20</button>
            <button type="button" className="chip" onClick={() => quick(0.9)}>−%10</button>
            <button type="button" className="chip" onClick={() => quick(1)}>İstenen fiyat</button>
          </div>
          <Button variant="primary" block onClick={submit} disabled={parseAmount(amount) <= 0 || sameAsRejected}>Teklif ver</Button>
        </>
      ) : null}

      {submitted && view.message ? <p className="result result--bad">{view.message}</p> : null}
      {result?.kind === 'counter' ? (
        <p className="result">{listing.sellerName}: “{formatTL(result.price)} olur. Daha aşağı inmem zor.”</p>
      ) : null}
      {result?.kind === 'accepted' ? (
        <div className="result result--good">
          <strong>Anlaştınız!</strong> {itemName(item)} artık senin: {formatTL(result.price)}.
          <Button variant="good" block onClick={() => { onClose(); onGoGarage(); }}>Garaja git</Button>
        </div>
      ) : null}
      {result?.kind === 'walked' ? <p className="result result--bad">{listing.sellerName} vazgeçti, ilanı kaldırdı.</p> : null}
    </Sheet>
  );
}
