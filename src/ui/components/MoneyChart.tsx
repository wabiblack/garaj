import { dateLabel } from '../../game/calendar';
import { formatTL } from '../../game/format';

const W = 320, H = 120, PAD = 8;

/** Gün sonu paralarının çizgi grafiği. */
export function MoneyChart({ points }: { points: { day: number; money: number }[] }) {
  if (points.length < 2) return <p className="hint">Grafik için birkaç ay oyna.</p>;
  const max = Math.max(...points.map((p) => p.money), 1);
  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const y = (m: number) => H - PAD - (m / max) * (H - PAD * 2);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.money).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${H - PAD} L${x(0)},${H - PAD} Z`;
  const first = points[0], last = points[points.length - 1];
  const change = last.money - first.money;
  return (
    <figure className="chart" aria-label={`${dateLabel(first.day)}–${dateLabel(last.day)} arası para: ${formatTL(first.money)} → ${formatTL(last.money)}`}>
      <div className="chart__head">
        <span className="muted">{dateLabel(first.day)} – {dateLabel(last.day)}</span>
        <strong className={change >= 0 ? 'pos' : 'neg'}>{change >= 0 ? '+' : '−'}{formatTL(Math.abs(change))}</strong>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart__svg" role="img" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".35" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={PAD} x2={W - PAD} y1={y(max)} y2={y(max)} className="chart__grid" />
        <line x1={PAD} x2={W - PAD} y1={y(max / 2)} y2={y(max / 2)} className="chart__grid" />
        <path d={area} fill="url(#chartFill)" />
        <path d={line} className="chart__line" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="chart__axis"><span>En yüksek {formatTL(max)}</span><span>Şimdi {formatTL(last.money)}</span></div>
    </figure>
  );
}
