import { useState } from 'react';
import type { Action } from '../../game/reducer';
import type { GameState } from '../../game/types';
import { exportSave, importSave } from '../../game/save';
import { isSoundOn, setSoundOn } from '../feedback';
import { loadSettings, saveSettings, type Settings } from '../settings';
import { Button } from './Button';

/** Ses, görünüm ve kayıt yedeği: hem ana menüde hem Profil'de kullanılır. */
export function SettingsPanel({ state, dispatch }: { state: GameState; dispatch(a: Action): void }) {
  const [sound, setSound] = useState(isSoundOn);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [backup, setBackup] = useState<'none' | 'export' | 'import'>('none');
  const [code, setCode] = useState('');
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const change = (s: Settings) => { setSettings(s); saveSettings(s); };
  const showExport = async () => {
    const c = exportSave(state);
    setCode(c);
    setBackup('export');
    try {
      await navigator.clipboard.writeText(c);
      setBackupMsg('Kod panoya kopyalandı. Güvenli bir yere yapıştır.');
    } catch {
      setBackupMsg('Kodu seçip kopyala, güvenli bir yere yapıştır.');
    }
  };
  const doImport = () => {
    const loaded = importSave(code);
    if (!loaded) { setBackupMsg('Kod geçersiz. Tamamını yapıştırdığından emin ol.'); return; }
    dispatch({ type: 'load', state: loaded });
    setBackup('none');
    setCode('');
    setBackupMsg('Kayıt yüklendi.');
  };
  return (
    <>
          <div className="panel">
          <label className="switch switch--flat">
            <input
              type="checkbox"
              aria-label="Ses ve titreşim"
              checked={sound}
              onChange={(e) => { setSound(e.target.checked); setSoundOn(e.target.checked); }}
            />
            <span className="switch__track" aria-hidden="true" />
            <span>
              <span className="switch__label">Ses ve titreşim</span>
              <span className="switch__hint">Titreşim yalnız Android telefonlarda çalışır.</span>
            </span>
          </label>
          <label className="switch switch--flat">
            <input type="checkbox" aria-label="Açık tema" checked={settings.theme === 'acik'} onChange={(e) => change({ ...settings, theme: e.target.checked ? 'acik' : 'koyu' })} />
            <span className="switch__track" aria-hidden="true" />
            <span>
              <span className="switch__label">Açık tema</span>
              <span className="switch__hint">Gün ışığında daha rahat okunur.</span>
            </span>
          </label>
          <label className="switch switch--flat">
            <input type="checkbox" aria-label="Büyük yazı" checked={settings.font === 'buyuk'} onChange={(e) => change({ ...settings, font: e.target.checked ? 'buyuk' : 'normal' })} />
            <span className="switch__track" aria-hidden="true" />
            <span>
              <span className="switch__label">Büyük yazı</span>
              <span className="switch__hint">Tüm ekranı biraz büyütür.</span>
            </span>
          </label>
        </div>

        <h2 className="h2">Kayıt yedeği</h2>
        <div className="panel">
          <p className="hint">Kaydını bir koda çevirip başka telefona taşıyabilirsin.</p>
          <div className="chips">
            <Button small onClick={() => void showExport()}>Yedek kodu al</Button>
            <Button small onClick={() => { setBackup('import'); setCode(''); setBackupMsg(null); }}>Yedekten yükle</Button>
          </div>
          {backup !== 'none' ? (
            <label className="field">
              <span className="field__label">{backup === 'export' ? 'Yedek kodun' : 'Yedek kodunu yapıştır'}</span>
              <textarea
                className="field__input field__input--code"
                aria-label={backup === 'export' ? 'Yedek kodun' : 'Yedek kodunu yapıştır'}
                readOnly={backup === 'export'}
                value={code}
                onFocus={(e) => backup === 'export' && e.currentTarget.select()}
                onChange={(e) => setCode(e.target.value)}
              />
            </label>
          ) : null}
          {backup === 'import' ? (
            <>
              <p className="hint">Yüklersen şu anki ilerlemenin yerine geçer.</p>
              <Button small variant="primary" disabled={!code.trim()} onClick={doImport}>Kaydı yükle</Button>
            </>
          ) : null}
          {backupMsg ? <p className="hint" role="status">{backupMsg}</p> : null}
        </div>
    </>
  );
}
