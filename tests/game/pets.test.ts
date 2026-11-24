import { PAINTABLE, scrap, scrapValue } from '../../src/game/workshop';
import { PET_FOOD, adoptCat, feedPets, keepPet, settlePets } from '../../src/game/pets';
import { care, paint } from '../../src/game/prep';
import { createRng } from '../../src/game/rng';
import { gameReducer, type GameView } from '../../src/game/reducer';
import type { GameState } from '../../src/game/types';
import { makeItem, makeState } from '../helpers';

const ok = (x: GameState | string | null): GameState => { if (typeof x !== 'object' || x === null) throw new Error(String(x)); return x; };
const view = (over: Partial<GameState> = {}): GameView => ({ state: makeState(over), message: null, lastOffer: null });

test('boya: kaliteye göre durum artar; motor ve karavan da boyanır', () => {
  expect(PAINTABLE).toEqual(expect.arrayContaining(['araba', 'motor', 'karavan', 'tekne']));
  const car = makeItem({ category: 'araba', condition: 50 });
  const s = makeState({ money: 1e6 });
  expect(paint(car, s, 1)!.item.condition).toBeGreaterThan(paint(car, s, 0)!.item.condition);
  expect(paint(makeItem({ category: 'motor' }), s, 1)).not.toBeNull();
  expect(paint(makeItem(), s, 1)).toBeNull();
  const v = gameReducer(view({ money: 1e6, inventory: [car] }), { type: 'paint', itemId: car.id, quality: 0.5 });
  expect(v.state.inventory[0].painted).toBe(true);
});

test('bütün hayvanlara bakılır (güvercin, kuş, balık, köpek)', () => {
  for (const c of ['guvercin', 'kus', 'balik', 'kopek'] as const) expect(care(makeItem({ category: c }))).not.toBeNull();
  expect(care(makeItem({ category: 'telefon' }))).toBeNull();
});

test('köpeği satmayıp yanında tutarsın; beslenmezse üzülür, mutluysa itibar getirir', () => {
  const dog = makeItem({ id: 'k', category: 'kopek', brand: 'Kangal', model: 'Sivas' });
  const s = ok(keepPet(makeState({ inventory: [dog] }), 'k'));
  expect(s.inventory).toHaveLength(0);
  expect(s.pets.dog).toMatchObject({ name: 'Kangal', happiness: 80, fed: false });
  expect(keepPet(makeState({ inventory: [makeItem()] }), 'it-1')).toBeNull();
  const fed = ok(feedPets(s));
  expect(fed.money).toBe(s.money - PET_FOOD[1]);
  expect(fed.pets.dog!.fed).toBe(true);
  const happy = settlePets(fed, createRng(1));
  expect(happy.reputation).toBe(s.reputation + 1);
  expect(happy.pets.dog!.fed).toBe(false);
  const sad = settlePets(s, createRng(1));
  expect(sad.pets.dog!.happiness).toBeLessThan(80);
});

test('kedi garajı farelerden, köpek hırsızdan korur', () => {
  const items = [makeItem({ id: 'a', condition: 80 })];
  let mice = 0, thief = 0, miceCat = 0, thiefDog = 0;
  for (let seed = 1; seed <= 400; seed++) {
    const bare = settlePets(makeState({ inventory: items }), createRng(seed));
    if (bare.inventory.length === 0) thief++;
    else if (bare.inventory[0].condition < 80) mice++;
    const guarded = settlePets(ok(adoptCat(ok(keepPet(makeState({ inventory: [...items, makeItem({ id: 'k', category: 'kopek' })] }), 'k')))), createRng(seed));
    if (guarded.inventory.length === 0) thiefDog++;
    else if (guarded.inventory[0].condition < 80) miceCat++;
  }
  expect(mice).toBeGreaterThan(5);
  expect(thief).toBeGreaterThan(3);
  expect(miceCat).toBe(0);
  expect(thiefDog).toBe(0);
});

test('hurda söküm: çok bozuk eşyayı parça parça satmak bütün satmaktan kârlı', () => {
  const wreck = makeItem({ id: 'w', category: 'motor', baseValue: 100000, condition: 15, boughtFor: 30000 });
  expect(scrapValue(wreck)).toBe(50000);
  expect(scrapValue(makeItem({ category: 'kopek' }))).toBe(0);
  const s = ok(scrap(makeState({ money: 0, inventory: [wreck] }), 'w'));
  expect(s.money).toBe(50000);
  expect(s.inventory).toHaveLength(0);
  expect(s.ledger.at(-1)).toMatchObject({ kind: 'sat', price: 50000, profit: 20000 });
});
