// Karakter portresi: seçilen ten, saç, renk ve gözlüğe göre her yaş için SVG çizer (data URL).
import { FAV_COLORS, HAIR_COLORS, SKIN_TONES, type Look } from '../game/player';

type Age = 12 | 16 | 18 | 25;

/** Rengi siyaha doğru koyulaştırır (f: 0–1). */
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.round(v * (1 - f)).toString(16).padStart(2, '0');
  return `#${c(n >> 16)}${c((n >> 8) & 255)}${c(n & 255)}`;
}

const lin = (id: string, a: string, b: string) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

function face(look: Look, o: { y: number; jaw: number; brows: 'soft' | 'strong'; stubble?: boolean; smile: 'grin' | 'calm' }): string {
  const [skin, skinD] = SKIN_TONES[look.skin];
  const hair = HAIR_COLORS[look.hair].hex;
  const cy = 52 + o.y;
  const browY = cy - 7;
  const brow = o.brows === 'soft' ? `M45,${browY} q5,-3 10,0 M65,${browY} q5,-3 10,0` : `M44,${browY + 1} l11,-2 M65,${browY - 1} l11,2`;
  const mouth = o.smile === 'grin'
    ? `<path d="M52,${cy + 13} q8,7 16,0" fill="#8a3b2c" stroke="#6b2a1f" stroke-width="1.2"/><path d="M54,${cy + 13.5} q6,3 12,0" fill="#fff" opacity=".9"/>`
    : `<path d="M52,${cy + 14} q8,4 16,0" fill="none" stroke="#6b2a1f" stroke-width="2" stroke-linecap="round"/>`;
  const glasses = look.glasses
    ? `<g fill="none" stroke="#1d2027" stroke-width="2"><circle cx="50" cy="${cy}" r="7"/><circle cx="70" cy="${cy}" r="7"/><path d="M57,${cy} h6 M43,${cy - 1} l-5,-2 M77,${cy - 1} l5,-2"/></g>`
    : '';
  return `<defs>${lin('skin', skin, skinD)}</defs>
  <rect x="53" y="${cy + 18}" width="14" height="14" fill="${skinD}"/>
  <ellipse cx="38" cy="${cy + 2}" rx="5" ry="7" fill="${skinD}"/><ellipse cx="82" cy="${cy + 2}" rx="5" ry="7" fill="${skinD}"/>
  <path d="M40,${cy - 10} Q40,${cy - 28} 60,${cy - 28} Q80,${cy - 28} 80,${cy - 10} L80,${cy + 4} Q80,${cy + 22 * o.jaw} 60,${cy + 26 * o.jaw} Q40,${cy + 22 * o.jaw} 40,${cy + 4} Z" fill="url(#skin)"/>
  ${o.stubble ? `<path d="M44,${cy + 8} Q46,${cy + 24} 60,${cy + 26} Q74,${cy + 24} 76,${cy + 8} Q70,${cy + 18} 60,${cy + 19} Q50,${cy + 18} 44,${cy + 8} Z" fill="${hair}" opacity=".22"/>` : ''}
  <ellipse cx="50" cy="${cy}" rx="3.6" ry="4.2" fill="#fff"/><ellipse cx="70" cy="${cy}" rx="3.6" ry="4.2" fill="#fff"/>
  <circle cx="50.6" cy="${cy + 0.6}" r="2.4" fill="#3b2516"/><circle cx="70.6" cy="${cy + 0.6}" r="2.4" fill="#3b2516"/>
  <circle cx="51.4" cy="${cy - 0.4}" r=".8" fill="#fff"/><circle cx="71.4" cy="${cy - 0.4}" r=".8" fill="#fff"/>
  <path d="${brow}" stroke="${hair}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <path d="M60,${cy + 2} q-3,6 0,8" stroke="${skinD}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <ellipse cx="46" cy="${cy + 9}" rx="4" ry="2.4" fill="#e7836b" opacity=".35"/><ellipse cx="74" cy="${cy + 9}" rx="4" ry="2.4" fill="#e7836b" opacity=".35"/>
  ${mouth}${glasses}`;
}

const shirt = (color: string, extra = '') =>
  `<defs>${lin('shirt', '#000000', '#000000')}</defs><path d="M18,120 Q20,92 46,86 L60,94 L74,86 Q100,92 102,120 Z" fill="${color}"/><path d="M18,120 Q20,92 46,86 L60,94 L74,86 Q100,92 102,120 Z" fill="${shade(color, 0.35)}" opacity=".35"/>${extra}`;

const BG: Record<Age, [string, string]> = {
  12: ['#3d6fd8', '#1f3d8a'], 16: ['#e0603a', '#8a2a18'], 18: ['#2bc48a', '#11704c'], 25: ['#f5b700', '#a86d00'],
};

function inner(age: Age, look: Look): string {
  const hair = HAIR_COLORS[look.hair].hex;
  const fav = FAV_COLORS[look.color].hex;
  const favD = shade(fav, 0.2);
  switch (age) {
    case 12: // ters şapka, çizgili tişört
      return `${shirt('#f2b134', `<path d="M24,104 L96,104 M21,113 L99,113" stroke="${fav}" stroke-width="4"/><path d="M50,88 Q60,98 70,88" fill="none" stroke="#c98a2c" stroke-width="3"/>`)}
        ${face(look, { y: 6, jaw: 0.9, brows: 'soft', smile: 'grin' })}
        <path d="M38,46 Q38,24 60,24 Q82,24 82,46 Q74,38 60,38 Q46,38 38,46 Z" fill="${fav}"/>
        <path d="M78,40 Q92,40 96,46 Q88,48 80,46 Z" fill="${favD}"/><circle cx="60" cy="25" r="2.4" fill="${favD}"/>
        <path d="M40,46 q-2,4 0,8 M80,46 q2,4 0,8" stroke="${hair}" stroke-width="4" stroke-linecap="round"/>`;
    case 16: // dağınık saç, ceket
      return `${shirt(fav === '#2b2f36' ? '#2b2f36' : favD, `<path d="M46,86 L60,108 L74,86 L68,86 L60,98 L52,86 Z" fill="#e8ecf2"/><path d="M40,90 L52,120 M80,90 L68,120" stroke="${shade(fav, 0.5)}" stroke-width="2"/><circle cx="86" cy="104" r="1.6" fill="#b9c0ca"/><path d="M28,96 l10,6" stroke="#b9c0ca" stroke-width="1.6"/>`)}
        ${face(look, { y: 4, jaw: 1, brows: 'soft', smile: 'grin' })}
        <path d="M38,44 Q34,20 56,18 Q64,12 72,20 Q86,22 84,42 L80,40 Q78,30 70,32 L66,26 L62,32 L54,28 L50,34 Q42,34 40,44 Z" fill="${hair}"/>
        <path d="M54,18 l-4,-6 M64,16 l2,-7 M72,20 l6,-5" stroke="${hair}" stroke-width="4" stroke-linecap="round"/>`;
    case 18: // tulum, anahtar, alında yağ lekesi
      return `${shirt(fav, `<path d="M42,92 L42,120 M78,92 L78,120" stroke="${favD}" stroke-width="5"/><rect x="66" y="100" width="14" height="10" rx="2" fill="${favD}"/><path d="M50,104 l12,-10" stroke="#b9c0ca" stroke-width="4" stroke-linecap="round"/><circle cx="62" cy="94" r="4" fill="none" stroke="#b9c0ca" stroke-width="3"/><path d="M46,86 L60,94 L74,86" fill="none" stroke="#e8ecf2" stroke-width="3"/>`)}
        ${face(look, { y: 3, jaw: 1.05, brows: 'strong', smile: 'grin' })}
        <path d="M38,44 Q36,20 60,19 Q84,20 82,44 Q80,32 70,30 Q60,34 48,30 Q40,32 38,44 Z" fill="${hair}"/>
        <path d="M66,40 q5,2 8,-1" stroke="#2b2f36" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`;
    case 25: // takım elbise, kravat, sakal
      return `${shirt('#1f2530', `<path d="M46,86 L60,104 L74,86 Z" fill="#f4f6f9"/><path d="M57,92 L63,92 L65,118 L60,122 L55,118 Z" fill="${fav}"/><path d="M57,92 L63,92 L61,97 L59,97 Z" fill="${favD}"/><path d="M46,86 L54,110 L44,96 Z M74,86 L66,110 L76,96 Z" fill="#2c3443"/><rect x="80" y="100" width="10" height="3" rx="1" fill="#f4f6f9"/>`)}
        ${face(look, { y: 2, jaw: 1.08, brows: 'strong', stubble: true, smile: 'calm' })}
        <path d="M38,42 Q38,18 62,18 Q84,20 82,42 Q80,30 66,28 Q50,26 40,40 Z" fill="${hair}"/>
        <path d="M40,40 Q48,26 70,28" stroke="${shade(hair, 0.3)}" stroke-width="2" fill="none" opacity=".6"/>`;
  }
}

export function portraitSvg(age: number, look: Look): string {
  const a: Age = age >= 25 ? 25 : age >= 18 ? 18 : age >= 16 ? 16 : 12;
  const [b0, b1] = BG[a];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs>${lin('bg', b0, b1)}<clipPath id="pc"><circle cx="60" cy="60" r="60"/></clipPath></defs><g clip-path="url(#pc)"><rect width="120" height="120" fill="url(#bg)"/><circle cx="60" cy="60" r="44" fill="#fff" opacity=".06"/>${inner(a, look)}</g></svg>`;
}

const cache = new Map<string, string>();

export function portraitUrl(age: number, look: Look): string {
  const key = `${age >= 25 ? 25 : age >= 18 ? 18 : age >= 16 ? 16 : 12}-${look.skin}-${look.hair}-${look.color}-${look.glasses ? 1 : 0}`;
  let url = cache.get(key);
  if (!url) {
    url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(portraitSvg(age, look));
    cache.set(key, url);
  }
  return url;
}
