import { MONTHS, START_WEEK, WEEKS_PER_YEAR, SCHOOL_ACTIONS, actionsLeft, isSchoolWeek, monthOf, weekOfYear, weeksToBirthday } from '../../src/game/calendar';
import { seasonForDay } from '../../src/game/pricing';
import { startNextDay } from '../../src/game/day';
import { checkProgress, STAGE_GOALS } from '../../src/game/progression';
import { newGame } from '../../src/game/newGame';
import { gameReducer, type GameView } from '../../src/game/reducer';
import { makeListing, makeState } from '../helpers';

const view = (over = {}): GameView => ({ state: makeState(over), message: null, lastOffer: null });

test('oyun haziranda başlar; yıl 52 hafta, 12 ay, 4 mevsim', () => {
  expect(weekOfYear(1)).toBe(START_WEEK);
  expect(monthOf(1)).toBe('Haziran');
  expect(weekOfYear(1 + WEEKS_PER_YEAR)).toBe(START_WEEK);
  expect(MONTHS).toHaveLength(12);
  expect(seasonForDay(1)).toBe('yaz');
  const seasons = new Set(Array.from({ length: 52 }, (_, i) => seasonForDay(i + 1)));
  expect(seasons).toEqual(new Set(['ilkbahar', 'yaz', 'sonbahar', 'kis']));
  expect(newGame(1).season).toBe('yaz');
});

test('52 hafta dolunca yaş bir artar, doğum günü notu düşer', () => {
  const before = makeState({ phase: 'evening', day: WEEKS_PER_YEAR, age: 12 });
  const after = startNextDay(before);
  expect(after.age).toBe(13);
  expect(after.summary.notes.some((n) => n.includes('13 yaşına'))).toBe(true);
  expect(startNextDay(makeState({ phase: 'evening', day: 10, age: 12 })).age).toBe(12);
  expect(weeksToBirthday(1)).toBe(WEEKS_PER_YEAR);
  expect(weeksToBirthday(WEEKS_PER_YEAR)).toBe(1);
});

test('aşama geçişi için para yetmez, yaş da gerekir', () => {
  const rich = makeState({ money: STAGE_GOALS[1], age: 15 });
  expect(checkProgress(rich).pendingTransition).toBeNull();
  expect(checkProgress({ ...rich, age: 16 }).pendingTransition).toBe(2);
  expect(checkProgress(makeState({ stage: 2, age: 17, money: STAGE_GOALS[2] })).pendingTransition).toBeNull();
});

test('geçişte yaş zıplamaz', async () => {
  const { completeTransition } = await import('../../src/game/progression');
  const s = completeTransition(makeState({ age: 16, day: 200, pendingTransition: 2 }));
  expect(s).toMatchObject({ stage: 2, age: 16 });
});

test('okul haftasında reşit olmayanın iş hakkı sınırlı; tatilde ve 18 yaşta sınır yok', () => {
  const schoolDay = Array.from({ length: 52 }, (_, i) => i + 1).find((d) => isSchoolWeek(d))!;
  const holiday = Array.from({ length: 52 }, (_, i) => i + 1).find((d) => !isSchoolWeek(d))!;
  expect(isSchoolWeek(1)).toBe(false);
  expect(actionsLeft(makeState({ day: schoolDay }))).toBe(SCHOOL_ACTIONS);
  expect(actionsLeft(makeState({ day: holiday }))).toBe(Infinity);
  expect(actionsLeft(makeState({ day: schoolDay, age: 18, stage: 3 }))).toBe(Infinity);
});

test('iş hakkı bitince alım engellenir', () => {
  const schoolDay = Array.from({ length: 52 }, (_, i) => i + 1).find((d) => isSchoolWeek(d))!;
  const l = makeListing({ minPrice: 100, askPrice: 200 });
  const v = gameReducer(view({ day: schoolDay, listings: [l], used: SCHOOL_ACTIONS }), { type: 'offer', listingId: l.id, amount: 150 });
  expect(v.state.inventory).toHaveLength(0);
  expect(v.message).toMatch(/okul/i);
  const ok = gameReducer(view({ day: schoolDay, listings: [l], used: 0 }), { type: 'offer', listingId: l.id, amount: 150 });
  expect(ok.state.used).toBe(1);
  expect(startNextDay({ ...ok.state, phase: 'evening' }).used).toBe(0);
});
