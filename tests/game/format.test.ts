import { formatTL } from '../../src/game/format';

test('TL biçimi', () => {
  expect(formatTL(1250000)).toBe('1.250.000 TL');
  expect(formatTL(0)).toBe('0 TL');
});
