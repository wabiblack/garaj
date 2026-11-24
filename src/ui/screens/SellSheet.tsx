import { useState } from 'react';
import type { Action } from '../../game/reducer';
import type { GameState, Item } from '../../game/types';
import { marketValue } from '../../game/pricing';
import { marketIndex } from '../../game/market';
import { buyerValue, itemName } from '../../game/selling';
import { formatTL } from '../../game/format';
import { Sheet } from '../components/Sheet';
import { Button } from '../components/Button';
import { parseAmount } from './NegotiationSheet';

export function SellSheet({ item, state, dispatch, onClose }: { item: Item; state: GameState; dispatch(a: Action): void; onClose(): void }) {
  const existing = state.forSale.find((f) => f.itemId === item.id);
  const [price, setPrice] = useState(String(existing?.price ?? marketValue(item, state.season, marketIndex(state.market, item.category))));
  const [disclosed, setDisclosed] = useState(existing?.disclosed ?? false);
  const hasKnown = item.defects.some((d) => d.known);
  const value = buyerValue(item, disclosed, state);
  const submit = () => {
    dispatch({ type: 'listForSale', itemId: item.id, price: parseAmount(price), disclosed: hasKnown && disclosed });
    onClose();
  };
  return (
    <Sheet open title="Satışa koy" onClose={onClose}>
      <p className="sheet__lead">{itemName(item)}</p>
      <dl className="kv">
        <div><dt>Alış fiyatın</dt><dd>{formatTL(item.boughtFor)}</dd></div>
        <div><dt>Alıcının gözünde değer</dt><dd>{formatTL(value)}</dd></div>
      </dl>
      <label className="field">
        <span className="field__label">Satış fiyatı (TL)</span>
        <input className="field__input" inputMode="numeric" maxLength={10} value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
      </label>
      <p className="hint">Değerin üstüne çıktıkça teklif gelme ihtimali düşer. Teklifler gün sonunda gelir.</p>
      {hasKnown ? (
        <label className="switch">
          <input type="checkbox" aria-label="Kusurları belirt" checked={disclosed} onChange={(e) => setDisclosed(e.target.checked)} />
          <span className="switch__track" aria-hidden="true" />
          <span>
            <span className="switch__label">Kusurları belirt</span>
            <span className="switch__hint">Belirtirsen fiyat düşer ama itibarın artar. Saklarsan yakalanabilirsin.</span>
          </span>
        </label>
      ) : null}
      <Button variant="primary" block onClick={submit} disabled={parseAmount(price) <= 0}>İlana koy</Button>
    </Sheet>
  );
}
