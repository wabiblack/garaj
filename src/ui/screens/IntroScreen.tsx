import { useState, type CSSProperties, type ReactNode } from 'react';
import { Button } from '../components/Button';
import { formatTL } from '../../game/format';
import { ItemImage } from '../components/ItemCard';
import type { GameState, Item } from '../../game/types';
import { portraitUrl } from '../art';
import { extraImage } from '../images';

const art = (category: Item['category'], brand: string, model: string): Item => ({
  id: 'intro-' + model, category, brand, model, baseValue: 0, condition: 100, defects: [], tags: [],
  cleaned: false, painted: false, careCount: 0, caredToday: false, boughtFor: 0,
});

const PATH = [
  { item: art('bisiklet', 'Serçe', 'Şehir 26'), age: 12, text: 'Bisiklet, güvercin, eski telefon' },
  { item: art('motor', 'Kartal', 'K125'), age: 16, text: 'İkinci el motorlar' },
  { item: art('araba', 'Marmara', 'GT Coupe'), age: 18, text: 'Arabalar ve kendi galerin' },
];

interface Scene { kicker: string; title: string; text?: string; art: ReactNode }

function scenes(state: GameState): Scene[] {
  const { name } = state.player;
  const adult = state.age >= 18;
  const dede = extraImage('ui/dede');
  return [
    {
      kicker: 'Garaj',
      title: `${name} ${state.age} yaşında.`,
      text: 'Dedesinin mahalledeki eski garajı, dünyada en sevdiği yer.',
      art: <div className="intro__art intro__art--big"><ItemImage item={PATH[0].item} /></div>,
    },
    {
      kicker: 'Dede',
      title: '“Her eşyanın bir hikâyesi var. Ucuza al, emeğini kat, değerinde sat.”',
      text: '“Bir de dürüst ol. Gizlediğin kusur bir gün mutlaka ortaya çıkar.”',
      art: dede ? <img className="intro__face intro__face--bust" src={dede} alt="" /> : null,
    },
    {
      kicker: 'Annen ve baban',
      title: adult ? 'Artık reşitsin: bankadan kredi çekebilirsin.' : 'Reşit olana kadar banka yok.',
      text: adult
        ? 'Ama ailene verdiğin sözler hâlâ geçerli. Borcunu zamanında öde.'
        : 'Okul aksamayacak, verilen sözler tutulacak. Paraya sıkışırsan önce aileye danışacaksın.',
      art: <img className="intro__face" src={portraitUrl(state.age, state.player.look)} alt="" />,
    },
    {
      kicker: 'Hedef',
      title: `Cebinde ${formatTL(state.money)} var.`,
      text: 'Ucuza al, temizle, tamir et, kârla sat. Biriktirdikçe büyü: mahalleden şehrin en büyük galerisine.',
      art: (
        <ol className="intro__steps">
          {PATH.filter((s) => s.age >= state.age).map((s) => (
            <li key={s.age} className="intro__step">
              <div className="intro__art"><ItemImage item={s.item} /></div>
              <div>
                <div className="intro__age">{s.age} yaş</div>
                <div className="intro__text">{s.text}</div>
              </div>
            </li>
          ))}
        </ol>
      ),
    },
  ];
}

/** Yeni oyunun açılış hikâyesi: dört sahne, istenirse atlanır. */
export function IntroScreen({ state, onStart }: { state: GameState; onStart(): void }) {
  const [i, setI] = useState(0);
  const all = scenes(state);
  const scene = all[i];
  const last = i === all.length - 1;
  const bg = extraImage(`scenes/acilis-${i + 1}`);
  return (
    <div
      className={'overlay overlay--center' + (bg ? ' overlay--scene' : '')}
      style={bg ? ({ '--scene': `url("${bg}")` } as CSSProperties) : undefined}
      role="dialog" aria-modal="true" aria-label="Hikâye"
    >
      {last ? null : <button type="button" className="intro__skip" onClick={onStart}>Atla</button>}
      <div className="overlay__inner overlay__inner--center intro" key={i}>
        {bg && !last ? null : scene.art}
        <p className="overlay__kicker">{scene.kicker}</p>
        <h1 className="transition__title">{scene.title}</h1>
        {scene.text ? <p className="muted">{scene.text}</p> : null}
        <div className="intro__dots" aria-hidden="true">
          {all.map((_, n) => <span key={n} className={'coach__dot' + (n <= i ? ' coach__dot--on' : '')} />)}
        </div>
        {last
          ? <Button variant="primary" block onClick={onStart}>Başla</Button>
          : <Button variant="primary" block onClick={() => setI(i + 1)}>İleri</Button>}
      </div>
    </div>
  );
}
