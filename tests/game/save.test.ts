import { loadGame, saveGame, SAVE_KEY } from '../../src/game/save';
import { newGame } from '../../src/game/newGame';

function memStorage(init: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(init));
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
}

test('kaydet ve geri yükle', () => {
  const st = memStorage();
  const g = newGame(5);
  saveGame(st, g);
  expect(loadGame(st)).toEqual({ kind: 'ok', state: g });
});
test('kayıt yoksa empty', () => expect(loadGame(memStorage())).toEqual({ kind: 'empty' }));
test('bozuk JSON → broken', () => expect(loadGame(memStorage({ [SAVE_KEY]: '{oops' }))).toEqual({ kind: 'broken' }));
test('bilinmeyen sürüm → broken', () => {
  expect(loadGame(memStorage({ [SAVE_KEY]: JSON.stringify({ ...newGame(1), version: 99 }) }))).toEqual({ kind: 'broken' });
});
test('eksik alanlı kayıt → broken', () => {
  expect(loadGame(memStorage({ [SAVE_KEY]: JSON.stringify({ version: 1, money: 5 }) }))).toEqual({ kind: 'broken' });
  expect(loadGame(memStorage({ [SAVE_KEY]: 'null' }))).toEqual({ kind: 'broken' });
});
test('getItem hata fırlatırsa broken, setItem hata fırlatırsa sessiz', () => {
  const bad = { ...memStorage(), getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } } as Storage;
  expect(loadGame(bad)).toEqual({ kind: 'broken' });
  expect(() => saveGame(bad, newGame(1))).not.toThrow();
});

test('fix M1: phase veya summary.notes bozuksa broken', () => {
  const g = newGame(2);
  expect(loadGame(memStorage({ [SAVE_KEY]: JSON.stringify({ ...g, phase: undefined }) }))).toEqual({ kind: 'broken' });
  expect(loadGame(memStorage({ [SAVE_KEY]: JSON.stringify({ ...g, summary: { day: 1 } }) }))).toEqual({ kind: 'broken' });
});

test('sürüm 1 kaydı güncel sürüme taşınır', () => {
  const g = newGame(4);
  const { event: _e, quests: _q, stats: _s, achievements: _a, ...v1 } = { ...g, version: 1 } as Record<string, unknown>;
  const res = loadGame(memStorage({ [SAVE_KEY]: JSON.stringify(v1) }));
  expect(res.kind).toBe('ok');
  if (res.kind !== 'ok') return;
  expect(res.state.version).toBe(3);
  expect(res.state.quests).toHaveLength(3);
  expect(res.state.stats.sales).toBe(0);
  expect(res.state.achievements).toEqual([]);
  expect(res.state.event).toBeNull();
  expect(res.state.listings.every((l) => l.personality)).toBe(true);
});
