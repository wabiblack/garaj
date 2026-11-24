import type { Action } from '../../game/reducer';
import { FamilyTaskCard } from '../components/FamilyTaskCard';
import { useState } from 'react';
import type { GameState, Quest } from '../../game/types';
import { ItemCard } from '../components/ItemCard';
import { PERSONALITY_LABEL, storageLimit } from '../../game/negotiation';
import { eventInfo } from '../../game/day';
import { formatTL } from '../../game/format';
import { orderTitle } from '../../game/orders';
import { RIVAL } from '../../game/rival';
import { expertLevel } from '../../game/expertise';

const SPECIAL_LABEL = { mezat: 'Canlı mezat', hurdalik: 'Hurdalık', klasik: 'Nadir klasik' } as const;

function QuestRow({ q }: { q: Quest }) {
  const shown = q.kind === 'kar' ? (q.done ? 1 : 0) : q.progress;
  const total = q.kind === 'kar' ? 1 : q.target;
  return (
    <li className={'quest' + (q.done ? ' quest--done' : '')}>
      <div className="quest__main">
        <div className="quest__title">{q.title}</div>
        <div className="quest__track"><div className="quest__fill" style={{ width: `${(shown / total) * 100}%` }} /></div>
      </div>
      <div className="quest__side">
        <span className="quest__count">{q.done ? '✓' : `${shown}/${total}`}</span>
        <span className="quest__reward">+{formatTL(q.reward)}</span>
      </div>
    </li>
  );
}

const QUESTS_KEY = 'garaj.gorevler';

/** Görevler tek satıra katlanır; açık/kapalı tercihi cihazda hatırlanır. */
function Quests({ quests }: { quests: Quest[] }) {
  const [open, setOpen] = useState(() => {
    try { return window.localStorage.getItem(QUESTS_KEY) === 'acik'; } catch { return false; }
  });
  const done = quests.filter((q) => q.done).length;
  const reward = quests.filter((q) => !q.done).reduce((sum, q) => sum + q.reward, 0);
  return (
    <section className="quests" aria-label="Görevler">
      <details
        open={open}
        onToggle={(e) => {
          const next = e.currentTarget.open;
          setOpen(next);
          try { window.localStorage.setItem(QUESTS_KEY, next ? 'acik' : 'kapali'); } catch { /* depolama kapalı */ }
        }}
      >
        <summary className="quests__sum">
          <span className="quests__head">Görevler</span>
          <span className="quests__dots" aria-hidden="true">
            {quests.map((q) => <span key={q.id} className={'quests__dot' + (q.done ? ' quests__dot--on' : '')} />)}
          </span>
          <span className="quests__meta">{done}/{quests.length}{reward > 0 ? <> · <span className="quest__reward">+{formatTL(reward)}</span></> : null}</span>
          <svg className="quests__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </summary>
        <ul>{quests.map((q) => <QuestRow key={q.id} q={q} />)}</ul>
      </details>
    </section>
  );
}

export function ListingsScreen({ state, onOpen, dispatch }: { state: GameState; onOpen(id: string): void; dispatch(a: Action): void }) {
  return (
    <section>
      <FamilyTaskCard state={state} dispatch={dispatch} />
      {state.event ? (
        <div className="event">
          <div className="event__title">{eventInfo(state.event, state.stage).title}</div>
          <div className="event__text">{eventInfo(state.event, state.stage).text}</div>
        </div>
      ) : null}
      {state.summary.notes.length > 0 ? (
        <div className="notice">
          {state.summary.notes.map((n, i) => <p key={i}>{n}</p>)}
        </div>
      ) : null}
      {state.quests.length > 0 ? <Quests quests={state.quests} /> : null}
      {state.orders.length > 0 ? (
        <section className="orders" aria-label="Siparişler">
          <h2 className="quests__head">Müşteri siparişleri</h2>
          <ul>
            {state.orders.map((o) => (
              <li key={o.id} className="order">
                <div className="order__main">
                  <div className="quest__title">{orderTitle(o)}</div>
                  <div className="order__sub">Durumu en az %{o.minCondition}, kusursuz · piyasa değerinin %{Math.round(o.bonus * 100)} fazlasını öder</div>
                </div>
                <span className="order__days">{o.daysLeft} gün</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="section-head">
        <h1>İlanlar</h1>
        <span className="muted">Depo {state.inventory.length}/{storageLimit(state)}</span>
      </div>
      {state.listings.length === 0 ? (
        <div className="empty">Bugünlük ilan kalmadı. Günü bitirip yarını bekle.</div>
      ) : (
        <div className="list">
          {state.listings.map((l) => (
            <ItemCard
              key={l.id}
              item={l.item}
              price={l.askPrice}
              subtitle={l.sellerName}
              badge={
                <>
                  {l.special ? <span className="tag tag--accent">{SPECIAL_LABEL[l.special]}</span> : null}
                  {expertLevel(state, l.item.category) > 0 && l.special !== 'mezat' ? <span className="tag tag--expert">Uzmanlık alanın</span> : null}
                  {l.rivalEye ? <span className="tag tag--rival">{RIVAL} göz koydu</span> : null}
                  {l.personality !== 'normal' ? <span className={'tag tag--persona tag--' + l.personality}>{PERSONALITY_LABEL[l.personality]}</span> : null}
                </>
              }
              onClick={() => onOpen(l.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
