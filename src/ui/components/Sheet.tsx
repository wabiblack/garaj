import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Kapanış animasyonu süresi (theme.css .sheet--closing ile aynı). */
const CLOSE_MS = 200;

function motionOn(): boolean {
  return typeof window.matchMedia === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Alttan açılan pencere. Her zaman <body> altına çizilir: kayan oyun alanının içinde kalırsa
 * iPhone'da alt menü çubuğunun altında kalıyordu.
 */
export function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose(): void; children: ReactNode }) {
  const [closing, setClosing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const close = useCallback(() => {
    if (!motionOn()) { onClose(); return; }
    setClosing(true);
    timer.current ??= setTimeout(() => { timer.current = null; setClosing(false); onClose(); }, CLOSE_MS);
  }, [onClose]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);
  if (!open) return null;
  return createPortal(
    <div className={'sheet-backdrop' + (closing ? ' sheet-backdrop--closing' : '')} onClick={close}>
      <div className={'sheet' + (closing ? ' sheet--closing' : '')} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet__grip" aria-hidden="true" />
        <header className="sheet__header">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Kapat" onClick={close}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>
        <div className="sheet__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
