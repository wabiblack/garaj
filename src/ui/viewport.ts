// iPhone ana ekran uygulamasında (standalone) sayfa yüksekliği bazen durum çubuğu kadar kısa ölçülür
// ve altta siyah bant kalır. Dikey ekranda uygulama tüm ekranı kapladığı için gerçek yükseklik ekran
// yüksekliğidir; bunu --app-h olarak verir. Tarayıcı sekmesinde hiçbir şey yapmaz.

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches);
}

/** Dikeyde ekranın uzun kenarı, yatayda pencere yüksekliği; ölçülen yükseklikten kısa olamaz. */
export function appHeight(inner: number, screenW: number, screenH: number, portrait: boolean): number {
  return portrait ? Math.max(inner, Math.max(screenW, screenH)) : inner;
}

export function fitStandaloneHeight(): void {
  if (!isStandalone()) return;
  const apply = () => {
    // Pencere ekranın tam genişliğinde değilse (iPad bölünmüş ekran) ekran yüksekliği kullanılmaz.
    const full = Math.abs(window.innerWidth - Math.min(window.screen.width, window.screen.height)) < 2;
    const portrait = full && window.innerHeight >= window.innerWidth;
    const h = appHeight(window.innerHeight, window.screen.width, window.screen.height, portrait);
    document.documentElement.style.setProperty('--app-h', `${h}px`);
  };
  apply();
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', () => setTimeout(apply, 300));
}
