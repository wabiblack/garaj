import type { Player } from './player';

export type Stage = 1 | 2 | 3 | 4;
export type Season = 'ilkbahar' | 'yaz' | 'sonbahar' | 'kis';
export type Category =
  | 'bisiklet' | 'guvercin' | 'konsol' | 'telefon' | 'motor' | 'araba'
  | 'kaykay' | 'scooter' | 'kulaklik' | 'kart' | 'kus' | 'balik' | 'kopek'
  | 'escooter' | 'bilgisayar' | 'kamera' | 'gitar' | 'karavan' | 'tekne' | 'ismakinesi';
export type Tag = '4x4' | 'cabrio' | 'klasik' | 'nadir';
export type Personality = 'normal' | 'acele' | 'inatci' | 'kurnaz';
export type GameEventId = 'fuar' | 'durgun' | 'firsat' | 'hediye' | 'ceza';
export type QuestKind = 'sat' | 'kategori' | 'kar' | 'temiz' | 'durust';
export type AchievementId =
  | 'ilk-satis' | 'pazarlikci' | 'durust-esnaf' | 'koleksiyoncu' | 'buyuk-vurgun'
  | 'motorcu' | 'galerici' | 'showroom' | 'borcsuz' | 'sampiyon'
  | 'mezatci' | 'siparisci' | 'rakip' | 'holding';
export type StoryId =
  | 'okul' | 'kardes' | 'dede' | 'ehliyet' | 'cirak' | 'amca-borc' | 'dugun' | 'vergi' | 'cevdet-ortak' | 'roportaj';
export type SpecialKind = 'mezat' | 'hurdalik' | 'klasik';

export interface Defect { id: string; name: string; repairCost: number; valueHit: number; known: boolean }

export interface Item {
  id: string;
  category: Category;
  brand: string;
  model: string;
  baseValue: number;
  /** 0–100 */
  condition: number;
  defects: Defect[];
  tags: Tag[];
  cleaned: boolean;
  painted: boolean;
  /** Güvercin bakımı sayısı (en çok 5) */
  careCount: number;
  caredToday: boolean;
  boughtFor: number;
  /** Nadir/klasik eşyanın elde tutulduğu gün (değer artışı en çok 15 gün). */
  heldDays?: number;
  /** Araçlarda model yaşı (yıl) ve kilometre (tekne/iş makinesinde çalışma saati). */
  modelAge?: number;
  km?: number;
  /** Çalıntı mal: polis el koyabilir. */
  stolen?: boolean;
}

export interface Listing {
  id: string;
  item: Item;
  askPrice: number;
  minPrice: number;
  patience: number;
  inspected: boolean;
  special: SpecialKind | null;
  sellerName: string;
  personality: Personality;
  /** Satıcının son reddettiği teklif; aynı tutar tekrar sabır yemez. */
  lastRejected?: number;
  /** Rakip Cevdet bu ilana göz koydu: oyuncunun bir sonraki hamlesinde kapar. */
  rivalEye?: boolean;
  /** Mezatta rakiplerin çıkabileceği en yüksek fiyat (gizli). */
  auctionMax?: number;
  /** Riskli ilan: çalıntı mal ya da kapora isteyen sahte ilan. */
  risk?: 'calinti' | 'sahte';
}

/** Müşteri siparişi: belirli bir türde mal arayan alıcı, piyasa değerinin üstünü öder. */
export interface Order {
  id: string;
  buyerName: string;
  category: Category;
  tag?: Tag;
  minCondition: number;
  /** Piyasa değerine eklenen pay (0.3 = %30 fazla). */
  bonus: number;
  daysLeft: number;
}

export interface SaleListing { itemId: string; price: number; disclosed: boolean }
export interface BuyerOffer { id: string; itemId: string; amount: number; buyerName: string }
export interface Employees { usta: boolean; boyaci: boolean; satis: boolean; cirak: boolean }
/** Taksitli kredi: kalan borç, günlük taksit, kalan gün, geciken taksit sayısı. */
export interface Loan { debt: number; installment: number; daysLeft: number; late: number }
export interface Quest {
  id: string;
  kind: QuestKind;
  title: string;
  target: number;
  progress: number;
  reward: number;
  done: boolean;
  category?: Category;
}
export interface Stats {
  sales: number;
  profit: number;
  bestProfit: number;
  bestItem: string | null;
  disclosedSales: number;
  rivalTaken: number;
  /** Türe göre satış sayısı: uzmanlık bundan hesaplanır. */
  categorySales: Record<Category, number>;
  stageDay: { 2: number | null; 3: number | null; 4: number | null };
}
/** Türe göre piyasa endeksi geçmişi; son değer bugünkü (1 = normal). */
export type Market = Record<Category, number[]>;
/** Al-sat defteri satırı. */
export interface LedgerEntry { day: number; kind: 'al' | 'sat'; name: string; category: Category; price: number; profit?: number }
export type FamilyTaskKind = 'katki' | 'kardes' | 'ders' | 'duzen';
/** Anne ya da babanın verdiği görev; amount varsa para ister, yoksa gün sonunda kontrol edilir. */
export interface FamilyTask { kind: FamilyTaskKind; from: 'anne' | 'baba'; title: string; text: string; amount?: number; daysLeft: number }
export type StockId = 'lastik' | 'parca' | 'galeri' | 'lojistik';
/** Borsa: fiyat geçmişi (son değer bugünkü), sahip olunan hisse, toplam maliyet. */
export interface Stocks { prices: Record<StockId, number[]>; owned: Record<StockId, number>; cost: Record<StockId, number> }
export type TalentId = 'pazarlik' | 'goz' | 'tamir' | 'karizma';
export type TraitId = 'hesapli' | 'dikkatli' | 'tamirci' | 'girisken' | 'caliskan';
/** Karakter gelişimi: tecrübe, seviye, harcanmamış puan, yetenek seviyeleri (0–3). */
export interface Talents { xp: number; level: number; points: number; ranks: Record<TalentId, number> }
export type PartSource = 'orijinal' | 'muadil' | 'cikma';
/** Sipariş edilen yedek parça; arrives haftasında takılabilir. */
export interface PartOrder { itemId: string; defectId: string; source: PartSource; arrives: number }
/** Evcil hayvan: mutluluk 0–100, bu hafta beslendi mi. */
export interface Pet { name: string; brand?: string; model?: string; happiness: number; fed: boolean }
export interface DaySummary { day: number; bought: number; sold: number; spent: number; earned: number; notes: string[] }

export interface GameState {
  version: 3;
  rngState: number;
  day: number;
  phase: 'day' | 'evening';
  stage: Stage;
  age: number;
  money: number;
  season: Season;
  inventory: Item[];
  listings: Listing[];
  forSale: SaleListing[];
  offers: BuyerOffer[];
  /** 0–100 */
  reputation: number;
  /** 0–100 */
  skill: number;
  capacityLevel: 0 | 1 | 2 | 3;
  locationLevel: 0 | 1 | 2;
  employees: Employees;
  loan: Loan | null;
  /** Ertesi gün yakalanacak gizlenmiş kusurlu satışlar */
  /** knowing: oyuncu kusuru biliyordu (yoksa bilmeden satılmış kusur şikâyeti). */
  pendingCatch: { itemName: string; knowing?: boolean }[];
  summary: DaySummary;
  pendingTransition: Stage | null;
  won: boolean;
  wonSeen: boolean;
  event: GameEventId | null;
  quests: Quest[];
  stats: Stats;
  achievements: AchievementId[];
  orders: Order[];
  story: { seen: StoryId[]; pending: StoryId | null };
  /** Gün sonlarındaki para (en çok son 60 gün). */
  history: { day: number; money: number }[];
  /** 4. aşamada açılan şube sayısı (0–3). */
  branches: number;
  finalSeen: boolean;
  /** Zor mod: satıcılar daha sert, alıcılar daha az. */
  hard: boolean;
  /** Model başına oyuncunun son satışları (en çok 5). */
  prices: Record<string, { day: number; price: number }[]>;
  /** Oyuncunun karakteri (isim, görünüm). */
  player: Player;
  market: Market;
  /** Birikim hesabı. */
  bank: { savings: number };
  /** Aile: güven (0–100), açık görev, aileye borç ve kalan gün. */
  family: { trust: number; task: FamilyTask | null; debt: number; debtDays: number };
  stocks: Stocks;
  talents: Talents;
  /** Bu hafta kullanılan iş hakkı (okul haftalarında sınırlı). */
  used: number;
  /** Sipariş edilmiş, takılmayı bekleyen parçalar. */
  parts: PartOrder[];
  pets: { dog: Pet | null; cat: Pet | null };
  /** Son alımlar ve satışlar (en çok LEDGER_MAX). */
  ledger: LedgerEntry[];
}
