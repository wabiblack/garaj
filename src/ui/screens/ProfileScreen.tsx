import { useState } from 'react';
import type { Action, GameView } from '../../game/reducer';
import type { Employees } from '../../game/types';
import {
  CAPACITY, CAPACITY_COST, LOCATION_COST, LOCATIONS, ROLE_LABEL, ROLE_STAGE, SALARY, dailySalaries,
} from '../../game/growth';
import { CATEGORY_LABEL, categoriesFor } from '../../game/catalog';
import { EXPERT_DISCOUNT, EXPERT_MAX, EXPERT_STEP, expertLevel } from '../../game/expertise';
import { shareRecordCard } from '../shareCard';
import { extraImage } from '../images';
import { SettingsPanel } from '../components/SettingsPanel';
import { formatTL } from '../../game/format';
import { STAGE_LABEL } from '../components/TopBar';
import { Button } from '../components/Button';
import { ACHIEVEMENTS } from '../../game/career';
import type { AchievementId } from '../../game/types';
import { BRANCHES } from '../../game/growth';
import { RIVAL } from '../../game/rival';
import { portraitUrl } from '../art';
import { MoneyChart } from '../components/MoneyChart';
import { TalentsPanel } from '../components/TalentsPanel';
import { dateLabel } from '../../game/calendar';

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="meter">
      <div className="meter__head"><span>{label}</span><strong>{value}/100</strong></div>
      <div className="meter__track"><div className="meter__fill" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

const ROLE_HELP: Record<keyof Employees, string> = {
  cirak: 'Teklif gelmeyen mala müşteri bulur',
  usta: 'Tamirler %20 ucuz',
  boyaci: 'Boya %30 ucuz',
  satis: 'Her ay +1 alıcı',
};

export function ProfileScreen({ view, dispatch, onMenu, onEditLook }: { view: GameView; dispatch(a: Action): void; onMenu(): void; onEditLook(): void }) {
  const { state } = view;
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const { stats } = state;
  const capCost = CAPACITY_COST[state.capacityLevel];
  const locCost = LOCATION_COST[state.locationLevel];
  return (
    <section>
      <div className="profile">
        <img className="avatar" src={portraitUrl(state.age, state.player.look)} alt="" />
        <div>
          <h1>{state.player.name}</h1>
          <div className="muted">{state.age} yaş · {STAGE_LABEL[state.stage]} · {dateLabel(state.day)}{state.hard ? ' · Zor mod' : ''}</div>
          <Button small variant="ghost" className="mt8" onClick={onEditLook}>Görünümü değiştir</Button>
        </div>
      </div>
      <div className="panel">
        <Meter label="İtibar" value={state.reputation} />
        <Meter label="Tamir becerisi" value={state.skill} />
      </div>
      <TalentsPanel state={state} dispatch={dispatch} />

      <h2 className="h2">Kasa</h2>
      <div className="panel"><MoneyChart points={[...state.history, { day: state.day, money: state.money }]} /></div>

      <h2 className="h2">Rekorlar</h2>
      <div className="panel">
        <div className="stats stats--flat">
          <div className="stat"><span>Toplam satış</span><strong>{stats.sales}</strong></div>
          <div className="stat"><span>Toplam kâr</span><strong>{formatTL(stats.profit)}</strong></div>
          <div className="stat"><span>En kârlı satış</span><strong>{formatTL(stats.bestProfit)}</strong></div>
          <div className="stat"><span>Hangi parça</span><strong className="ellipsis">{stats.bestItem ?? '—'}</strong></div>
          <div className="stat"><span>Motora geçiş</span><strong>{stats.stageDay[2] ? dateLabel(stats.stageDay[2]) : '—'}</strong></div>
          <div className="stat"><span>Galeriye geçiş</span><strong>{stats.stageDay[3] ? dateLabel(stats.stageDay[3]) : '—'}</strong></div>
          <div className="stat"><span>{RIVAL}’in kaptığı</span><strong>{stats.rivalTaken}</strong></div>
          <div className="stat"><span>Holding</span><strong>{stats.stageDay[4] ? dateLabel(stats.stageDay[4]) : '—'}</strong></div>
        </div>
        <Button small onClick={() => void shareRecordCard(state).then(setShareMsg)}>Rekor kartını paylaş</Button>
        {shareMsg ? <p className="hint" role="status">{shareMsg}</p> : null}
      </div>

      <h2 className="h2">Uzmanlık</h2>
      <div className="panel">
        <p className="hint">Aynı türden her {EXPERT_STEP} satış bir seviye. Her seviyede satıcılar %{EXPERT_DISCOUNT * 100} daha aşağı iner.</p>
        {(Object.keys(CATEGORY_LABEL) as (keyof typeof CATEGORY_LABEL)[]).filter((c) => (stats.categorySales[c] ?? 0) > 0 || categoriesFor(state).includes(c)).map((c) => {
          const level = expertLevel(state, c);
          return (
            <div className="row" key={c}>
              <div>
                <div className="row__title">{CATEGORY_LABEL[c]}</div>
                <div className="row__sub">{stats.categorySales[c] ?? 0} satış{level < EXPERT_MAX ? ` · sonraki seviyeye ${EXPERT_STEP * (level + 1) - (stats.categorySales[c] ?? 0)}` : ''}</div>
              </div>
              <span className={'tag' + (level > 0 ? ' tag--accent' : '')} aria-label={`${CATEGORY_LABEL[c]} uzmanlık ${level}/${EXPERT_MAX}`}>{'★'.repeat(level) + '☆'.repeat(EXPERT_MAX - level)}</span>
            </div>
          );
        })}
      </div>

      <section aria-label="Başarımlar">
        <h2 className="h2">Başarımlar <span className="muted">{state.achievements.length}/{Object.keys(ACHIEVEMENTS).length}</span></h2>
        <ul className="badges">
          {(Object.keys(ACHIEVEMENTS) as AchievementId[]).map((id) => {
            const got = state.achievements.includes(id);
            return (
              <li key={id} className={'badge' + (got ? ' badge--got' : '')}>
                {extraImage(`badges/${id}`)
                  ? <img className="badge__img" src={extraImage(`badges/${id}`)} alt="" />
                  : <span className="badge__icon" aria-hidden="true">{got ? '★' : '☆'}</span>}
                <span className="badge__title">{ACHIEVEMENTS[id].title}</span>
                <span className="badge__desc">{got ? ACHIEVEMENTS[id].desc : 'Kilitli'}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {state.stage === 4 ? (
        <>
          <h2 className="h2">Şubeler <span className="muted">{state.branches}/{BRANCHES.length}</span></h2>
          <div className="panel">
            {BRANCHES.map((b, i) => (
              <div className="row" key={b.city}>
                <div>
                  <div className="row__title">{b.city} şubesi</div>
                  <div className="row__sub">Aylık {formatTL(b.income)} gelir · her ay +1 alıcı</div>
                </div>
                {i < state.branches ? <span className="tag tag--accent">Açık</span>
                  : i === state.branches ? (
                    <Button small variant="primary" disabled={state.money < b.cost} onClick={() => dispatch({ type: 'openBranch' })}>{`Aç · ${formatTL(b.cost)}`}</Button>
                  ) : <span className="muted">Sırada</span>}
              </div>
            ))}
          </div>
        </>
      ) : null}

      {state.stage >= 2 ? (
        <>
          <h2 className="h2">Çalışanlar <span className="muted">· aylık {formatTL(dailySalaries(state.employees))}</span></h2>
          <div className="panel">
            {(Object.keys(SALARY) as (keyof Employees)[]).filter((role) => ROLE_STAGE[role] <= state.stage).map((role) => (
              <div className="row" key={role}>
                <div>
                  <div className="row__title">{ROLE_LABEL[role]}</div>
                  <div className="row__sub">{ROLE_HELP[role]} · {formatTL(SALARY[role])}/ay</div>
                </div>
                {state.employees[role] ? (
                  <Button small variant="ghost" aria-label={`${ROLE_LABEL[role]}: Çıkar`} onClick={() => dispatch({ type: 'fire', role })}>Çıkar</Button>
                ) : (
                  <Button small aria-label={`${ROLE_LABEL[role]}: İşe al`} onClick={() => dispatch({ type: 'hire', role })}>İşe al</Button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : null}

      {state.stage >= 3 ? (
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
        </>
      ) : (
        <div className="panel panel--muted">
          <p className="muted">{state.stage === 1 ? 'Çırak motor işinde; garajı büyütme ve usta galerici olunca açılır.' : 'Garajı büyütme ve usta galerici olunca açılır.'}</p>
        </div>
      )}

      <h2 className="h2">Ayarlar</h2>
      <SettingsPanel state={state} dispatch={dispatch} />

      <div className="danger-zone">
        <Button small variant="ghost" onClick={onMenu}>Ana menüye dön</Button>
      </div>
    </section>
  );
}
