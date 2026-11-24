import { simulate } from '../../scripts/simulate';

const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

// Her tur bir ay; doğum günleri 13, 25, 37, 49. turlarda. 12 yaşında başlayan oyuncu
// motora 16 yaşında (49. tur), galeriye 18 yaşında (24 tur sonra) geçer.
test('basit oyuncu aşamaları yaşı gelince geçer', () => {
  const runs = Array.from({ length: 20 }, (_, i) => simulate(1000 + i, 'basit'));
  const s2 = median(runs.map((r) => r.daysToStage2));
  const s3 = median(runs.map((r) => r.daysToStage3));
  console.log('stage2 days', runs.map((r) => r.daysToStage2).join(','), 'median', s2);
  console.log('stage3 days', runs.map((r) => r.daysToStage3).join(','), 'median', s3);
  expect(s2).toBeGreaterThanOrEqual(49);
  expect(s2).toBeLessThanOrEqual(55);
  expect(s3).toBeGreaterThanOrEqual(24);
  expect(s3).toBeLessThanOrEqual(32);
});
