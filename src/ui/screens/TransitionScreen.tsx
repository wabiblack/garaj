import type { Stage } from '../../game/types';
import { Button } from '../components/Button';
import { portraitUrl } from '../art';

const AGE = { 2: 16, 3: 18, 4: 25 } as const;
const TEXT: Record<2 | 3 | 4, { when: string; body: string; next: string }> = {
  2: {
    when: '4 yıl sonra…',
    body: 'Kerem 16 yaşında. Bisikletler, güvercinler geride kaldı; biriktirdiği parayla artık motor alıp satabilir.',
    next: 'Yeni hedef: 500.000 TL',
  },
  3: {
    when: '2 yıl sonra…',
    body: 'Kerem 18 yaşında, ehliyetini aldı. Amcası sanayideki garajını ona bıraktı. Artık araba zamanı.',
    next: 'Yeni hedef: şehrin en büyük galericisi olmak',
  },
  4: {
    when: '7 yıl sonra…',
    body: 'Kerem 25 yaşında. Şehrin bir numarası oldu; şimdi Kerem Holding’i kurup başka şehirlere açılıyor.',
    next: 'Yeni hedef: İzmir, Ankara ve Antalya’da şube açmak',
  },
};

export function TransitionScreen({ to, onContinue }: { to: Stage; onContinue(): void }) {
  const key = to === 1 ? 2 : to;
  const t = TEXT[key];
  return (
    <div className="overlay overlay--center" role="dialog" aria-modal="true" aria-label="Yeni dönem">
      <div className="overlay__inner overlay__inner--center">
        <img className="story__face" src={portraitUrl(AGE[key])} alt={`Kerem ${AGE[key]} yaşında`} />
        <p className="overlay__kicker">{t.when}</p>
        <h1 className="transition__title">{t.body}</h1>
        <p className="muted">{t.next}</p>
        <Button variant="primary" block onClick={onContinue}>Devam</Button>
      </div>
    </div>
  );
}
