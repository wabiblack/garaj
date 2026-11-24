import { ALLOWANCE_EVERY, FAMILY_START, TRUST_GAIN, TRUST_LOSS, allowance, familyBorrow, familyLimit, familyPay, familyRepay, settleFamily } from '../../src/game/family';
import { createRng } from '../../src/game/rng';
import { gameReducer, type GameView } from '../../src/game/reducer';
import { newGame } from '../../src/game/newGame';
import { loadGame, SAVE_KEY } from '../../src/game/save';
import type { FamilyTask, GameState } from '../../src/game/types';
import { makeItem, makeState } from '../helpers';

const pay: FamilyTask = { kind: 'katki', from: 'anne', title: 'Eve katkı', text: '', amount: 200, daysLeft: 2 };
const ders: FamilyTask = { kind: 'ders', from: 'baba', title: 'Sınav haftası', text: '', daysLeft: 2 };
const duzen: FamilyTask = { kind: 'duzen', from: 'anne', title: 'Garajı topla', text: '', daysLeft: 1 };
const fam = (over: Partial<GameState['family']> = {}) => ({ ...FAMILY_START, ...over });
const ok = (x: GameState | string | null): GameState => { if (typeof x !== 'object' || x === null) throw new Error(String(x)); return x; };

test('yeni oyunda aile güveni başlangıç değerinde', () => {
  expect(newGame(3).family).toEqual(FAMILY_START);
});

test('para isteyen görev ödenince güven artar', () => {
  const s = ok(familyPay(makeState({ money: 500, family: fam({ task: pay }) })));
  expect(s.money).toBe(300);
  expect(s.family).toMatchObject({ task: null, trust: FAMILY_START.trust + TRUST_GAIN });
  expect(s.talents.xp).toBe(10);
  expect(familyPay(makeState({ money: 100, family: fam({ task: pay }) }))).toBe('yetersiz-para');
});

test('ders görevi: gün içinde en çok 1 alım yapılırsa tamamlanır', () => {
  const good = settleFamily(makeState({ family: fam({ task: ders }), summary: { day: 1, bought: 1, sold: 0, spent: 0, earned: 0, notes: [] } }), createRng(1));
  expect(good.family).toMatchObject({ task: null, trust: FAMILY_START.trust + TRUST_GAIN });
  const bad = settleFamily(makeState({ family: fam({ task: ders }), summary: { day: 1, bought: 3, sold: 0, spent: 0, earned: 0, notes: [] } }), createRng(1));
  expect(bad.family.task).toMatchObject({ daysLeft: 1 });
});

test('düzen görevi depoda en çok 1 eşya ister; süresi dolan görev güveni düşürür', () => {
  const failed = settleFamily(makeState({ inventory: [makeItem({ id: 'a' }), makeItem({ id: 'b' })], family: fam({ task: duzen }) }), createRng(1));
  expect(failed.family).toMatchObject({ task: null, trust: FAMILY_START.trust - TRUST_LOSS });
  expect(failed.summary.notes.some((n) => n.includes('Annen'))).toBe(true);
});

test('reşit olmayana haftalık harçlık güvene göre verilir', () => {
  const s = makeState({ day: ALLOWANCE_EVERY, family: fam({ trust: 100 }) });
  expect(allowance(s)).toBeGreaterThan(allowance({ ...s, family: fam({ trust: 50 }) }));
  expect(allowance({ ...s, day: ALLOWANCE_EVERY + 1 })).toBe(0);
  expect(allowance({ ...s, age: 18, stage: 3 })).toBe(0);
  const after = settleFamily(s, createRng(1));
  expect(after.money).toBe(s.money + allowance(s));
});

test('reşit olmayan aileden borç alır; reşit olan bankaya gider; güven düşükse verilmez', () => {
  const s = makeState({ family: fam({ trust: 80 }) });
  const lim = familyLimit(s);
  expect(lim).toBeGreaterThan(0);
  const b = ok(familyBorrow(s, lim));
  expect(b.money).toBe(s.money + lim);
  expect(b.family.debt).toBe(lim);
  expect(familyBorrow(b, 10)).toBe('borc-var');
  expect(familyBorrow(makeState({ family: fam({ trust: 30 }) }), 100)).toBe('guven-dusuk');
  expect(familyBorrow(makeState({ age: 18, stage: 3 }), 100)).toBe('resit');
  const r = ok(familyRepay(b));
  expect(r.family.debt).toBe(0);
  expect(r.money).toBe(s.money);
});

test('vadesi geçen aile borcu kendiliğinden alınır, ödenemezse güven düşer', () => {
  const s = settleFamily(makeState({ money: 100, family: fam({ debt: 1000, debtDays: 1 }) }), createRng(1));
  expect(s.money).toBe(0);
  expect(s.family.debt).toBe(900);
  expect(s.family.trust).toBeLessThan(FAMILY_START.trust);
});

test('reducer: aile işlemleri', () => {
  const v: GameView = { state: makeState({ money: 500, family: fam({ task: pay }) }), message: null, lastOffer: null };
  expect(gameReducer(v, { type: 'familyPay' }).state.family.task).toBeNull();
  expect(gameReducer(v, { type: 'familyBorrow', amount: 100 }).state.family.debt).toBe(100);
});

test('eski kayda aile eklenir', () => {
  const old = makeState() as unknown as Record<string, unknown>;
  delete old.family;
  localStorage.setItem(SAVE_KEY, JSON.stringify(old));
  const r = loadGame(localStorage);
  expect(r.kind === 'ok' && r.state.family).toEqual(FAMILY_START);
});
