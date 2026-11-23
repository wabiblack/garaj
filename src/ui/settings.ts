// Görünüm ayarları cihazda saklanır ve <html> etiketine işlenir.
const KEY = 'garaj.ayar';
export type Theme = 'koyu' | 'acik';
export type FontSize = 'normal' | 'buyuk';
export interface Settings { theme: Theme; font: FontSize }
const DEFAULTS: Settings = { theme: 'koyu', font: 'normal' };

export function loadSettings(): Settings {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Partial<Settings>;
    return {
      theme: raw.theme === 'acik' ? 'acik' : DEFAULTS.theme,
      font: raw.font === 'buyuk' ? 'buyuk' : DEFAULTS.font,
    };
  } catch {
    return DEFAULTS;
  }
}

export function applySettings(s: Settings): void {
  const root = document.documentElement;
  root.dataset.theme = s.theme;
  root.dataset.font = s.font;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', s.theme === 'acik' ? '#f4f5f8' : '#0e1116');
}

export function saveSettings(s: Settings): void {
  applySettings(s);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // depolama kapalı: ayar bu oturumluk kalır
  }
}
