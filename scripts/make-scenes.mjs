// Garaj sahne çizimleri: Kerem'in yaşlara göre portresi ve büyüyen işyeri.
// Çalıştır: node scripts/make-scenes.mjs → src/assets/portraits/*.svg ve src/assets/places/*.svg
import { mkdirSync, writeFileSync } from 'node:fs';

const PORTRAITS = 'src/assets/portraits';
const PLACES = 'src/assets/places';
mkdirSync(PORTRAITS, { recursive: true });
mkdirSync(PLACES, { recursive: true });

let uid = 0;
const id = (p) => `${p}${++uid}`;
const svg = (body, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>\n`;
const lin = (a, b, dir = 'v') => {
  const g = id('g');
  const xy = dir === 'v' ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
  return { url: `url(#${g})`, def: `<linearGradient id="${g}" ${xy}><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>` };
};

/* ============================== PORTRELER ============================== */
const SKIN = '#e2a77f', SKIN_D = '#c98a63', HAIR = '#2b1d16';

function face({ y = 0, jaw = 1, brows = 'soft', stubble = false, smile = 'grin' }) {
  const cy = 52 + y;
  const browY = cy - 7;
  const browPath = brows === 'soft'
    ? `M45,${browY} q5,-3 10,0 M65,${browY} q5,-3 10,0`
    : `M44,${browY + 1} l11,-2 M65,${browY - 1} l11,2`;
  const mouth = smile === 'grin'
    ? `<path d="M52,${cy + 13} q8,7 16,0" fill="#8a3b2c" stroke="#6b2a1f" stroke-width="1.2"/><path d="M54,${cy + 13.5} q6,3 12,0" fill="#fff" opacity=".9"/>`
    : `<path d="M52,${cy + 14} q8,4 16,0" fill="none" stroke="#6b2a1f" stroke-width="2" stroke-linecap="round"/>`;
  const g = lin(SKIN, SKIN_D);
  return `<defs>${g.def}</defs>
  <rect x="53" y="${cy + 18}" width="14" height="14" fill="${SKIN_D}"/>
  <ellipse cx="38" cy="${cy + 2}" rx="5" ry="7" fill="${SKIN_D}"/><ellipse cx="82" cy="${cy + 2}" rx="5" ry="7" fill="${SKIN_D}"/>
  <path d="M40,${cy - 10} Q40,${cy - 28} 60,${cy - 28} Q80,${cy - 28} 80,${cy - 10} L80,${cy + 4} Q80,${cy + 22 * jaw} 60,${cy + 26 * jaw} Q40,${cy + 22 * jaw} 40,${cy + 4} Z" fill="${g.url}"/>
  ${stubble ? `<path d="M44,${cy + 8} Q46,${cy + 24} 60,${cy + 26} Q74,${cy + 24} 76,${cy + 8} Q70,${cy + 18} 60,${cy + 19} Q50,${cy + 18} 44,${cy + 8} Z" fill="#3a2a22" opacity=".18"/>` : ''}
  <ellipse cx="50" cy="${cy}" rx="3.6" ry="4.2" fill="#fff"/><ellipse cx="70" cy="${cy}" rx="3.6" ry="4.2" fill="#fff"/>
  <circle cx="50.6" cy="${cy + 0.6}" r="2.4" fill="#3b2516"/><circle cx="70.6" cy="${cy + 0.6}" r="2.4" fill="#3b2516"/>
  <circle cx="51.4" cy="${cy - 0.4}" r=".8" fill="#fff"/><circle cx="71.4" cy="${cy - 0.4}" r=".8" fill="#fff"/>
  <path d="${browPath}" stroke="${HAIR}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <path d="M60,${cy + 2} q-3,6 0,8" stroke="${SKIN_D}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <ellipse cx="46" cy="${cy + 9}" rx="4" ry="2.4" fill="#e7836b" opacity=".35"/><ellipse cx="74" cy="${cy + 9}" rx="4" ry="2.4" fill="#e7836b" opacity=".35"/>
  ${mouth}`;
}

function portrait(bg, inner) {
  const b = lin(bg[0], bg[1]);
  const clip = id('pc');
  return svg(`<defs>${b.def}<clipPath id="${clip}"><circle cx="60" cy="60" r="60"/></clipPath></defs>
  <g clip-path="url(#${clip})"><rect width="120" height="120" fill="${b.url}"/>
  <circle cx="60" cy="60" r="44" fill="#fff" opacity=".06"/>${inner}</g>`, 120, 120);
}

const shirt = (color, extra = '') => {
  const g = lin(color, '#000000');
  return `<defs>${lin(color, color).def}</defs><path d="M18,120 Q20,92 46,86 L60,94 L74,86 Q100,92 102,120 Z" fill="${color}"/><path d="M18,120 Q20,92 46,86 L60,94 L74,86 Q100,92 102,120 Z" fill="${g.url}" opacity=".18"/><defs>${g.def}</defs>${extra}`;
};

const PORTRAIT = {
  // 12 yaş: ters şapka, çizgili tişört
  'kerem-12': portrait(['#3d6fd8', '#1f3d8a'], `
    ${shirt('#f2b134', '<path d="M24,104 L96,104 M21,113 L99,113" stroke="#d8452f" stroke-width="4"/><path d="M50,88 Q60,98 70,88" fill="none" stroke="#c98a2c" stroke-width="3"/>')}
    ${face({ y: 6, jaw: 0.9 })}
    <path d="M38,46 Q38,24 60,24 Q82,24 82,46 Q74,38 60,38 Q46,38 38,46 Z" fill="#d8452f"/>
    <path d="M78,40 Q92,40 96,46 Q88,48 80,46 Z" fill="#b4361f"/>
    <circle cx="60" cy="25" r="2.4" fill="#b4361f"/>
    <path d="M40,46 q-2,4 0,8 M80,46 q2,4 0,8" stroke="${HAIR}" stroke-width="4" stroke-linecap="round"/>`),
  // 16 yaş: dağınık saç, deri ceket
  'kerem-16': portrait(['#e0603a', '#8a2a18'], `
    ${shirt('#2b2f36', '<path d="M46,86 L60,108 L74,86 L68,86 L60,98 L52,86 Z" fill="#e8ecf2"/><path d="M40,90 L52,120 M80,90 L68,120" stroke="#15181d" stroke-width="2"/><circle cx="86" cy="104" r="1.6" fill="#b9c0ca"/><path d="M28,96 l10,6" stroke="#b9c0ca" stroke-width="1.6"/>')}
    ${face({ y: 4, jaw: 1, brows: 'soft', smile: 'grin' })}
    <path d="M38,44 Q34,20 56,18 Q64,12 72,20 Q86,22 84,42 L80,40 Q78,30 70,32 L66,26 L62,32 L54,28 L50,34 Q42,34 40,44 Z" fill="${HAIR}"/>
    <path d="M54,18 l-4,-6 M64,16 l2,-7 M72,20 l6,-5" stroke="${HAIR}" stroke-width="4" stroke-linecap="round"/>`),
  // 18 yaş: tulum, alında yağ lekesi, anahtar
  'kerem-18': portrait(['#2bc48a', '#11704c'], `
    ${shirt('#3a6db0', '<path d="M42,92 L42,120 M78,92 L78,120" stroke="#2a5288" stroke-width="5"/><rect x="66" y="100" width="14" height="10" rx="2" fill="#2a5288"/><path d="M50,104 l12,-10" stroke="#b9c0ca" stroke-width="4" stroke-linecap="round"/><circle cx="62" cy="94" r="4" fill="none" stroke="#b9c0ca" stroke-width="3"/><path d="M46,86 L60,94 L74,86" fill="none" stroke="#e8ecf2" stroke-width="3"/>')}
    ${face({ y: 3, jaw: 1.05, brows: 'strong', smile: 'grin' })}
    <path d="M38,44 Q36,20 60,19 Q84,20 82,44 Q80,32 70,30 Q60,34 48,30 Q40,32 38,44 Z" fill="${HAIR}"/>
    <path d="M66,40 q5,2 8,-1" stroke="#2b2f36" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`),
  // 25 yaş: takım elbise, kravat, sakal
  'kerem-25': portrait(['#f5b700', '#a86d00'], `
    ${shirt('#1f2530', '<path d="M46,86 L60,104 L74,86 Z" fill="#f4f6f9"/><path d="M57,92 L63,92 L65,118 L60,122 L55,118 Z" fill="#c2412d"/><path d="M57,92 L63,92 L61,97 L59,97 Z" fill="#9a2f20"/><path d="M46,86 L54,110 L44,96 Z M74,86 L66,110 L76,96 Z" fill="#2c3443"/><rect x="80" y="100" width="10" height="3" rx="1" fill="#f4f6f9"/>')}
    ${face({ y: 2, jaw: 1.08, brows: 'strong', stubble: true, smile: 'calm' })}
    <path d="M38,42 Q38,18 62,18 Q84,20 82,42 Q80,30 66,28 Q50,26 40,40 Z" fill="${HAIR}"/>
    <path d="M40,40 Q48,26 70,28" stroke="#4a3a30" stroke-width="2" fill="none" opacity=".6"/>`),
};

/* ============================== MEKÂNLAR ============================== */
const W = 320, H = 140;
function sky(top, bottom, ground = '#2a2f37') {
  const s = lin(top, bottom);
  const g = lin(ground, '#14171c');
  return `<defs>${s.def}${g.def}</defs><rect width="${W}" height="${H}" fill="${s.url}"/><rect y="112" width="${W}" height="28" fill="${g.url}"/>`;
}
const win = (x, y, w, h, lit = true) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${lit ? '#ffd27a' : '#2c3443'}"/><path d="M${x + w / 2},${y} V${y + h} M${x},${y + h / 2} H${x + w}" stroke="#1b1f27" stroke-width="1.2"/>`;
const sign = (x, y, w, text, bg = '#f5b700', ink = '#1a1400', size = 12) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${size + 8}" rx="3" fill="${bg}"/><text x="${x + w / 2}" y="${y + size + 2}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${size}" fill="${ink}">${text}</text>`;
const tinyCar = (x, y, color) => `<g transform="translate(${x} ${y})"><path d="M0,10 Q2,2 12,2 L22,0 Q30,0 34,6 L42,8 Q46,9 46,14 L46,16 L0,16 Z" fill="${color}"/><path d="M14,3 L22,1.5 Q28,1.5 31,6 L14,6 Z" fill="#9fd3ff" opacity=".8"/><circle cx="10" cy="16" r="4.5" fill="#15181d"/><circle cx="36" cy="16" r="4.5" fill="#15181d"/><circle cx="10" cy="16" r="2" fill="#9aa3b0"/><circle cx="36" cy="16" r="2" fill="#9aa3b0"/></g>`;
const tinyBike = (x, y) => `<g transform="translate(${x} ${y})" stroke="#e8ecf2" stroke-width="1.6" fill="none"><circle cx="6" cy="14" r="6"/><circle cx="28" cy="14" r="6"/><path d="M6,14 L14,4 L24,4 L28,14 M14,4 L17,14 L24,4 M12,2 h5 M24,4 l-2,-4 h4" stroke="#d8452f"/></g>`;
const flag = (x, y, c) => `<path d="M${x},${y} V${y - 26}" stroke="#9aa3b0" stroke-width="1.4"/><path d="M${x},${y - 26} l14,4 l-14,4 Z" fill="${c}"/>`;
const tree = (x, y, s = 1) => `<rect x="${x - 2 * s}" y="${y - 12 * s}" width="${4 * s}" height="${12 * s}" fill="#5a3b26"/><circle cx="${x}" cy="${y - 20 * s}" r="${11 * s}" fill="#2f8f5b"/><circle cx="${x - 5 * s}" cy="${y - 24 * s}" r="${6 * s}" fill="#3fae70"/>`;

const PLACE = {
  // 1. aşama: Kerem'in odası (iç mekân)
  oda: svg(`${(() => {
    const wall = lin('#3b4a6b', '#2a3550');
    const floor = lin('#8a5a3a', '#5e3b24');
    return `<defs>${wall.def}${floor.def}</defs><rect width="${W}" height="${H}" fill="${wall.url}"/><rect y="108" width="${W}" height="32" fill="${floor.url}"/>
    <path d="M0,108 H${W}" stroke="#2a1b12" stroke-width="2"/>${[40, 100, 160, 220, 280].map((x) => `<path d="M${x},108 L${x - 14},140" stroke="#4d3120" stroke-width="1"/>`).join('')}`;
  })()}
    <rect x="26" y="20" width="64" height="48" rx="3" fill="#9fd3ff"/><rect x="26" y="20" width="64" height="48" rx="3" fill="none" stroke="#e8ecf2" stroke-width="4"/>
    <path d="M58,20 V68 M26,44 H90" stroke="#e8ecf2" stroke-width="3"/><circle cx="76" cy="32" r="6" fill="#ffe58a"/>
    <path d="M30,64 q10,-12 20,-4 q8,-10 20,-2 q10,-6 16,6" fill="#cfe9ff"/>
    <rect x="112" y="16" width="34" height="46" rx="2" fill="#d8452f"/><text x="129" y="34" text-anchor="middle" font-family="Arial" font-weight="800" font-size="9" fill="#fff">GOOL</text><circle cx="129" cy="48" r="7" fill="#fff"/><path d="M129,41 l3,5 -3,4 -3,-4 Z" fill="#1b1f27"/>
    <rect x="168" y="70" width="120" height="30" rx="6" fill="#3d6fd8"/><rect x="168" y="62" width="30" height="18" rx="6" fill="#e8ecf2"/><rect x="168" y="94" width="120" height="14" fill="#2a4fa0"/><rect x="172" y="108" width="6" height="6" fill="#2a1b12"/><rect x="278" y="108" width="6" height="6" fill="#2a1b12"/>
    <path d="M200,70 q30,-6 86,4" stroke="#2a4fa0" stroke-width="2" fill="none"/>
    <rect x="112" y="78" width="40" height="30" rx="2" fill="#a0683f"/><rect x="116" y="84" width="32" height="8" rx="1" fill="#8a5a3a"/><rect x="116" y="96" width="32" height="8" rx="1" fill="#8a5a3a"/><circle cx="132" cy="88" r="1.4" fill="#2a1b12"/><circle cx="132" cy="100" r="1.4" fill="#2a1b12"/>
    <rect x="120" y="66" width="22" height="12" rx="2" fill="#1b1f27"/><rect x="122" y="68" width="18" height="8" rx="1" fill="#2bc48a"/>
    ${tinyBike(30, 92)}
    <path d="M220,40 q6,-8 12,0 q-6,6 -12,0" fill="#9aa3b0"/><circle cx="234" cy="38" r="1" fill="#1b1f27"/><path d="M236,38 l4,1" stroke="#f5b700" stroke-width="1.4"/>`, W, H),

  // 2. aşama: apartman altı otopark
  apartman: svg(`${sky('#5aa0e0', '#bfe0ff')}
    <rect x="30" y="8" width="200" height="104" fill="#c9b9a4"/><rect x="30" y="8" width="200" height="6" fill="#a8977f"/>
    ${[22, 46, 70].map((y) => [44, 84, 124, 164, 204].map((x) => win(x, y, 16, 16, (x + y) % 3 === 0)).join('')).join('')}
    <rect x="56" y="88" width="70" height="24" fill="#5c5f66"/><path d="M56,92 H126 M56,96 H126 M56,100 H126 M56,104 H126 M56,108 H126" stroke="#4a4d54" stroke-width="1.2"/>
    <rect x="150" y="84" width="22" height="28" rx="2" fill="#6b4a2c"/><circle cx="167" cy="98" r="1.4" fill="#f5b700"/>
    ${sign(180, 90, 44, 'OTOPARK', '#3d6fd8', '#fff', 8)}
    <g transform="translate(236 78)"><circle cx="10" cy="26" r="8" fill="#15181d"/><circle cx="50" cy="26" r="8" fill="#15181d"/><circle cx="10" cy="26" r="3" fill="#9aa3b0"/><circle cx="50" cy="26" r="3" fill="#9aa3b0"/><path d="M10,26 L24,12 L40,12 L50,26 M24,12 L20,4 L14,4 M40,12 L44,6 L50,6" stroke="#f07c1a" stroke-width="3.4" fill="none" stroke-linecap="round"/><rect x="22" y="8" width="18" height="8" rx="3" fill="#d8452f"/></g>
    ${tree(296, 112, 1)}`, W, H),

  // 3. aşama, seviye 0: sanayi garajı
  sanayi: svg(`${sky('#7c8aa6', '#d7dde8', '#3a3f47')}
    <rect x="20" y="30" width="210" height="82" fill="#8a929e"/><path d="M20,30 L125,10 L230,30 Z" fill="#5b6470"/>
    ${sign(60, 36, 130, 'AMCA GARAJ', '#d8452f', '#fff', 13)}
    <rect x="44" y="62" width="110" height="50" fill="#b9c0ca"/>${Array.from({ length: 12 }, (_, i) => `<path d="M44,${66 + i * 4} H154" stroke="#8a929e" stroke-width="1.6"/>`).join('')}
    <rect x="44" y="62" width="110" height="50" fill="none" stroke="#5b6470" stroke-width="3"/>
    <rect x="168" y="64" width="44" height="30" fill="#2c3443"/>${win(172, 68, 36, 22, true)}
    <rect x="234" y="84" width="10" height="28" fill="#c2412d"/><rect x="246" y="92" width="14" height="20" rx="2" fill="#2a2f37"/><circle cx="253" cy="98" r="5" fill="#15181d"/><circle cx="253" cy="106" r="5" fill="#15181d"/>
    ${tinyCar(262, 96, '#3d6fd8')}
    <path d="M0,124 H${W}" stroke="#f5b700" stroke-width="2" stroke-dasharray="14 10"/>`, W, H),

  // 3. aşama, seviye 1: mahalle galerisi
  galeri: svg(`${sky('#4f8fd8', '#cde6ff')}
    <rect x="24" y="34" width="272" height="78" fill="#e8ecf2"/><rect x="24" y="30" width="272" height="10" fill="#f5b700"/>
    ${sign(100, 42, 120, 'KEREM OTO', '#1f2530', '#f5b700', 13)}
    <rect x="40" y="68" width="240" height="44" fill="#9fd3ff" opacity=".55"/><path d="M100,68 V112 M160,68 V112 M220,68 V112" stroke="#e8ecf2" stroke-width="3"/>
    ${tinyCar(50, 92, '#d8452f')}${tinyCar(112, 92, '#2bc48a')}${tinyCar(172, 92, '#f4f6f9')}${tinyCar(230, 92, '#1f2530')}
    ${flag(30, 34, '#d8452f')}${flag(292, 34, '#3d6fd8')}
    ${Array.from({ length: 9 }, (_, i) => `<circle cx="${40 + i * 30}" cy="${64 + (i % 2) * 2}" r="2.4" fill="${['#d8452f', '#f5b700', '#3d6fd8'][i % 3]}"/>`).join('')}`, W, H),

  // 3. aşama, seviye 2: ana cadde showroom
  showroom: svg(`${(() => {
    const s = lin('#1d2b4a', '#e08a5a');
    return `<defs>${s.def}</defs><rect width="${W}" height="${H}" fill="${s.url}"/><rect y="112" width="${W}" height="28" fill="#2a2f37"/>`;
  })()}
    <rect x="8" y="18" width="40" height="94" fill="#2c3443"/>${[26, 42, 58, 74, 90].map((y) => win(14, y, 10, 8, y % 32 !== 10) + win(30, y, 10, 8, true)).join('')}
    <path d="M60,112 V30 L260,18 V112 Z" fill="#1f2530"/>
    <path d="M70,108 V44 L250,34 V108 Z" fill="#9fd3ff" opacity=".35"/><path d="M130,108 V40 M190,108 V37" stroke="#3a4558" stroke-width="2"/>
    ${sign(96, 20, 128, 'KEREM MOTORS', '#f5b700', '#1a1400', 13)}
    ${tinyCar(78, 92, '#d8452f')}${tinyCar(140, 92, '#f4f6f9')}${tinyCar(200, 92, '#2bc48a')}
    <ellipse cx="160" cy="108" rx="90" ry="3" fill="#fff" opacity=".18"/>
    <rect x="272" y="40" width="40" height="72" fill="#2c3443"/>${[48, 64, 80, 96].map((y) => win(278, y, 12, 9, true) + win(294, y, 12, 9, y !== 64)).join('')}
    <path d="M0,126 H${W}" stroke="#e8ecf2" stroke-width="2" stroke-dasharray="16 12" opacity=".6"/>`, W, H),

  // 4. aşama: holding kulesi ve şehir
  holding: svg(`${(() => {
    const s = lin('#0f1630', '#3b2a6b');
    return `<defs>${s.def}</defs><rect width="${W}" height="${H}" fill="${s.url}"/>${Array.from({ length: 18 }, (_, i) => `<circle cx="${(i * 53) % W}" cy="${(i * 37) % 60 + 6}" r="${i % 3 ? 0.8 : 1.3}" fill="#fff" opacity=".7"/>`).join('')}<rect y="116" width="${W}" height="24" fill="#14171c"/>`;
  })()}
    <circle cx="276" cy="24" r="12" fill="#f4f6f9" opacity=".9"/><circle cx="270" cy="20" r="11" fill="#0f1630" opacity=".9"/>
    ${[[10, 60, 30], [44, 44, 26], [214, 52, 30], [248, 70, 28], [280, 56, 36]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${116 - y}" fill="#232a3d"/>${Array.from({ length: Math.floor((116 - y) / 12) }, (_, r) => win(x + 5, y + 6 + r * 12, w - 10, 6, (x + r) % 3 !== 0)).join('')}`).join('')}
    <path d="M110,116 V22 L160,8 L210,22 V116 Z" fill="#2c3550"/><path d="M160,8 V116" stroke="#3a4766" stroke-width="2"/>
    ${Array.from({ length: 8 }, (_, r) => [118, 136, 166, 184].map((x) => win(x, 28 + r * 10, 14, 6, (x + r) % 4 !== 0)).join('')).join('')}
    ${sign(118, 4, 84, 'KEREM HOLDİNG', '#f5b700', '#1a1400', 9)}
    <path d="M160,4 V-4" stroke="#d8452f" stroke-width="2"/>
    ${tinyCar(30, 104, '#d8452f')}${tinyCar(230, 104, '#f5b700')}`, W, H),
};

for (const [n, s] of Object.entries(PORTRAIT)) writeFileSync(`${PORTRAITS}/${n}.svg`, s);
for (const [n, s] of Object.entries(PLACE)) writeFileSync(`${PLACES}/${n}.svg`, s);
console.log(`${Object.keys(PORTRAIT).length} portre, ${Object.keys(PLACE).length} mekân yazıldı`);
