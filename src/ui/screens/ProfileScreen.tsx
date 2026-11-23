import { useState } from 'react';
import type { Action, GameView } from '../../game/reducer';
import type { Employees } from '../../game/types';
import {
  CAPACITY, CAPACITY_COST, LOAN_OPTIONS, LOCATION_COST, LOCATIONS, ROLE_LABEL, SALARY, dailySalaries,
} from '../../game/growth';
import { formatTL } from '../../game/format';
import { STAGE_LABEL } from '../components/TopBar';
import { Button } from '../components/Button';
import { ACHIEVEMENTS } from '../../game/career';
import type { AchievementId } from '../../game/types';
import { isSoundOn, setSoundOn } from '../feedback';

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="meter">
      <div className="meter__head"><span>{label}</span><strong>{value}/100</strong></div>
      <div className="meter__track"><div className="meter__fill" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

const ROLE_HELP: Record<keyof Employees, string> = {
  usta: 'Tamirler %20 ucuz',
  boyaci: 'Boya %30 ucuz',
  satis: 'Her gün +1 alıcı',
};

export function ProfileScreen({ view, dispatch, onNewGame }: { view: GameView; dispatch(a: Action): void; onNewGame(): void }) {
  const { state } = view;
  const [confirm, setConfirm] = useState(false);
  const [sound, setSound] = useState(isSoundOn);
  const { stats } = state;
  const capCost = CAPACITY_COST[state.capacityLevel];
  const locCost = LOCATION_COST[state.locationLevel];
  return (
    <section>
      <div className="profile">
        <div className="avatar" aria-hidden="true">K</div>
        <div>
          <h1>Kerem</h1>
          <div className="muted">{state.age} yaş · {STAGE_LABEL[state.stage]} · Gün {state.day}</div>
        </div>
      </div>
      <div className="panel">
        <Meter label="İtibar" value={state.reputation} />
        <Meter label="Tamir becerisi" value={state.skill} />
      </div>

      <h2 className="h2">Rekorlar</h2>
      <div className="panel">
        <div className="stats stats--flat">
          <div className="stat"><span>Toplam satış</span><strong>{stats.sales}</strong></div>
          <div className="stat"><span>Toplam kâr</span><strong>{formatTL(stats.profit)}</strong></div>
          <div className="stat"><span>En kârlı satış</span><strong>{formatTL(stats.bestProfit)}</strong></div>
          <div className="stat"><span>Hangi parça</span><strong className="ellipsis">{stats.bestItem ?? '—'}</strong></div>
          <div className="stat"><span>Motora geçiş</span><strong>{stats.stageDay[2] ? `Gün ${stats.stageDay[2]}` : '—'}</strong></div>
          <div className="stat"><span>Galeriye geçiş</span><strong>{stats.stageDay[3] ? `Gün ${stats.stageDay[3]}` : '—'}</strong></div>
        </div>
      </div>

      <section aria-label="Başarımlar">
        <h2 className="h2">Başarımlar <span className="muted">{state.achievements.length}/{Object.keys(ACHIEVEMENTS).length}</span></h2>
        <ul className="badges">
          {(Object.keys(ACHIEVEMENTS) as AchievementId[]).map((id) => {
            const got = state.achievements.includes(id);
            return (
              <li key={id} className={'badge' + (got ? ' badge--got' : '')}>
                <span className="badge__icon" aria-hidden="true">{got ? '★' : '☆'}</span>
                <span className="badge__title">{ACHIEVEMENTS[id].title}</span>
                <span className="badge__desc">{got ? ACHIEVEMENTS[id].desc : 'Kilitli'}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {state.stage === 3 ? (
        <>
          <h2 className="h2">Büyüme</h2>
          <div className="panel">
            <div className="row">
              <div>
                <div className="row__title">Kapasite: {CAPACITY[state.capacityLevel]} araç</div>
                <div className="row__sub">En çok 8 araç</div>
              </div>
              {capCost !== undefined ? (
                <Button small variant="primary" disabled={state.money < capCost} onClick={() => dispatch({ type: 'upgradeCapacity' })}>
                  {`Kapasiteyi artır · ${formatTL(capCost)}`}
                </Button>
              ) : <span className="tag tag--accent">En üst</span>}
            </div>
            <div className="row">
              <div>
                <div className="row__title">{LOCATIONS[state.locationLevel]}</div>
                <div className="row__sub">Daha iyi mekân, daha çok ve zengin alıcı</div>
              </div>
              {locCost !== undefined ? (
                <Button small variant="primary" disabled={state.money < locCost} onClick={() => dispatch({ type: 'upgradeLocation' })}>
                  {`Mekânı yükselt: ${LOCATIONS[state.locationLevel + 1]} · ${formatTL(locCost)}`}
                </Button>
              ) : <span className="tag tag--accent">En üst</span>}
            </div>
          </div>

          <h2 className="h2">Çalışanlar <span className="muted">· günlük {formatTL(dailySalaries(state.employees))}</span></h2>
          <div className="panel">
            {(Object.keys(SALARY) as (keyof Employees)[]).map((role) => (
              <div className="row" key={role}>
                <div>
                  <div className="row__title">{ROLE_LABEL[role]}</div>
                  <div className="row__sub">{ROLE_HELP[role]} · {formatTL(SALARY[role])}/gün</div>
                </div>
                {state.employees[role] ? (
                  <Button small variant="ghost" aria-label={`${ROLE_LABEL[role]}: Çıkar`} onClick={() => dispatch({ type: 'fire', role })}>Çıkar</Button>
                ) : (
                  <Button small aria-label={`${ROLE_LABEL[role]}: İşe al`} onClick={() => dispatch({ type: 'hire', role })}>İşe al</Button>
                )}
              </div>
            ))}
          </div>

          <h2 className="h2">Banka</h2>
          <div className="panel">
            {state.loan ? (
              <div className="row">
                <div>
                  <div className="row__title">Borç: {formatTL(state.loan.principal)}</div>
                  <div className="row__sub">Günlük faiz %1 · {formatTL(Math.round(state.loan.principal * state.loan.dailyRate))}</div>
                </div>
                <Button small variant="primary" disabled={state.money < state.loan.principal} onClick={() => dispatch({ type: 'repayLoan' })}>
                  {`Krediyi öde · ${formatTL(state.loan.principal)}`}
                </Button>
              </div>
            ) : (
              <>
                <p className="hint">Günlük %1 faiz. Ödeyemediğin faiz borca eklenir.</p>
                <div className="chips">
                  {LOAN_OPTIONS.map((a) => (
                    <Button key={a} small onClick={() => dispatch({ type: 'takeLoan', amount: a })}>{`${formatTL(a)} kredi al`}</Button>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="panel panel--muted">
          <p className="muted">Garajı büyütme, çalışan ve kredi Kerem galerici olunca açılır.</p>
        </div>
      )}

      <h2 className="h2">Ayarlar</h2>
      <div className="panel">
        <label className="switch switch--flat">
          <input
            type="checkbox"
            aria-label="Ses ve titreşim"
            checked={sound}
            onChange={(e) => { setSound(e.target.checked); setSoundOn(e.target.checked); }}
          />
          <span className="switch__track" aria-hidden="true" />
          <span>
            <span className="switch__label">Ses ve titreşim</span>
            <span className="switch__hint">Titreşim yalnız Android telefonlarda çalışır.</span>
          </span>
        </label>
      </div>

      <div className="danger-zone">
        {confirm ? (
          <>
            <p className="hint">Tüm ilerleme silinecek. Bu geri alınamaz.</p>
            <div className="chips">
              <Button small variant="danger" onClick={() => { setConfirm(false); onNewGame(); }}>Evet, sıfırla</Button>
              <Button small variant="ghost" onClick={() => setConfirm(false)}>Vazgeç</Button>
            </div>
          </>
        ) : (
          <Button small variant="ghost" onClick={() => setConfirm(true)}>Yeni oyun</Button>
        )}
      </div>
    </section>
  );
}
