import type { Category, Defect, Item, SpecialKind, Stage, Tag } from './types';
import type { RNG } from './rng';
import { round10 } from './pricing';

/** Her türün açıldığı yaş ve aşama (motor ehliyetle 16, araba 18, iş makinesi holdingde). */
export const CATEGORY_OPEN: Record<Category, { age: number; stage: Stage }> = {
  bisiklet: { age: 12, stage: 1 }, guvercin: { age: 12, stage: 1 }, kaykay: { age: 12, stage: 1 }, kart: { age: 12, stage: 1 },
  kus: { age: 12, stage: 1 }, balik: { age: 12, stage: 1 },
  telefon: { age: 13, stage: 1 }, scooter: { age: 13, stage: 1 }, kulaklik: { age: 13, stage: 1 },
  konsol: { age: 14, stage: 1 }, kopek: { age: 14, stage: 1 },
  escooter: { age: 15, stage: 1 }, bilgisayar: { age: 15, stage: 1 }, kamera: { age: 15, stage: 1 }, gitar: { age: 15, stage: 1 },
  motor: { age: 16, stage: 2 },
  araba: { age: 18, stage: 3 }, karavan: { age: 18, stage: 3 }, tekne: { age: 18, stage: 3 },
  ismakinesi: { age: 22, stage: 4 },
};
/** Aşama büyüdükçe ucuz türler ilanlardan çekilir: türün en yüksek değeri bu tabandan küçükse çıkmaz. */
const STAGE_FLOOR: Record<Stage, number> = { 1: 0, 2: 5000, 3: 20000, 4: 100000 };
/** Aşamanın asıl işi: ilanların çoğu bu türlerden gelir. */
export const MAIN_CATEGORIES: Record<Stage, Category[]> = { 1: [], 2: ['motor'], 3: ['araba'], 4: ['araba', 'ismakinesi'] };
/** Bir aşamanın ilk (en küçük) yaşı. */
export const STAGE_START_AGE: Record<Stage, number> = { 1: 12, 2: 16, 3: 18, 4: 22 };

/** Oyuncunun yaşına ve aşamasına göre ilanlarda çıkabilecek türler. */
export function categoriesFor(s: { stage: Stage; age?: number }): Category[] {
  const age = Math.max(s.age ?? 0, STAGE_START_AGE[s.stage]);
  return (Object.keys(CATEGORY_OPEN) as Category[]).filter(
    (c) => CATEGORY_OPEN[c].age <= age && CATEGORY_OPEN[c].stage <= s.stage && CATALOG[c].max >= STAGE_FLOOR[s.stage],
  );
}

/** İlan için tür seçer: asıl türler ağırlıklı, gerisi yaşa uygun havuzdan. */
export function pickCategory(s: { stage: Stage; age?: number }, rng: RNG): Category {
  const pool = categoriesFor(s);
  const main = MAIN_CATEGORIES[s.stage].filter((c) => pool.includes(c));
  return main.length > 0 && rng.chance(0.6) ? rng.pick(main) : rng.pick(pool);
}

export const CATEGORY_LABEL: Record<Category, string> = {
  bisiklet: 'Bisiklet',
  guvercin: 'Güvercin',
  konsol: 'Oyun konsolu',
  telefon: 'Telefon',
  motor: 'Motor',
  araba: 'Araba',
  kaykay: 'Kaykay',
  scooter: 'Scooter',
  kulaklik: 'Kulaklık',
  kart: 'Koleksiyon kartı',
  kus: 'Kuş',
  balik: 'Akvaryum balığı',
  kopek: 'Köpek',
  escooter: 'Elektrikli scooter',
  bilgisayar: 'Bilgisayar',
  kamera: 'Fotoğraf makinesi',
  gitar: 'Gitar',
  karavan: 'Karavan',
  tekne: 'Tekne',
  ismakinesi: 'İş makinesi',
};

interface Template {
  min: number;
  max: number;
  models: [brand: string, model: string][];
  defects: [name: string, valueHit: number, repairShare: number][];
}

/** Tüm markalar hayalidir. */
export const CATALOG: Record<Category, Template> = {
  bisiklet: {
    min: 500, max: 8000,
    models: [['Serçe', 'Şehir 26'], ['Serçe', 'Dağ Pro'], ['Kanat', 'BMX'], ['Kanat', 'Katlanır'], ['Rüzgârgülü', 'Yarış 28']],
    defects: [['Zincir paslı', 0.12, 0.06], ['Fren tutmuyor', 0.2, 0.1], ['Lastik patlak', 0.1, 0.05], ['Jant eğri', 0.25, 0.15]],
  },
  guvercin: {
    min: 300, max: 6000,
    models: [['Taklacı', 'Ankara'], ['Dönek', 'Edirne'], ['Posta', 'Belçika tipi'], ['Hünkâri', 'Gösteri'], ['Kelebek', 'Konya']],
    defects: [['Hasta', 0.35, 0.15], ['Tüy dökümü', 0.15, 0.08]],
  },
  konsol: {
    min: 2000, max: 20000,
    models: [['Oynat', 'Box 4'], ['Oynat', 'Box 5 Slim'], ['Piksel', 'Go'], ['Piksel', 'Station'], ['Tuşla', 'Mini']],
    defects: [['Kol arızalı', 0.15, 0.08], ['Fan sesli', 0.12, 0.06], ['Disk okumuyor', 0.3, 0.18]],
  },
  telefon: {
    min: 1500, max: 25000,
    models: [['Pırıl', 'P12'], ['Pırıl', 'P14 Pro'], ['Nokta', 'Mini 5'], ['Nokta', 'Max'], ['Ekran', 'Lite']],
    defects: [['Ekran çizik', 0.15, 0.08], ['Pil şişmiş', 0.25, 0.1], ['Kamera bulanık', 0.18, 0.12]],
  },
  motor: {
    min: 30000, max: 400000,
    models: [['Kartal', 'K125'], ['Kartal', 'Sport 250'], ['Yıldırım', 'Scooter 150'], ['Yıldırım', 'Tour 650'], ['Bozkır', 'Enduro 300']],
    defects: [['Debriyaj kaçırıyor', 0.18, 0.08], ['Karbüratör ayarsız', 0.12, 0.05], ['Zincir dişli bitik', 0.15, 0.07], ['Motor yağ kaçırıyor', 0.3, 0.18]],
  },
  araba: {
    min: 250000, max: 5000000,
    models: [['Doruk', 'Sedan 1.6'], ['Doruk', 'Hatchback'], ['Tunca', 'Arazi 4x4'], ['Tunca', 'Station'], ['Akdağ', 'Roadster'], ['Marmara', 'GT Coupe']],
    defects: [['Şanzıman vuruntulu', 0.3, 0.15], ['Motor yağ yakıyor', 0.35, 0.2], ['Triger zamanı gelmiş', 0.12, 0.05], ['Boya değişen', 0.15, 0.08]],
  },
  kaykay: {
    min: 300, max: 4000,
    models: [['Dalga', 'Street 31'], ['Dalga', 'Pro 8']],
    defects: [['Rulman sesli', 0.12, 0.06], ['Tabla çatlak', 0.3, 0.15], ['Teker aşınmış', 0.1, 0.05]],
  },
  scooter: {
    min: 200, max: 3000,
    models: [['Çekirge', 'Mini'], ['Çekirge', 'Trick']],
    defects: [['Teker aşınmış', 0.12, 0.06], ['Fren gevşek', 0.15, 0.07], ['Katlama kilidi bozuk', 0.2, 0.1]],
  },
  kulaklik: {
    min: 300, max: 6000,
    models: [['Sessiz', 'Pro'], ['Sessiz', 'Bas']],
    defects: [['Tek taraf çalmıyor', 0.3, 0.12], ['Kulak süngeri yırtık', 0.1, 0.04], ['Kablo temassız', 0.18, 0.06]],
  },
  kart: {
    min: 100, max: 5000,
    models: [['Efsane', 'Futbol Seti'], ['Ejder', 'Birinci Seri']],
    defects: [['Köşeleri yıpranmış', 0.2, 0.05], ['Eksik kart', 0.3, 0.15]],
  },
  kus: {
    min: 150, max: 2500,
    models: [['Muhabbet', 'Yeşil'], ['Kanarya', 'Sarı']],
    defects: [['Hasta', 0.35, 0.15], ['Tüy dökümü', 0.15, 0.08]],
  },
  balik: {
    min: 100, max: 1500,
    models: [['Japon', 'Balığı'], ['Lepistes', 'Çift']],
    defects: [['Hasta', 0.35, 0.15], ['Akvaryum filtresi bozuk', 0.15, 0.08]],
  },
  kopek: {
    min: 1000, max: 30000,
    models: [['Kangal', 'Sivas'], ['Golden', 'Retriever'], ['Karabaş', 'Melez']],
    defects: [['Aşısı eksik', 0.25, 0.08], ['Pire var', 0.12, 0.04], ['Hasta', 0.35, 0.15]],
  },
  escooter: {
    min: 3000, max: 25000,
    models: [['Volt', 'S1'], ['Volt', 'Max']],
    defects: [['Batarya zayıf', 0.3, 0.15], ['Fren balatası bitik', 0.12, 0.05], ['Lastik patlak', 0.1, 0.04]],
  },
  bilgisayar: {
    min: 5000, max: 60000,
    models: [['Çip', 'Oyun Kasası'], ['Çip', 'Ekran Kartı']],
    defects: [['Fan sesli', 0.12, 0.05], ['Ekran kartı ısınıyor', 0.3, 0.18], ['Anakart arızalı', 0.4, 0.25]],
  },
  kamera: {
    min: 4000, max: 50000,
    models: [['Objektif', 'Z50'], ['Objektif', 'Aksiyon']],
    defects: [['Objektif çizik', 0.25, 0.15], ['Pil kapağı kırık', 0.08, 0.03], ['Sensör tozlu', 0.15, 0.06]],
  },
  gitar: {
    min: 1500, max: 30000,
    models: [['Tel', 'Klasik'], ['Tel', 'Elektro']],
    defects: [['Teller paslı', 0.1, 0.03], ['Sap eğri', 0.3, 0.15], ['Akort burgusu kırık', 0.12, 0.05]],
  },
  karavan: {
    min: 200000, max: 2000000,
    models: [['Yayla', 'Çekme 4'], ['Yayla', 'Motokaravan']],
    defects: [['Tavan su alıyor', 0.25, 0.12], ['Akü bitik', 0.1, 0.04], ['Lastikler eskimiş', 0.12, 0.06]],
  },
  tekne: {
    min: 300000, max: 4000000,
    models: [['Martı', 'Balıkçı 6'], ['Martı', 'Sürat 7']],
    defects: [['Motor yağ kaçırıyor', 0.3, 0.18], ['Gövde boyası kalkmış', 0.15, 0.08], ['Pervane eğri', 0.15, 0.07]],
  },
  ismakinesi: {
    min: 2000000, max: 15000000,
    models: [['Toprak', 'Kepçe'], ['Toprak', 'Ekskavatör']],
    defects: [['Hidrolik kaçağı', 0.3, 0.15], ['Palet aşınmış', 0.2, 0.1], ['Motor yağ yakıyor', 0.35, 0.2]],
  },
};

const MODEL_TAGS: Record<string, Tag> = { 'Arazi 4x4': '4x4', Roadster: 'cabrio' };

function makeDefect(t: Template, baseValue: number, rng: RNG, taken: Defect[]): Defect | null {
  const free = t.defects.filter(([n]) => !taken.some((d) => d.name === n));
  if (free.length === 0) return null;
  const [name, valueHit, repairShare] = rng.pick(free);
  return { id: rng.id('d'), name, valueHit, repairCost: round10(baseValue * repairShare), known: rng.chance(0.5) };
}

export function generateItem(category: Category, rng: RNG, opts: { special?: SpecialKind; scale?: number } = {}): Item {
  const t = CATALOG[category];
  let [brand, model] = rng.pick(t.models);
  const tags = new Set<Tag>();
  if (category === 'araba') {
    if (MODEL_TAGS[model]) tags.add(MODEL_TAGS[model]);
    else if (rng.chance(0.15)) tags.add('4x4');
    else if (rng.chance(0.1)) tags.add('cabrio');
    if (rng.chance(0.05)) tags.add('klasik');
  } else if (rng.chance(0.04)) {
    tags.add('nadir');
  }
  let baseValue = round10(rng.range(t.min, t.max) * (opts.scale ?? 1));
  let condition = rng.int(30, 90);
  let defectCount = rng.int(0, 2);
  if (opts.special === 'hurdalik') {
    condition = rng.int(10, 30);
    defectCount = rng.int(2, 3);
  }
  if (opts.special === 'klasik') {
    tags.add('klasik');
    baseValue = round10(baseValue * 1.5);
    if (category === 'araba') [brand, model] = rng.pick([['Doruk', 'Klasik 1972'], ['Marmara', 'Klasik Coupe 1968']] as const);
  }
  const defects: Defect[] = [];
  for (let i = 0; i < defectCount; i++) {
    const d = makeDefect(t, baseValue, rng, defects);
    if (d) defects.push(d);
  }
  return {
    id: rng.id('it'), category, brand, model, baseValue, condition, defects, tags: [...tags],
    cleaned: false, painted: false, careCount: 0, caredToday: false, boughtFor: 0,
  };
}

/** Kurnaz satıcı: eşyaya gizli bir kusur ekler (yoksa yerine en ağırını gizler). */
export function addHiddenDefect(item: Item, rng: RNG): Item {
  if (item.defects.some((d) => !d.known)) return item;
  const d = makeDefect(CATALOG[item.category], item.baseValue, rng, item.defects);
  if (d) return { ...item, defects: [...item.defects, { ...d, known: false }] };
  return { ...item, defects: item.defects.map((x, i) => (i === 0 ? { ...x, known: false } : x)) };
}
