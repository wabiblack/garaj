import { checkProgress, completeTransition, hasWon, STAGE_GOALS } from '../../src/game/progression';
import { marketValue } from '../../src/game/pricing';
import { makeItem, makeState } from '../helpers';

test('hedefler', () => expect(STAGE_GOALS).toEqual({ 1: 50000, 2: 500000 }));

describe('checkProgress', () => {
  test('aşama 1: 50.000 TL → geçiş 2', () => {
    expect(checkProgress(makeState({ money: 49990 })).pendingTransition).toBeNull();
    expect(checkProgress(makeState({ money: 50000 })).pendingTransition).toBe(2);
  });
  test('aşama 2: 500.000 TL → geçiş 3', () => {
    expect(checkProgress(makeState({ stage: 2, money: 500000 })).pendingTransition).toBe(3);
  });
  test('aşama 3: kazanma', () => {
    expect(checkProgress(makeState({ stage: 3, money: 9e9 })).pendingTransition).toBeNull();
    expect(checkProgress(makeState({ stage: 3, locationLevel: 2, reputation: 90 })).won).toBe(true);
  });
});

test('hasWon', () => {
  expect(hasWon(makeState({ stage: 3, locationLevel: 2, reputation: 90 }))).toBe(true);
  expect(hasWon(makeState({ stage: 3, locationLevel: 1, reputation: 100 }))).toBe(false);
  expect(hasWon(makeState({ stage: 3, locationLevel: 2, reputation: 89 }))).toBe(false);
});

describe('completeTransition', () => {
  test('aşama 2: 16 yaş, eski eşyalar %80e satılır, motor ilanları', () => {
    const item = makeItem({ baseValue: 2000, condition: 100 });
    const s = makeState({
      money: 50000, pendingTransition: 2, inventory: [item],
      forSale: [{ itemId: item.id, price: 1, disclosed: false }], offers: [{ id: 'o', itemId: item.id, amount: 1, buyerName: 'A' }],
    });
    const n = completeTransition(s);
    expect(n).toMatchObject({ stage: 2, age: 16, pendingTransition: null, inventory: [], forSale: [], offers: [] });
    expect(n.money).toBe(50000 + Math.round((marketValue(item, 'ilkbahar') * 0.8) / 10) * 10);
    expect(n.summary.notes).toContain('Kerem eski eşyalarını elden çıkardı');
    expect(n.listings.every((l) => l.item.category === 'motor')).toBe(true);
  });
  test('aşama 3: 18 yaş, araba ilanları; eşya yoksa not yok', () => {
    const n = completeTransition(makeState({ stage: 2, pendingTransition: 3 }));
    expect(n).toMatchObject({ stage: 3, age: 18 });
    expect(n.summary.notes).not.toContain('Kerem eski eşyalarını elden çıkardı');
    expect(n.listings.every((l) => l.item.category === 'araba')).toBe(true);
  });
  test('bekleyen geçiş yoksa değişmez', () => {
    const s = makeState();
    expect(completeTransition(s)).toBe(s);
  });
});

test('restartStage sonrası en az bir ilan alınabilir', async () => {
  const { restartStage, STAGE_RESTART_MONEY } = await import('../../src/game/progression');
  for (let seed = 1; seed <= 40; seed++) {
    const s = restartStage(makeState({ stage: 2, rngState: seed, money: 0 }));
    expect(s.listings.some((l) => l.minPrice <= STAGE_RESTART_MONEY[2])).toBe(true);
  }
});
