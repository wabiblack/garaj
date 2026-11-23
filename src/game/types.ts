export type Stage = 1 | 2 | 3;
export type Season = 'ilkbahar' | 'yaz' | 'sonbahar' | 'kis';
export type Category = 'bisiklet' | 'guvercin' | 'konsol' | 'telefon' | 'motor' | 'araba';
export type Tag = '4x4' | 'cabrio' | 'klasik' | 'nadir';
export type Personality = 'normal' | 'acele' | 'inatci' | 'kurnaz';
export type GameEventId = 'fuar' | 'durgun' | 'firsat' | 'hediye' | 'ceza';
export type QuestKind = 'sat' | 'kategori' | 'kar' | 'temiz' | 'durust';
export type AchievementId =
  | 'ilk-satis' | 'pazarlikci' | 'durust-esnaf' | 'koleksiyoncu' | 'buyuk-vurgun'
  | 'motorcu' | 'galerici' | 'showroom' | 'borcsuz' | 'sampiyon';
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
}

export interface SaleListing { itemId: string; price: number; disclosed: boolean }
export interface BuyerOffer { id: string; itemId: string; amount: number; buyerName: string }
export interface Employees { usta: boolean; boyaci: boolean; satis: boolean }
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
  stageDay: { 2: number | null; 3: number | null };
}
export interface DaySummary { day: number; bought: number; sold: number; spent: number; earned: number; notes: string[] }

export interface GameState {
  version: 2;
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
}
