import type { Category, Defect, Item, SpecialKind, Stage, Tag } from './types';
import type { RNG } from './rng';
import { round10 } from './pricing';

export const CATEGORIES_BY_STAGE: Record<Stage, Category[]> = {
  1: ['bisiklet', 'guvercin', 'konsol', 'telefon'],
  2: ['motor'],
  3: ['araba'],
};

export const CATEGORY_LABEL: Record<Category, string> = {
  bisiklet: 'Bisiklet',
  guvercin: 'Güvercin',
  konsol: 'Oyun konsolu',
  telefon: 'Telefon',
  motor: 'Motor',
  araba: 'Araba',
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
};

const MODEL_TAGS: Record<string, Tag> = { 'Arazi 4x4': '4x4', Roadster: 'cabrio' };

function makeDefect(t: Template, baseValue: number, rng: RNG, taken: Defect[]): Defect | null {
  const free = t.defects.filter(([n]) => !taken.some((d) => d.name === n));
  if (free.length === 0) return null;
  const [name, valueHit, repairShare] = rng.pick(free);
  return { id: rng.id('d'), name, valueHit, repairCost: round10(baseValue * repairShare), known: rng.chance(0.5) };
}

export function generateItem(category: Category, rng: RNG, opts: { special?: SpecialKind } = {}): Item {
  const t = CATALOG[category];
  let [brand, model] = rng.pick(t.models);
  const tags = new Set<Tag>();
  if (category === 'araba') {
    if (MODEL_TAGS[model]) tags.add(MODEL_TAGS[model]);
    else if (rng.chance(0.15)) tags.add('4x4');
    else if (rng.chance(0.1)) tags.add('cabrio');
    if (rng.chance(0.05)) tags.add('klasik');
  }
  let baseValue = round10(rng.range(t.min, t.max));
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
