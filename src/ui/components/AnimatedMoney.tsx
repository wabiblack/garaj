import { useEffect, useRef, useState } from 'react';
import { formatTL } from '../../game/format';

function reducedMotion(): boolean {
  return typeof window.matchMedia !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Para değiştiğinde sayarak yeni değere gider; artışta yeşil, azalışta kırmızı parlar. */
export function AnimatedMoney({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    from.current = value;
    if (start === value) return;
    setFlash(value > start ? 'up' : 'down');
    const clear = setTimeout(() => setFlash(null), 700);
    if (reducedMotion() || typeof requestAnimationFrame !== 'function') {
      setShown(value);
      return () => clearTimeout(clear);
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 600);
      const eased = 1 - (1 - k) ** 3;
      setShown(Math.round(start + (value - start) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(clear);
      setShown(value);
    };
  }, [value]);
  return <span className={'money' + (flash ? ` money--flash-${flash}` : '')}>{formatTL(shown)}</span>;
}
