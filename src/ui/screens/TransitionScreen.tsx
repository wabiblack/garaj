import type { Stage } from '../../game/types';
import type { Player } from '../../game/player';
import { Button } from '../components/Button';
import { portraitUrl } from '../art';
import { extraImage } from '../images';
import type { CSSProperties } from 'react';

const TEXT: Record<2 | 3 | 4, { when: string; body(name: string): string; next: string }> = {
  2: {
    when: 'Motor ehliyeti',
    body: (n) => `${n} 16 yaşına girdi ve motor ehliyetini aldı. Biriktirdiği parayla artık motor da alıp satabilir.`,
    next: 'Yeni hedef: 500.000 TL',
  },
  3: {
    when: 'Reşit oldu',
    body: (n) => `${n} 18 yaşında, araba ehliyetini aldı. Amcası sanayideki garajını ona bıraktı. Artık araba zamanı.`,
    next: 'Yeni hedef: şehrin en büyük galericisi olmak',
  },
  4: {
    when: 'Holding zamanı',
    body: (n) => `${n} şehrin bir numarası oldu; şimdi ${n} Holding’i kurup başka şehirlere açılıyor.`,
    next: 'Yeni hedef: İzmir, Ankara ve Antalya’da şube açmak',
  },
};

export function TransitionScreen({ to, player, age, onContinue }: { to: Stage; player: Player; age: number; onContinue(): void }) {
  const key = to === 1 ? 2 : to;
  const t = TEXT[key];
  const scene = extraImage(`scenes/donem-${key}`);
  return (
    <div
      className={'overlay overlay--center' + (scene ? ' overlay--scene' : '')}
      style={scene ? ({ '--scene': `url("${scene}")` } as CSSProperties) : undefined}
      role="dialog" aria-modal="true" aria-label="Yeni dönem"
    >
      <div className="overlay__inner overlay__inner--center">
        <img className="story__face" src={portraitUrl(age, player.look)} alt={`${player.name} ${age} yaşında`} />
        <p className="overlay__kicker">{t.when}</p>
        <h1 className="transition__title">{t.body(player.name)}</h1>
        <p className="muted">{t.next}</p>
        <Button variant="primary" block onClick={onContinue}>Devam</Button>
      </div>
    </div>
  );
}
