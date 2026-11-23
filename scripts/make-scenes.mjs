// Garaj sahne çizimleri: büyüyen işyeri. Karakter portresi oyun içinde çizilir (src/ui/portrait.ts).
// Çalıştır: node scripts/make-scenes.mjs → src/assets/places/*.svg
import { mkdirSync, writeFileSync } from 'node:fs';

const PLACES = 'src/assets/places';
mkdirSync(PLACES, { recursive: true });

let uid = 0;
const id = (p) => `${p}${++uid}`;
const svg = (body, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>\n`;
const lin = (a, b, dir = 'v') => {
  const g = id('g');
  const xy = dir === 'v' ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
  return { url: `url(#${g})`, def: `<linearGradient id="${g}" ${xy}><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>` };
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

for (const [n, s] of Object.entries(PLACE)) writeFileSync(`${PLACES}/${n}.svg`, s);
console.log(`${Object.keys(PLACE).length} mekân yazıldı`);
