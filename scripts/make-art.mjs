// Garaj model çizimleri: her model için aynı tarzda, ayrıntılı yandan görünüş SVG üretir.
// Çalıştır: node scripts/make-art.mjs   → src/assets/models/*.svg ve src/assets/categories/*.svg
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = 'src/assets/models';
const CAT = 'src/assets/categories';
mkdirSync(OUT, { recursive: true });
mkdirSync(CAT, { recursive: true });

let uid = 0;
const id = (p) => `${p}${++uid}`;
const r1 = (n) => Math.round(n * 10) / 10;
const rad = (a) => (a * Math.PI) / 180;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt)))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

function svg(body, w = 240, h = 160) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>\n`;
}

/** Dikey (üstten aydınlık) gövde gradyanı. */
function grad(color, dir = 'v') {
  const g = id('g');
  const xy = dir === 'v' ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
  return {
    id: g,
    def: `<linearGradient id="${g}" ${xy}><stop offset="0" stop-color="${shade(color, 0.35)}"/><stop offset="0.35" stop-color="${shade(color, 0.08)}"/><stop offset="0.7" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.42)}"/></linearGradient>`,
  };
}

function groundShadow(cx = 120, cy = 138, rx = 100) {
  const g = id('sh');
  return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="9" fill="url(#${g})"/>`;
}

const METAL = '#b9c0ca';
function chromeGrad() {
  const g = id('cr');
  return { id: g, def: `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f9"/><stop offset=".45" stop-color="#9aa3b0"/><stop offset=".55" stop-color="#e2e6eb"/><stop offset="1" stop-color="#6b7482"/></linearGradient>` };
}

/* ============================== ARABALAR ============================== */
function carWheel(cx, cy, r, rimColor = '#c9ced6', offroad = false) {
  const rim = id('rim');
  const tire = id('tire');
  const spokes = [0, 72, 144, 216, 288]
    .map((a) => {
      const a1 = rad(a - 9), a2 = rad(a + 9);
      const ri = r * 0.16, ro = r * 0.62;
      return `<path d="M${r1(cx + Math.cos(a1) * ri)},${r1(cy + Math.sin(a1) * ri)} L${r1(cx + Math.cos(a1) * ro)},${r1(cy + Math.sin(a1) * ro)} L${r1(cx + Math.cos(a2) * ro)},${r1(cy + Math.sin(a2) * ro)} L${r1(cx + Math.cos(a2) * ri)},${r1(cy + Math.sin(a2) * ri)} Z" fill="url(#${rim})"/>`;
    })
    .join('');
  const lugs = [36, 108, 180, 252, 324].map((a) => `<circle cx="${r1(cx + Math.cos(rad(a)) * r * 0.12)}" cy="${r1(cy + Math.sin(rad(a)) * r * 0.12)}" r="0.9" fill="#2a2f37"/>`).join('');
  return `<defs>
    <radialGradient id="${rim}" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="${rimColor}"/><stop offset="1" stop-color="${shade(rimColor, -0.45)}"/></radialGradient>
    <radialGradient id="${tire}"><stop offset=".7" stop-color="#2a2e35"/><stop offset="1" stop-color="#0d0f12"/></radialGradient></defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${tire})"/>
  ${offroad ? `<circle cx="${cx}" cy="${cy}" r="${r - 1.6}" fill="none" stroke="#3a3f47" stroke-width="2" stroke-dasharray="2.2 2.4"/>` : `<circle cx="${cx}" cy="${cy}" r="${r - 0.8}" fill="none" stroke="#454b55" stroke-width=".8" opacity=".8"/><path d="M${r1(cx - r * 0.82)},${r1(cy + r * 0.3)} A${r * 0.86},${r * 0.86} 0 0 0 ${r1(cx + r * 0.3)},${r1(cy + r * 0.82)}" stroke="#000" stroke-width="2" fill="none" opacity=".35"/>`}
  <circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="#1b1f25"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.56}" fill="#5b6470"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="none" stroke="#7d8692" stroke-width="1" stroke-dasharray="1.2 1.6"/>
  <rect x="${r1(cx - r * 0.5)}" y="${r1(cy - r * 0.62)}" width="${r1(r * 0.34)}" height="${r1(r * 0.22)}" rx="1.5" fill="#c2412d" transform="rotate(-30 ${cx} ${cy})"/>
  ${spokes}
  <circle cx="${cx}" cy="${cy}" r="${r * 0.66}" fill="none" stroke="${shade(rimColor, -0.2)}" stroke-width="1.6"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.17}" fill="url(#${rim})" stroke="#5b6470" stroke-width=".8"/>${lugs}
  <path d="M${r1(cx - r * 0.55)},${r1(cy - r * 0.2)} A${r * 0.58},${r * 0.58} 0 0 1 ${r1(cx + r * 0.1)},${r1(cy - r * 0.58)}" stroke="#fff" stroke-width="1.4" fill="none" opacity=".45"/>`;
}

function car({
  color, body, windows, wheelR = 19, wheels = [62, 178], wy = 116, extra = '', front = [214, 100], rear = [24, 100],
  chrome = false, doors = [], handles = [], mirror = null, beltY = 94, rimColor, roofRails = null, open = false, offroad = false,
}) {
  const g = grad(color);
  const clip = id('clip');
  const glass = id('glass');
  const glow = id('glow');
  const dark = shade(color, -0.55);
  const cg = chromeGrad();
  const fx = front[0], fy = front[1];
  return svg(`<defs>${g.def}${cg.def}
    <clipPath id="${clip}"><path d="${body}"/></clipPath>
    <linearGradient id="${glass}" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="#e3f1fb"/><stop offset=".45" stop-color="#8fb4d4"/><stop offset="1" stop-color="#3d5a75"/></linearGradient>
    <radialGradient id="${glow}"><stop offset="0" stop-color="#fffbe6"/><stop offset=".5" stop-color="#ffe7a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd25a" stop-opacity="0"/></radialGradient>
  </defs>
  ${groundShadow(120, 138, 108)}
  ${wheels.map((x) => `<circle cx="${x}" cy="${wy}" r="${wheelR + 3}" fill="#0b0d10"/>`).join('')}
  <path d="${body}" fill="url(#${g.id})" stroke="${dark}" stroke-width="1.4" stroke-linejoin="round"/>
  <g clip-path="url(#${clip})">
    <rect x="0" y="${beltY + 12}" width="240" height="30" fill="#000" opacity=".22"/>
    <path d="M0,${beltY - 2} L240,${beltY - 6} L240,${beltY - 2} L0,${beltY + 2} Z" fill="#fff" opacity=".28"/>
    <path d="M10,${beltY + 8} Q120,${beltY + 4} 232,${beltY + 8}" stroke="${shade(color, -0.35)}" stroke-width="1.2" fill="none" opacity=".8"/>
    ${doors.map((x) => `<path d="M${x},${beltY - 30} L${x - 2},${beltY + 20}" stroke="${dark}" stroke-width="1.1" opacity=".7"/>`).join('')}
    ${wheels.map((x) => `<circle cx="${x}" cy="${wy}" r="${wheelR + 6}" fill="none" stroke="${shade(color, -0.3)}" stroke-width="3" opacity=".9"/>`).join('')}
  </g>
  ${windows.map((w) => `<path d="${w}" fill="url(#${glass})" stroke="${shade(color, -0.65)}" stroke-width="2" stroke-linejoin="round"/>`).join('')}
  ${windows.map((w, i) => `<clipPath id="${clip}w${i}"><path d="${w}"/></clipPath><g clip-path="url(#${clip}w${i})"><path d="M0,40 L240,-20 L240,-6 L0,54 Z" fill="#fff" opacity=".35"/><path d="M0,64 L240,4 L240,10 L0,70 Z" fill="#fff" opacity=".18"/></g>`).join('')}
  ${roofRails ? `<rect x="${roofRails[0]}" y="${roofRails[1]}" width="${roofRails[2]}" height="3.5" rx="1.5" fill="url(#${cg.id})"/><rect x="${roofRails[0] + 6}" y="${roofRails[1] + 2}" width="3" height="5" fill="#2b2f36"/><rect x="${roofRails[0] + roofRails[2] - 9}" y="${roofRails[1] + 2}" width="3" height="5" fill="#2b2f36"/>` : ''}
  ${handles.map((x) => `<rect x="${x}" y="${beltY + 1}" width="9" height="2.6" rx="1.3" fill="${shade(color, -0.45)}"/><rect x="${x}" y="${beltY + 1}" width="9" height="1" rx=".5" fill="#fff" opacity=".5"/>`).join('')}
  ${mirror ? `<path d="M${mirror[0]},${mirror[1]} l7,-4 l4,0 l0,6 l-9,2 Z" fill="${shade(color, -0.15)}" stroke="${dark}" stroke-width="1"/>` : ''}
  ${extra}
  <ellipse cx="${fx}" cy="${fy}" rx="14" ry="8" fill="url(#${glow})" opacity=".85"/>
  <path d="M${fx - 6},${fy - 4} Q${fx + 6},${fy - 5} ${fx + 7},${fy} Q${fx + 4},${fy + 4} ${fx - 6},${fy + 3} Z" fill="#fff8dc" stroke="${dark}" stroke-width="1"/>
  <path d="M${fx - 3},${fy - 2} L${fx + 3},${fy - 2}" stroke="#fff" stroke-width="1.4"/>
  ${open ? '' : `<rect x="${fx - 2}" y="${fy + 7}" width="12" height="5" rx="1.5" fill="#15181d"/><path d="M${fx},${fy + 9.5} L${fx + 9},${fy + 9.5}" stroke="#4a515c" stroke-width="1" stroke-dasharray="1.5 1"/>`}
  <path d="M${rear[0] - 4},${rear[1] - 5} L${rear[0] + 6},${rear[1] - 5} L${rear[0] + 5},${rear[1] + 4} L${rear[0] - 4},${rear[1] + 4} Z" fill="#e5302f" stroke="#7a1010" stroke-width=".8"/><rect x="${rear[0] - 3}" y="${rear[1] - 4}" width="4" height="2" fill="#ffb3b3"/>
  ${chrome
    ? `<rect x="8" y="106" width="24" height="6" rx="3" fill="url(#${cg.id})"/><rect x="208" y="106" width="26" height="6" rx="3" fill="url(#${cg.id})"/>`
    : `<path d="M14,110 L226,110 L224,117 L18,117 Z" fill="${shade(color, -0.6)}"/>`}
  <path d="M30,117 Q20,118 18,122 L24,122" stroke="#3a404a" stroke-width="2.5" fill="none"/><ellipse cx="17" cy="121" rx="2" ry="1.6" fill="#15181d"/>
  ${wheels.map((x) => carWheel(x, wy, wheelR, rimColor, offroad)).join('')}`);
}

const CARS = {
  'doruk-sedan-1-6': car({
    color: '#3b7dd8',
    body: 'M20,112 Q16,98 30,93 L70,88 Q86,64 108,62 L150,62 Q170,62 186,86 L214,90 Q228,94 226,112 Z',
    windows: ['M90,86 Q100,70 112,69 L127,69 L127,86 Z', 'M133,69 L150,69 Q164,70 176,86 L133,86 Z'],
    doors: [130, 92, 172], handles: [112, 152], mirror: [176, 86], beltY: 94,
    extra: '<path d="M24,96 L34,92" stroke="#fff" stroke-width="1.5" opacity=".5"/><circle cx="58" cy="94" r="3" fill="none" stroke="#1d3e6e" stroke-width="1.2"/>',
  }),
  'doruk-hatchback': car({
    color: '#e5484d',
    body: 'M24,112 Q20,98 34,92 L66,88 Q82,62 108,60 L170,60 Q186,62 192,88 L212,92 Q222,96 220,112 Z',
    windows: ['M86,86 Q98,68 112,67 L133,67 L133,86 Z', 'M139,67 L166,67 Q180,70 184,86 L139,86 Z'],
    doors: [136, 88, 186], handles: [118, 160], mirror: [180, 84], front: [210, 100], beltY: 94,
    extra: '<rect x="66" y="56" width="10" height="4" rx="2" fill="#2b2f36"/>',
  }),
  'tunca-arazi-4x4': car({
    color: '#3e8e5a',
    body: 'M18,112 L18,90 Q20,80 34,78 L62,76 L80,50 Q84,46 92,46 L180,46 Q192,46 198,58 L208,78 Q222,80 222,94 L222,112 Z',
    windows: ['M86,74 L98,54 L132,54 L132,74 Z', 'M138,54 L174,54 Q182,54 186,62 L192,74 L138,74 Z'],
    wheelR: 22, wy: 114, offroad: true, doors: [135, 84, 196], handles: [116, 160], mirror: [190, 74], beltY: 82, rimColor: '#9aa3b0',
    roofRails: [92, 40, 88],
    extra: '<rect x="212" y="84" width="12" height="18" rx="2" fill="#2b2f36"/><path d="M214,88 L222,88 M214,93 L222,93 M214,98 L222,98" stroke="#555c66" stroke-width="1.2"/><rect x="10" y="80" width="10" height="24" rx="4" fill="#2b2f36"/><circle cx="15" cy="92" r="6" fill="#1b1f25" stroke="#3a404a" stroke-width="1.5"/><path d="M24,104 L216,104" stroke="#1b1f25" stroke-width="3" opacity=".35"/>',
    front: [214, 90],
  }),
  'tunca-station': car({
    color: '#9aa4b2',
    body: 'M18,112 Q14,98 30,92 L66,88 Q84,60 106,60 L198,60 Q208,62 210,74 L214,92 Q228,96 226,112 Z',
    windows: ['M88,86 Q100,68 112,67 L136,67 L136,86 Z', 'M142,67 L176,67 L176,86 L142,86 Z', 'M182,67 L198,67 Q203,70 204,86 L182,86 Z'],
    doors: [139, 179, 86], handles: [118, 158], mirror: [84, 84], beltY: 94, roofRails: [104, 54, 94],
    front: [214, 100], rear: [24, 100],
  }),
  'akdag-roadster': car({
    color: '#f5b700',
    body: 'M20,114 Q16,100 32,96 L84,92 L100,84 L176,84 Q198,86 214,96 Q226,100 224,114 Z',
    windows: ['M96,84 L110,62 L116,62 L106,84 Z'],
    doors: [148, 92], handles: [128], beltY: 98, open: true, front: [214, 102], rimColor: '#2b2f36',
    extra: '<path d="M106,84 L176,84 Q178,88 170,90 L110,90 Z" fill="#3a2a22"/><rect x="124" y="68" width="12" height="20" rx="5" fill="#3a2a22"/><rect x="142" y="70" width="11" height="18" rx="5" fill="#3a2a22"/><path d="M150,84 Q170,84 186,90" stroke="#1f2329" stroke-width="3" fill="none"/><path d="M60,100 L80,98 M66,104 L84,102" stroke="#1f2329" stroke-width="2.5"/><path d="M30,104 L200,104" stroke="#1f2329" stroke-width="2" opacity=".6"/>',
  }),
  'marmara-gt-coupe': car({
    color: '#2b2f36',
    body: 'M18,114 Q14,100 30,96 L72,92 Q96,66 122,64 L148,64 Q172,66 198,92 L218,96 Q230,100 226,114 Z',
    windows: ['M96,90 Q108,72 122,71 L134,71 L134,90 Z', 'M140,71 L148,71 Q164,73 184,90 L140,90 Z'],
    doors: [137, 96], handles: [116], mirror: [180, 88], beltY: 98, rimColor: '#f5b700', front: [216, 104],
    extra: '<path d="M28,100 L224,100" stroke="#f5b700" stroke-width="4"/><path d="M28,106 L222,106" stroke="#f5b700" stroke-width="1.5"/><path d="M26,96 L16,90 L22,104 Z" fill="#1a1d22"/><path d="M60,102 l14,0 l-4,6 l-10,0 Z" fill="#15181d"/><path d="M62,104 L72,104 M62,106 L70,106" stroke="#3a404a" stroke-width="1"/>',
  }),
  'doruk-klasik-1972': car({
    color: '#e8d8b0',
    body: 'M16,112 L16,96 Q16,90 26,90 L66,88 L86,64 L160,64 L182,88 L216,90 Q224,90 224,98 L224,112 Z',
    windows: ['M92,86 L102,70 L122,70 L122,86 Z', 'M128,70 L154,70 L170,86 L128,86 Z'],
    chrome: true, doors: [125, 88, 176], handles: [110, 146], mirror: [172, 84], beltY: 94, rimColor: '#e6e9ee',
    extra: '<path d="M20,100 L222,100" stroke="#d9dee5" stroke-width="2.2"/><path d="M20,101.5 L222,101.5" stroke="#8a7a52" stroke-width=".8"/><circle cx="217" cy="97" r="5.5" fill="#fff3c4" stroke="#9c8a5c" stroke-width="1.2"/><rect x="40" y="94" width="14" height="3" rx="1.5" fill="#cfd5dc"/>',
    front: [214, 96],
  }),
  'marmara-klasik-coupe-1968': car({
    color: '#2a9d8f',
    body: 'M16,114 Q12,98 30,94 L80,90 Q102,62 130,62 L146,62 Q172,64 202,90 L220,94 Q232,98 228,114 Z',
    windows: ['M102,88 Q114,70 128,69 L136,69 L136,88 Z', 'M142,69 L148,69 Q166,72 186,88 L142,88 Z'],
    chrome: true, doors: [139, 100], handles: [120], mirror: [184, 86], beltY: 96, rimColor: '#e6e9ee',
    extra: '<path d="M24,102 L224,102" stroke="#e6edf2" stroke-width="2.5"/><path d="M200,96 L222,98" stroke="#e6edf2" stroke-width="1.5"/><path d="M40,98 l18,0 l-2,3 l-16,0 Z" fill="#e6edf2"/>',
  }),
};

/* ============================== MOTORLAR ============================== */
function moWheel(cx, cy, r, { knobby = false, disc = false, color = '#9aa3b0' } = {}) {
  const tire = id('mt');
  const knobs = knobby
    ? Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        return `<rect x="${r1(cx + Math.cos(a) * r - 2.2)}" y="${r1(cy + Math.sin(a) * r - 2.2)}" width="4.4" height="4.4" rx="1" fill="#14171c" transform="rotate(${r1((a * 180) / Math.PI)} ${r1(cx + Math.cos(a) * r)} ${r1(cy + Math.sin(a) * r)})"/>`;
      }).join('')
    : '';
  const holes = disc ? Array.from({ length: 8 }, (_, i) => `<circle cx="${r1(cx + Math.cos((i * Math.PI) / 4) * r * 0.34)}" cy="${r1(cy + Math.sin((i * Math.PI) / 4) * r * 0.34)}" r="1.2" fill="#3a404a"/>`).join('') : '';
  return `<defs><radialGradient id="${tire}"><stop offset=".72" stop-color="#2a2e35"/><stop offset="1" stop-color="#0d0f12"/></radialGradient></defs>${knobs}
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${tire})"/>
  ${knobby ? '' : `<circle cx="${cx}" cy="${cy}" r="${r - 2}" fill="none" stroke="#3a3f47" stroke-width="1.6" stroke-dasharray="3 3"/>`}
  <circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="#1b1f25"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="none" stroke="${color}" stroke-width="2.4"/>
  ${disc ? `<circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="#c3c9d1" stroke="#7d8692" stroke-width="1"/>${holes}<rect x="${cx + r * 0.26}" y="${cy - r * 0.46}" width="${r * 0.2}" height="${r * 0.3}" rx="2" fill="#c2412d"/>` : ''}
  ${[0, 60, 120, 180, 240, 300].map((a) => `<line x1="${cx}" y1="${cy}" x2="${r1(cx + Math.cos(rad(a + 15)) * r * 0.62)}" y2="${r1(cy + Math.sin(rad(a + 15)) * r * 0.62)}" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>`).join('')}
  <circle cx="${cx}" cy="${cy}" r="${r * 0.14}" fill="#dfe3e8" stroke="#5b6470"/>
  <path d="M${r1(cx - r * 0.75)},${r1(cy - r * 0.3)} A${r * 0.8},${r * 0.8} 0 0 1 ${r1(cx - r * 0.1)},${r1(cy - r * 0.8)}" stroke="#fff" stroke-width="1.2" fill="none" opacity=".3"/>`;
}

function engine(x, y, w, h, color = '#4a515c') {
  const fins = Array.from({ length: Math.floor(h / 4) }, (_, i) => `<line x1="${x + 2}" y1="${y + 3 + i * 4}" x2="${x + w * 0.55}" y2="${y + 3 + i * 4}" stroke="#2a2f37" stroke-width="1.2"/>`).join('');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${color}" stroke="#20242a" stroke-width="1.2"/>${fins}
  <circle cx="${x + w * 0.72}" cy="${y + h * 0.62}" r="${Math.min(w, h) * 0.22}" fill="#8a929e" stroke="#3a404a"/><circle cx="${x + w * 0.72}" cy="${y + h * 0.62}" r="${Math.min(w, h) * 0.08}" fill="#3a404a"/>`;
}

function shock(x1, y1, x2, y2, color = '#f07c1a') {
  // Yay: eksene dik, aralıklı kısa halkalar; altında gövde çubuğu.
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
  const px = -uy * 4, py = ux * 4;
  const coils = Array.from({ length: 7 }, (_, i) => {
    const t = 0.12 + (i / 6) * 0.76;
    const cx = x1 + (x2 - x1) * t, cy = y1 + (y2 - y1) * t;
    return `<path d="M${r1(cx - px)},${r1(cy - py)} L${r1(cx + px + ux * 2)},${r1(cy + py + uy * 2)}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
  }).join('');
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3a404a" stroke-width="4" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9aa3b0" stroke-width="1.2"/>${coils}`;
}

function moto({ color, r = 26, wx = [58, 182], wy = 112, knobby = false, parts, crank = [110, 104], tail = [44, 74], rimColor }) {
  const g = grad(color);
  const cg = chromeGrad();
  const dark = shade(color, -0.5);
  return svg(`<defs>${g.def}${cg.def}</defs>${groundShadow(120, 142, 100)}
  ${moWheel(wx[0], wy, r, { knobby, color: rimColor ?? '#9aa3b0' })}${moWheel(wx[1], wy, r, { knobby, disc: true, color: rimColor ?? '#9aa3b0' })}
  <path d="M${crank[0]},${crank[1] - 5} L${wx[0]},${wy - 6} M${crank[0]},${crank[1] + 5} L${wx[0]},${wy + 6}" stroke="#3a404a" stroke-width="1.6" stroke-dasharray="2 1.2"/>
  <circle cx="${wx[0]}" cy="${wy}" r="7" fill="none" stroke="#5b6470" stroke-width="2" stroke-dasharray="1.6 1.2"/>
  <path d="M${wx[0]},${wy} L${crank[0] - 6},${crank[1] - 2}" stroke="#2a2f37" stroke-width="6" stroke-linecap="round"/>
  ${parts({ fill: `url(#${g.id})`, dark, color, chrome: `url(#${cg.id})` })}
  <rect x="${tail[0] - 4}" y="${tail[1] - 2}" width="8" height="5" rx="2" fill="#e5302f" stroke="#7a1010" stroke-width=".8"/>`);
}

const MOTOS = {
  'kartal-k125': moto({
    color: '#d6453d', crank: [104, 102], tail: [46, 76],
    parts: ({ fill, dark, chrome }) => `
    ${shock(70, 78, 84, 102)}
    <path d="M182,112 L160,62" stroke="${chrome}" stroke-width="6" stroke-linecap="round"/><path d="M181,110 L170,84" stroke="#3a404a" stroke-width="7" stroke-linecap="round"/>
    <path d="M58,112 L96,96 L140,96 L160,66" stroke="#2a2f37" stroke-width="6" fill="none" stroke-linejoin="round"/>
    ${engine(96, 80, 40, 26)}
    <path d="M134,104 Q120,118 80,116 L48,112" stroke="${chrome}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M48,110 L36,108" stroke="#3a404a" stroke-width="7" stroke-linecap="round"/>
    <path d="M106,76 Q110,54 138,54 L158,60 Q156,76 142,78 Z" fill="${fill}" stroke="${dark}" stroke-width="1.4"/><path d="M114,62 Q124,56 140,58" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/>
    <path d="M118,66 L146,64" stroke="#fff" stroke-width="3" opacity=".85"/><path d="M118,70 L144,68" stroke="${dark}" stroke-width="1.2"/>
    <path d="M66,74 Q84,64 110,70 L108,78 L70,80 Z" fill="#1f2329"/><path d="M72,72 Q88,66 106,70" stroke="#3a404a" stroke-width="1.2" fill="none"/>
    <path d="M44,82 Q58,72 78,80" stroke="${dark}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M156,58 L166,46 M162,48 L178,50" stroke="#1f2329" stroke-width="4" stroke-linecap="round"/><path d="M166,46 L164,38 L170,36" stroke="#3a404a" stroke-width="2" fill="none"/><ellipse cx="171" cy="35" rx="4" ry="2.5" fill="${chrome}"/>
    <circle cx="170" cy="62" r="8" fill="${chrome}"/><circle cx="171" cy="62" r="5.5" fill="#fff3c4"/>
    <circle cx="112" cy="110" r="3" fill="#2a2f37"/><path d="M112,110 L118,116" stroke="#2a2f37" stroke-width="3"/>`,
  }),
  'kartal-sport-250': moto({
    color: '#2f6fd6', crank: [108, 104], tail: [62, 70],
    parts: ({ fill, dark, chrome }) => `
    ${shock(84, 78, 96, 100, '#f5b700')}
    <path d="M182,112 L162,64" stroke="${chrome}" stroke-width="6" stroke-linecap="round"/><path d="M181,110 L172,88" stroke="#f5b700" stroke-width="7" stroke-linecap="round"/>
    ${engine(100, 86, 34, 20)}
    <path d="M90,100 L120,70 L170,58 Q194,62 190,84 L160,104 L112,108 Z" fill="${fill}" stroke="${dark}" stroke-width="1.5"/>
    <path d="M124,70 L168,60 Q184,62 186,74" stroke="#fff" stroke-width="2.5" opacity=".55" fill="none"/>
    <path d="M118,92 L160,84 L150,98 Z" fill="#1f2329" opacity=".55"/><path d="M128,90 L150,86" stroke="#fff" stroke-width="2"/>
    <path d="M168,60 L186,46 L192,60 Z" fill="#9fc6e8" stroke="${dark}"/><path d="M174,56 L186,49" stroke="#fff" stroke-width="1.2" opacity=".8"/>
    <path d="M60,72 L96,66 L122,70 L112,80 L68,82 Z" fill="${fill}" stroke="${dark}" stroke-width="1.4"/><path d="M96,68 L124,62 L124,72 Z" fill="#1f2329"/>
    <path d="M108,108 L74,104 Q60,102 56,96" stroke="${chrome}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60,92 L48,90 L50,100 L60,100 Z" fill="#3a404a"/>
    <path d="M176,72 L190,76" stroke="#fff3c4" stroke-width="4" stroke-linecap="round"/><path d="M174,80 L186,82" stroke="#fff" stroke-width="1.5" opacity=".6"/>
    <text x="134" y="98" font-family="Arial" font-weight="700" font-size="9" fill="#fff" opacity=".9">250</text>`,
  }),
  'yildirim-scooter-150': moto({
    color: '#5ccfb0', r: 18, wx: [66, 176], wy: 118, crank: [96, 112], tail: [40, 88],
    parts: ({ fill, dark, chrome }) => `
    <path d="M176,118 L164,74" stroke="${chrome}" stroke-width="5" stroke-linecap="round"/>
    <path d="M40,104 Q40,80 70,78 L104,80 Q112,82 112,96 L150,100 L160,66 Q170,56 178,60 L170,104 Q160,118 130,118 L84,118 Q48,118 40,104 Z" fill="${fill}" stroke="${dark}" stroke-width="1.5"/>
    <path d="M48,94 Q52,84 70,84 L100,86" stroke="#fff" stroke-width="2.5" opacity=".5" fill="none"/>
    <path d="M112,100 L150,103 L148,110 L112,110 Z" fill="#2a2f37"/><path d="M116,104 L146,106" stroke="#4a515c" stroke-width="1" stroke-dasharray="3 2"/>
    <path d="M56,74 Q60,62 100,64 L104,76 L58,80 Z" fill="#6b4a32"/><path d="M62,68 Q80,64 98,67" stroke="#8a6448" stroke-width="1.5" fill="none"/>
    <path d="M160,60 L156,44 M148,46 L172,42" stroke="#1f2329" stroke-width="4" stroke-linecap="round"/><ellipse cx="148" cy="40" rx="4" ry="2.5" fill="${chrome}"/><path d="M150,46 L148,41" stroke="#3a404a" stroke-width="1.5"/>
    <path d="M170,62 Q182,62 182,70 L174,74 Z" fill="${fill}" stroke="${dark}"/><circle cx="177" cy="66" r="4.5" fill="#fff3c4" stroke="${dark}"/>
    <rect x="30" y="80" width="20" height="14" rx="3" fill="#1f2329"/><path d="M34,84 L46,84" stroke="#3a404a" stroke-width="1.2"/>
    <path d="M60,116 Q48,118 42,112" stroke="${chrome}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  }),
  'yildirim-tour-650': moto({
    color: '#3b3f48', r: 27, crank: [112, 104], tail: [36, 70], rimColor: '#c9a227',
    parts: ({ fill, dark, chrome }) => `
    <path d="M182,112 L160,60" stroke="${chrome}" stroke-width="7" stroke-linecap="round"/>
    ${engine(98, 82, 44, 26, '#5b6470')}
    <rect x="30" y="74" width="44" height="32" rx="7" fill="${fill}" stroke="${dark}" stroke-width="1.4"/><path d="M34,80 L70,80" stroke="#fff" stroke-width="1.5" opacity=".35"/><rect x="46" y="88" width="12" height="5" rx="2" fill="${chrome}"/>
    <path d="M86,96 L94,68 L150,62 L166,96 Z" fill="${fill}" stroke="${dark}" stroke-width="1.4"/><path d="M98,72 L146,66" stroke="#fff" stroke-width="2" opacity=".4"/>
    <path d="M150,62 L168,38 L182,42 L166,70 Z" fill="#9fc6e8" opacity=".85" stroke="${dark}"/><path d="M158,58 L172,42" stroke="#fff" stroke-width="1.5" opacity=".7"/>
    <path d="M56,66 Q74,56 104,62 L104,72 L60,76 Z" fill="#6b4a32"/><path d="M70,58 L96,56 L96,64 L72,64 Z" fill="#6b4a32"/><path d="M62,68 Q80,62 100,66" stroke="#8a6448" stroke-width="1.2" fill="none"/>
    <path d="M140,108 Q110,120 70,114 L40,112" stroke="${chrome}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M42,110 L30,109" stroke="#3a404a" stroke-width="7" stroke-linecap="round"/>
    <circle cx="170" cy="72" r="8" fill="${chrome}"/><circle cx="171" cy="72" r="5.5" fill="#fff3c4"/>
    <path d="M112,80 L140,78" stroke="#c9a227" stroke-width="3"/><path d="M162,50 L176,48" stroke="#1f2329" stroke-width="3"/>`,
  }),
  'bozkir-enduro-300': moto({
    color: '#f07c1a', r: 27, wy: 110, knobby: true, crank: [108, 98], tail: [52, 62],
    parts: ({ fill, dark, chrome }) => `
    ${shock(84, 70, 96, 94, '#f5b700')}
    <path d="M182,110 L158,52" stroke="${chrome}" stroke-width="6" stroke-linecap="round"/><path d="M181,108 L168,78" stroke="#1f2329" stroke-width="8" stroke-linecap="round"/>
    <path d="M58,110 L104,90 L138,90 L154,58" stroke="#3a404a" stroke-width="6" fill="none"/>
    ${engine(102, 76, 34, 22)}
    <path d="M104,66 Q116,50 146,52 L156,58 Q150,72 136,72 L108,74 Z" fill="${fill}" stroke="${dark}" stroke-width="1.4"/><path d="M112,60 Q126,54 146,56" stroke="#fff" stroke-width="2" opacity=".55" fill="none"/>
    <path d="M60,62 Q90,58 112,66 L108,72 L66,70 Z" fill="#1f2329"/>
    <path d="M40,58 Q60,50 72,60" stroke="${fill}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M170,58 Q192,56 198,74" stroke="${fill}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M150,48 L162,38 M158,40 L174,44" stroke="#1f2329" stroke-width="4" stroke-linecap="round"/><rect x="170" y="40" width="7" height="6" rx="2" fill="#f07c1a"/>
    <path d="M134,96 Q120,72 96,62 L74,60" stroke="${chrome}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M76,58 L60,58" stroke="#3a404a" stroke-width="7" stroke-linecap="round"/>
    <rect x="158" y="54" width="12" height="14" rx="3" fill="#fff" stroke="#1f2329"/><rect x="160.5" y="57" width="7" height="8" rx="2" fill="#fff3c4"/>
    <text x="112" y="70" font-family="Arial" font-weight="800" font-size="8" fill="#fff" opacity=".9">300</text>`,
  }),
};

/* ============================== BİSİKLETLER ============================== */
function bikeWheel(cx, cy, r, { knobby = false, thin = false, rim = '#9aa3b0' } = {}) {
  const tw = thin ? 3.5 : knobby ? 7 : 5;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#14171c" stroke-width="${tw}"/>
  <circle cx="${cx}" cy="${cy}" r="${r + tw / 2 - 0.6}" fill="none" stroke="#2a2e35" stroke-width="1.2" stroke-dasharray="${knobby ? '2.5 2' : '1.2 2.2'}"/>
  <circle cx="${cx}" cy="${cy}" r="${r - tw / 2 - 1}" fill="none" stroke="${rim}" stroke-width="2.2"/>
  ${Array.from({ length: 16 }, (_, i) => `<line x1="${r1(cx + Math.cos((i * Math.PI) / 8 + 0.2) * 3)}" y1="${r1(cy + Math.sin((i * Math.PI) / 8 + 0.2) * 3)}" x2="${r1(cx + Math.cos((i * Math.PI) / 8) * (r - tw / 2 - 2))}" y2="${r1(cy + Math.sin((i * Math.PI) / 8) * (r - tw / 2 - 2))}" stroke="#c9ced6" stroke-width=".7"/>`).join('')}
  <circle cx="${cx}" cy="${cy}" r="3.6" fill="#5b6470" stroke="#2a2f37"/><circle cx="${cx}" cy="${cy}" r="1.2" fill="#c9ced6"/>
  <rect x="${cx - 1}" y="${cy - r + tw / 2}" width="2" height="4" fill="#5b6470"/>`;
}

function bike({ color, r = 30, rx = 62, fx = 178, wy = 108, knobby = false, thin = false, extra = '', bars, seat = [96, 54], frame, crank = [118, 108], cage = false, fork }) {
  const dark = shade(color, -0.45);
  const light = shade(color, 0.45);
  const f = frame;
  const teeth = Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2;
    return `<line x1="${r1(crank[0] + Math.cos(a) * 9)}" y1="${r1(crank[1] + Math.sin(a) * 9)}" x2="${r1(crank[0] + Math.cos(a) * 11)}" y2="${r1(crank[1] + Math.sin(a) * 11)}" stroke="#5b6470" stroke-width="1.4"/>`;
  }).join('');
  return svg(`${groundShadow(120, 140, 100)}
  ${bikeWheel(rx, wy, r, { knobby, thin })}${bikeWheel(fx, wy, r, { knobby, thin })}
  <path d="M${crank[0]},${crank[1] - 10} L${rx},${wy - 4} M${crank[0]},${crank[1] + 10} L${rx},${wy + 4}" stroke="#3a404a" stroke-width="1.4" stroke-dasharray="1.6 1"/>
  <circle cx="${rx}" cy="${wy}" r="5" fill="none" stroke="#5b6470" stroke-width="2"/>
  <path d="${f}" fill="none" stroke="${dark}" stroke-width="7.5" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="${f}" fill="none" stroke="${color}" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="${f}" fill="none" stroke="${light}" stroke-width="1.4" stroke-linejoin="round" opacity=".8" transform="translate(-.6 -1.2)"/>
  ${fork ?? ''}
  <path d="M${seat[0] + 6},${seat[1] + 10} L${seat[0] + 2},${seat[1] + 1}" stroke="#d7dce3" stroke-width="3.5"/>
  <path d="M${seat[0] - 12},${seat[1]} Q${seat[0] + 2},${seat[1] - 7} ${seat[0] + 17},${seat[1] - 1} Q${seat[0] + 4},${seat[1] + 4} ${seat[0] - 12},${seat[1]} Z" fill="#1f2329" stroke="#0f1114" stroke-width="1.5"/>
  <path d="M${seat[0] - 6},${seat[1] - 2} Q${seat[0] + 4},${seat[1] - 6} ${seat[0] + 12},${seat[1] - 2}" stroke="#4a515c" stroke-width="1.2" fill="none"/>
  ${bars}
  ${cage ? `<rect x="${(crank[0] + seat[0]) / 2 + 6}" y="${(crank[1] + seat[1]) / 2 - 2}" width="7" height="16" rx="3" fill="#7fd1ff" stroke="#3a6e8f" stroke-width="1.2" transform="rotate(-24 ${(crank[0] + seat[0]) / 2 + 9} ${(crank[1] + seat[1]) / 2 + 6})"/>` : ''}
  <circle cx="${crank[0]}" cy="${crank[1]}" r="10" fill="none" stroke="#8a929e" stroke-width="2.5"/>${teeth}
  <circle cx="${crank[0]}" cy="${crank[1]}" r="3.2" fill="#3a404a"/>
  <path d="M${crank[0]},${crank[1]} L${crank[0] + 11},${crank[1] + 12}" stroke="#3a404a" stroke-width="3.5" stroke-linecap="round"/><rect x="${crank[0] + 7}" y="${crank[1] + 12}" width="11" height="3.5" rx="1.5" fill="#1f2329"/>
  <path d="M${crank[0]},${crank[1]} L${crank[0] - 10},${crank[1] - 12}" stroke="#3a404a" stroke-width="3" stroke-linecap="round" opacity=".6"/>
  <rect x="${rx - 3 - r * 0.2}" y="${wy - r * 0.55}" width="5" height="7" rx="1.5" fill="#e5302f" opacity=".9"/>
  ${extra}`);
}

const fork = (top, bottom) => `<path d="M${top[0]},${top[1]} L${bottom[0]},${bottom[1]}" stroke="#3a404a" stroke-width="4.5" stroke-linecap="round"/><path d="M${top[0] - 0.8},${top[1]} L${bottom[0] - 0.8},${bottom[1]}" stroke="#8a929e" stroke-width="1" />`;

const BIKES = {
  'serce-sehir-26': bike({
    color: '#2a9d8f',
    frame: 'M62,108 L118,108 L98,64 M118,108 L156,66 M100,82 L156,74 M98,64 L62,108',
    fork: fork([158, 62], [178, 108]),
    bars: '<path d="M158,62 L154,44 Q166,38 178,44" stroke="#3a404a" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="172" y="41" width="9" height="5" rx="2.5" fill="#6b4a32"/><path d="M160,48 Q148,60 150,74" stroke="#1f2329" stroke-width="1" fill="none"/>',
    extra: '<path d="M168,50 L198,50 L194,72 L172,72 Z" fill="#c8a26a" stroke="#8a6a3c" stroke-width="2"/><path d="M171,56 L195,56 M172,62 L194,62 M173,68 L193,68 M178,50 L177,72 M186,50 L186,72" stroke="#8a6a3c" stroke-width="1.2"/><path d="M34,86 Q62,74 90,86" stroke="#1f6e64" stroke-width="4" fill="none"/><path d="M150,86 Q178,74 206,86" stroke="#1f6e64" stroke-width="4" fill="none"/><circle cx="188" cy="60" r="0" /><path d="M64,78 L100,70" stroke="#3a404a" stroke-width="2.5"/><circle cx="196" cy="66" r="4" fill="#fff3c4" stroke="#3a404a"/>',
  }),
  'serce-dag-pro': bike({
    color: '#f07c1a', knobby: true, seat: [90, 50], cage: true,
    frame: 'M62,108 L118,108 L96,60 M118,108 L158,66 M96,64 L158,62 M96,60 L62,108',
    fork: '<path d="M160,62 L168,82" stroke="#1f2329" stroke-width="7" stroke-linecap="round"/><path d="M168,82 L178,108" stroke="#c9ced6" stroke-width="4" stroke-linecap="round"/>',
    bars: '<path d="M160,62 L156,48 L184,46" stroke="#3a404a" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="176" y="43" width="9" height="6" rx="3" fill="#1f2329"/><path d="M160,52 Q142,62 120,62" stroke="#1f2329" stroke-width="1" fill="none"/>',
    extra: '<circle cx="178" cy="108" r="9" fill="none" stroke="#9aa3b0" stroke-width="2"/><rect x="180" y="94" width="5" height="7" rx="1" fill="#c2412d"/><path d="M72,96 L84,92 L90,100" stroke="#5b6470" stroke-width="2" fill="none"/>',
  }),
  'kanat-bmx': bike({
    color: '#e5484d', r: 22, rx: 70, fx: 170, wy: 116, seat: [100, 74], crank: [118, 116],
    frame: 'M70,116 L118,116 L106,84 Z M118,116 L154,76 L106,84 M118,116 L106,84',
    fork: fork([154, 74], [170, 116]),
    bars: '<path d="M154,76 L150,54 M138,56 L166,52" stroke="#1f2329" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M144,64 L160,62" stroke="#1f2329" stroke-width="3"/><rect x="134" y="52" width="8" height="6" rx="3" fill="#2f6fd6"/><rect x="162" y="49" width="8" height="6" rx="3" fill="#2f6fd6"/>',
    extra: '<rect x="60" y="113" width="20" height="6" rx="2" fill="url(#bmxpeg)"/><rect x="160" y="113" width="20" height="6" rx="2" fill="#c9ced6"/><defs><linearGradient id="bmxpeg"><stop offset="0" stop-color="#e2e6eb"/><stop offset="1" stop-color="#9aa3b0"/></linearGradient></defs><circle cx="70" cy="116" r="14" fill="none" stroke="#2f6fd6" stroke-width="2"/><circle cx="170" cy="116" r="14" fill="none" stroke="#2f6fd6" stroke-width="2"/>',
  }),
  'kanat-katlanir': bike({
    color: '#d7dde5', r: 20, rx: 66, fx: 172, wy: 118, seat: [92, 62], crank: [118, 112],
    frame: 'M66,118 L118,108 L160,104 M118,108 L100,74 M160,104 L156,58',
    fork: fork([156, 60], [172, 118]),
    bars: '<path d="M156,58 L148,54 L168,50" stroke="#3a404a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="138" cy="106" r="5.5" fill="#3a404a"/><circle cx="138" cy="106" r="2" fill="#c9ced6"/><circle cx="158" cy="80" r="4" fill="#3a404a"/>',
    extra: '<path d="M52,100 Q66,92 80,100" stroke="#9aa3b0" stroke-width="3" fill="none"/><path d="M158,100 Q172,92 186,100" stroke="#9aa3b0" stroke-width="3" fill="none"/>',
  }),
  'ruzgargulu-yaris-28': bike({
    color: '#f5b700', thin: true, seat: [92, 50], cage: true,
    frame: 'M62,108 L118,108 L96,60 M118,108 L160,62 M96,62 L160,60 M96,60 L62,108',
    fork: fork([160, 60], [178, 108]),
    bars: '<path d="M160,60 L158,52 L176,52 Q188,54 184,66 Q180,72 172,68" stroke="#1f2329" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M176,52 L178,60" stroke="#c9ced6" stroke-width="2.5"/>',
    extra: '<path d="M100,64 L158,62" stroke="#1f2329" stroke-width="2"/><text x="112" y="74" font-family="Arial" font-weight="800" font-style="italic" font-size="7" fill="#1f2329">RÜZGÂR</text><path d="M62,108 m-30,0 a30,30 0 0 1 60,0" stroke="#1f2329" stroke-width="5" fill="none" opacity=".25"/>',
  }),
};

/* ============================== GÜVERCİNLER ============================== */
function pigeon({ body, wing, neck, bars = null, belly = null, crest = false, fan = false, spots = null, tail = '#3a404a', head = null, primaries = null }) {
  const gb = id('pb');
  const gw = grad(wing);
  const neckId = id('neck');
  const wingClip = id('wc');
  const h = head ?? body;
  const prim = primaries ?? shade(wing, -0.35);
  const wingPath = 'M72,92 Q96,70 134,82 Q140,98 126,108 Q98,114 72,92 Z';
  const scallops = [
    [88, 86], [100, 82], [112, 80], [124, 82],
    [84, 94], [96, 92], [108, 90], [120, 92], [132, 92],
    [92, 102], [104, 100], [116, 100], [126, 102],
  ].map(([x, y]) => `<path d="M${x - 6},${y} Q${x},${y + 6} ${x + 6},${y}" stroke="${shade(wing, -0.3)}" stroke-width="1" fill="none" opacity=".8"/>`).join('');
  return svg(`<defs>
    <radialGradient id="${gb}" cx=".55" cy=".35" r=".75"><stop offset="0" stop-color="${shade(body, 0.35)}"/><stop offset=".6" stop-color="${body}"/><stop offset="1" stop-color="${shade(body, -0.35)}"/></radialGradient>
    ${gw.def}
    <linearGradient id="${neckId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${neck[0]}"/><stop offset=".5" stop-color="${neck[1]}"/><stop offset="1" stop-color="${neck[0]}"/></linearGradient>
    <clipPath id="${wingClip}"><path d="${wingPath}"/></clipPath>
  </defs>
  ${groundShadow(118, 143, 74)}
  ${fan
    ? `<path d="M72,92 L20,34 L28,98 L16,122 Z" fill="${tail}" stroke="${shade(tail, -0.3)}" stroke-width="1.5"/>${Array.from({ length: 9 }, (_, i) => { const a = -150 + i * 13; return `<path d="M72,94 L${r1(72 + Math.cos(rad(a)) * 62)},${r1(94 + Math.sin(rad(a)) * 62)}" stroke="${shade(tail, -0.2)}" stroke-width="1.2"/>`; }).join('')}`
    : `<path d="M76,98 L22,110 L24,118 L28,122 L80,110 Z" fill="${tail}" stroke="${shade(tail, -0.35)}" stroke-width="1.2"/><path d="M76,102 L26,114 M76,106 L28,120" stroke="${shade(tail, -0.3)}" stroke-width="1"/><path d="M28,112 L24,118 L30,121" stroke="#1f2329" stroke-width="3" fill="none" opacity=".6"/>`}
  <path d="M60,104 Q62,72 104,66 Q138,58 158,74 Q170,96 152,116 Q128,130 92,124 Q66,120 60,104 Z" fill="url(#${gb})" stroke="${shade(body, -0.45)}" stroke-width="1.4"/>
  ${belly ? `<path d="M112,118 Q140,120 154,104 Q160,118 140,126 Q120,130 104,124 Z" fill="${belly}" opacity=".9"/>` : ''}
  <path d="M138,74 Q150,56 160,52 Q172,52 176,62 Q176,78 162,92 Q150,96 140,88 Z" fill="url(#${neckId})"/>
  <path d="M146,72 Q156,62 168,62" stroke="#fff" stroke-width="1.5" opacity=".35" fill="none"/>
  <circle cx="166" cy="54" r="15" fill="${h}" stroke="${shade(h, -0.4)}" stroke-width="1.4"/>
  <circle cx="161" cy="48" r="6" fill="#fff" opacity=".18"/>
  ${crest ? `<path d="M150,46 Q150,28 164,32 Q176,26 182,40 Q172,36 166,40 Q158,38 150,46 Z" fill="${h}" stroke="${shade(h, -0.35)}" stroke-width="1.4"/><path d="M156,38 Q164,32 174,34" stroke="${shade(h, -0.2)}" stroke-width="1" fill="none"/>` : ''}
  <path d="M179,51 L195,55.5 L179,59.5 Q177,55 179,51 Z" fill="#4a3d32" stroke="#2a221c" stroke-width=".8"/><path d="M179,55.5 L193,55.5" stroke="#2a221c" stroke-width=".6"/>
  <path d="M176,49 Q182,46 185,51 Q181,52 176,51 Z" fill="#f3ece4" stroke="#c9bfb4" stroke-width=".6"/>
  <circle cx="170" cy="51" r="4.6" fill="#ffefe0" stroke="#d9c3ae" stroke-width=".8"/><circle cx="170" cy="51" r="3.4" fill="#ff8c1a"/><circle cx="170.5" cy="51" r="1.7" fill="#140f0b"/><circle cx="169.3" cy="49.8" r=".8" fill="#fff"/>
  <path d="${wingPath}" fill="url(#${gw.id})" stroke="${shade(wing, -0.45)}" stroke-width="1.4"/>
  <g clip-path="url(#${wingClip})">${scallops}
    ${bars ? `<path d="M98,94 Q114,86 130,90 M94,101 Q112,95 128,99" stroke="${bars}" stroke-width="4.2" fill="none" stroke-linecap="round"/>` : ''}
    ${spots ? [[88, 88], [100, 84], [112, 82], [96, 96], [110, 94], [122, 90], [104, 104], [118, 102]].map(([x, y]) => `<path d="M${x - 4},${y} Q${x},${y + 5} ${x + 4},${y} Q${x},${y - 3} ${x - 4},${y} Z" fill="${spots}"/>`).join('') : ''}
  </g>
  ${[0, 1, 2, 3].map((i) => `<path d="M${84 - i * 3},${96 + i * 2} Q${66 - i * 4},${100 + i * 3} ${50 - i * 3},${104 + i * 3} Q${68 - i * 3},${106 + i * 2} ${90 - i * 2},${102 + i}" fill="${prim}" stroke="${shade(prim, -0.35)}" stroke-width=".8"/>`).join('')}
  <path d="M104,74 Q120,68 136,76" stroke="#fff" stroke-width="1.6" opacity=".3" fill="none"/>
  <g stroke="#e8707f" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M112,124 L110,138"/><path d="M128,122 L128,138"/>
    <path d="M110,138 L102,141 M110,138 L110,143 M110,138 L117,141 M110,138 L106,136"/>
    <path d="M128,138 L120,141 M128,138 L128,143 M128,138 L135,141 M128,138 L124,136"/>
  </g>
  <g fill="#3a3027"><circle cx="101.5" cy="141.5" r="1"/><circle cx="117.5" cy="141.5" r="1"/><circle cx="119.5" cy="141.5" r="1"/><circle cx="135.5" cy="141.5" r="1"/></g>`);
}

const PIGEONS = {
  'taklaci-ankara': pigeon({ body: '#eef0f3', wing: '#d3d8df', neck: ['#e8ecef', '#cfd6dd'], bars: '#6d7682', tail: '#c9ced6', primaries: '#aeb5bf' }),
  'donek-edirne': pigeon({ body: '#a0553a', wing: '#b8694a', neck: ['#8c4630', '#b0623f'], spots: '#5b2a1a', tail: '#6b3423', belly: '#c98a6a' }),
  'posta-belcika-tipi': pigeon({ body: '#7f8fa6', wing: '#a2afc1', neck: ['#2fa36b', '#7b4bb3'], bars: '#252a31', tail: '#3a404a', head: '#6f7f96', primaries: '#4a5260' }),
  'hunkari-gosteri': pigeon({ body: '#fbfbfd', wing: '#eef0f6', neck: ['#f3f4f8', '#e2e5ee'], crest: true, fan: true, tail: '#f4f5f9', belly: '#f0f1f6', primaries: '#dde1ea' }),
  'kelebek-konya': pigeon({ body: '#f6f6f6', wing: '#2b3038', neck: ['#262a31', '#4a3f6b'], tail: '#262a31', head: '#f6f6f6', spots: '#f6f6f6', primaries: '#1b1f25' }),
};

/* ============================== KONSOLLAR ============================== */
function pad(x, y, color) {
  const dark = shade(color, -0.45);
  return `<g transform="translate(${x} ${y})">
  <path d="M6,2 L18,-2 L22,2 Z M42,2 L46,-2 L58,2 Z" fill="${dark}"/>
  <path d="M0,14 Q0,0 16,0 L44,0 Q60,0 60,14 L64,34 Q66,44 56,44 Q48,44 44,34 L16,34 Q12,44 4,44 Q-6,44 -4,34 Z" fill="${color}" stroke="${dark}" stroke-width="1.5"/>
  <path d="M6,6 Q16,2 30,3" stroke="#fff" stroke-width="1.2" opacity=".35" fill="none"/>
  <path d="M12,11 L12,23 M6,17 L18,17" stroke="${shade(color, 0.65)}" stroke-width="3.4" stroke-linecap="round"/>
  <circle cx="22" cy="28" r="4.6" fill="${dark}"/><circle cx="22" cy="28" r="3" fill="${shade(color, 0.2)}"/>
  <circle cx="38" cy="28" r="4.6" fill="${dark}"/><circle cx="38" cy="28" r="3" fill="${shade(color, 0.2)}"/>
  <circle cx="46" cy="11" r="2.8" fill="#e5484d"/><circle cx="52" cy="17" r="2.8" fill="#2f6fd6"/><circle cx="40" cy="17" r="2.8" fill="#3e8e5a"/><circle cx="46" cy="23" r="2.8" fill="#f5b700"/>
  <rect x="27" y="10" width="6" height="2.5" rx="1.2" fill="${dark}"/></g>`;
}

function led(cx, cy, color) {
  const g = id('led');
  return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="9" fill="url(#${g})" opacity=".7"/><circle cx="${cx}" cy="${cy}" r="3" fill="${color}"/>`;
}

const vents = (x, y, n, w, color = '#0f1114') => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * 4}" width="${w}" height="1.6" rx=".8" fill="${color}"/>`).join('');

const CONSOLES = {
  'oynat-box-4': svg(`${groundShadow(120, 140, 96)}<rect x="40" y="56" width="120" height="70" rx="8" fill="#22262d" stroke="#0f1114" stroke-width="2"/><rect x="40" y="56" width="120" height="14" rx="6" fill="#2d323b"/><path d="M46,60 L154,60" stroke="#fff" stroke-width="1" opacity=".15"/>${vents(50, 76, 4, 50)}<rect x="52" y="104" width="60" height="4" rx="2" fill="#0f1114"/><rect x="52" y="113" width="10" height="5" rx="1" fill="#0f1114"/><rect x="66" y="113" width="10" height="5" rx="1" fill="#0f1114"/>${led(146, 104, '#3be07a')}${pad(150, 92, '#2a2f37')}`),
  'oynat-box-5-slim': svg(`${groundShadow(120, 140, 96)}<rect x="44" y="70" width="128" height="52" rx="10" fill="#eef1f5" stroke="#aab2bd" stroke-width="2"/><rect x="44" y="70" width="128" height="12" rx="6" fill="#fff"/><path d="M50,74 L166,74" stroke="#fff" stroke-width="1.5"/><path d="M58,100 L118,100" stroke="#aab2bd" stroke-width="3"/>${vents(126, 88, 5, 26, '#c3cad3')}${led(158, 110, '#2f6fd6')}${pad(150, 94, '#f4f6f9')}`),
  'piksel-go': svg(`${groundShadow(120, 140, 96)}<rect x="40" y="58" width="160" height="70" rx="20" fill="#2b2f36" stroke="#0f1114" stroke-width="2"/><path d="M60,58 L78,58 L78,128 L60,128 Q40,128 40,108 L40,78 Q40,58 60,58 Z" fill="#f07c1a"/><path d="M162,58 L180,58 Q200,58 200,78 L200,108 Q200,128 180,128 L162,128 Z" fill="#f07c1a"/><path d="M46,70 Q50,62 62,61" stroke="#fff" stroke-width="1.5" opacity=".35" fill="none"/><rect x="82" y="66" width="76" height="54" rx="4" fill="#0f1114"/><rect x="86" y="70" width="68" height="46" rx="2" fill="#7fd1ff"/><path d="M86,104 Q110,92 154,100 L154,116 L86,116 Z" fill="#3e8e5a"/><path d="M100,104 L110,88 L120,104 Z" fill="#2a6b42"/><circle cx="140" cy="80" r="6" fill="#ffe08a"/><rect x="116" y="96" width="6" height="8" fill="#e5484d"/><path d="M86,70 L120,70 L96,94 L86,94 Z" fill="#fff" opacity=".18"/><circle cx="59" cy="80" r="7" fill="#1b1f25"/><circle cx="59" cy="80" r="4" fill="#3a404a"/><path d="M56,100 L56,112 M50,106 L62,106" stroke="#1b1f25" stroke-width="3.5" stroke-linecap="round"/><circle cx="181" cy="104" r="7" fill="#1b1f25"/><circle cx="181" cy="104" r="4" fill="#3a404a"/><circle cx="181" cy="78" r="2.6" fill="#1b1f25"/><circle cx="187" cy="84" r="2.6" fill="#1b1f25"/><circle cx="175" cy="84" r="2.6" fill="#1b1f25"/><circle cx="181" cy="90" r="2.6" fill="#1b1f25"/>`),
  'piksel-station': svg(`${groundShadow(120, 140, 96)}<path d="M38,120 L46,62 Q48,54 58,54 L150,54 Q160,54 162,62 L170,120 Z" fill="#1d2026" stroke="#0b0c0f" stroke-width="2"/><path d="M50,62 Q52,58 60,58 L148,58" stroke="#fff" stroke-width="1" opacity=".18" fill="none"/><path d="M60,60 L150,60" stroke="#2f6fd6" stroke-width="3" opacity=".9"/><path d="M60,60 L150,60" stroke="#7fb3ff" stroke-width="8" opacity=".15"/><path d="M54,112 L156,112" stroke="#2f6fd6" stroke-width="2" opacity=".6"/>${vents(60, 74, 6, 80, '#121418')}${pad(148, 94, '#22262d')}`),
  'tusla-mini': svg(`${groundShadow(120, 140, 96)}<rect x="40" y="76" width="104" height="48" rx="14" fill="#2f3a48" stroke="#141a22" stroke-width="2"/><path d="M48,82 Q60,78 120,78" stroke="#fff" stroke-width="1.2" opacity=".2" fill="none"/><circle cx="66" cy="100" r="12" fill="#1d242e"/>${led(66, 100, '#5ccfb0')}<rect x="88" y="94" width="40" height="5" rx="2.5" fill="#5ccfb0" opacity=".8"/><rect x="88" y="104" width="26" height="5" rx="2.5" fill="#1d242e"/>${vents(118, 104, 3, 16, '#1d242e')}${pad(150, 92, '#2f3a48')}`),
};

/* ============================== TELEFONLAR ============================== */
function lens(cx, cy, r) {
  const g = id('lens');
  return `<defs><radialGradient id="${g}" cx=".35" cy=".3"><stop offset="0" stop-color="#4a6fa5"/><stop offset=".5" stop-color="#14203a"/><stop offset="1" stop-color="#05070c"/></radialGradient></defs>
  <circle cx="${cx}" cy="${cy}" r="${r + 1.6}" fill="#2a2f37" stroke="#8a929e" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${g})"/>
  <circle cx="${cx - r * 0.35}" cy="${cy - r * 0.35}" r="${r * 0.28}" fill="#fff" opacity=".55"/><circle cx="${cx + r * 0.3}" cy="${cy + r * 0.25}" r="${r * 0.12}" fill="#9fc6e8" opacity=".6"/>`;
}

function phone({ color, w = 62, h = 118, cams = 2, bump = 'square', accent = null }) {
  const g = grad(color, 'h');
  const x = 120 - w / 2;
  const y = 136 - h;
  const bw = cams > 2 ? 32 : 24;
  const bh = cams > 1 ? 32 : 20;
  const lensPos = cams === 1 ? [[x + 15, y + 17]] : cams === 2 ? [[x + 16, y + 16], [x + 16, y + 30]] : cams === 3 ? [[x + 16, y + 16], [x + 30, y + 16], [x + 16, y + 30]] : [[x + 16, y + 16], [x + 30, y + 16], [x + 16, y + 30], [x + 30, y + 30]];
  const camsSvg = bump === 'square'
    ? `<rect x="${x + 6}" y="${y + 6}" width="${bw + 2}" height="${bh + 4}" rx="9" fill="${shade(color, -0.2)}" stroke="${shade(color, -0.5)}"/><path d="M${x + 9},${y + 9} L${x + bw},${y + 9}" stroke="#fff" stroke-width="1" opacity=".3"/>
       ${lensPos.map(([cx, cy]) => lens(cx, cy, 4.6)).join('')}
       <circle cx="${x + (cams > 2 ? 30 : 26)}" cy="${y + (cams > 2 ? 38 : 22)}" r="1.8" fill="#fff3c4"/>`
    : `<rect x="${x + 9}" y="${y + 7}" width="13" height="${cams * 14 + 4}" rx="6.5" fill="${shade(color, -0.3)}"/>${Array.from({ length: cams }, (_, i) => lens(x + 15.5, y + 15 + i * 14, 4.2)).join('')}<circle cx="${x + 26}" cy="${y + 13}" r="1.8" fill="#fff3c4"/>`;
  return svg(`<defs>${g.def}</defs>${groundShadow(120, 140, 54)}
  <rect x="${x + 2}" y="${y + 2}" width="${w}" height="${h}" rx="13" fill="#000" opacity=".35"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="url(#${g.id})" stroke="${shade(color, -0.55)}" stroke-width="2"/>
  <rect x="${x + 2.5}" y="${y + 2.5}" width="${w - 5}" height="${h - 5}" rx="10" fill="none" stroke="#fff" stroke-opacity=".22"/>
  <path d="M${x + 4},${y + h * 0.55} L${x + w - 4},${y + h * 0.35} L${x + w - 4},${y + h * 0.45} L${x + 4},${y + h * 0.65} Z" fill="#fff" opacity=".07"/>
  ${camsSvg}
  ${accent
    ? `<circle cx="120" cy="${y + h / 2 + 8}" r="8" fill="none" stroke="${accent}" stroke-width="2" opacity=".7"/><circle cx="120" cy="${y + h / 2 + 8}" r="3" fill="${accent}" opacity=".5"/>`
    : `<rect x="118" y="${y + h / 2}" width="4" height="12" rx="2" fill="${shade(color, -0.3)}" opacity=".6"/>`}
  <text x="120" y="${y + h - 10}" text-anchor="middle" font-family="Arial" font-size="5" letter-spacing="1.5" fill="#fff" opacity=".35">GARAJ</text>
  <rect x="${x + w - 0.5}" y="${y + 24}" width="3" height="16" rx="1.5" fill="${shade(color, -0.4)}"/><rect x="${x + w - 0.5}" y="${y + 44}" width="3" height="10" rx="1.5" fill="${shade(color, -0.4)}"/>
  <rect x="${x - 2.5}" y="${y + 30}" width="3" height="20" rx="1.5" fill="${shade(color, -0.4)}"/>`);
}

const PHONES = {
  'piril-p12': phone({ color: '#4c6ef5' }),
  'piril-p14-pro': phone({ color: '#5a5f6b', cams: 3, accent: '#d7dde5' }),
  'nokta-mini-5': phone({ color: '#ff7aa8', w: 54, h: 100, cams: 1 }),
  'nokta-max': phone({ color: '#1f2329', w: 70, h: 126, cams: 4, accent: '#f5b700' }),
  'ekran-lite': phone({ color: '#5ccfb0', cams: 2, bump: 'pill' }),
};

/* ============================== YAZ ============================== */
const ALL = { ...CARS, ...MOTOS, ...BIKES, ...PIGEONS, ...CONSOLES, ...PHONES };
for (const [slug, s] of Object.entries(ALL)) writeFileSync(`${OUT}/${slug}.svg`, s);

const CATEGORY = {
  araba: CARS['doruk-sedan-1-6'],
  motor: MOTOS['kartal-k125'],
  bisiklet: BIKES['serce-dag-pro'],
  guvercin: PIGEONS['posta-belcika-tipi'],
  konsol: CONSOLES['oynat-box-4'],
  telefon: PHONES['piril-p12'],
};
for (const [c, s] of Object.entries(CATEGORY)) writeFileSync(`${CAT}/${c}.svg`, s);
console.log(`${Object.keys(ALL).length} model, ${Object.keys(CATEGORY).length} kategori çizimi yazıldı`);
