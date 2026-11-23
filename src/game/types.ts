export type Stage = 1 | 2 | 3 | 4;
export type Season = 'ilkbahar' | 'yaz' | 'sonbahar' | 'kis';
export type Category = 'bisiklet' | 'guvercin' | 'konsol' | 'telefon' | 'motor' | 'araba';
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
export interface Loan { principal: number; dailyRate: number }
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
}
