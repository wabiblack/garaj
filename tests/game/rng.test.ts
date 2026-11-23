import { createRng } from '../../src/game/rng';

test('aynı tohum aynı diziyi verir', () => {
  const a = createRng(42), b = createRng(42);
  expect([a.float(), a.float()]).toEqual([b.float(), b.float()]);
});
test('int sınırları dahil', () => {
  const r = createRng(1);
  const seen = new Set<number>();
  for (let i = 0; i < 500; i++) {
    const v = r.int(1, 3);
    expect(v).toBeGreaterThanOrEqual(1);
    expect(v).toBeLessThanOrEqual(3);
    seen.add(v);
  }
  expect(seen.size).toBe(3);
});
test('state() ile devam eden üreteç aynı diziyi sürdürür', () => {
  const a = createRng(9); a.float();
  const b = createRng(a.state());
  expect(b.float()).toBe(a.float());
});
