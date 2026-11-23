import { simulate } from '../../scripts/simulate';

const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

test('basit oyuncu aşamaları hedef sürede geçer', () => {
  const runs = Array.from({ length: 20 }, (_, i) => simulate(1000 + i, 'basit'));
  const s2 = median(runs.map((r) => r.daysToStage2));
  const s3 = median(runs.map((r) => r.daysToStage3));
  console.log('stage2 days', runs.map((r) => r.daysToStage2).join(','), 'median', s2);
  console.log('stage3 days', runs.map((r) => r.daysToStage3).join(','), 'median', s3);
  expect(s2).toBeGreaterThanOrEqual(6);
  expect(s2).toBeLessThanOrEqual(12);
  expect(s3).toBeGreaterThanOrEqual(8);
  expect(s3).toBeLessThanOrEqual(15);
});
