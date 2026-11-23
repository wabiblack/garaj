import type { GameState, Quest } from '../../game/types';
import { ItemCard } from '../components/ItemCard';
import { PERSONALITY_LABEL, storageLimit } from '../../game/negotiation';
import { EVENT_INFO } from '../../game/day';
import { formatTL } from '../../game/format';
import { orderTitle } from '../../game/orders';
import { RIVAL } from '../../game/rival';
import { expertLevel } from '../../game/expertise';
import { useState } from 'react';
import { coachDismissed, coachTip, dismissCoach } from '../coach';

function Coach({ state }: { state: GameState }) {
  const [hidden, setHidden] = useState(coachDismissed);
  const tip = hidden ? null : coachTip(state);
  if (!tip) return null;
  return (
    <aside className="coach" aria-label="Rehber">
      <span className="coach__icon" aria-hidden="true">💡</span>
      <p className="coach__text">{tip}</p>
      <button type="button" className="coach__close" aria-label="Rehberi kapat" onClick={() => { dismissCoach(); setHidden(true); }}>×</button>
    </aside>
  );
}

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

export function ListingsScreen({ state, onOpen }: { state: GameState; onOpen(id: string): void }) {
  return (
    <section>
      <Coach state={state} />
      {state.event ? (
        <div className="event">
          <div className="event__title">{EVENT_INFO[state.event].title}</div>
          <div className="event__text">{EVENT_INFO[state.event].text}</div>
        </div>
      ) : null}
      {state.summary.notes.length > 0 ? (
        <div className="notice">
          {state.summary.notes.map((n, i) => <p key={i}>{n}</p>)}
        </div>
      ) : null}
      {state.quests.length > 0 ? (
        <section className="quests" aria-label="Görevler">
          <h2 className="quests__head">Görevler</h2>
          <ul>{state.quests.map((q) => <QuestRow key={q.id} q={q} />)}</ul>
        </section>
      ) : null}
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
