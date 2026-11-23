import { Button } from '../components/Button';
import { ItemImage } from '../components/ItemCard';
import type { Item } from '../../game/types';

const art = (category: Item['category'], brand: string, model: string): Item => ({
  id: 'intro-' + model, category, brand, model, baseValue: 0, condition: 100, defects: [], tags: [],
  cleaned: false, painted: false, careCount: 0, caredToday: false, boughtFor: 0,
});

const STEPS = [
  { item: art('bisiklet', 'Serçe', 'Şehir 26'), age: '12 yaş', text: 'Bisiklet, güvercin, eski telefon' },
  { item: art('motor', 'Kartal', 'K125'), age: '16 yaş', text: 'İkinci el motorlar' },
  { item: art('araba', 'Marmara', 'GT Coupe'), age: '18 yaş', text: 'Arabalar ve kendi galerin' },
];

export function IntroScreen({ onStart }: { onStart(): void }) {
  return (
    <div className="overlay overlay--center" role="dialog" aria-modal="true" aria-label="Hikâye">
      <div className="overlay__inner overlay__inner--center intro">
        <p className="overlay__kicker">Garaj</p>
        <h1 className="transition__title">Kerem 12 yaşında. Cebinde 2.000 TL var.</h1>
        <p className="muted">Ucuza al, temizle, tamir et, kârla sat. Biriktirdikçe büyü: mahalleden şehrin en büyük galerisine.</p>
        <ol className="intro__steps">
          {STEPS.map((s) => (
            <li key={s.age} className="intro__step">
              <div className="intro__art"><ItemImage item={s.item} /></div>
              <div>
                <div className="intro__age">{s.age}</div>
                <div className="intro__text">{s.text}</div>
              </div>
            </li>
          ))}
        </ol>
        <Button variant="primary" block onClick={onStart}>Başla</Button>
      </div>
    </div>
  );
}
