import type { Action } from '../../../game/reducer';
import type { GameState } from '../../../game/types';
import { STOCKS, STOCK_FEE, portfolioValue, stockPrice } from '../../../game/stocks';
import { ADULT_AGE } from '../../../game/bank';
import { formatTL } from '../../../game/format';
import { Button } from '../../components/Button';
import { Change, Spark } from '../../components/Spark';
import { extraImage } from '../../images';

/** Paranın bu kadarlık kısmıyla alınabilecek hisse. */
const sharesFor = (money: number, price: number, part: number) => Math.floor((money * part) / (price * (1 + STOCK_FEE)));

export function StocksPanel({ state, dispatch }: { state: GameState; dispatch(a: Action): void }) {
  const adult = state.age >= ADULT_AGE;
  const value = portfolioValue(state);
  const cost = STOCKS.reduce((s, { id }) => s + state.stocks.cost[id], 0);
  return (
    <section aria-label="Borsa">
      <p className="hint">
        Şirketler otomotiv piyasasıyla birlikte iner çıkar: araba ve motor fiyatları yükselirse hisseleri de yükselir.
        Her alım ve satışta %{(STOCK_FEE * 100).toLocaleString('tr-TR')} komisyon.
        {adult ? '' : ' Borsa 18 yaşında açılır; şimdilik yalnız izleyebilirsin.'}
      </p>
      {value > 0 ? (
        <div className="panel">
          <div className="stats stats--flat">
            <div className="stat"><span>Portföy</span><strong>{formatTL(value)}</strong></div>
            <div className="stat"><span>Kâr / zarar</span><strong className={value >= cost ? 'good' : 'bad'}>{formatTL(value - cost)}</strong></div>
          </div>
        </div>
      ) : null}
      {STOCKS.map((s) => {
        const price = stockPrice(state.stocks, s.id);
        const hist = state.stocks.prices[s.id];
        const owned = state.stocks.owned[s.id];
        const logo = extraImage(`stocks/${s.id}`);
        const buy = sharesFor(state.money, price, 0.25) || sharesFor(state.money, price, 1);
        return (
          <div className="stock" key={s.id} role="group" aria-label={s.name}>
            <div className="stock__head">
              {logo ? <img className="stock__logo" src={logo} alt="" /> : <span className="stock__logo stock__logo--empty" aria-hidden="true">{s.name[0]}</span>}
              <div className="stock__name">
                <div className="row__title">{s.name}</div>
                <div className="row__sub">{s.sector}</div>
              </div>
              <Spark values={hist.slice(-14)} />
              <div className="stock__price">
                <div>{formatTL(price)}</div>
                <Change value={hist.length > 1 ? price / hist[hist.length - 2] - 1 : 0} />
              </div>
            </div>
            {owned > 0 ? (
              <div className="row__sub">
                {owned} hisse · değeri {formatTL(owned * price)} ·{' '}
                <span className={owned * price >= state.stocks.cost[s.id] ? 'good' : 'bad'}>{formatTL(owned * price - state.stocks.cost[s.id])}</span>
              </div>
            ) : null}
            {adult ? (
              <div className="chips">
                {buy > 0 ? <Button small onClick={() => dispatch({ type: 'buyStock', id: s.id, shares: buy })}>{`Al: ${buy} hisse`}</Button> : null}
                {owned > 1 ? <Button small variant="ghost" onClick={() => dispatch({ type: 'sellStock', id: s.id, shares: Math.floor(owned / 2) })}>Yarısını sat</Button> : null}
                {owned > 0 ? <Button small variant="ghost" onClick={() => dispatch({ type: 'sellStock', id: s.id, shares: owned })}>Hepsini sat</Button> : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
