import { useState } from 'react';
import type { Action } from '../../game/reducer';
import type { GameState } from '../../game/types';
import { formatTL } from '../../game/format';
import { STAGE_LABEL } from '../components/TopBar';
import { Sheet } from '../components/Sheet';
import { Button } from '../components/Button';
import { SettingsPanel } from '../components/SettingsPanel';
import { HowToPlay } from './HowToPlay';
import { portraitUrl } from '../art';
import { Place } from '../components/Place';
import { extraImage } from '../images';

type Panel = null | 'ayarlar' | 'nasil' | 'yeni' | 'zor';

/** Oyun kaydında ilerleme var mı (yeni açılmış, hiç oynanmamış oyun sayılmaz). */
export function hasProgress(state: GameState): boolean {
  return state.day > 1 || state.stats.sales > 0 || state.inventory.length > 0 || state.stage > 1;
}

export function Logo() {
  return (
    <div className="logo">
      <svg className="logo__mark" viewBox="0 0 120 100" aria-hidden="true">
        <path d="M8 40 L60 8 L112 40" fill="none" stroke="var(--accent)" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M22 42 V92 H98 V42" fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="7" strokeLinejoin="round" />
        <rect className="logo__door" x="32" y="52" width="56" height="11" rx="2" fill="var(--accent)" />
        <rect className="logo__door" x="32" y="70" width="56" height="11" rx="2" fill="var(--accent)" />
      </svg>
      <div className="logo__word">GARAJ</div>
      <div className="logo__tag">Al · Tamir et · Sat · Büyü</div>
    </div>
  );
}

export function MenuScreen({ state, dispatch, onPlay, onNewGame }: {
  state: GameState;
  dispatch(a: Action): void;
  onPlay(): void;
  onNewGame(hard: boolean): void;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const menuBg = extraImage('ui/menu');
  const progress = hasProgress(state);
  const hardOpen = state.achievements.includes('sampiyon');
  const close = () => setPanel(null);
  const start = (hard: boolean) => { close(); onNewGame(hard); };
  let n = 0;
  const rise = () => ({ animationDelay: `${0.35 + 0.07 * n++}s` });

  return (
    <div className="menu" role="dialog" aria-modal="true" aria-label="Ana menü">
      {menuBg ? <img className="menu__bg" src={menuBg} alt="" /> : <Place state={state} className="menu__scene" />}
      <div className="menu__shade" aria-hidden="true" />
      <div className="menu__inner">
        <Logo />
        <img className="menu__kerem" src={portraitUrl(progress ? state.age : 12, state.player.look)} alt="" />
        <nav className="menu__buttons" aria-label="Ana menü">
          {progress ? (
            <button type="button" className="menu-btn menu-btn--primary" style={rise()} onClick={onPlay}>
              <span className="menu-btn__label">Devam et</span>
              <span className="menu-btn__sub">Hafta {state.day} · {formatTL(state.money)} · {STAGE_LABEL[state.stage]}{state.hard ? ' · Zor' : ''}</span>
            </button>
          ) : null}
          <button
            type="button"
            className={'menu-btn' + (progress ? '' : ' menu-btn--primary')}
            style={rise()}
            onClick={() => (progress ? setPanel('yeni') : onPlay())}
          >
            <span className="menu-btn__label">{progress ? 'Yeni oyun' : 'Oyuna başla'}</span>
          </button>
          <button type="button" className="menu-btn" style={rise()} disabled={!hardOpen} onClick={() => setPanel('zor')}>
            <span className="menu-btn__label">{hardOpen ? 'Zor mod' : '🔒 Zor mod'}</span>
            {!hardOpen ? <span className="menu-btn__sub">Oyunu bir kez bitirince açılır</span> : null}
          </button>
          <div className="menu__row" style={rise()}>
            <button type="button" className="menu-btn menu-btn--small" onClick={() => setPanel('nasil')}>Nasıl oynanır</button>
            <button type="button" className="menu-btn menu-btn--small" onClick={() => setPanel('ayarlar')}>Ayarlar</button>
          </div>
        </nav>
        <p className="menu__version">Sürüm {__APP_VERSION__}</p>
      </div>

      {panel === 'nasil' ? <HowToPlay onClose={close} /> : null}
      {panel === 'ayarlar' ? (
        <Sheet open title="Ayarlar" onClose={close}><SettingsPanel state={state} dispatch={dispatch} /></Sheet>
      ) : null}
      {panel === 'yeni' || panel === 'zor' ? (
        <Sheet open title={panel === 'zor' ? 'Zor mod' : 'Yeni oyun'} onClose={close}>
          <p>
            {panel === 'zor'
              ? '1.000 TL ile başlarsın. Satıcılar daha sert, alıcılar daha az. Başarımların kalır.'
              : 'Yeniden 12 yaşında, cebinde 2.000 TL ile başlarsın.'}
          </p>
          {progress ? <p className="hint">Şu anki ilerlemen silinir. Bu geri alınamaz. İstersen önce Ayarlar’dan yedek kodu al.</p> : null}
          <div className="chips">
            <Button variant={progress ? 'danger' : 'primary'} onClick={() => start(panel === 'zor')}>{progress ? 'Evet, baştan başla' : 'Başla'}</Button>
            <Button variant="ghost" onClick={close}>Vazgeç</Button>
          </div>
        </Sheet>
      ) : null}
    </div>
  );
}
