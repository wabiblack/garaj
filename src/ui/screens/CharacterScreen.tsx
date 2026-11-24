import { useState } from 'react';
import {
  ACCESSORIES, BROWS, EYE_COLORS, FAV_COLORS, GLASSES, HAIR_COLORS, HAIR_STYLES, NAME_MAX, SKIN_TONES, TRAIT_IDS,
  cleanName, type Look, type Player,
} from '../../game/player';
import { TALENTS, TRAITS } from '../../game/talents';
import type { TraitId } from '../../game/types';
import { Button } from '../components/Button';
import { START_AGE, type StartStage } from '../../game/newGame';
import { portraitUrl } from '../portrait';

const AGES = [12, 16, 18, 25] as const;
type Age = (typeof AGES)[number];
/** Yeni oyunda yaş seçimi başlangıç yaşıdır; görünüm düzenlerken yalnız önizlemedir. */
const START_STAGES = (Object.keys(START_AGE).map(Number) as StartStage[]);
const SKIN_NAMES = ['Açık', 'Buğday', 'Esmer', 'Koyu'];
type Part = 'kisilik' | 'ten' | 'sac' | 'model' | 'goz' | 'yuz' | 'renk' | 'gozluk' | 'aksesuar';
const PARTS: { id: Part; label: string }[] = [
  { id: 'kisilik', label: 'Kişilik' },
  { id: 'ten', label: 'Ten' },
  { id: 'sac', label: 'Saç' },
  { id: 'model', label: 'Model' },
  { id: 'goz', label: 'Göz' },
  { id: 'yuz', label: 'Yüz' },
  { id: 'renk', label: 'Renk' },
  { id: 'gozluk', label: 'Gözlük' },
  { id: 'aksesuar', label: 'Aksesuar' },
];
/** Yüz sekmesi: kaş ve çil birlikte. */
const FACES: { name: string; patch: Partial<Look> }[] = [
  { name: 'Sade', patch: { brows: 0, freckles: false } },
  { name: 'Çilli', patch: { brows: 0, freckles: true } },
  { name: BROWS[1], patch: { brows: 1, freckles: false } },
  { name: 'Çilli, kalın kaş', patch: { brows: 1, freckles: true } },
];

type Item = { name: string; patch: Partial<Look>; on: boolean; dot?: string };

function lookItems(part: Exclude<Part, 'kisilik'>, look: Look): Item[] {
  const list = (names: readonly string[], key: 'glasses' | 'style' | 'accessory') =>
    names.map((name, i) => ({ name, patch: { [key]: i } as Partial<Look>, on: look[key] === i }));
  const colors = (cs: readonly { name: string; hex: string }[], key: 'hair' | 'color' | 'eyes') =>
    cs.map((c, i) => ({ name: c.name, patch: { [key]: i } as Partial<Look>, on: look[key] === i, dot: c.hex }));
  switch (part) {
    case 'ten': return SKIN_TONES.map(([hex], i) => ({ name: SKIN_NAMES[i], patch: { skin: i }, on: look.skin === i, dot: hex }));
    case 'sac': return colors(HAIR_COLORS, 'hair');
    case 'model': return list(HAIR_STYLES, 'style');
    case 'goz': return colors(EYE_COLORS, 'eyes');
    case 'yuz': return FACES.map((f) => ({ ...f, on: look.brows === f.patch.brows && look.freckles === f.patch.freckles }));
    case 'renk': return colors(FAV_COLORS, 'color');
    case 'gozluk': return list(GLASSES, 'glasses');
    case 'aksesuar': return list(ACCESSORIES, 'accessory');
  }
}

/** Her görünüm seçeneği, o seçenek uygulanmış küçük bir portreyle gösterilir. */
function LookOptions({ part, look, age, onPick }: { part: Exclude<Part, 'kisilik'>; look: Look; age: Age; onPick(patch: Partial<Look>): void }) {
  return (
    <div className="opts" role="radiogroup" aria-label={PARTS.find((p) => p.id === part)!.label}>
      {lookItems(part, look).map((o) => (
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

/** Kişilik: hikâyesi ve oyuna kattığı avantaj. */
function TraitOptions({ trait, onPick }: { trait: TraitId; onPick(t: TraitId): void }) {
  return (
    <div className="traits" role="radiogroup" aria-label="Kişilik">
      {TRAIT_IDS.map((id) => {
        const t = TRAITS[id];
        const perk = t.talent ? `${TALENTS[t.talent].name} 1. seviyeden başlar` : `%${Math.round((t.xpBonus ?? 0) * 100)} fazla tecrübe`;
        return (
          <label key={id} className={'trait' + (trait === id ? ' trait--on' : '')}>
            <input type="radio" name="kisilik" aria-label={t.name} checked={trait === id} onChange={() => onPick(id)} />
            <span className="trait__name">{t.name}</span>
            <span className="trait__story">{t.story}</span>
            <span className="trait__perk">{perk}</span>
          </label>
        );
      })}
    </div>
  );
}

const pick = (n: number) => Math.floor(Math.random() * n);

const START_HINT: Partial<Record<Age, string>> = {
  12: 'Bisikletle, en baştan başlarsın.',
  16: 'Motorlarla başlarsın, cebinde daha çok para olur.',
  18: 'Arabalarla başlarsın; kendi galerine en yakın yaş.',
};

export function CharacterScreen({ initial, editing, onDone, onCancel }: {
  initial: Player;
  editing?: boolean;
  onDone(p: Player, stage: StartStage): void;
  onCancel(): void;
}) {
  const [name, setName] = useState(initial.name);
  const [look, setLook] = useState<Look>(initial.look);
  const [trait, setTrait] = useState<TraitId>(initial.trait ?? 'tamirci');
  const [age, setAge] = useState<Age>(12);
  const [part, setPart] = useState<Part>(editing ? 'ten' : 'kisilik');
  const [spin, setSpin] = useState(0);
  const set = (patch: Partial<Look>) => setLook((l) => ({ ...l, ...patch }));
  const shown = cleanName(name);
  const parts = editing ? PARTS.filter((p) => p.id !== 'kisilik') : PARTS;
  const random = () => {
    setLook({
      skin: pick(SKIN_TONES.length), hair: pick(HAIR_COLORS.length), color: pick(FAV_COLORS.length),
      glasses: Math.random() < 0.3 ? 1 + pick(GLASSES.length - 1) : 0, style: pick(HAIR_STYLES.length),
      eyes: pick(EYE_COLORS.length), brows: pick(BROWS.length), freckles: Math.random() < 0.3,
      accessory: Math.random() < 0.4 ? 1 + pick(ACCESSORIES.length - 1) : 0,
    });
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
        <div className="creator__name">{shown}{editing ? null : <span className="creator__trait"> · {TRAITS[trait].name}</span>}</div>
        {editing ? (
          <div className="seg" role="group" aria-label="Yaşa göre önizle">
            {AGES.map((a) => (
              <button key={a} type="button" className={'seg__btn' + (a === age ? ' seg__btn--on' : '')} aria-pressed={a === age} onClick={() => setAge(a)}>{a} yaş</button>
            ))}
          </div>
        ) : (
          <div className="creator__start">
            <div className="seg" role="radiogroup" aria-label="Başlangıç yaşı">
              {START_STAGES.map((st) => {
                const a = START_AGE[st] as Age;
                return (
                  <label key={st} className={'seg__btn' + (a === age ? ' seg__btn--on' : '')}>
                    <input type="radio" name="baslangic" aria-label={`${a} yaş`} checked={a === age} onChange={() => setAge(a)} />
                    {a} yaş
                  </label>
                );
              })}
            </div>
            <p className="creator__hint">{START_HINT[age]}</p>
          </div>
        )}
      </section>

      <section className="creator__panel">
        <label className="creator__field">
          <span className="field__label">Adı</span>
          <input className="field__input" value={name} maxLength={NAME_MAX} autoComplete="off" autoCapitalize="words" enterKeyHint="done" onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="tabs tabs--scroll" role="tablist" aria-label="Görünüm">
          {parts.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={p.id === part} className={'tabs__btn' + (p.id === part ? ' tabs__btn--on' : '')} onClick={() => setPart(p.id)}>{p.label}</button>
          ))}
        </div>
        {part === 'kisilik'
          ? <TraitOptions trait={trait} onPick={setTrait} />
          : <LookOptions part={part} look={look} age={age} onPick={set} />}
      </section>

      <footer className="creator__foot">
        <Button variant="primary" block onClick={() => onDone({ name: shown, look, trait: editing ? initial.trait : trait }, START_STAGES.find((st) => START_AGE[st] === age) ?? 1)}>{editing ? 'Kaydet' : 'Hikâyeye başla'}</Button>
      </footer>
    </div>
  );
}
