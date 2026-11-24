import { TALENTS, TRAITS, XP, gainXp, initialTalents, learnTalent, levelFor, talentRank, xpForLevel } from '../../src/game/talents';
import { gameReducer, type GameView } from '../../src/game/reducer';
import { newGame } from '../../src/game/newGame';
import { adjustListing } from '../../src/game/expertise';
import { inspectionCost } from '../../src/game/negotiation';
import { repairCost } from '../../src/game/prep';
import { buyerValue, generateOffers } from '../../src/game/selling';
import { createRng } from '../../src/game/rng';
import { loadGame, SAVE_KEY } from '../../src/game/save';
import type { GameState } from '../../src/game/types';
import { makeItem, makeListing, makeState } from '../helpers';

const withRank = (id: keyof GameState['talents']['ranks'], rank: number, over: Partial<GameState> = {}) =>
  makeState({ talents: { ...initialTalents(), ranks: { ...initialTalents().ranks, [id]: rank } }, ...over });
const view = (over: Partial<GameState> = {}): GameView => ({ state: makeState(over), message: null, lastOffer: null });

test('dört yetenek ve beş kişilik var', () => {
  expect(Object.keys(TALENTS)).toEqual(['pazarlik', 'goz', 'tamir', 'karizma']);
  expect(Object.keys(TRAITS)).toEqual(['hesapli', 'dikkatli', 'tamirci', 'girisken', 'caliskan']);
});

test('tecrübe biriktikçe seviye atlanır, her seviye bir puan verir', () => {
  expect(levelFor(0)).toBe(1);
  expect(levelFor(xpForLevel(2))).toBe(2);
  expect(xpForLevel(3)).toBeGreaterThan(xpForLevel(2));
  const s = gainXp(makeState(), xpForLevel(3));
  expect(s.talents).toMatchObject({ level: 3, points: 2 });
  expect(s.summary.notes.some((n) => n.includes('Seviye 3'))).toBe(true);
});

test('çalışkan kişilik %25 fazla tecrübe kazanır', () => {
  const s = gainXp(makeState({ player: { ...makeState().player, trait: 'caliskan' } }), 100);
  expect(s.talents.xp).toBe(125);
});

test('puanla yetenek geliştirilir, en çok 3', () => {
  const s = { ...makeState(), talents: { ...initialTalents(), points: 5 } };
  let t = learnTalent(s, 'pazarlik')!;
  expect(talentRank(t, 'pazarlik')).toBe(1);
  expect(t.talents.points).toBe(4);
  t = learnTalent(learnTalent(t, 'pazarlik')!, 'pazarlik')!;
  expect(learnTalent(t, 'pazarlik')).toBeNull();
  expect(learnTalent(makeState(), 'goz')).toBeNull();
});

test('kişilik başlangıçta bir yeteneği 1 yapar', () => {
  expect(newGame(1, { player: { ...makeState().player, trait: 'tamirci' } }).talents.ranks.tamir).toBe(1);
  expect(newGame(1, { player: { ...makeState().player, trait: 'caliskan' } }).talents.ranks).toEqual(initialTalents().ranks);
});

test('yetenek etkileri: pazarlık, göz, tamir, karizma', () => {
  const l = makeListing({ minPrice: 1000, askPrice: 2000 });
  expect(adjustListing(l, { talents: withRank('pazarlik', 2).talents }).minPrice).toBe(940);
  const l2 = makeListing({ item: makeItem({ baseValue: 100000 }) });
  expect(inspectionCost(l2, 2, 'ilkbahar', 2)).toBeLessThan(inspectionCost(l2, 2, 'ilkbahar', 0));
  const d = { id: 'd', name: 'x', repairCost: 1000, valueHit: 0.1, known: true };
  expect(repairCost(d, withRank('tamir', 3))).toBeLessThan(repairCost(d, makeState()));
  const it = makeItem();
  const sale = { itemId: it.id, price: buyerValue(it, true, makeState()), disclosed: true };
  const sum = (s: GameState) => generateOffers(s, createRng(3)).reduce((a, o) => a + o.amount, 0);
  expect(sum(withRank('karizma', 3, { inventory: [it], forSale: [sale] }))).toBeGreaterThan(sum(makeState({ inventory: [it], forSale: [sale] })));
});

test('alım, satış ve tamir tecrübe verir; reducer yetenek öğretir', () => {
  const l = makeListing({ minPrice: 1000, askPrice: 1500 });
  const bought = gameReducer(view({ listings: [l] }), { type: 'offer', listingId: l.id, amount: 1200 }).state;
  expect(bought.talents.xp).toBe(XP.buy);
  const it = bought.inventory[0];
  const sold = gameReducer(view({ ...bought, phase: 'evening', offers: [{ id: 'o', itemId: it.id, amount: 2000, buyerName: 'A' }] }), { type: 'acceptOffer', offerId: 'o' }).state;
  expect(sold.talents.xp).toBe(XP.buy + XP.sale);
  const learned = gameReducer(view({ talents: { ...initialTalents(), points: 1 } }), { type: 'learnTalent', id: 'goz' }).state;
  expect(learned.talents.ranks.goz).toBe(1);
});

test('eski kayda yetenekler eklenir; geçmiş satışlar tecrübe sayılır', () => {
  const old = makeState({ stats: { ...makeState().stats, sales: 10 } }) as unknown as Record<string, unknown>;
  delete old.talents;
  localStorage.setItem(SAVE_KEY, JSON.stringify(old));
  const r = loadGame(localStorage);
  if (r.kind !== 'ok') throw new Error();
  expect(r.state.talents.xp).toBe(10 * XP.sale);
  expect(r.state.talents.points).toBe(r.state.talents.level - 1);
});
