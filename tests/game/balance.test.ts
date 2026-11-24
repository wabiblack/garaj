import { simulate } from '../../scripts/simulate';

const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

// Her tur bir hafta; doğum günleri 53, 105, 157, 209. haftalarda. 12 yaşında başlayan oyuncu
// parasını erkenden toplasa da motora 16 yaşında (209. hafta), galeriye 18 yaşında (2 yıl sonra) geçer.
test('basit oyuncu aşamaları yaşı gelince geçer', () => {
  const runs = Array.from({ length: 20 }, (_, i) => simulate(1000 + i, 'basit'));
  const s2 = median(runs.map((r) => r.daysToStage2));
  const s3 = median(runs.map((r) => r.daysToStage3));
  console.log('stage2 days', runs.map((r) => r.daysToStage2).join(','), 'median', s2);
  console.log('stage3 days', runs.map((r) => r.daysToStage3).join(','), 'median', s3);
  expect(s2).toBeGreaterThanOrEqual(209);
  expect(s2).toBeLessThanOrEqual(215);
  expect(s3).toBeGreaterThanOrEqual(104);
  expect(s3).toBeLessThanOrEqual(115);
});
