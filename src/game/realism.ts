// Gerçek hayat ayrıntıları: araç yaşı/kilometresi, sahiplik masrafları, dönemsel talep, riskli ilanlar.
import type { Category, GameState, Item, Listing } from './types';
import type { RNG } from './rng';
import { monthOfYear } from './calendar';
import { formatTL } from './format';
import { round10 } from './pricing';

/** Sigorta, vergi ve muayenesi olan araçlar. */
export const VEHICLES: Category[] = ['motor', 'araba', 'karavan', 'tekne', 'ismakinesi'];
/** Kilometresi olan (ya da çalışma saati tutulan) türler. */
const METERED: Category[] = [...VEHICLES, 'escooter'];
/** Çalışma saatiyle ölçülenler. */
export const HOURS: Category[] = ['tekne', 'ismakinesi'];
/** Aylık sigorta + vergi + muayene payı (değerin yılda ~%7'si). */
const OWNERSHIP_RATE = 0.006;

/** Model yaşı ve kilometreyi belirler, değeri buna göre düşürür (klasikler düşmez). */
export function wearItem(item: Item, rng: RNG): Item {
  if (!METERED.includes(item.category)) return item;
  const classic = item.tags.includes('klasik');
  const modelAge = classic ? rng.int(40, 55) : rng.int(0, 15);
  const perYear = HOURS.includes(item.category) ? rng.int(100, 300) : item.category === 'escooter' ? rng.int(500, 2000) : rng.int(6000, 20000);
  const km = Math.round((modelAge === 0 ? rng.int(10, perYear) : modelAge * perYear) / 10) * 10;
  if (classic) return { ...item, modelAge, km };
  const limit = HOURS.includes(item.category) ? 6000 : item.category === 'escooter' ? 20000 : 400000;
  const factor = Math.max(0.35, 1 - 0.05 * modelAge) * (1 - Math.min(0.2, (km / limit) * 0.2));
  return { ...item, modelAge, km, baseValue: round10(item.baseValue * factor) };
}

export function ownershipCost(item: Item): number {
  return VEHICLES.includes(item.category) ? round10(item.baseValue * OWNERSHIP_RATE) : 0;
}

/** Ay başında elde tutulan araçların masrafı ödenir (para eksiye düşmez). */
export function settleVehicles(s: GameState): GameState {
  const total = s.inventory.reduce((sum, i) => sum + ownershipCost(i), 0);
  if (total === 0) return s;
  const paid = Math.min(s.money, total);
  const notes = [...s.summary.notes, `Araç masrafları (sigorta, vergi, muayene): ${formatTL(paid)}`];
  return { ...s, money: s.money - paid, summary: { ...s.summary, notes, spent: s.summary.spent + paid } };
}

/** Okulların açıldığı ay: eylül. */
const SCHOOL_OPEN = [9];
const SCHOOL_GOODS: Category[] = ['bisiklet', 'telefon', 'kulaklik', 'bilgisayar', 'kaykay', 'scooter'];
/** Bayram ayları (yaklaşık; her yıl aynı ayda sayılır): nisan ve temmuz. */
const BAYRAM = [4, 7];

/** Ayın o türe kattığı fazladan alıcı ve ayın notu. */
export function demand(s: Pick<GameState, 'day'>, category: Category): { buyers: number; note: string | null } {
  const w = monthOfYear(s.day);
  if (BAYRAM.includes(w)) return { buyers: 1, note: 'Bayram ayı: herkes alışverişte, alıcılar kalabalık' };
  if (SCHOOL_OPEN.includes(w) && SCHOOL_GOODS.includes(category)) return { buyers: 1, note: 'Okullar açılıyor: bisiklet, telefon ve kulaklık aranıyor' };
  return { buyers: 0, note: null };
}

/** Ayın başında düşülecek dönem notu. */
export function weekNote(day: number): string | null {
  const w = monthOfYear(day);
  if (BAYRAM.includes(w)) return demand({ day }, 'araba').note;
  if (w === SCHOOL_OPEN[0]) return demand({ day }, 'bisiklet').note;
  return null;
}

const STOLEN_CHANCE = 0.04;
const SCAM_CHANCE = 0.03;
const SUSPICIOUS = 0.6;
const SEIZE_CHANCE = 0.5;
const SEIZE_REP = 10;

/** Normal ilanın bir kısmı çalıntı ya da sahte olur; ikisi de şüpheli derecede ucuzdur. */
export function riskListing(l: Listing, rng: RNG): Listing {
  if (l.special) return l;
  const r = rng.float();
  const risk = r < STOLEN_CHANCE ? 'calinti' : r < STOLEN_CHANCE + SCAM_CHANCE ? 'sahte' : null;
  if (!risk) return l;
  const cheap = { ...l, risk, askPrice: round10(l.askPrice * SUSPICIOUS), minPrice: round10(l.minPrice * SUSPICIOUS) } as Listing;
  return risk === 'calinti' ? { ...cheap, item: { ...cheap.item, stolen: true } } : cheap;
}

/** İlana bakınca (ekspertiz/inceleme) görülen uyarı; bakılmadıysa hiçbir şey. */
export function riskOf(l: Listing): string | null {
  if (!l.inspected || !l.risk) return null;
  return l.risk === 'calinti'
    ? 'Satıcının faturası ya da belgesi yok: bu mal çalıntı olabilir.'
    : 'Satıcı ürünü göstermiyor, önce kapora istiyor: sahte ilan olabilir.';
}

/** Ay başında: çalıntı mala polis el koyabilir. */
export function settleRisks(s: GameState, rng: RNG): GameState {
  const seized = s.inventory.filter((i) => i.stolen && rng.chance(SEIZE_CHANCE));
  if (seized.length === 0) return s;
  const ids = new Set(seized.map((i) => i.id));
  const notes = [...s.summary.notes, ...seized.map((i) => `Polis çalıntı çıkan ${i.brand} ${i.model} eşyasına el koydu`)];
  return {
    ...s,
    inventory: s.inventory.filter((i) => !ids.has(i.id)),
    forSale: s.forSale.filter((f) => !ids.has(f.itemId)),
    reputation: Math.max(0, s.reputation - SEIZE_REP * seized.length),
    summary: { ...s.summary, notes },
  };
}

/** Noter devri: araç alırken fiyatın %1'i (araç değilse yok). */
export function notaryFee(item: Item, price: number): number {
  return VEHICLES.includes(item.category) ? round10(price * 0.01) : 0;
}

const CITIES = ['İzmir', 'Ankara', 'Bursa', 'Antalya', 'Eskişehir', 'Trabzon', 'Konya', 'Adana'];
const REMOTE_CHANCE = 0.35;
/** İkinci el sitesinde fiyatlar biraz daha ucuzdur (kargo bekleme bedeli). */
const REMOTE_DISCOUNT = 0.9;

/** Normal ilanın bir kısmı ikinci el sitesinden, başka şehirden gelir. Düşük puanlı satıcı daha riskli. */
export function remoteListing(l: Listing, rng: RNG): Listing {
  if (l.special || !rng.chance(REMOTE_CHANCE)) return l;
  const r = rng.float();
  const rating = r < 0.1 ? 1 : r < 0.25 ? 2 : r < 0.5 ? 3 : r < 0.8 ? 4 : 5;
  return {
    ...l, remote: { city: rng.pick(CITIES), rating },
    askPrice: round10(l.askPrice * REMOTE_DISCOUNT), minPrice: round10(l.minPrice * REMOTE_DISCOUNT),
    ...(rating <= 2 && !l.risk && rng.chance(0.3) ? { risk: 'sahte' as const } : {}),
  };
}

/** Kargodaki mal: bu ay gelmediyse hazırlanamaz ve satılamaz. */
export const inTransit = (item: Item, day: number) => item.arrives !== undefined && item.arrives > day;
