import type { Action } from '../../../game/reducer';
import type { GameState } from '../../../game/types';
import { ALLOWANCE_EVERY, FAMILY_MIN_TRUST, familyLimit } from '../../../game/family';
import { ADULT_AGE } from '../../../game/bank';
import { formatTL } from '../../../game/format';
import { Button } from '../../components/Button';
import { FamilyTaskCard } from '../../components/FamilyTaskCard';
import { extraImage } from '../../images';

export function FamilyPanel({ state, dispatch }: { state: GameState; dispatch(a: Action): void }) {
  const { trust, debt, debtDays } = state.family;
  const limit = familyLimit(state);
  const minor = state.age < ADULT_AGE;
  const anne = extraImage('ui/anne'), baba = extraImage('ui/baba');
  return (
    <section aria-label="Aile">
      {anne || baba ? (
        <div className="family__faces">{[anne, baba].filter(Boolean).map((src) => <img key={src} src={src} alt="" />)}</div>
      ) : null}
      <div className="panel">
        <div className="meter">
          <div className="meter__head"><span>Güven {trust}/100</span></div>
          <div className="meter__track"><div className="meter__fill" style={{ width: `${trust}%` }} /></div>
        </div>
        <p className="hint">
          Annenle babanın istediklerini yaparsan güvenleri artar.
          {minor ? ` Reşit olana kadar her ${ALLOWANCE_EVERY} günde güvene göre harçlık verirler.` : ' Artık reşitsin; yine de seni arada bir ararlar.'}
        </p>
      </div>
      {state.family.task ? <FamilyTaskCard state={state} dispatch={dispatch} /> : <p className="muted">Şu an ailenin senden bir isteği yok.</p>}

      <h2 className="h2">Aileden borç</h2>
      <div className="panel">
        {debt > 0 ? (
          <>
            <div className="row__title">Aileye borcun: {formatTL(debt)}</div>
            <div className="row__sub">{debtDays} gün içinde ödemezsen paran kendiliğinden alınır, yetmezse güven düşer.</div>
            <Button small variant="primary" disabled={state.money < debt} onClick={() => dispatch({ type: 'familyRepay' })}>{`Borcu öde · ${formatTL(debt)}`}</Button>
          </>
        ) : !minor ? <p className="muted">Artık reşitsin: borç için Banka bölümüne bak.</p>
          : limit > 0 ? (
            <>
              <p className="hint">Faizsiz, 7 gün içinde geri ödenir. En çok {formatTL(limit)}.</p>
              <Button small onClick={() => dispatch({ type: 'familyBorrow', amount: limit })}>{`Aileden borç al · ${formatTL(limit)}`}</Button>
            </>
          ) : <p className="muted">Borç için ailenin güveni en az {FAMILY_MIN_TRUST} olmalı.</p>}
      </div>
    </section>
  );
}
