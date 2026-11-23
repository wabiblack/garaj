import { cue } from '../feedback';
import { useEffect, useRef, useState } from 'react';
import type { Action } from '../../game/reducer';
import type { Defect, Item } from '../../game/types';
import { HIT_GRACE, HIT_ZONE, isHit, repairDiscount } from '../../game/prep';
import { formatTL } from '../../game/format';
import { round10 } from '../../game/pricing';
import { itemName } from '../../game/selling';
import { Sheet } from '../components/Sheet';
import { Button } from '../components/Button';

const TRIES = 3;
/** İbrenin bir uçtan öbürüne gidiş süresi (ms); her denemede hızlanır. */
const SWEEP_MS = [1100, 900, 750];

/** 0→1→0 gidip gelen ibre konumu. */
export function needleAt(ms: number, sweep: number): number {
  const t = (ms / sweep) % 2;
  return t <= 1 ? t : 2 - t;
}

export function RepairSheet({ item, defect, cost, money, dispatch, onClose }: {
  item: Item; defect: Defect; cost: number; money: number; dispatch(a: Action): void; onClose(): void;
}) {
  const [results, setResults] = useState<boolean[]>([]);
  const [pos, setPos] = useState(0);
  /** Ekranda son çizilen ibre konumu: oyuncu buna bakarak basar. */
  const shown = useRef(0);
  const start = useRef(performance.now());
  const done = results.length >= TRIES;
  const hits = results.filter(Boolean).length;
  const finalCost = round10(cost * (1 - repairDiscount(hits)));

  useEffect(() => {
    if (done) return;
    start.current = performance.now();
    let raf = 0;
    const tick = () => {
      shown.current = needleAt(performance.now() - start.current, SWEEP_MS[results.length]);
      setPos(shown.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done, results.length]);

  // Parmak değdiği anda (pointerdown) değerlendirilir; dokunmatikte click parmak kalkınca gelir ve ibre kaçmış olur.
  // Ekranda görülen konum ya da o anki konum yeşildeyse isabet.
  const strike = () => {
    if (done) return;
    const now = needleAt(performance.now() - start.current, SWEEP_MS[results.length]);
    const hit = isHit(shown.current, HIT_GRACE) || isHit(now, HIT_GRACE);
    cue(hit ? 'hit' : 'miss');
    setResults((r) => [...r, hit]);
  };
  const finish = (quality: number) => {
    dispatch({ type: 'repair', itemId: item.id, defectId: defect.id, quality });
    onClose();
  };

  return (
    <Sheet open title="Tamir" onClose={onClose}>
      <p className="sheet__lead">{itemName(item)} · {defect.name}</p>
      <p className="hint">İbre yeşil bölgedeyken “Vur!”a bas. Her isabet tamiri %10 ucuzlatır.</p>
      <div className="gauge" aria-hidden="true">
        <div className="gauge__zone" style={{ left: `${HIT_ZONE[0] * 100}%`, width: `${(HIT_ZONE[1] - HIT_ZONE[0]) * 100}%` }} />
        <div className="gauge__needle" style={{ left: `${(done ? 0.5 : pos) * 100}%` }} />
      </div>
      <div className="tries" aria-label={`İsabet ${hits}/${TRIES}`}>
        {Array.from({ length: TRIES }, (_, i) => (
          <span key={i} className={'tries__dot' + (i < results.length ? (results[i] ? ' tries__dot--hit' : ' tries__dot--miss') : '')}>
            {i < results.length ? (results[i] ? '✓' : '✗') : i + 1}
          </span>
        ))}
      </div>
      <dl className="kv">
        <div><dt>Normal fiyat</dt><dd>{formatTL(cost)}</dd></div>
        <div><dt>Senin fiyatın</dt><dd className="money money--accent">{formatTL(finalCost)}</dd></div>
      </dl>
      {done ? (
        <Button variant="primary" block disabled={money < finalCost} onClick={() => finish(hits)}>{`Tamiri bitir · ${formatTL(finalCost)}`}</Button>
      ) : (
        <>
          <Button
            variant="primary"
            block
            className="strike"
            onPointerDown={(e) => { e.preventDefault(); strike(); }}
            onClick={(e) => { if (e.detail === 0) strike(); }}
          >Vur!</Button>
          <Button variant="ghost" block className="mt8" disabled={money < cost} onClick={() => finish(0)}>{`Ustaya bırak · ${formatTL(cost)}`}</Button>
        </>
      )}
      {money < finalCost ? <p className="hint">Tamire paran yetmiyor</p> : null}
    </Sheet>
  );
}
