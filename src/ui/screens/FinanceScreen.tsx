import { useState } from 'react';
import type { Action, GameView } from '../../game/reducer';
import { extraImage } from '../images';
import { MarketPanel } from './finance/MarketPanel';
import { LedgerPanel } from './finance/LedgerPanel';

type Part = 'piyasa' | 'defter';
const PARTS: { id: Part; label: string; image: string }[] = [
  { id: 'piyasa', label: 'Piyasa', image: 'ui/piyasa' },
  { id: 'defter', label: 'Defter', image: 'ui/piyasa' },
];

/** Para işleri: piyasa, al-sat defteri (sonra banka, borsa, aile). */
export function FinanceScreen({ view }: { view: GameView; dispatch(a: Action): void }) {
  const { state } = view;
  const [part, setPart] = useState<Part>('piyasa');
  const banner = extraImage(PARTS.find((p) => p.id === part)!.image);
  return (
    <div className="finance">
      {banner ? <img className="finance__banner" src={banner} alt="" /> : null}
      <div className="tabs tabs--auto" role="tablist" aria-label="Finans">
        {PARTS.map((p) => (
          <button key={p.id} type="button" role="tab" aria-selected={p.id === part} className={'tabs__btn' + (p.id === part ? ' tabs__btn--on' : '')} onClick={() => setPart(p.id)}>{p.label}</button>
        ))}
      </div>
      {part === 'piyasa' ? <MarketPanel state={state} /> : null}
      {part === 'defter' ? <LedgerPanel state={state} /> : null}
    </div>
  );
}
