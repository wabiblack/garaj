import { useState } from 'react';
import { FAV_COLORS, HAIR_COLORS, NAME_MAX, SKIN_TONES, cleanName, type Look, type Player } from '../../game/player';
import { Button } from '../components/Button';
import { portraitUrl } from '../portrait';

const AGES = [12, 16, 18, 25] as const;
const SKIN_NAMES = ['Açık', 'Buğday', 'Esmer', 'Koyu'];

function Swatches({ label, options, value, onChange }: {
  label: string;
  options: readonly { name: string; hex: string }[];
  value: number;
  onChange(i: number): void;
}) {
  return (
    <fieldset className="swatches">
      <legend className="field__label">{label}</legend>
      <div className="swatches__row">
        {options.map((o, i) => (
          <label key={o.name} className={'swatch' + (i === value ? ' swatch--on' : '')} title={o.name}>
            <input type="radio" name={label} aria-label={o.name} checked={i === value} onChange={() => onChange(i)} />
            <span className="swatch__dot" style={{ background: o.hex }} aria-hidden="true" />
          </label>
        ))}
      </div>
    </fieldset>
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
  const [age, setAge] = useState<(typeof AGES)[number]>(12);
  const set = (patch: Partial<Look>) => setLook((l) => ({ ...l, ...patch }));
  const shown = cleanName(name);
  const random = () => setLook({
    skin: pick(SKIN_TONES.length), hair: pick(HAIR_COLORS.length), color: pick(FAV_COLORS.length), glasses: Math.random() < 0.3,
  });

  return (
    <div className="overlay creator" role="dialog" aria-modal="true" aria-label="Karakter">
      <div className="overlay__inner">
        <p className="overlay__kicker">{editing ? 'Görünümü değiştir' : 'Yeni oyun'}</p>
        <h1 className="creator__title">Karakterini oluştur</h1>

        <div className="creator__preview">
          <img className="creator__face" src={portraitUrl(age, look)} alt={`${shown} ${age} yaşında`} />
          <div className="creator__name">{shown}</div>
          <div className="chips chips--center" role="group" aria-label="Yaşa göre önizle">
            {AGES.map((a) => (
              <button key={a} type="button" className={'chip' + (a === age ? ' chip--on' : '')} aria-pressed={a === age} onClick={() => setAge(a)}>{a} yaş</button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="field__label">Adı</span>
          <input className="field__input" value={name} maxLength={NAME_MAX} autoComplete="off" autoCapitalize="words" onChange={(e) => setName(e.target.value)} />
        </label>
        <Swatches label="Ten rengi" options={SKIN_TONES.map(([hex], i) => ({ name: SKIN_NAMES[i], hex }))} value={look.skin} onChange={(skin) => set({ skin })} />
        <Swatches label="Saç rengi" options={HAIR_COLORS} value={look.hair} onChange={(hair) => set({ hair })} />
        <Swatches label="Sevdiği renk" options={FAV_COLORS} value={look.color} onChange={(color) => set({ color })} />
        <label className="switch switch--flat">
          <input type="checkbox" aria-label="Gözlük" checked={look.glasses} onChange={(e) => set({ glasses: e.target.checked })} />
          <span className="switch__track" aria-hidden="true" />
          <span><span className="switch__label">Gözlük</span></span>
        </label>

        <div className="overlay__footer creator__actions">
          <Button variant="primary" block onClick={() => onDone({ name: shown, look })}>{editing ? 'Kaydet' : 'Hikâyeye başla'}</Button>
          <div className="chips">
            <Button small variant="ghost" onClick={random}>Rastgele görünüm</Button>
            <Button small variant="ghost" onClick={onCancel}>Vazgeç</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
