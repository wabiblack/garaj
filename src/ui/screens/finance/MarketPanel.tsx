import type { GameState } from '../../../game/types';
import { CATEGORIES_BY_STAGE, CATEGORY_LABEL } from '../../../game/catalog';
import { marketChange, marketIndex } from '../../../game/market';
import { Change, Spark } from '../../components/Spark';

export function MarketPanel({ state }: { state: GameState }) {
  return (
    <section aria-label="Piyasa">
      <p className="hint">Fiyatlar her gün değişir. Endeks yüksekken sat, düşükken al. Fuar günleri piyasayı ısıtır, durgun günler soğutur.</p>
      <div className="panel">
        {CATEGORIES_BY_STAGE[state.stage].map((c) => {
          const idx = marketIndex(state.market, c);
          return (
            <div className="row market-row" key={c}>
              <div>
                <div className="row__title">{CATEGORY_LABEL[c]}</div>
                <div className="row__sub">Normalin %{Math.round(idx * 100)}’i</div>
              </div>
              <Spark values={state.market[c].slice(-14)} />
              <Change value={marketChange(state.market, c)} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
