import type { Action } from '../../../game/reducer';
import type { GameState } from '../../../game/types';
import { CREDIT_MIN_REP, CREDIT_MIN_SALES, LATE_PENALTY, LATE_REP, LOAN_DAYS, LOAN_INTEREST, SAVINGS_RATE, creditCheck } from '../../../game/bank';
import { formatTL } from '../../../game/format';
import { Button } from '../../components/Button';

const REASON = {
  'resit-degil': '18 yaşından önce bankadan kredi çekemezsin. Paraya sıkışırsan önce ailene danış.',
  'itibar-dusuk': `İtibarın ${CREDIT_MIN_REP}’ın altında: banka kredi vermiyor. Dürüst satışlarla itibarını yükselt.`,
  'gecmis-yok': `Banka en az ${CREDIT_MIN_SALES} satışlık geçmiş istiyor.`,
} as const;

const part = (x: number, f: number, step: number) => Math.floor((x * f) / step) * step;
const unique = (xs: number[]) => [...new Set(xs)].filter((x) => x > 0);

export function BankPanel({ state, dispatch }: { state: GameState; dispatch(a: Action): void }) {
  const credit = creditCheck(state);
  const { savings } = state.bank;
  const step = state.stage <= 1 ? 100 : 1000;
  return (
    <section aria-label="Banka">
      <h2 className="h2">Birikim hesabı</h2>
      <div className="panel">
        <div className="row">
          <div>
            <div className="row__title">Birikim: {formatTL(savings)}</div>
            <div className="row__sub">Günlük %{(SAVINGS_RATE * 100).toLocaleString('tr-TR')} faiz · istediğin an çekebilirsin</div>
          </div>
        </div>
        <div className="chips">
          {unique([part(state.money, 0.5, step), part(state.money, 1, step)]).map((a) => (
            <Button key={'y' + a} small onClick={() => dispatch({ type: 'deposit', amount: a })}>{`Yatır: ${formatTL(a)}`}</Button>
          ))}
          {savings > 0 ? <Button small variant="ghost" onClick={() => dispatch({ type: 'withdraw', amount: savings })}>{`Hepsini çek: ${formatTL(savings)}`}</Button> : null}
        </div>
      </div>

      <h2 className="h2">Kredi</h2>
      <div className="panel">
        {state.loan ? (
          <>
            <div className="row">
              <div>
                <div className="row__title">Borç: {formatTL(state.loan.debt)}</div>
                <div className="row__sub">Günlük taksit {formatTL(state.loan.installment)} · {state.loan.daysLeft} gün kaldı{state.loan.late ? ` · ${state.loan.late} gecikme` : ''}</div>
              </div>
            </div>
            <Button small variant="primary" disabled={state.money < state.loan.debt} onClick={() => dispatch({ type: 'repayLoan' })}>{`Borcu kapat · ${formatTL(state.loan.debt)}`}</Button>
          </>
        ) : credit.ok ? (
          <>
            <div className="row__title">Kredi limitin: {formatTL(credit.limit)}</div>
            <p className="hint">{LOAN_DAYS} gün, eşit günlük taksit, toplam %{LOAN_INTEREST * 100} faiz. Taksit ödenmezse %{LATE_PENALTY * 100} ceza eklenir, itibarın {LATE_REP} düşer. Limit itibarına ve satış geçmişine göre.</p>
            <div className="chips">
              {unique([part(credit.limit, 0.25, 1000), part(credit.limit, 0.5, 1000), credit.limit]).map((a) => (
                <Button key={a} small onClick={() => dispatch({ type: 'takeLoan', amount: a })}>{`${formatTL(a)} kredi çek`}</Button>
              ))}
            </div>
          </>
        ) : <p className="muted">{REASON[credit.reason]}</p>}
      </div>
    </section>
  );
}
