import { CAREERS, EXAMS, chooseCareer, examFor, failExam, gradeFor, settleSchool } from '../../src/game/life';
import { notaryFee } from '../../src/game/realism';
import { checkProgress, STAGE_GOALS } from '../../src/game/progression';
import { buyerValue } from '../../src/game/selling';
import { generateListings, startNextDay } from '../../src/game/day';
import { createRng } from '../../src/game/rng';
import { gameReducer, type GameView } from '../../src/game/reducer';
import { initialTalents } from '../../src/game/talents';
import { monthOfYear } from '../../src/game/calendar';
import type { GameState } from '../../src/game/types';
import { makeItem, makeListing, makeState } from '../helpers';

const view = (over: Partial<GameState> = {}): GameView => ({ state: makeState(over), message: null, lastOffer: null });
const dayOfWeek = (m: number) => Array.from({ length: 12 }, (_, i) => i + 1).find((d) => monthOfYear(d) === m)!;

test('araç alırken noter masrafı ödenir; ekspertiz raporlu araç daha değerli satılır', () => {
  expect(notaryFee(makeItem({ category: 'araba' }), 500000)).toBe(5000);
  expect(notaryFee(makeItem(), 1000)).toBe(0);
  const car = makeItem({ category: 'araba', baseValue: 500000 });
  const l = makeListing({ item: car, minPrice: 100000, askPrice: 200000 });
  const v = gameReducer(view({ stage: 3, age: 18, money: 1e6, listings: [l] }), { type: 'offer', listingId: l.id, amount: 150000 });
  expect(v.state.money).toBe(1e6 - 150000 - notaryFee(car, 150000));
  const inspected = gameReducer(view({ stage: 3, age: 18, money: 1e6, listings: [l] }), { type: 'inspect', listingId: l.id });
  expect(inspected.state.listings[0].item.report).toBe(true);
  const s = makeState();
  expect(buyerValue({ ...car, report: true }, true, s)).toBeGreaterThan(buyerValue(car, true, s));
});

test('ehliyet sınavı: motor ve araba için ayrı sorular; geçemezsen bir ay sonra tekrar', () => {
  expect(EXAMS[2].length).toBeGreaterThanOrEqual(3);
  expect(EXAMS[3].length).toBeGreaterThanOrEqual(3);
  const q = examFor(2, 7);
  expect(q).toHaveLength(3);
  for (const x of q) expect(x.options[x.answer]).toBeTruthy();
  const ready = makeState({ age: 16, money: STAGE_GOALS[1], day: 10 });
  const failed = failExam({ ...ready, pendingTransition: 2 });
  expect(failed).toMatchObject({ pendingTransition: null, examRetry: 11 });
  expect(checkProgress(failed).pendingTransition).toBeNull();
  expect(checkProgress({ ...failed, day: 11 }).pendingTransition).toBe(2);
});

test('ikinci el sitesi: başka şehirden ilan, satıcı puanı; mal kargoyla bir hafta sonra gelir', () => {
  let remote = 0;
  for (let seed = 1; seed <= 100; seed++) for (const l of generateListings(makeState(), createRng(seed))) {
    if (l.remote) { remote++; expect(l.remote.rating).toBeGreaterThanOrEqual(1); expect(l.remote.rating).toBeLessThanOrEqual(5); expect(l.remote.city).toBeTruthy(); }
  }
  expect(remote).toBeGreaterThan(30);
  const l = makeListing({ remote: { city: 'İzmir', rating: 5 }, minPrice: 1000, askPrice: 1500 });
  const v = gameReducer(view({ money: 5000, listings: [l] }), { type: 'offer', listingId: l.id, amount: 1200 });
  const it = v.state.inventory[0];
  expect(it.arrives).toBe(2);
  expect(gameReducer(v, { type: 'clean', itemId: it.id }).message).toMatch(/kargo/i);
  expect(gameReducer(v, { type: 'listForSale', itemId: it.id, price: 2000, disclosed: true }).message).toMatch(/kargo/i);
});

test('karne: okul aylarında az iş yapan iyi not alır, aile güveni artar', () => {
  const end = dayOfWeek(5);
  expect(gradeFor({ weeks: 10, used: 20 })).toBe('Pekiyi');
  expect(gradeFor({ weeks: 10, used: 55 })).toBe('Orta');
  const good = settleSchool(makeState({ day: end, term: { weeks: 9, used: 10 } }));
  expect(good.family.trust).toBeGreaterThan(60);
  expect(good.term).toEqual({ weeks: 0, used: 0 });
  expect(good.summary.notes.some((n) => n.includes('Karne'))).toBe(true);
  const mid = settleSchool(makeState({ day: end - 1, used: 3, term: { weeks: 0, used: 0 } }));
  expect(mid.term).toEqual({ weeks: 1, used: 3 });
  expect(startNextDay(makeState({ phase: 'evening', day: 2 })).term).toEqual({ weeks: 0, used: 0 });
});

test('18 yaşında meslek seçilir, ilgili yetenek bir artar', () => {
  expect(Object.keys(CAREERS)).toEqual(['otomotiv', 'isletme', 'iletisim', 'calis']);
  const s = chooseCareer(makeState({ age: 18, talents: initialTalents() }), 'otomotiv')!;
  expect(s.talents.ranks.tamir).toBe(1);
  expect(s.player.career).toBe('otomotiv');
  expect(chooseCareer(s, 'isletme')).toBeNull();
  expect(chooseCareer(makeState({ age: 18 }), 'calis')!.talents.points).toBe(1);
});
