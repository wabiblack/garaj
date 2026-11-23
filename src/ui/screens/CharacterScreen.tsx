import { useState } from 'react';
import { FAV_COLORS, HAIR_COLORS, NAME_MAX, SKIN_TONES, cleanName, type Look, type Player } from '../../game/player';
import { Button } from '../components/Button';
import { portraitUrl } from '../portrait';

const AGES = [12, 16, 18, 25] as const;
type Age = (typeof AGES)[number];
const SKIN_NAMES = ['Açık', 'Buğday', 'Esmer', 'Koyu'];
type Part = 'ten' | 'sac' | 'renk' | 'gozluk';
const PARTS: { id: Part; label: string }[] = [
  { id: 'ten', label: 'Ten' },
  { id: 'sac', label: 'Saç' },
  { id: 'renk', label: 'Renk' },
  { id: 'gozluk', label: 'Gözlük' },
];

/** Her seçenek, o seçenek uygulanmış küçük bir portreyle gösterilir. */
function Options({ part, look, age, onPick }: { part: Part; look: Look; age: Age; onPick(patch: Partial<Look>): void }) {
  const items: { name: string; patch: Partial<Look>; on: boolean; dot?: string }[] =
    part === 'ten' ? SKIN_TONES.map(([hex], i) => ({ name: SKIN_NAMES[i], patch: { skin: i }, on: look.skin === i, dot: hex }))
    : part === 'sac' ? HAIR_COLORS.map((c, i) => ({ name: c.name, patch: { hair: i }, on: look.hair === i, dot: c.hex }))
    : part === 'renk' ? FAV_COLORS.map((c, i) => ({ name: c.name, patch: { color: i }, on: look.color === i, dot: c.hex }))
    : [{ name: 'Gözlüksüz', patch: { glasses: false }, on: !look.glasses }, { name: 'Gözlüklü', patch: { glasses: true }, on: look.glasses }];
  return (
    <div className="opts" role="radiogroup" aria-label={PARTS.find((p) => p.id === part)!.label}>
      {items.map((o) => (
        <label key={o.name} className={'opt' + (o.on ? ' opt--on' : '')}>
          <input type="radio" name={part} aria-label={o.name} checked={o.on} onChange={() => onPick(o.patch)} />
          <img className="opt__face" src={portraitUrl(age, { ...look, ...o.patch })} alt="" />
          <span className="opt__name">
            {o.dot ? <span className="opt__dot" style={{ background: o.dot }} aria-hidden="true" /> : null}
            {o.name}
          </span>
        </label>
      ))}
    </div>
  );
}

const pick = (n: number) => Math.floor(Math.random() * n);

export function CharacterScreen({ initial, editing, onDone, onCancel }: {
  initial: Player;
  editing?: boolean;
  onDone(p: Player): void;
  onCancel(): void;
}) {
  const [name, setName] = useState(initial.name);
  const [look, setLook] = useState<Look>(initial.look);
  const [age, setAge] = useState<Age>(12);
  const [part, setPart] = useState<Part>('ten');
  const [spin, setSpin] = useState(0);
  const set = (patch: Partial<Look>) => setLook((l) => ({ ...l, ...patch }));
  const shown = cleanName(name);
  const random = () => {
    setLook({ skin: pick(SKIN_TONES.length), hair: pick(HAIR_COLORS.length), color: pick(FAV_COLORS.length), glasses: Math.random() < 0.3 });
    setSpin((n) => n + 1);
  };

  return (
    <div className="creator" role="dialog" aria-modal="true" aria-label="Karakter">
      <header className="creator__bar">
        <button type="button" className="creator__back" onClick={onCancel}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          Vazgeç
        </button>
        <span className="creator__kicker">{editing ? 'Görünümü değiştir' : 'Karakterini oluştur'}</span>
        <button type="button" className="creator__dice" aria-label="Rastgele görünüm" onClick={random}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="9" cy="9" r="1.3" /><circle cx="15" cy="15" r="1.3" /><circle cx="15" cy="9" r="1.3" /><circle cx="9" cy="15" r="1.3" /></svg>
        </button>
      </header>

      <section className="creator__stage" aria-label="Önizleme">
        <img key={spin} className="creator__face" src={portraitUrl(age, look)} alt={`${shown} ${age} yaşında`} />
        <div className="creator__name">{shown}</div>
        <div className="seg" role="group" aria-label="Yaşa göre önizle">
          {AGES.map((a) => (
            <button key={a} type="button" className={'seg__btn' + (a === age ? ' seg__btn--on' : '')} aria-pressed={a === age} onClick={() => setAge(a)}>{a} yaş</button>
          ))}
        </div>
      </section>

      <section className="creator__panel">
        <label className="creator__field">
          <span className="field__label">Adı</span>
          <input className="field__input" value={name} maxLength={NAME_MAX} autoComplete="off" autoCapitalize="words" enterKeyHint="done" onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="tabs" role="tablist" aria-label="Görünüm">
          {PARTS.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={p.id === part} className={'tabs__btn' + (p.id === part ? ' tabs__btn--on' : '')} onClick={() => setPart(p.id)}>{p.label}</button>
          ))}
        </div>
        <Options part={part} look={look} age={age} onPick={set} />
      </section>

      <footer className="creator__foot">
        <Button variant="primary" block onClick={() => onDone({ name: shown, look })}>{editing ? 'Kaydet' : 'Hikâyeye başla'}</Button>
      </footer>
    </div>
  );
}
