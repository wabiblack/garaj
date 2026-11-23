import { dative, genitive } from '../../src/game/turkish';

test('yönelme eki ünlü uyumuna ve kaynaştırmaya uyar', () => {
  expect(dative('Kerem')).toBe('Kerem’e');
  expect(dative('Umut')).toBe('Umut’a');
  expect(dative('Ali')).toBe('Ali’ye');
  expect(dative('Arda')).toBe('Arda’ya');
  expect(dative('İLKER')).toBe('İLKER’e');
});

test('tamlayan eki dört biçimli', () => {
  expect(genitive('Kerem')).toBe('Kerem’in');
  expect(genitive('Baran')).toBe('Baran’ın');
  expect(genitive('Umut')).toBe('Umut’un');
  expect(genitive('Ömür')).toBe('Ömür’ün');
  expect(genitive('Ayşe')).toBe('Ayşe’nin');
  expect(genitive('Doruk')).toBe('Doruk’un');
});

import { cleanName, cleanPlayer, DEFAULT_PLAYER } from '../../src/game/player';
import { exportSave, importSave } from '../../src/game/save';
import { makeState } from '../helpers';
import type { GameState } from '../../src/game/types';

test('isim temizlenir: harf dışı atılır, 14 karakter, ilk harf büyük, boşsa Kerem', () => {
  expect(cleanName('  ilker  ')).toBe('İlker');
  expect(cleanName('<b>Ali</b>9')).toBe('BAlib');
  expect(cleanName('Abdurrahmanşahin')).toBe('Abdurrahmanşah');
  expect(cleanName('123')).toBe('Kerem');
});

test('bozuk karakter verisi varsayılana döner; eski kayıt Kerem olur', () => {
  expect(cleanPlayer({ name: 'Ayşe', look: { skin: 9, hair: 2, color: -1, glasses: 'evet' } }))
    .toEqual({ name: 'Ayşe', look: { skin: DEFAULT_PLAYER.look.skin, hair: 2, color: DEFAULT_PLAYER.look.color, glasses: false } });
  const old = { ...makeState() } as Partial<GameState>;
  delete old.player;
  expect(importSave(exportSave(old as GameState))!.player).toEqual(DEFAULT_PLAYER);
});
