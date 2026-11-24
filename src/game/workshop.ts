// Kendin yap tamiri: her kusurun bir parçası, aleti ve vida sayısı var. Parça orijinal (hemen, pahalı),
// muadil ya da çıkma (ucuz, hafta sonu kargoyla) sipariş edilir, sonra takılır. Hayvanlar tedavi edilir.
import type { Defect, GameState, Item, PartSource } from './types';
import { repairCost } from './prep';
export { PAINTABLE } from './prep';
import { addLedger } from './career';
import { round10 } from './pricing';
import { XP, gainXp } from './talents';

export type RepairKind = 'mekanik' | 'elektronik' | 'hayvan';
export type ToolId =
  | 'tornavida-duz' | 'tornavida-yildiz' | 'anahtar' | 'lokma' | 'pense' | 'vantuz'
  | 'isi-tabancasi' | 'yama-kiti' | 'sprey-boya' | 'ariza-cihazi' | 'olcu-aleti' | 'tork-anahtari';
export type CareId = 'mama' | 'su' | 'yem' | 'ilac' | 'asi' | 'firca' | 'sampuan' | 'tasma';

export interface DefectInfo { kind: RepairKind; part?: string; partName: string; tool?: ToolId; screws: number; care?: CareId[] }

export const TOOL_NAME: Record<ToolId, string> = {
  'tornavida-duz': 'Düz tornavida', 'tornavida-yildiz': 'Yıldız tornavida', anahtar: 'İngiliz anahtarı', lokma: 'Lokma takımı',
  pense: 'Pense', vantuz: 'Vantuz', 'isi-tabancasi': 'Isı tabancası', 'yama-kiti': 'Yama kiti', 'sprey-boya': 'Sprey boya',
  'ariza-cihazi': 'Arıza cihazı', 'olcu-aleti': 'Ölçü aleti', 'tork-anahtari': 'Tork anahtarı',
};
export const CARE_NAME: Record<CareId, string> = {
  mama: 'Mama', su: 'Temiz su', yem: 'Yem', ilac: 'İlaç', asi: 'Aşı', firca: 'Fırça', sampuan: 'Şampuan', tasma: 'Tasma',
};

const M = (part: string, partName: string, tool: ToolId, screws: number, kind: RepairKind = 'mekanik'): DefectInfo => ({ kind, part, partName, tool, screws });
const E = (part: string, partName: string, tool: ToolId, screws: number) => M(part, partName, tool, screws, 'elektronik');
const H = (partName: string, ...care: CareId[]): DefectInfo => ({ kind: 'hayvan', partName, screws: 0, care });

/** Kusur adına göre onarım bilgisi (aynı ad farklı türlerde aynı onarımı kullanır). */
const DEFECTS: Record<string, DefectInfo> = {
  'Zincir paslı': M('zincir', 'Zincir', 'anahtar', 2),
  'Fren tutmuyor': M('fren-balatasi', 'Fren balatası', 'anahtar', 2),
  'Lastik patlak': M('ic-lastik', 'İç lastik', 'yama-kiti', 2),
  'Jant eğri': M('jant', 'Jant', 'anahtar', 4),
  'Kol arızalı': E('kol', 'Oyun kolu', 'tornavida-yildiz', 4),
  'Fan sesli': E('fan', 'Fan', 'tornavida-yildiz', 4),
  'Disk okumuyor': E('disk-okuyucu', 'Disk okuyucu', 'tornavida-yildiz', 6),
  'Ekran çizik': E('ekran', 'Ekran', 'vantuz', 2),
  'Pil şişmiş': E('batarya', 'Batarya', 'vantuz', 2),
  'Kamera bulanık': E('kamera-modulu', 'Kamera modülü', 'tornavida-yildiz', 4),
  'Debriyaj kaçırıyor': M('debriyaj', 'Debriyaj seti', 'lokma', 6),
  'Karbüratör ayarsız': M('karburator', 'Karbüratör', 'tornavida-duz', 4),
  'Zincir dişli bitik': M('zincir', 'Zincir dişli seti', 'lokma', 4),
  'Motor yağ kaçırıyor': M('conta', 'Conta', 'lokma', 6),
  'Şanzıman vuruntulu': M('sanziman', 'Şanzıman', 'lokma', 6),
  'Motor yağ yakıyor': M('conta', 'Segman ve conta', 'tork-anahtari', 6),
  'Triger zamanı gelmiş': M('triger-kayisi', 'Triger kayışı', 'lokma', 6),
  'Boya değişen': M('kaporta', 'Kaporta parçası', 'anahtar', 4),
  'Rulman sesli': M('vida', 'Rulman', 'anahtar', 4),
  'Tabla çatlak': M('vida', 'Kaykay tablası', 'tornavida-yildiz', 4),
  'Teker aşınmış': M('vida', 'Teker', 'anahtar', 2),
  'Fren gevşek': M('fren-balatasi', 'Fren pabucu', 'anahtar', 1),
  'Katlama kilidi bozuk': M('vida', 'Katlama kilidi', 'anahtar', 2),
  'Tek taraf çalmıyor': E('vida', 'Hoparlör', 'tornavida-yildiz', 2),
  'Kulak süngeri yırtık': M('vida', 'Kulak süngeri', 'pense', 0),
  'Kablo temassız': E('vida', 'Kablo', 'pense', 0),
  'Köşeleri yıpranmış': M('vida', 'Koruyucu kılıf', 'pense', 0),
  'Eksik kart': M('vida', 'Eksik kart', 'pense', 0),
  'Akvaryum filtresi bozuk': E('fan', 'Filtre motoru', 'tornavida-yildiz', 2),
  'Batarya zayıf': E('batarya', 'Batarya', 'tornavida-yildiz', 6),
  'Fren balatası bitik': M('fren-balatasi', 'Fren balatası', 'anahtar', 2),
  'Ekran kartı ısınıyor': E('fan', 'Ekran kartı fanı', 'tornavida-yildiz', 4),
  'Anakart arızalı': E('anakart', 'Anakart', 'tornavida-yildiz', 6),
  'Objektif çizik': E('lens', 'Objektif camı', 'tornavida-yildiz', 4),
  'Pil kapağı kırık': M('vida', 'Pil kapağı', 'tornavida-yildiz', 1),
  'Sensör tozlu': E('lens', 'Sensör temizleme seti', 'tornavida-yildiz', 4),
  'Teller paslı': M('gitar-teli', 'Tel seti', 'pense', 0),
  'Sap eğri': M('vida', 'Sap demiri', 'anahtar', 2),
  'Akort burgusu kırık': M('vida', 'Akort burgusu', 'tornavida-yildiz', 2),
  'Tavan su alıyor': M('conta', 'Tavan contası', 'tornavida-yildiz', 6),
  'Akü bitik': E('aku', 'Akü', 'anahtar', 2),
  'Lastikler eskimiş': M('jant', 'Lastik takımı', 'lokma', 6),
  'Gövde boyası kalkmış': M('kaporta', 'Jelkot boya', 'anahtar', 0),
  'Pervane eğri': M('jant', 'Pervane', 'lokma', 4),
  'Hidrolik kaçağı': M('conta', 'Hidrolik hortumu', 'anahtar', 6),
  'Palet aşınmış': M('zincir', 'Palet', 'lokma', 6),
  Hasta: H('Tedavi', 'ilac', 'su'),
  'Tüy dökümü': H('Bakım', 'yem', 'firca'),
  'Aşısı eksik': H('Aşı', 'asi'),
  'Pire var': H('Pire banyosu', 'sampuan', 'firca'),
};
const FALLBACK: DefectInfo = M('vida', 'Yedek parça', 'tornavida-yildiz', 4);

export function defectInfo(name: string): DefectInfo {
  return DEFECTS[name] ?? FALLBACK;
}

/** Parça kaynağı: fiyat payı (ustanın fiyatına göre) ve kaç haftada geldiği. */
export const SOURCES: Record<PartSource, { label: string; share: number; weeks: number; text: string; wear: number }> = {
  orijinal: { label: 'Orijinal', share: 0.7, weeks: 0, text: 'Sanayiden, hemen', wear: 0 },
  muadil: { label: 'Muadil', share: 0.45, weeks: 1, text: 'İnternetten, gelecek ay kargoyla', wear: 2 },
  cikma: { label: 'Çıkma', share: 0.3, weeks: 1, text: 'Hurdacıdan, gelecek ay kargoyla; durumu belirsiz', wear: 6 },
};

export type WorkshopBlock = 'yetersiz-para' | 'zaten-var' | 'parca-yolda' | 'parca-yok' | null;

export function partPrice(defect: Defect, s: GameState, source: PartSource): number {
  return round10(repairCost(defect, s) * SOURCES[source].share);
}

const knownDefect = (s: GameState, itemId: string, defectId: string) => {
  const item = s.inventory.find((i) => i.id === itemId);
  const defect = item?.defects.find((d) => d.id === defectId && d.known);
  return item && defect ? { item, defect } : null;
};

export function orderPart(s: GameState, itemId: string, defectId: string, source: PartSource): GameState | WorkshopBlock {
  const found = knownDefect(s, itemId, defectId);
  if (!found || defectInfo(found.defect.name).kind === 'hayvan') return null;
  if (s.parts.some((p) => p.itemId === itemId && p.defectId === defectId)) return 'zaten-var';
  const price = partPrice(found.defect, s, source);
  if (s.money < price) return 'yetersiz-para';
  return {
    ...s, money: s.money - price,
    parts: [...s.parts, { itemId, defectId, source, arrives: s.day + SOURCES[source].weeks }],
    summary: { ...s.summary, spent: s.summary.spent + price },
  };
}

/** İşçilik kalitesi (0–1): iyi iş durumu artırır, kötü iş düşürür. */
function fixed(item: Item, defectId: string, quality: number, wear = 0): Item {
  const q = Math.max(0, Math.min(1, quality));
  const delta = q >= 0.67 ? 3 : q >= 0.34 ? 0 : -5;
  return { ...item, defects: item.defects.filter((d) => d.id !== defectId), condition: Math.max(0, Math.min(100, item.condition + delta - wear)) };
}

export function installPart(s: GameState, itemId: string, defectId: string, quality: number): GameState | WorkshopBlock {
  const order = s.parts.find((p) => p.itemId === itemId && p.defectId === defectId);
  const found = knownDefect(s, itemId, defectId);
  if (!order || !found) return 'parca-yok';
  if (order.arrives > s.day) return 'parca-yolda';
  const item = fixed(found.item, defectId, quality, SOURCES[order.source].wear);
  return gainXp({
    ...s, inventory: s.inventory.map((i) => (i.id === itemId ? item : i)),
    parts: s.parts.filter((p) => p !== order),
  }, XP.repair);
}

/** Hayvanı kendin tedavi etmek veterinerin yarı fiyatı. */
export function treatCost(defect: Defect, s: GameState): number {
  return round10(repairCost(defect, s) * 0.5);
}

export function treat(s: GameState, itemId: string, defectId: string, quality: number): GameState | WorkshopBlock {
  const found = knownDefect(s, itemId, defectId);
  if (!found || defectInfo(found.defect.name).kind !== 'hayvan') return null;
  const cost = treatCost(found.defect, s);
  if (s.money < cost) return 'yetersiz-para';
  return gainXp({
    ...s, money: s.money - cost,
    inventory: s.inventory.map((i) => (i.id === itemId ? fixed(found.item, defectId, quality) : i)),
    summary: { ...s.summary, spent: s.summary.spent + cost },
  }, XP.repair);
}

/** Bekleyen siparişlerden eşyası artık olmayanları düşürür. */
export function dropOrphanParts(s: GameState): GameState {
  const parts = s.parts.filter((p) => s.inventory.some((i) => i.id === p.itemId));
  return parts.length === s.parts.length ? s : { ...s, parts };
}

/** Parça parça satılabilen türler (hayvan ve kart hariç). */
const SCRAPPABLE: Item['category'][] = ['bisiklet', 'telefon', 'konsol', 'motor', 'araba', 'escooter', 'bilgisayar', 'kamera', 'karavan', 'tekne', 'ismakinesi'];

/** Hurdacıya parça parça satış: değerin yarısı; durumu ve kusuru ne olursa olsun. */
export function scrapValue(item: Item): number {
  return SCRAPPABLE.includes(item.category) ? round10(item.baseValue * 0.5) : 0;
}

export function scrap(s: GameState, itemId: string): GameState | WorkshopBlock {
  const item = s.inventory.find((i) => i.id === itemId);
  const value = item ? scrapValue(item) : 0;
  if (!item || value === 0) return null;
  return gainXp({
    ...s, money: s.money + value,
    inventory: s.inventory.filter((i) => i.id !== itemId), forSale: s.forSale.filter((f) => f.itemId !== itemId),
    offers: s.offers.filter((o) => o.itemId !== itemId), parts: s.parts.filter((p) => p.itemId !== itemId),
    ledger: addLedger(s.ledger, { day: s.day, kind: 'sat', name: `${item.brand} ${item.model} (parça parça)`, category: item.category, price: value, profit: value - item.boughtFor }),
    summary: { ...s.summary, earned: s.summary.earned + value },
  }, XP.repair);
}
