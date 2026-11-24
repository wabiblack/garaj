/** Küçük çizgi grafik (en az iki nokta). */
export function Spark({ values, className = '' }: { values: number[]; className?: string }) {
  if (values.length < 2) return <svg className={'spark ' + className} viewBox="0 0 100 30" aria-hidden="true"><line x1="0" y1="15" x2="100" y2="15" /></svg>;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / span) * 26}`).join(' ');
  const up = values[values.length - 1] >= values[0];
  return (
    <svg className={'spark ' + (up ? 'spark--up ' : 'spark--down ') + className} viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts} />
    </svg>
  );
}

/** Yüzde değişim etiketi: ▲ %4 / ▼ %3 / = %0 */
export function Change({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const cls = pct > 0 ? 'chg chg--up' : pct < 0 ? 'chg chg--down' : 'chg';
  return <span className={cls}>{pct > 0 ? '▲' : pct < 0 ? '▼' : '='} %{Math.abs(pct)}</span>;
}
