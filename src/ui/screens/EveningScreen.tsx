import { useState } from 'react';
import type { Action, GameView } from '../../game/reducer';
import type { BuyerOffer } from '../../game/types';
import { itemName } from '../../game/selling';
import { formatTL } from '../../game/format';
import { Money } from '../components/Money';
import { Button } from '../components/Button';
import { parseAmount } from './NegotiationSheet';
import { Tutorial } from '../components/Tutorial';

function OfferRow({ offer, label, dispatch }: { offer: BuyerOffer; label: string; dispatch(a: Action): void }) {
  const [countering, setCountering] = useState(false);
  const [amount, setAmount] = useState(String(Math.round((offer.amount * 1.05) / 10) * 10));
  return (
    <li className="offer">
      <div className="offer__head">
        <div>
          <div className="offer__buyer">{offer.buyerName}</div>
          <div className="offer__item ellipsis">{label}</div>
        </div>
        <Money value={offer.amount} className="money--accent" />
      </div>
      {countering ? (
        <div className="offer__counter">
          <label className="field field--inline">
            <span className="field__label">Karşı teklifin (TL)</span>
            <input className="field__input" inputMode="numeric" maxLength={10} value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} />
          </label>
          <Button small variant="primary" onClick={() => dispatch({ type: 'counterOffer', offerId: offer.id, amount: parseAmount(amount) })}>Gönder</Button>
        </div>
      ) : (
        <div className="offer__actions">
          <Button small variant="good" onClick={() => dispatch({ type: 'acceptOffer', offerId: offer.id })}>Kabul</Button>
          <Button small onClick={() => setCountering(true)}>Karşı teklif</Button>
          <Button small variant="ghost" onClick={() => dispatch({ type: 'rejectOffer', offerId: offer.id })}>Reddet</Button>
        </div>
      )}
    </li>
  );
}

export function EveningScreen({ view, dispatch }: { view: GameView; dispatch(a: Action): void }) {
  const { state } = view;
  const s = state.summary;
  const net = s.earned - s.spent;
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Gün sonu">
      <div className="overlay__inner">
        <p className="overlay__kicker">Akşam oldu</p>
        <h1>Gün {state.day} bitti</h1>
        <Tutorial state={state} />
        <div className="stats">
          <div className="stat"><span>Alınan</span><strong>{s.bought}</strong></div>
          <div className="stat"><span>Satılan</span><strong>{s.sold}</strong></div>
          <div className="stat"><span>Harcanan</span><strong>{formatTL(s.spent)}</strong></div>
          <div className="stat"><span>Kazanılan</span><strong>{formatTL(s.earned)}</strong></div>
        </div>
        <div className={'net ' + (net >= 0 ? 'pos' : 'neg')}>Bugün: {net >= 0 ? '+' : ''}{formatTL(net)}</div>
        {s.notes.length > 0 ? <div className="notice">{s.notes.map((n, i) => <p key={i}>{n}</p>)}</div> : null}
        {view.message ? <p className="result" role="status">{view.message}</p> : null}

        <h2 className="overlay__h2">Gelen teklifler</h2>
        {state.offers.length === 0 ? (
          <div className="empty empty--small">
            {state.forSale.length === 0 ? 'Satışta bir şey yoktu.' : 'Bugün kimse teklif vermedi. Fiyatı düşürmeyi dene.'}
          </div>
        ) : (
          <ul className="offers">
            {state.offers.map((o) => {
              const item = state.inventory.find((i) => i.id === o.itemId);
              return <OfferRow key={o.id} offer={o} label={item ? itemName(item) : ''} dispatch={dispatch} />;
            })}
          </ul>
        )}
        <div className="overlay__footer">
          {state.offers.length > 0 ? <p className="hint">Yanıtlamadığın teklifler sabah düşer.</p> : null}
          <Button variant="primary" block onClick={() => dispatch({ type: 'startNextDay' })}>Yeni güne başla</Button>
        </div>
      </div>
    </div>
  );
}
