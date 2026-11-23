// Garaj model çizimleri: her model için aynı tarzda (yandan görünüş, düz renk + yumuşak gölge) SVG üretir.
// Çalıştır: node scripts/make-art.mjs   → src/assets/models/*.svg ve src/assets/categories/*.svg
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = 'src/assets/models';
const CAT = 'src/assets/categories';
mkdirSync(OUT, { recursive: true });
mkdirSync(CAT, { recursive: true });

let uid = 0;
const id = (p) => `${p}${++uid}`;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt)))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

function svg(body, w = 240, h = 160) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>\n`;
}

function grad(color, dir = 'v') {
  const g = id('g');
  const xy = dir === 'v' ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
  return {
    id: g,
    def: `<linearGradient id="${g}" ${xy}><stop offset="0" stop-color="${shade(color, 0.28)}"/><stop offset="0.55" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.35)}"/></linearGradient>`,
  };
}

const shadow = (cx = 120, cy = 138, rx = 100) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="7" fill="#000" opacity=".35"/>`;
const GLASS = '#9fc6e8';

/* ------------------------------ ARABALAR ------------------------------ */
function carWheel(cx, cy, r) {
  const g = id('rim');
  return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="#eef1f5"/><stop offset="1" stop-color="#8b94a3"/></radialGradient></defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#14171c"/><circle cx="${cx}" cy="${cy}" r="${r * 0.58}" fill="url(#${g})"/>
  ${[0, 72, 144, 216, 288].map((a) => `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos((a * Math.PI) / 180) * r * 0.52}" y2="${cy + Math.sin((a * Math.PI) / 180) * r * 0.52}" stroke="#6b7482" stroke-width="2.2"/>`).join('')}
  <circle cx="${cx}" cy="${cy}" r="${r * 0.16}" fill="#3a404a"/>`;
}

function car({ color, body, windows, wheelR = 19, wheels = [62, 178], wy = 116, extra = '', front = [214, 100], rear = [24, 100], chrome = false }) {
  const g = grad(color);
  return svg(`<defs>${g.def}</defs>${shadow()}
  <path d="${body}" fill="url(#${g.id})" stroke="${shade(color, -0.5)}" stroke-width="1.5" stroke-linejoin="round"/>
  ${windows.map((w) => `<path d="${w}" fill="${GLASS}" stroke="${shade(color, -0.55)}" stroke-width="1.2"/><path d="${w}" fill="url(#shine)" opacity=".5"/>`).join('')}
  <defs><linearGradient id="shine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <path d="M30,104 L210,104" stroke="${shade(color, -0.4)}" stroke-width="1.2" opacity=".6"/>
  ${extra}
  <ellipse cx="${front[0]}" cy="${front[1]}" rx="6" ry="4" fill="#fff3c4" stroke="${shade(color, -0.5)}"/>
  <rect x="${rear[0] - 3}" y="${rear[1] - 4}" width="7" height="7" rx="2" fill="#ff4d4f"/>
  ${chrome ? '<rect x="10" y="108" width="20" height="5" rx="2" fill="#dfe4ea"/><rect x="210" y="108" width="22" height="5" rx="2" fill="#dfe4ea"/>' : `<rect x="16" y="110" width="208" height="6" rx="3" fill="${shade(color, -0.55)}"/>`}
  ${wheels.map((x) => `<circle cx="${x}" cy="${wy}" r="${wheelR + 4}" fill="${shade(color, -0.6)}"/>`).join('')}
  ${wheels.map((x) => carWheel(x, wy, wheelR)).join('')}`);
}

const CARS = {
  'doruk-sedan-1-6': car({
    color: '#3b7dd8',
    body: 'M20,112 Q18,96 34,92 L70,88 Q86,64 108,62 L150,62 Q170,62 186,86 L212,90 Q226,94 224,112 Z',
    windows: ['M90,86 Q100,70 112,69 L128,69 L128,86 Z', 'M134,69 L150,69 Q164,70 176,86 L134,86 Z'],
  }),
  'doruk-hatchback': car({
    color: '#e5484d',
    body: 'M24,112 Q22,96 36,92 L66,88 Q82,62 108,60 L170,60 Q186,62 192,88 L210,92 Q220,96 218,112 Z',
    windows: ['M86,86 Q98,68 112,67 L134,67 L134,86 Z', 'M140,67 L166,67 Q180,70 184,86 L140,86 Z'],
    front: [210, 100],
  }),
  'tunca-arazi-4x4': car({
    color: '#3e8e5a',
    body: 'M18,112 L18,90 Q20,80 34,78 L62,76 L80,50 Q84,46 92,46 L180,46 Q192,46 198,58 L208,78 Q222,80 222,94 L222,112 Z',
    windows: ['M86,74 L98,54 L132,54 L132,74 Z', 'M138,54 L176,54 Q184,54 188,62 L194,74 L138,74 Z'],
    wheelR: 22, wy: 114,
    extra: '<rect x="90" y="38" width="90" height="5" rx="2" fill="#2b2f36"/><rect x="100" y="34" width="4" height="8" fill="#2b2f36"/><rect x="166" y="34" width="4" height="8" fill="#2b2f36"/><rect x="214" y="84" width="10" height="16" rx="2" fill="#2b2f36"/>',
    front: [214, 90],
  }),
  'tunca-station': car({
    color: '#9aa4b2',
    body: 'M18,112 Q18,96 32,92 L66,88 Q84,60 106,60 L198,60 Q208,62 210,74 L214,92 Q226,96 224,112 Z',
    windows: ['M88,86 Q100,68 112,67 L136,67 L136,86 Z', 'M142,67 L176,67 L176,86 L142,86 Z', 'M182,67 L198,67 Q203,70 204,86 L182,86 Z'],
    extra: '<rect x="100" y="54" width="96" height="4" rx="2" fill="#4a5260"/>',
  }),
  'akdag-roadster': car({
    color: '#f5b700',
    body: 'M20,114 Q18,100 32,96 L84,92 L100,84 L176,84 Q198,86 214,96 Q224,100 222,114 Z',
    windows: ['M96,84 L110,62 L116,62 L106,84 Z'],
    extra: '<rect x="124" y="70" width="12" height="16" rx="5" fill="#2b2f36"/><path d="M150,84 Q170,84 186,90" stroke="#1f2329" stroke-width="3" fill="none"/>',
    front: [214, 102],
  }),
  'marmara-gt-coupe': car({
    color: '#2b2f36',
    body: 'M18,114 Q16,100 30,96 L72,92 Q96,66 122,64 L148,64 Q172,66 198,92 L216,96 Q228,100 226,114 Z',
    windows: ['M96,90 Q108,72 122,71 L134,71 L134,90 Z', 'M140,71 L148,71 Q164,73 184,90 L140,90 Z'],
    extra: '<path d="M28,100 L222,100" stroke="#f5b700" stroke-width="4"/><path d="M26,96 L18,92 L22,104 Z" fill="#1a1d22"/>',
    front: [216, 104],
  }),
  'doruk-klasik-1972': car({
    color: '#e8d8b0',
    body: 'M16,112 L16,96 Q16,90 26,90 L66,88 L86,64 L160,64 L182,88 L216,90 Q224,90 224,98 L224,112 Z',
    windows: ['M92,86 L102,70 L122,70 L122,86 Z', 'M128,70 L154,70 L170,86 L128,86 Z'],
    chrome: true,
    extra: '<path d="M22,100 L220,100" stroke="#c9b787" stroke-width="2"/><circle cx="218" cy="98" r="5" fill="#fff3c4" stroke="#9c8a5c"/>',
    front: [216, 96],
  }),
  'marmara-klasik-coupe-1968': car({
    color: '#2a9d8f',
    body: 'M16,114 Q14,98 30,94 L80,90 Q102,62 130,62 L146,62 Q172,64 202,90 L220,94 Q230,98 226,114 Z',
    windows: ['M102,88 Q114,70 128,69 L136,69 L136,88 Z', 'M142,69 L148,69 Q166,72 186,88 L142,88 Z'],
    chrome: true,
    extra: '<path d="M24,102 L222,102" stroke="#e6edf2" stroke-width="2.5"/>',
  }),
};

/* ------------------------------ MOTORLAR ------------------------------ */
function moWheel(cx, cy, r, knobby = false) {
  const knobs = knobby
    ? Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return `<rect x="${cx + Math.cos(a) * r - 2.5}" y="${cy + Math.sin(a) * r - 2.5}" width="5" height="5" fill="#14171c" transform="rotate(${(a * 180) / Math.PI} ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r})"/>`;
      }).join('')
    : '';
  return `${knobs}<circle cx="${cx}" cy="${cy}" r="${r}" fill="#14171c"/><circle cx="${cx}" cy="${cy}" r="${r * 0.66}" fill="#2a2f37"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="none" stroke="#9aa3b0" stroke-width="2"/>
  ${[0, 60, 120, 180, 240, 300].map((a) => `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos((a * Math.PI) / 180) * r * 0.5}" y2="${cy + Math.sin((a * Math.PI) / 180) * r * 0.5}" stroke="#9aa3b0" stroke-width="1.6"/>`).join('')}
  <circle cx="${cx}" cy="${cy}" r="${r * 0.14}" fill="#c9ced6"/>`;
}

function moto({ color, r = 26, wx = [58, 182], wy = 112, knobby = false, parts }) {
  const g = grad(color);
  const dark = shade(color, -0.5);
  return svg(`<defs>${g.def}</defs>${shadow(120, 140, 96)}
  ${moWheel(wx[0], wy, r, knobby)}${moWheel(wx[1], wy, r, knobby)}
  ${parts({ fill: `url(#${g.id})`, dark, color })}`);
}

const METAL = '#b9c0ca';
const MOTOS = {
  'kartal-k125': moto({
    color: '#d6453d',
    parts: ({ fill, dark }) => `
    <path d="M182,112 L160,62" stroke="${METAL}" stroke-width="5" stroke-linecap="round"/>
    <path d="M58,112 L96,96 L140,96 L160,66" stroke="#3a404a" stroke-width="6" fill="none" stroke-linejoin="round"/>
    <path d="M100,96 L96,74 L134,72 L142,96 Z" fill="#3a404a"/>
    <path d="M108,74 Q112,56 138,56 L156,60 Q154,74 142,76 Z" fill="${fill}" stroke="${dark}" stroke-width="1.4"/>
    <path d="M70,72 Q86,64 110,70 L108,76 L72,78 Z" fill="#1f2329"/>
    <path d="M96,102 L56,98 L52,104 L92,108 Z" fill="${METAL}"/>
    <path d="M156,58 L166,48 M164,50 L176,52" stroke="#1f2329" stroke-width="4" stroke-linecap="round"/>
    <circle cx="170" cy="62" r="7" fill="#fff3c4" stroke="#1f2329" stroke-width="2"/>
    <path d="M44,84 Q58,74 76,82" stroke="${dark}" stroke-width="5" fill="none"/>`,
  }),
  'kartal-sport-250': moto({
    color: '#2f6fd6',
    parts: ({ fill, dark }) => `
    <path d="M182,112 L162,64" stroke="${METAL}" stroke-width="5" stroke-linecap="round"/>
    <path d="M58,112 L100,96 L146,96" stroke="#3a404a" stroke-width="6" fill="none"/>
    <path d="M90,100 L120,70 L170,58 Q192,62 190,82 L160,104 L110,108 Z" fill="${fill}" stroke="${dark}" stroke-width="1.5"/>
    <path d="M168,60 L186,48 L190,60 Z" fill="${GLASS}" stroke="${dark}"/>
    <path d="M64,74 L96,68 L120,72 L110,80 L70,82 Z" fill="${fill}" stroke="${dark}" stroke-width="1.4"/>
    <path d="M96,70 L124,64 L124,72 Z" fill="#1f2329"/>
    <path d="M124,90 L150,90" stroke="#fff" stroke-width="3" opacity=".7"/>
    <path d="M110,104 L66,100 L64,108 L106,110 Z" fill="${METAL}"/>
    <path d="M178,72 L188,74" stroke="#fff3c4" stroke-width="4" stroke-linecap="round"/>`,
  }),
  'yildirim-scooter-150': moto({
    color: '#5ccfb0', r: 18, wx: [66, 176], wy: 118,
    parts: ({ fill, dark }) => `
    <path d="M176,118 L164,74" stroke="${METAL}" stroke-width="5" stroke-linecap="round"/>
    <path d="M40,104 Q40,80 70,78 L104,80 Q112,82 112,96 L150,100 L160,66 Q170,56 178,60 L170,104 Q160,118 130,118 L84,118 Q48,118 40,104 Z" fill="${fill}" stroke="${dark}" stroke-width="1.5"/>
    <path d="M56,74 Q60,64 100,66 L104,76 L58,80 Z" fill="#6b4a32"/>
    <path d="M160,60 L156,44 M150,46 L170,42" stroke="#1f2329" stroke-width="4" stroke-linecap="round"/>
    <circle cx="176" cy="66" r="6" fill="#fff3c4" stroke="${dark}" stroke-width="2"/>
    <rect x="34" y="80" width="18" height="12" rx="3" fill="#1f2329"/>`,
  }),
  'yildirim-tour-650': moto({
    color: '#3b3f48', r: 27,
    parts: ({ fill, dark }) => `
    <path d="M182,112 L160,60" stroke="${METAL}" stroke-width="6" stroke-linecap="round"/>
    <path d="M58,112 L100,94 L148,94" stroke="#20242a" stroke-width="7" fill="none"/>
    <rect x="34" y="74" width="40" height="30" rx="6" fill="${fill}" stroke="${dark}" stroke-width="1.4"/>
    <path d="M86,96 L94,68 L150,62 L166,96 Z" fill="${fill}" stroke="${dark}" stroke-width="1.4"/>
    <path d="M150,62 L168,40 L180,44 L166,70 Z" fill="${GLASS}" opacity=".85" stroke="${dark}"/>
    <path d="M58,68 Q74,58 104,64 L104,72 L62,76 Z" fill="#6b4a32"/>
    <path d="M70,60 L96,58 L96,66 L72,66 Z" fill="#6b4a32"/>
    <path d="M100,100 L60,98 L56,106 L96,108 Z" fill="${METAL}"/>
    <circle cx="170" cy="70" r="7" fill="#fff3c4" stroke="#1f2329" stroke-width="2"/>
    <path d="M112,80 L140,78" stroke="#c9a227" stroke-width="3"/>`,
  }),
  'bozkir-enduro-300': moto({
    color: '#f07c1a', r: 27, wy: 110, knobby: true,
    parts: ({ fill, dark }) => `
    <path d="M182,110 L158,52" stroke="${METAL}" stroke-width="6" stroke-linecap="round"/>
    <path d="M58,110 L104,90 L138,90 L154,58" stroke="#3a404a" stroke-width="6" fill="none"/>
    <path d="M104,66 Q116,50 146,52 L156,58 Q150,72 136,72 L108,74 Z" fill="${fill}" stroke="${dark}" stroke-width="1.4"/>
    <path d="M60,62 Q90,58 112,66 L108,72 L66,70 Z" fill="#1f2329"/>
    <path d="M40,58 Q60,50 72,60" stroke="${fill}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M170,58 Q192,56 198,74" stroke="${fill}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M150,48 L162,38 M158,40 L172,44" stroke="#1f2329" stroke-width="4" stroke-linecap="round"/>
    <path d="M104,96 L70,80 L66,86 L100,102 Z" fill="${METAL}"/>
    <rect x="160" y="56" width="10" height="12" rx="2" fill="#fff3c4" stroke="#1f2329"/>`,
  }),
};

/* ------------------------------ BİSİKLETLER ------------------------------ */
function bikeWheel(cx, cy, r, knobby = false, thin = false) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#14171c" stroke-width="${thin ? 4 : knobby ? 8 : 6}" ${knobby ? 'stroke-dasharray="3 2"' : ''}/>
  <circle cx="${cx}" cy="${cy}" r="${r - (knobby ? 5 : 4)}" fill="none" stroke="#9aa3b0" stroke-width="1.6"/>
  ${Array.from({ length: 12 }, (_, i) => `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos((i * Math.PI) / 6) * (r - 4)}" y2="${cy + Math.sin((i * Math.PI) / 6) * (r - 4)}" stroke="#b9c0ca" stroke-width=".8"/>`).join('')}
  <circle cx="${cx}" cy="${cy}" r="3" fill="#3a404a"/>`;
}

function bike({ color, r = 30, rx = 62, fx = 178, wy = 108, knobby = false, thin = false, extra = '', bars, seat = [96, 54], frame }) {
  const dark = shade(color, -0.45);
  const crank = [118, wy];
  const f = frame ?? `M${rx},${wy} L${crank[0]},${crank[1]} L${seat[0] + 6},${seat[1] + 10} Z M${crank[0]},${crank[1]} L${fx - 18},${wy - 46} L${seat[0] + 6},${seat[1] + 10} M${fx - 18},${wy - 46} L${fx},${wy}`;
  return svg(`${shadow(120, 140, 96)}
  ${bikeWheel(rx, wy, r, knobby, thin)}${bikeWheel(fx, wy, r, knobby, thin)}
  <path d="${f}" fill="none" stroke="${color}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="${f}" fill="none" stroke="${shade(color, 0.35)}" stroke-width="1.5" stroke-linejoin="round" opacity=".7"/>
  <path d="M${seat[0] + 6},${seat[1] + 10} L${seat[0] + 2},${seat[1] + 2}" stroke="${METAL}" stroke-width="4"/>
  <path d="M${seat[0] - 10},${seat[1]} Q${seat[0] + 4},${seat[1] - 6} ${seat[0] + 16},${seat[1]} Z" fill="#1f2329" stroke="#1f2329" stroke-width="3" stroke-linejoin="round"/>
  ${bars}
  <circle cx="${crank[0]}" cy="${crank[1]}" r="8" fill="none" stroke="${dark}" stroke-width="3"/>
  <path d="M${crank[0]},${crank[1]} L${crank[0] + 10},${crank[1] + 10}" stroke="#3a404a" stroke-width="4" stroke-linecap="round"/>
  ${extra}`);
}

const BIKES = {
  'serce-sehir-26': bike({
    color: '#2a9d8f',
    frame: 'M62,108 L118,108 L98,64 M118,108 L158,64 M100,80 L156,72 M158,64 L178,108',
    bars: '<path d="M158,64 L154,46 Q166,40 176,46" stroke="#3a404a" stroke-width="4" fill="none" stroke-linecap="round"/>',
    extra: '<path d="M170,52 L196,52 L192,70 L174,70 Z" fill="#c8a26a" stroke="#8a6a3c" stroke-width="2"/><path d="M174,58 L192,58 M176,64 L190,64" stroke="#8a6a3c" stroke-width="1.5"/><path d="M42,86 Q62,78 82,86" stroke="#2a9d8f" stroke-width="4" fill="none"/>',
  }),
  'serce-dag-pro': bike({
    color: '#f07c1a', knobby: true, seat: [90, 50],
    bars: '<path d="M160,62 L156,48 L180,46" stroke="#3a404a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M162,66 L176,104" stroke="#1f2329" stroke-width="6"/>',
  }),
  'kanat-bmx': bike({
    color: '#e5484d', r: 22, rx: 70, fx: 170, wy: 116, seat: [100, 74],
    frame: 'M70,116 L118,116 L106,84 Z M118,116 L154,76 L106,84 M154,76 L170,116',
    bars: '<path d="M154,76 L150,56 M140,56 L164,54" stroke="#1f2329" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M146,64 L160,64" stroke="#1f2329" stroke-width="3"/>',
    extra: '<rect x="62" y="113" width="18" height="6" rx="2" fill="#b9c0ca"/><rect x="160" y="113" width="18" height="6" rx="2" fill="#b9c0ca"/>',
  }),
  'kanat-katlanir': bike({
    color: '#d7dde5', r: 20, rx: 66, fx: 172, wy: 118, seat: [92, 62],
    frame: 'M66,118 L118,104 L160,104 L172,118 M118,104 L100,74 M160,104 L156,60',
    bars: '<path d="M156,60 L148,56 L166,52" stroke="#3a404a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="138" cy="104" r="5" fill="#3a404a"/>',
  }),
  'ruzgargulu-yaris-28': bike({
    color: '#f5b700', thin: true, seat: [92, 50],
    bars: '<path d="M160,60 L158,52 L176,52 Q186,54 182,64 Q178,70 172,66" stroke="#1f2329" stroke-width="4" fill="none" stroke-linecap="round"/>',
    extra: '<path d="M100,64 L158,62" stroke="#1f2329" stroke-width="2"/>',
  }),
};

/* ------------------------------ GÜVERCİNLER ------------------------------ */
function pigeon({ body, wing, neck, bars = null, belly = null, crest = false, fan = false, spots = null, tail = '#3a404a', head = null }) {
  const gb = grad(body);
  const gw = grad(wing);
  const neckId = id('neck');
  const h = head ?? body;
  return svg(`<defs>${gb.def}${gw.def}<linearGradient id="${neckId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${neck[0]}"/><stop offset="1" stop-color="${neck[1]}"/></linearGradient></defs>
  ${shadow(118, 142, 70)}
  ${fan ? `<path d="M70,92 L22,40 L30,96 L18,118 Z" fill="${tail}" stroke="${shade(tail, -0.3)}" stroke-width="1.5"/><path d="M70,92 L34,30 M70,94 L22,70 M70,96 L22,104" stroke="${shade(tail, -0.25)}" stroke-width="1.2"/>` : `<path d="M74,100 L26,112 L30,122 L80,110 Z" fill="${tail}"/>`}
  <path d="M60,104 Q62,72 104,66 Q138,58 158,74 Q170,96 152,116 Q128,130 92,124 Q66,120 60,104 Z" fill="url(#${gb.id})" stroke="${shade(body, -0.4)}" stroke-width="1.5"/>
  ${belly ? `<path d="M112,118 Q140,120 154,104 Q160,118 140,126 Q120,130 104,124 Z" fill="${belly}" opacity=".9"/>` : ''}
  <path d="M138,74 Q150,56 160,52 Q172,52 176,62 Q176,78 162,92 Q150,96 140,88 Z" fill="url(#${neckId})"/>
  <circle cx="166" cy="54" r="15" fill="${h}" stroke="${shade(h, -0.35)}" stroke-width="1.5"/>
  ${crest ? `<path d="M152,44 Q154,30 166,34 Q176,30 180,42" fill="${h}" stroke="${shade(h, -0.35)}" stroke-width="1.5"/>` : ''}
  <path d="M180,52 L194,56 L180,60 Z" fill="#3a3027"/><path d="M178,50 Q182,48 184,51" fill="#f0e6dc"/>
  <circle cx="170" cy="51" r="3.6" fill="#ff8c1a"/><circle cx="170.6" cy="51" r="1.8" fill="#1a1a1a"/>
  <path d="M72,92 Q96,70 134,82 Q140,98 126,108 Q98,114 72,92 Z" fill="url(#${gw.id})" stroke="${shade(wing, -0.4)}" stroke-width="1.5"/>
  ${bars ? `<path d="M100,94 Q114,88 128,92 M96,100 Q112,96 126,100" stroke="${bars}" stroke-width="4" fill="none" stroke-linecap="round"/>` : ''}
  ${spots ? [[90, 88], [104, 84], [116, 96], [98, 100], [124, 88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${spots}"/>`).join('') : ''}
  <path d="M74,92 L60,98 L74,100" fill="${shade(wing, -0.3)}"/>
  <path d="M112,124 L110,140 M110,140 L104,142 M110,140 L116,142 M128,122 L128,140 M128,140 L122,142 M128,140 L134,142" stroke="#e86b7a" stroke-width="3" stroke-linecap="round"/>`);
}

const PIGEONS = {
  'taklaci-ankara': pigeon({ body: '#eef0f3', wing: '#c9ced6', neck: ['#e8ecef', '#cfd6dd'], bars: '#7d8692', tail: '#c9ced6' }),
  'donek-edirne': pigeon({ body: '#a0553a', wing: '#b8694a', neck: ['#8c4630', '#a65c3f'], spots: '#5b2a1a', tail: '#6b3423', belly: '#c98a6a' }),
  'posta-belcika-tipi': pigeon({ body: '#7f8fa6', wing: '#9aa8bb', neck: ['#2fa36b', '#7b4bb3'], bars: '#2b2f36', tail: '#3a404a', head: '#6f7f96' }),
  'hunkari-gosteri': pigeon({ body: '#fbfbfd', wing: '#eef0f6', neck: ['#f3f4f8', '#e6e8f0'], crest: true, fan: true, tail: '#f4f5f9', belly: '#f0f1f6' }),
  'kelebek-konya': pigeon({ body: '#f6f6f6', wing: '#262a31', neck: ['#262a31', '#3b4049'], tail: '#262a31', head: '#f6f6f6', spots: '#f6f6f6' }),
};

/* ------------------------------ KONSOLLAR ------------------------------ */
function pad(x, y, color) {
  return `<g transform="translate(${x} ${y})"><path d="M0,14 Q0,0 16,0 L44,0 Q60,0 60,14 L64,34 Q66,44 56,44 Q48,44 44,34 L16,34 Q12,44 4,44 Q-6,44 -4,34 Z" fill="${color}" stroke="${shade(color, -0.45)}" stroke-width="1.5"/>
  <path d="M12,12 L12,22 M7,17 L17,17" stroke="${shade(color, 0.6)}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="46" cy="12" r="3" fill="#e5484d"/><circle cx="52" cy="18" r="3" fill="#2f6fd6"/><circle cx="40" cy="18" r="3" fill="#3e8e5a"/><circle cx="46" cy="24" r="3" fill="#f5b700"/></g>`;
}

const CONSOLES = {
  'oynat-box-4': svg(`${shadow(120, 140, 92)}<rect x="40" y="56" width="120" height="70" rx="8" fill="#22262d" stroke="#0f1114" stroke-width="2"/><rect x="40" y="56" width="120" height="14" rx="6" fill="#2d323b"/><rect x="52" y="96" width="60" height="4" rx="2" fill="#0f1114"/><circle cx="146" cy="104" r="5" fill="#3be07a"/>${pad(150, 92, '#2a2f37')}`),
  'oynat-box-5-slim': svg(`${shadow(120, 140, 92)}<rect x="44" y="70" width="128" height="52" rx="10" fill="#eef1f5" stroke="#aab2bd" stroke-width="2"/><rect x="44" y="70" width="128" height="10" rx="6" fill="#fff"/><path d="M58,100 L118,100" stroke="#aab2bd" stroke-width="3"/><circle cx="158" cy="106" r="4" fill="#2f6fd6"/>${pad(150, 94, '#f4f6f9')}`),
  'piksel-go': svg(`${shadow(120, 140, 92)}<rect x="40" y="58" width="160" height="70" rx="20" fill="#2b2f36" stroke="#0f1114" stroke-width="2"/><path d="M60,58 L78,58 L78,128 L60,128 Q40,128 40,108 L40,78 Q40,58 60,58 Z" fill="#f07c1a"/><path d="M162,58 L180,58 Q200,58 200,78 L200,108 Q200,128 180,128 L162,128 Z" fill="#f07c1a"/><rect x="82" y="66" width="76" height="54" rx="4" fill="#0f1114"/><rect x="86" y="70" width="68" height="46" rx="2" fill="#7fd1ff"/><path d="M90,110 L104,92 L114,104 L126,88 L150,112 Z" fill="#3e8e5a"/><circle cx="140" cy="80" r="6" fill="#ffe08a"/><circle cx="61" cy="80" r="6" fill="#2b2f36"/><circle cx="179" cy="104" r="6" fill="#2b2f36"/>`),
  'piksel-station': svg(`${shadow(120, 140, 92)}<path d="M38,120 L46,62 Q48,54 58,54 L150,54 Q160,54 162,62 L170,120 Z" fill="#1d2026" stroke="#0b0c0f" stroke-width="2"/><path d="M60,60 L150,60" stroke="#2f6fd6" stroke-width="3" opacity=".9"/><path d="M54,112 L156,112" stroke="#2f6fd6" stroke-width="2" opacity=".6"/>${pad(148, 94, '#22262d')}`),
  'tusla-mini': svg(`${shadow(120, 140, 92)}<rect x="40" y="76" width="104" height="48" rx="14" fill="#2f3a48" stroke="#141a22" stroke-width="2"/><circle cx="66" cy="100" r="12" fill="#1d242e"/><circle cx="66" cy="100" r="6" fill="#5ccfb0"/><rect x="88" y="94" width="40" height="5" rx="2.5" fill="#5ccfb0" opacity=".8"/><rect x="88" y="104" width="26" height="5" rx="2.5" fill="#1d242e"/>${pad(150, 92, '#2f3a48')}`),
};

/* ------------------------------ TELEFONLAR ------------------------------ */
function phone({ color, w = 62, h = 118, cams = 2, bump = 'square', accent = null }) {
  const g = grad(color, 'h');
  const x = 120 - w / 2;
  const y = 136 - h;
  const camsSvg = bump === 'square'
    ? `<rect x="${x + 8}" y="${y + 8}" width="${cams > 2 ? 30 : 22}" height="${cams > 1 ? 30 : 18}" rx="7" fill="${shade(color, -0.25)}" stroke="${shade(color, -0.5)}"/>
       ${Array.from({ length: cams }, (_, i) => `<circle cx="${x + 15 + (i % 2) * 13}" cy="${y + 15 + Math.floor(i / 2) * 14 + (cams === 2 ? i * 0 : 0)}" r="5" fill="#0f1114" stroke="#5b6470" stroke-width="1.5"/>`).join('')}`
    : `<rect x="${x + 10}" y="${y + 8}" width="10" height="${cams * 13}" rx="5" fill="${shade(color, -0.3)}"/>${Array.from({ length: cams }, (_, i) => `<circle cx="${x + 15}" cy="${y + 14 + i * 12}" r="4" fill="#0f1114"/>`).join('')}`;
  return svg(`<defs>${g.def}</defs>${shadow(120, 140, 50)}
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="url(#${g.id})" stroke="${shade(color, -0.5)}" stroke-width="2"/>
  <rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="10" fill="none" stroke="#fff" stroke-opacity=".18"/>
  ${camsSvg}
  ${accent ? `<circle cx="${120}" cy="${y + h / 2 + 8}" r="8" fill="none" stroke="${accent}" stroke-width="2" opacity=".7"/>` : `<rect x="${118}" y="${y + h / 2}" width="4" height="12" rx="2" fill="${shade(color, -0.3)}" opacity=".6"/>`}
  <rect x="${x + w}" y="${y + 26}" width="3" height="18" rx="1.5" fill="${shade(color, -0.4)}"/>`);
}

const PHONES = {
  'piril-p12': phone({ color: '#4c6ef5' }),
  'piril-p14-pro': phone({ color: '#5a5f6b', cams: 3, accent: '#d7dde5' }),
  'nokta-mini-5': phone({ color: '#ff7aa8', w: 54, h: 100, cams: 1 }),
  'nokta-max': phone({ color: '#1f2329', w: 70, h: 126, cams: 4, accent: '#f5b700' }),
  'ekran-lite': phone({ color: '#5ccfb0', cams: 2, bump: 'pill' }),
};

/* ------------------------------ YAZ ------------------------------ */
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
