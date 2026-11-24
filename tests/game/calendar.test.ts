import { MONTHS, PERIODS_PER_YEAR, SCHOOL_ACTIONS, START_MONTH, actionsLeft, dateLabel, isSchoolMonth, monthOf, monthOfYear, monthsToBirthday } from '../../src/game/calendar';
import { seasonForDay } from '../../src/game/pricing';
import { startNextDay } from '../../src/game/day';
import { checkProgress, STAGE_GOALS } from '../../src/game/progression';
import { newGame } from '../../src/game/newGame';
import { gameReducer, type GameView } from '../../src/game/reducer';
import { makeListing, makeState } from '../helpers';

const view = (over = {}): GameView => ({ state: makeState(over), message: null, lastOffer: null });
const schoolDay = Array.from({ length: 12 }, (_, i) => i + 1).find((d) => isSchoolMonth(d))!;

test('her tur bir ay: oyun haziranda başlar, 12 ay bir yıl, 4 mevsim', () => {
  expect(monthOfYear(1)).toBe(START_MONTH);
  expect(monthOf(1)).toBe('Haziran');
  expect(dateLabel(1)).toBe('Haziran 2026');
  expect(dateLabel(8)).toBe('Ocak 2027');
  expect(monthOfYear(1 + PERIODS_PER_YEAR)).toBe(START_MONTH);
  expect(MONTHS).toHaveLength(12);
  expect(seasonForDay(1)).toBe('yaz');
  expect(new Set(Array.from({ length: 12 }, (_, i) => seasonForDay(i + 1)))).toEqual(new Set(['ilkbahar', 'yaz', 'sonbahar', 'kis']));
  expect(newGame(1).season).toBe('yaz');
});

test('12 ay dolunca yaş bir artar, doğum günü notu düşer', () => {
  const after = startNextDay(makeState({ phase: 'evening', day: PERIODS_PER_YEAR, age: 12 }));
  expect(after.age).toBe(13);
  expect(after.summary.notes.some((n) => n.includes('13 yaşına'))).toBe(true);
  expect(startNextDay(makeState({ phase: 'evening', day: 5, age: 12 })).age).toBe(12);
  expect(monthsToBirthday(1)).toBe(PERIODS_PER_YEAR);
  expect(monthsToBirthday(PERIODS_PER_YEAR)).toBe(1);
});

test('aşama geçişi için para yetmez, yaş da gerekir', () => {
  const rich = makeState({ money: STAGE_GOALS[1], age: 15 });
  expect(checkProgress(rich).pendingTransition).toBeNull();
  expect(checkProgress({ ...rich, age: 16 }).pendingTransition).toBe(2);
});

test('okul aylarında reşit olmayanın iş hakkı sınırlı; yaz tatilinde ve 18 yaşta sınır yok', () => {
  expect(isSchoolMonth(1)).toBe(false);
  expect(actionsLeft(makeState({ day: schoolDay }))).toBe(SCHOOL_ACTIONS);
  expect(actionsLeft(makeState({ day: 1 }))).toBe(Infinity);
  expect(actionsLeft(makeState({ day: schoolDay, age: 18, stage: 3 }))).toBe(Infinity);
});

test('iş hakkı bitince alım engellenir, yeni ay sıfırlanır', () => {
  const l = makeListing({ minPrice: 100, askPrice: 200 });
  const v = gameReducer(view({ day: schoolDay, listings: [l], used: SCHOOL_ACTIONS }), { type: 'offer', listingId: l.id, amount: 150 });
  expect(v.state.inventory).toHaveLength(0);
  expect(v.message).toMatch(/okul/i);
  const ok = gameReducer(view({ day: schoolDay, listings: [l], used: 0 }), { type: 'offer', listingId: l.id, amount: 150 });
  expect(ok.state.used).toBe(1);
  expect(startNextDay({ ...ok.state, phase: 'evening' }).used).toBe(0);
});

test('geçişte yaş zıplamaz', async () => {
  const { completeTransition } = await import('../../src/game/progression');
  expect(completeTransition(makeState({ age: 16, day: 49, pendingTransition: 2 }))).toMatchObject({ stage: 2, age: 16 });
});
