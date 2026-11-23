import type { GameState, StoryId } from '../../game/types';
import { STORIES, canChoose } from '../../game/story';
import { formatTL } from '../../game/format';
import { Button } from '../components/Button';
import { portraitUrl } from '../art';

function effect(money?: number, reputation?: number, skill?: number): string {
  const parts: string[] = [];
  if (money) parts.push(`${money > 0 ? '+' : '−'}${formatTL(Math.abs(money))}`);
  if (reputation) parts.push(`itibar ${reputation > 0 ? '+' : '−'}${Math.abs(reputation)}`);
  if (skill) parts.push(`beceri +${skill}`);
  return parts.join(' · ');
}

export function StoryScreen({ id, state, onChoose }: { id: StoryId; state: GameState; onChoose(index: number): void }) {
  const story = STORIES[id];
  return (
    <div className="overlay overlay--center" role="dialog" aria-modal="true" aria-label="Hikâye">
      <div className="overlay__inner overlay__inner--center">
        <img className="story__face" src={portraitUrl(state.age)} alt="" />
        <p className="overlay__kicker">{story.who}, Kerem’e:</p>
        <h1 className="story__text">“{story.text}”</h1>
        <div className="story__choices">
          {story.choices.map((c, i) => (
            <Button key={i} block variant={i === 0 ? 'primary' : 'secondary'} disabled={!canChoose(state, c)} onClick={() => onChoose(i)}>
              <span className="story__label">{c.label}</span>
              {effect(c.money, c.reputation, c.skill) ? <span className="story__effect">{effect(c.money, c.reputation, c.skill)}</span> : null}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
