import { useRef, useState } from 'react';
import type { Action } from '../../game/reducer';
import type { GameState, Item } from '../../game/types';
import { paintCost } from '../../game/prep';
import { formatTL } from '../../game/format';
import { itemName } from '../../game/selling';
import { Sheet } from '../components/Sheet';
import { Button } from '../components/Button';
import { ItemImage } from '../components/ItemCard';

const COLS = 6, ROWS = 4;
/** Bir yere bu kadardan fazla geçersen boya akar. */
const DRIP = 4;
/** Bu oranda kaplayınca boya bitirilebilir. */
const DONE = 0.85;

/** Boya: parmağını aracın üstünde gezdir. Her yer bir kez boyansın; aynı yerde durursan boya akar. */
export function PaintSheet({ item, state, dispatch, onClose }: { item: Item; state: GameState; dispatch(a: Action): void; onClose(): void }) {
  const [coats, setCoats] = useState<number[]>(() => Array(COLS * ROWS).fill(0));
  const last = useRef(-1);
  const down = useRef(false);
  const covered = coats.filter((c) => c > 0).length / coats.length;
  const drips = coats.filter((c) => c > DRIP).length;
  const cost = paintCost(item, state);
  const spray = (i: number) => {
    if (i === last.current) return;
    last.current = i;
    setCoats((c) => c.map((v, k) => (k === i ? v + 1 : v)));
  };
  const cellAt = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const col = Math.floor(((e.clientX - r.left) / r.width) * COLS);
    const row = Math.floor(((e.clientY - r.top) / r.height) * ROWS);
    return col >= 0 && col < COLS && row >= 0 && row < ROWS ? row * COLS + col : -1;
  };
  const finish = () => {
    dispatch({ type: 'paint', itemId: item.id, quality: Math.max(0, 1 - drips * 0.15) });
    onClose();
  };
  return (
    <Sheet open title="Boya" onClose={onClose}>
      <p className="sheet__lead">{itemName(item)} · {formatTL(cost)}</p>
      <p className="hint">Parmağını aracın üstünde gezdir. Her yeri bir kez boya; aynı yerde fazla durursan boya akar.</p>
      <div
        className="paint"
        role="group"
        aria-label="Boya alanı"
        onPointerDown={(e) => { down.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); spray(cellAt(e)); }}
        onPointerMove={(e) => { if (down.current) { const i = cellAt(e); if (i >= 0) spray(i); } }}
        onPointerUp={() => { down.current = false; last.current = -1; }}
      >
        <ItemImage item={item} className="paint__item" />
        <div className="paint__grid" aria-hidden="true">
          {coats.map((c, i) => (
            <span key={i} data-cell={i} className={'paint__cell' + (c > DRIP ? ' paint__cell--drip' : c > 0 ? ' paint__cell--on' : '')} onClick={() => { last.current = -1; spray(i); }} />
          ))}
        </div>
      </div>
      <div className="paint__meter" aria-label={`Kaplama yüzde ${Math.round(covered * 100)}`}>
        <span>Kaplama %{Math.round(covered * 100)}</span>
        {drips > 0 ? <span className="bad">{drips} yerde boya aktı</span> : null}
      </div>
      <Button variant="primary" block disabled={covered < DONE || state.money < cost} onClick={finish}>{`Boyayı bitir · ${formatTL(cost)}`}</Button>
    </Sheet>
  );
}
