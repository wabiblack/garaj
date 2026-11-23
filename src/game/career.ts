import type { AchievementId, GameState, Item, Listing, Quest, QuestKind, Stage, Stats } from './types';
import type { RNG } from './rng';
import { CATEGORIES_BY_STAGE, CATEGORY_LABEL } from './catalog';
import { formatTL } from './format';
import { itemName } from './selling';

export const ACHIEVEMENTS: Record<AchievementId, { title: string; desc: string }> = {
  'ilk-satis': { title: 'İlk satış', desc: 'İlk eşyanı sattın' },
  pazarlikci: { title: 'Pazarlıkçı', desc: 'İstenen fiyatın %70’ine ya da altına aldın' },
  'durust-esnaf': { title: 'Dürüst esnaf', desc: 'Kusurunu belirterek 5 satış yaptın' },
  koleksiyoncu: { title: 'Koleksiyoncu', desc: 'Nadir ya da klasik bir parça sattın' },
  'buyuk-vurgun': { title: 'Büyük vurgun', desc: 'Tek satışta 100.000 TL kâr ettin' },
  motorcu: { title: 'Motorcu', desc: '16 yaşına geldin, motor işine girdin' },
  galerici: { title: 'Galerici', desc: 'Amcanın garajını devraldın' },
  showroom: { title: 'Showroom sahibi', desc: 'Ana caddeye taşındın' },
  borcsuz: { title: 'Borçsuz', desc: 'Banka kredisini kapattın' },
  sampiyon: { title: 'Şehrin bir numarası', desc: 'En büyük galerici oldun' },
  mezatci: { title: 'Mezatçı', desc: 'Bir mezatı kazandın' },
  siparisci: { title: 'Sözünün eri', desc: 'Bir müşteri siparişini teslim ettin' },
  rakip: { title: 'Cevdet’e geçit yok', desc: 'Cevdet’in göz koyduğu malı ondan önce aldın' },
  holding: { title: 'Holding patronu', desc: 'Üç şehirde şube açtın' },
};

export const QUEST_REWARD: Record<Stage, number> = { 1: 1000, 2: 5000, 3: 50000, 4: 200000 };
/** Model başına hatırlanan satış sayısı. */
export const PRICE_MEMORY = 5;
const PROFIT_TARGET: Record<Stage, number> = { 1: 1500, 2: 20000, 3: 200000, 4: 800000 };

export function emptyStats(): Stats {
  return { sales: 0, profit: 0, bestProfit: 0, bestItem: null, disclosedSales: 0, rivalTaken: 0, categorySales: { bisiklet: 0, guvercin: 0, konsol: 0, telefon: 0, motor: 0, araba: 0 }, stageDay: { 2: null, 3: null, 4: null } };
}

function makeQuest(kind: QuestKind, state: GameState, rng: RNG): Quest {
  const reward = QUEST_REWARD[state.stage];
  const base = { id: rng.id('q'), kind, progress: 0, reward, done: false };
  switch (kind) {
    case 'sat': {
      const n = rng.int(2, 3);
      return { ...base, target: n, title: `${n} satış yap` };
    }
    case 'kategori': {
      const category = rng.pick(CATEGORIES_BY_STAGE[state.stage]);
      return { ...base, target: 2, category, title: `2 ${CATEGORY_LABEL[category].toLocaleLowerCase('tr-TR')} sat` };
    }
    case 'kar':
      return { ...base, target: PROFIT_TARGET[state.stage], title: `Tek satışta ${formatTL(PROFIT_TARGET[state.stage])} kâr et` };
    case 'temiz':
      return { ...base, target: 2, title: '2 kusursuz satış yap' };
    case 'durust':
      return { ...base, target: 1, title: 'Kusurunu belirterek 1 satış yap' };
  }
}

/** Bitmemiş görevleri korur, listeyi 3 göreve tamamlar; aynı türden iki görev olmaz. */
export function generateQuests(state: GameState, rng: RNG, keep: Quest[] = []): Quest[] {
  const kinds: QuestKind[] = state.stage === 1 ? ['sat', 'kategori', 'kar', 'temiz', 'durust'] : ['sat', 'kar', 'temiz', 'durust'];
  const quests = [...keep];
  while (quests.length < 3) {
    const free = kinds.filter((k) => !quests.some((q) => q.kind === k));
    quests.push(makeQuest(rng.pick(free), state, rng));
  }
  return quests;
}

function unlock(state: GameState, ids: AchievementId[]): GameState {
  const add = ids.filter((id) => !state.achievements.includes(id));
  return add.length ? { ...state, achievements: [...state.achievements, ...add] } : state;
}

export function recordSale(state: GameState, item: Item, amount: number, disclosed: boolean): GameState {
  const profit = amount - item.boughtFor;
  const honest = disclosed && item.defects.some((d) => d.known);
  const stats: Stats = {
    ...state.stats,
    sales: state.stats.sales + 1,
    profit: state.stats.profit + profit,
    disclosedSales: state.stats.disclosedSales + (honest ? 1 : 0),
    categorySales: { ...state.stats.categorySales, [item.category]: (state.stats.categorySales[item.category] ?? 0) + 1 },
    ...(profit > state.stats.bestProfit ? { bestProfit: profit, bestItem: itemName(item) } : {}),
  };
  let money = state.money;
  const notes = [...state.summary.notes];
  const quests = state.quests.map((q) => {
    if (q.done) return q;
    let progress = q.progress;
    if (q.kind === 'sat') progress += 1;
    if (q.kind === 'kategori' && item.category === q.category) progress += 1;
    if (q.kind === 'kar') progress = Math.max(progress, profit);
    if (q.kind === 'temiz' && item.defects.length === 0) progress += 1;
    if (q.kind === 'durust' && honest) progress += 1;
    if (progress < q.target) return { ...q, progress };
    money += q.reward;
    notes.push(`Görev tamamlandı: ${q.title} (+${formatTL(q.reward)})`);
    return { ...q, progress: q.target, done: true };
  });
  const ids: AchievementId[] = ['ilk-satis'];
  if (item.tags.includes('nadir') || item.tags.includes('klasik')) ids.push('koleksiyoncu');
  if (profit >= 100000) ids.push('buyuk-vurgun');
  const name = itemName(item);
  const prices = { ...state.prices, [name]: [...(state.prices[name] ?? []), { day: state.day, price: amount }].slice(-PRICE_MEMORY) };
  return unlock({ ...state, money, stats, quests, prices, summary: { ...state.summary, notes } }, ids);
}

export function recordPurchase(state: GameState, listing: Listing, price: number): GameState {
  return price <= listing.askPrice * 0.7 ? unlock(state, ['pazarlikci']) : state;
}

export function unlockAchievement(state: GameState, id: AchievementId): GameState {
  return unlock(state, [id]);
}

export function checkAchievements(state: GameState): GameState {
  const ids: AchievementId[] = [];
  if (state.stats.sales > 0) ids.push('ilk-satis');
  if (state.stage >= 2) ids.push('motorcu');
  if (state.stage >= 3) ids.push('galerici');
  if (state.branches >= 3) ids.push('holding');
  if (state.locationLevel === 2) ids.push('showroom');
  if (state.won) ids.push('sampiyon');
  if (state.stats.disclosedSales >= 5) ids.push('durust-esnaf');
  let s = unlock(state, ids);
  const { stageDay } = s.stats;
  const at = (n: 2 | 3 | 4) => stageDay[n] ?? (s.stage >= n ? s.day : null);
  if (at(2) !== stageDay[2] || at(3) !== stageDay[3] || at(4) !== (stageDay[4] ?? null)) {
    s = { ...s, stats: { ...s.stats, stageDay: { 2: at(2), 3: at(3), 4: at(4) } } };
  }
  return s;
}
