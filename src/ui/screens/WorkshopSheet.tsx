import { useEffect, useMemo, useRef, useState } from 'react';
import { cue } from '../feedback';
import type { Action } from '../../game/reducer';
import type { Defect, GameState, Item, PartSource } from '../../game/types';
import { HIT_GRACE, HIT_ZONE, isHit, repairCost } from '../../game/prep';
import { formatTL } from '../../game/format';
import { itemName } from '../../game/selling';
import { CARE_NAME, SOURCES, TOOL_NAME, defectInfo, partPrice, treatCost, type CareId, type ToolId } from '../../game/workshop';
import { talentRank } from '../../game/talents';
import { Sheet } from '../components/Sheet';
import { Button } from '../components/Button';
import { extraImage } from '../images';

/** Teşhiste doğru parçanın yanında gösterilen sağlam parçalar. */
const DECOYS: [id: string, name: string][] = [
  ['vida', 'Vidalar'], ['fan', 'Fan'], ['batarya', 'Batarya'], ['zincir', 'Zincir'], ['conta', 'Conta'], ['buji', 'Buji'],
  ['aku', 'Akü'], ['fren-balatasi', 'Fren balatası'], ['kamera-modulu', 'Kamera modülü'], ['anakart', 'Anakart'], ['ekran', 'Ekran'],
];
const ICON: Record<string, string> = {
  vida: '🔩', fan: '🌀', batarya: '🔋', aku: '🔋', zincir: '⛓️', ekran: '📱', lens: '📷', jant: '⭕', 'gitar-teli': '🎸', kol: '🎮',
  anakart: '💾', conta: '⚫', buji: '⚡', 'fren-balatasi': '🛑', 'kamera-modulu': '📸', 'disk-okuyucu': '💿', 'ic-lastik': '🛞',
  debriyaj: '⚙️', karburator: '⚙️', sanziman: '⚙️', 'triger-kayisi': '➰', 'motor-yagi': '🛢️', kaporta: '🚪',
  'tornavida-duz': '🪛', 'tornavida-yildiz': '🪛', anahtar: '🔧', lokma: '🔧', pense: '🗜️', vantuz: '🪠', 'isi-tabancasi': '🔥',
  'yama-kiti': '🩹', 'sprey-boya': '🎨', 'ariza-cihazi': '📟', 'olcu-aleti': '📏', 'tork-anahtari': '🔧',
  mama: '🥣', su: '💧', yem: '🌾', ilac: '💊', asi: '💉', firca: '🪮', sampuan: '🧴', tasma: '🦮', kargo: '📦',
};
const TAPS_PER_SCREW = 3;
const TORQUE_TRIES = 3;
const SWEEP_MS = [1100, 900, 750];
const BRUSH_STROKES = 8;

/** 0→1→0 gidip gelen ibre konumu. */
export function needleAt(ms: number, sweep: number): number {
  const t = (ms / sweep) % 2;
  return t <= 1 ? t : 2 - t;
}

const pickDeterministic = <T,>(xs: T[], seed: string, n: number): T[] => {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const copy = [...xs];
  const out: T[] = [];
  while (out.length < n && copy.length) { h = (h * 1103515245 + 12345) >>> 0; out.push(copy.splice(h % copy.length, 1)[0]); }
  return out;
};

function Pic({ dir, id, label }: { dir: string; id: string; label: string }) {
  const src = extraImage(`${dir}/${id}`);
  return (
    <span className="ws-pic">
      {src ? <img src={src} alt="" /> : <span className="ws-pic__icon" aria-hidden="true">{ICON[id] ?? '🧰'}</span>}
      <span className="ws-pic__label">{label}</span>
    </span>
  );
}

/** Tork ayarı: ibre yeşildeyken sık. Eski "Vur" mini oyunu. */
function Torque({ onDone }: { onDone(hits: number): void }) {
  const [results, setResults] = useState<boolean[]>([]);
  const [pos, setPos] = useState(0);
  const shown = useRef(0);
  const start = useRef(performance.now());
  const done = results.length >= TORQUE_TRIES;
  useEffect(() => {
    if (done) { onDone(results.filter(Boolean).length); return; }
    start.current = performance.now();
    let raf = 0;
    const tick = () => { shown.current = needleAt(performance.now() - start.current, SWEEP_MS[results.length]); setPos(shown.current); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, results.length]);
  const strike = () => {
    if (done) return;
    const now = needleAt(performance.now() - start.current, SWEEP_MS[results.length]);
    const hit = isHit(shown.current, HIT_GRACE) || isHit(now, HIT_GRACE);
    cue(hit ? 'hit' : 'miss');
    setResults((r) => [...r, hit]);
  };
  return (
    <>
      <p className="hint">Vidaları tork anahtarıyla sık: ibre yeşildeyken bas. Fazla sıkarsan kırılır, az sıkarsan gevşek kalır.</p>
      <div className="gauge" aria-hidden="true">
        <div className="gauge__zone" style={{ left: `${HIT_ZONE[0] * 100}%`, width: `${(HIT_ZONE[1] - HIT_ZONE[0]) * 100}%` }} />
        <div className="gauge__needle" style={{ left: `${pos * 100}%` }} />
      </div>
      <div className="tries" aria-label={`Tork ${results.filter(Boolean).length}/${TORQUE_TRIES}`}>
        {Array.from({ length: TORQUE_TRIES }, (_, i) => (
          <span key={i} className={'tries__dot' + (i < results.length ? (results[i] ? ' tries__dot--hit' : ' tries__dot--miss') : '')}>
            {i < results.length ? (results[i] ? '✓' : '✗') : i + 1}
          </span>
        ))}
      </div>
      <Button variant="primary" block className="strike" onPointerDown={(e) => { e.preventDefault(); strike(); }} onClick={(e) => { if (e.detail === 0) strike(); }}>Sık!</Button>
    </>
  );
}

type Step = 'secim' | 'teshis' | 'sokum' | 'siparis' | 'bekle' | 'montaj' | 'bakim' | 'timar';

/** Kendin yap tamiri: teşhis → söküm → parça siparişi → montaj (tork). Hayvanda: bakım malzemesi → tımar. */
export function WorkshopSheet({ item, defect, state, dispatch, onClose }: {
  item: Item; defect: Defect; state: GameState; dispatch(a: Action): void; onClose(): void;
}) {
  const info = defectInfo(defect.name);
  const order = state.parts.find((p) => p.itemId === item.id && p.defectId === defect.id);
  const animal = info.kind === 'hayvan';
  const [step, setStep] = useState<Step>(order ? (order.arrives <= state.day ? 'montaj' : 'bekle') : 'secim');
  const [mistakes, setMistakes] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolId | null>(null);
  const [turns, setTurns] = useState<number[]>(() => Array.from({ length: Math.min(6, info.screws) }, () => 0));
  const [placed, setPlaced] = useState(false);
  const [care, setCare] = useState<CareId[]>([]);
  const [strokes, setStrokes] = useState(0);
  const usta = repairCost(defect, state);
  const eye = talentRank(state, 'goz');

  const candidates = useMemo(() => {
    const decoys = pickDeterministic(DECOYS.filter(([id]) => id !== info.part), item.id + defect.id, 3);
    const all: [string, string][] = [[info.part ?? 'vida', info.partName], ...decoys];
    return pickDeterministic(all, defect.id, all.length);
  }, [info.part, info.partName, item.id, defect.id]);
  const tools = useMemo(() => {
    const others = (Object.keys(TOOL_NAME) as ToolId[]).filter((t) => t !== info.tool);
    return pickDeterministic([info.tool!, ...pickDeterministic(others, item.id, 2)], defect.id + 't', 3);
  }, [info.tool, item.id, defect.id]);
  const cares = useMemo(() => pickDeterministic(Object.keys(CARE_NAME) as CareId[], defect.id, 8), [defect.id]);

  const quality = (hits: number) => Math.max(0, 0.5 * Math.max(0, 1 - 0.25 * mistakes) + 0.5 * (hits / TORQUE_TRIES));
  const miss = (text: string) => { setMistakes((m) => m + 1); setNote(text); cue('miss'); };

  const diagnose = (id: string) => {
    if (id !== (info.part ?? 'vida')) { miss('Bu parça sağlam görünüyor. Bir daha bak.'); return; }
    cue('hit');
    setNote(null);
    setStep(turns.length > 0 ? 'sokum' : 'siparis');
  };
  const turn = (i: number) => {
    if (tool !== info.tool) { miss(tool ? `${TOOL_NAME[tool]} bu vidaya uymuyor; vida yalama oluyor.` : 'Önce bir alet seç.'); return; }
    const next = turns.map((t, k) => (k === i ? Math.min(TAPS_PER_SCREW, t + 1) : t));
    setTurns(next);
    if (next.every((t) => t >= TAPS_PER_SCREW)) { cue('hit'); setNote(null); setStep('siparis'); }
  };
  const order_ = (source: PartSource) => {
    dispatch({ type: 'orderPart', itemId: item.id, defectId: defect.id, source });
    setStep(SOURCES[source].weeks === 0 ? 'montaj' : 'bekle');
  };
  const install = (hits: number) => {
    dispatch({ type: 'installPart', itemId: item.id, defectId: defect.id, quality: quality(hits) });
    onClose();
  };
  const applyCare = () => {
    const want = [...(info.care ?? [])].sort().join();
    if ([...care].sort().join() !== want) { miss('Bu bakım işe yaramadı. Belirtilere göre başka malzeme seç.'); setCare([]); return; }
    cue('hit');
    setNote(null);
    setStep('timar');
  };
  const brush = () => {
    const n = strokes + 1;
    setStrokes(n);
    if (n >= BRUSH_STROKES) {
      dispatch({ type: 'treat', itemId: item.id, defectId: defect.id, quality: Math.max(0, 1 - 0.25 * mistakes) });
      onClose();
    }
  };

  return (
    <Sheet open title={animal ? 'Bakım' : 'Tamir'} onClose={onClose}>
      <p className="sheet__lead">{itemName(item)} · {defect.name}</p>
      {note ? <p className="ws-note" role="status">{note}</p> : null}

      {step === 'secim' ? (
        <div className="ws-choice">
          <Button variant="ghost" block disabled={state.money < usta} onClick={() => { dispatch({ type: 'repair', itemId: item.id, defectId: defect.id }); onClose(); }}>
            {animal ? `Veterinere götür · ${formatTL(usta)}` : `Ustaya yaptır · ${formatTL(usta)} · hemen`}
          </Button>
          <Button variant="primary" block onClick={() => setStep(animal ? 'bakim' : 'teshis')}>
            {animal ? `Kendin bak · ${formatTL(treatCost(defect, state))}` : `Kendin yap · parça ${formatTL(partPrice(defect, state, 'cikma'))}’den`}
          </Button>
          <p className="hint">{animal ? 'Belirtilere bakıp doğru bakım malzemesini seç, sonra tımarla.' : 'Arızalı parçayı bul, vidaları doğru aletle sök, parçayı sipariş et ve tak. Ustadan ucuz ama emek ister.'}</p>
        </div>
      ) : null}

      {step === 'teshis' ? (
        <>
          <p className="hint">1/4 · Teşhis: hangi parça arızalı?</p>
          <div className="ws-grid" role="group" aria-label="Parçalar">
            {candidates.map(([id, name]) => (
              <button key={id} type="button" className={'ws-tile' + (eye > 0 && mistakes > 0 && id === info.part ? ' ws-tile--hint' : '')} onClick={() => diagnose(id)} aria-label={name}>
                <Pic dir="parts" id={id} label={name} />
              </button>
            ))}
          </div>
        </>
      ) : null}

      {step === 'sokum' ? (
        <>
          <p className="hint">2/4 · Söküm: doğru aleti seç, her vidayı {TAPS_PER_SCREW} kez çevir.</p>
          <div className="ws-tools" role="radiogroup" aria-label="Aletler">
            {tools.map((t) => (
              <label key={t} className={'ws-tile ws-tile--tool' + (tool === t ? ' ws-tile--on' : '')}>
                <input type="radio" name="alet" aria-label={TOOL_NAME[t]} checked={tool === t} onChange={() => { setTool(t); setNote(null); }} />
                <Pic dir="tools" id={t} label={TOOL_NAME[t]} />
              </label>
            ))}
          </div>
          <div className="ws-screws" role="group" aria-label="Vidalar">
            {turns.map((t, i) => (
              <button key={i} type="button" className={'ws-screw' + (t >= TAPS_PER_SCREW ? ' ws-screw--out' : '')} aria-label={`Vida ${i + 1}`} style={{ '--turn': `${t * 120}deg` } as React.CSSProperties} onClick={() => turn(i)} disabled={t >= TAPS_PER_SCREW}>
                <span aria-hidden="true">✚</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {step === 'siparis' ? (
        <>
          <p className="hint">3/4 · Parça: {info.partName}. Nereden alacaksın?</p>
          <div className="ws-sources">
            {(Object.keys(SOURCES) as PartSource[]).map((src) => {
              const price = partPrice(defect, state, src);
              return (
                <button key={src} type="button" className="ws-source" disabled={state.money < price} onClick={() => order_(src)}>
                  <span className="ws-source__name">{SOURCES[src].label}</span>
                  <span className="ws-source__text">{SOURCES[src].text}</span>
                  <span className="money money--accent">{formatTL(price)}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {step === 'bekle' ? (
        <div className="ws-wait">
          <Pic dir="care" id="kargo" label="Kargoda" />
          <p>{info.partName} hafta sonu kargoyla gelecek. Gelince Garaj’dan montajı yap.</p>
          <Button variant="primary" block onClick={onClose}>Tamam</Button>
        </div>
      ) : null}

      {step === 'montaj' ? (
        <>
          <p className="hint">4/4 · Montaj</p>
          {!placed ? (
            <div className="ws-place">
              <Pic dir="parts" id={info.part ?? 'vida'} label={info.partName} />
              <Button variant="primary" block onClick={() => { cue('hit'); setPlaced(true); }}>Parçayı yerine tak</Button>
            </div>
          ) : <Torque onDone={install} />}
        </>
      ) : null}

      {step === 'bakim' ? (
        <>
          <p className="hint">1/2 · Belirti: {defect.name}. Hangi malzemeler gerekli?</p>
          <div className="ws-grid ws-grid--care" role="group" aria-label="Bakım malzemeleri">
            {cares.map((c) => (
              <label key={c} className={'ws-tile' + (care.includes(c) ? ' ws-tile--on' : '')}>
                <input type="checkbox" aria-label={CARE_NAME[c]} checked={care.includes(c)} onChange={() => setCare((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]))} />
                <Pic dir="care" id={c} label={CARE_NAME[c]} />
              </label>
            ))}
          </div>
          <Button variant="primary" block disabled={care.length === 0} onClick={applyCare}>Uygula</Button>
        </>
      ) : null}

      {step === 'timar' ? (
        <>
          <p className="hint">2/2 · Tımar: sakinleştirerek fırçala ({strokes}/{BRUSH_STROKES}).</p>
          <div className="ws-brush-track"><div className="ws-brush-fill" style={{ width: `${(strokes / BRUSH_STROKES) * 100}%` }} /></div>
          <Button variant="primary" block className="strike" onClick={brush}>Fırçala</Button>
        </>
      ) : null}
    </Sheet>
  );
}
