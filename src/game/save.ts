import type { GameState, Listing, Loan } from './types';
import { createRng } from './rng';
import { emptyStats, generateQuests } from './career';
import { cleanPlayer } from './player';
import { fillMarket } from './market';
import { newLoan } from './bank';
import { FAMILY_START } from './family';

export const SAVE_KEY = 'garaj.save';
export type LoadResult = { kind: 'ok'; state: GameState } | { kind: 'empty' } | { kind: 'broken' };

function looksValid(s: unknown): s is GameState {
  if (typeof s !== 'object' || s === null) return false;
  const g = s as Record<string, unknown>;
  return (
    (g.version === 1 || g.version === 2 || g.version === 3) &&
    typeof g.money === 'number' && typeof g.day === 'number' && typeof g.rngState === 'number' &&
    [1, 2, 3, 4].includes(g.stage as number) &&
    Array.isArray(g.inventory) && Array.isArray(g.listings) && Array.isArray(g.forSale) && Array.isArray(g.offers) &&
    typeof g.employees === 'object' && g.employees !== null &&
    (g.phase === 'day' || g.phase === 'evening') &&
    typeof g.summary === 'object' && g.summary !== null &&
    Array.isArray((g.summary as Record<string, unknown>).notes)
  );
}

export function loadGame(storage: Storage): LoadResult {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (raw === null) return { kind: 'empty' };
    const parsed: unknown = JSON.parse(raw);
    return looksValid(parsed) ? { kind: 'ok', state: migrate(parsed) } : { kind: 'broken' };
  } catch {
    return { kind: 'broken' };
  }
}

export function saveGame(storage: Storage, state: GameState): void {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Depolama dolu veya kapalı: oyun kayıtsız devam eder.
  }
}

/** Yedek kodu: kaydın Türkçe karakter güvenli base64 hâli. */
export function exportSave(state: GameState): string {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function importSave(code: string): GameState | null {
  try {
    const bin = atob(code.replace(/\s/g, ''));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    return looksValid(parsed) ? migrate(parsed) : null;
  } catch {
    return null;
  }
}

/** Eski kayıtları sırayla güncel sürüme taşır. */
function migrate(s: GameState): GameState {
  const v = s.version as number;
  if (v === 3) return fillV3(s);
  const v2 = v === 1 ? migrate1to2(s) : s;
  return fillV3({
    ...v2,
    version: 3,
    orders: [],
    story: { seen: [], pending: null },
    history: [],
    branches: 0,
    finalSeen: false,
    stats: { ...v2.stats, rivalTaken: v2.stats.rivalTaken ?? 0, stageDay: { ...v2.stats.stageDay, 4: v2.stats.stageDay[4] ?? null } },
  });
}

/** Sürüm 3'e sonradan eklenen alanlar (çırak, uzmanlık, zor mod, fiyat geçmişi) eski kayıtlarda yoksa doldurulur. */
function fillV3(s: GameState): GameState {
  return {
    ...s,
    employees: { ...s.employees, cirak: s.employees.cirak ?? false },
    stats: { ...s.stats, categorySales: { ...emptyStats().categorySales, ...s.stats.categorySales } },
    hard: s.hard ?? false,
    prices: s.prices ?? {},
    player: cleanPlayer(s.player),
    market: fillMarket(s.market),
    ledger: Array.isArray(s.ledger) ? s.ledger : [],
    bank: { savings: typeof s.bank?.savings === 'number' ? s.bank.savings : 0 },
    loan: migrateLoan(s.loan),
    family: s.family && typeof s.family.trust === 'number' ? s.family : FAMILY_START,
  };
}

/** Eski kredi (anapara + günlük faiz) yeni taksitli krediye çevrilir. */
function migrateLoan(loan: unknown): Loan | null {
  if (!loan || typeof loan !== 'object') return null;
  const l = loan as Partial<Loan> & { principal?: number };
  if (typeof l.debt === 'number') return l as Loan;
  return typeof l.principal === 'number' ? newLoan(l.principal) : null;
}

/** Sürüm 1 kaydını (kariyer özellikleri öncesi) sürüm 2'ye taşır. */
function migrate1to2(s: GameState): GameState {
  const base: GameState = {
    ...s,
    event: null,
    quests: [],
    stats: emptyStats(),
    achievements: [],
    listings: s.listings.map((l: Listing) => ({ ...l, personality: l.personality ?? 'normal' })),
  };
  return { ...base, quests: generateQuests(base, createRng(s.rngState)) };
}
