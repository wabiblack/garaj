// Gerçek hayat ayrıntıları: araç yaşı/kilometresi, sahiplik masrafları, dönemsel talep, riskli ilanlar.
import type { Category, GameState, Item, Listing } from './types';
import type { RNG } from './rng';
import { weekOfYear } from './calendar';
import { formatTL } from './format';
import { round10 } from './pricing';

/** Sigorta, vergi ve muayenesi olan araçlar. */
export const VEHICLES: Category[] = ['motor', 'araba', 'karavan', 'tekne', 'ismakinesi'];
/** Kilometresi olan (ya da çalışma saati tutulan) türler. */
const METERED: Category[] = [...VEHICLES, 'escooter'];
/** Çalışma saatiyle ölçülenler. */
export const HOURS: Category[] = ['tekne', 'ismakinesi'];
/** Haftalık sigorta + vergi + muayene payı (değerin yılda ~%8'i). */
const OWNERSHIP_RATE = 0.0015;

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

/** Hafta başında elde tutulan araçların masrafı ödenir (para eksiye düşmez). */
export function settleVehicles(s: GameState): GameState {
  const total = s.inventory.reduce((sum, i) => sum + ownershipCost(i), 0);
  if (total === 0) return s;
  const paid = Math.min(s.money, total);
  const notes = [...s.summary.notes, `Araç masrafları (sigorta, vergi, muayene): ${formatTL(paid)}`];
  return { ...s, money: s.money - paid, summary: { ...s.summary, notes, spent: s.summary.spent + paid } };
}

const SCHOOL_OPEN = [35, 36, 37];
const SCHOOL_GOODS: Category[] = ['bisiklet', 'telefon', 'kulaklik', 'bilgisayar', 'kaykay', 'scooter'];
/** Bayram haftaları (yaklaşık; her yıl aynı haftada sayılır). */
const BAYRAM = [14, 24];

/** Haftanın o türe kattığı fazladan alıcı ve haftanın notu. */
export function demand(s: Pick<GameState, 'day'>, category: Category): { buyers: number; note: string | null } {
  const w = weekOfYear(s.day);
  if (BAYRAM.includes(w)) return { buyers: 1, note: 'Bayram haftası: herkes alışverişte, alıcılar kalabalık' };
  if (SCHOOL_OPEN.includes(w) && SCHOOL_GOODS.includes(category)) return { buyers: 1, note: 'Okullar açılıyor: bisiklet, telefon ve kulaklık aranıyor' };
  return { buyers: 0, note: null };
}

/** Haftanın başında düşülecek dönem notu. */
export function weekNote(day: number): string | null {
  const w = weekOfYear(day);
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

/** Hafta başında: çalıntı mala polis el koyabilir. */
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
