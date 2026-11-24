import type { Action } from '../../game/reducer';
import type { GameState, TalentId } from '../../game/types';
import { TALENTS, TALENT_MAX, TRAITS, xpForLevel } from '../../game/talents';
import { Button } from './Button';

/** Karakter gelişimi: seviye, tecrübe çubuğu, kişilik ve yetenekler. */
export function TalentsPanel({ state, dispatch }: { state: GameState; dispatch(a: Action): void }) {
  const { xp, level, points, ranks } = state.talents;
  const from = xpForLevel(level), to = xpForLevel(level + 1);
  const pct = Math.min(100, ((xp - from) / (to - from)) * 100);
  const trait = state.player.trait ? TRAITS[state.player.trait] : null;
  return (
    <section aria-label="Yetenekler">
      <h2 className="h2">Yetenekler {points > 0 ? <span className="tag tag--accent">{points} puan</span> : null}</h2>
      <div className="panel">
        <div className="meter">
          <div className="meter__head"><span>Seviye {level}</span><strong>{xp - from}/{to - from} tecrübe</strong></div>
          <div className="meter__track"><div className="meter__fill" style={{ width: `${pct}%` }} /></div>
        </div>
        <p className="hint">Alım, satış, tamir ve aile görevleri tecrübe kazandırır. Her seviyede bir yetenek puanı.</p>
        {trait ? <p className="hint"><strong>{trait.name}:</strong> {trait.story}</p> : null}
        {(Object.keys(TALENTS) as TalentId[]).map((id) => (
          <div className="row" key={id}>
            <div>
              <div className="row__title">{TALENTS[id].name}</div>
              <div className="row__sub">{TALENTS[id].text}</div>
            </div>
            {points > 0 && ranks[id] < TALENT_MAX ? (
              <Button small variant="primary" aria-label={`${TALENTS[id].name} geliştir`} onClick={() => dispatch({ type: 'learnTalent', id })}>
                {'★'.repeat(ranks[id]) + '☆'.repeat(TALENT_MAX - ranks[id])} +
              </Button>
            ) : (
              <span className={'tag' + (ranks[id] > 0 ? ' tag--accent' : '')} aria-label={`${TALENTS[id].name} ${ranks[id]}/${TALENT_MAX}`}>
                {'★'.repeat(ranks[id]) + '☆'.repeat(TALENT_MAX - ranks[id])}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
