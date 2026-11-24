// Evcil hayvanlar: köpeği satmayıp yanında tutabilirsin (hırsıza karşı bekçi, mahallede itibar),
// garaja bir sokak kedisi alabilirsin (farelere karşı). Her hafta beslenmeleri gerekir.
import type { GameState, Pet, Stage } from './types';
import type { RNG } from './rng';
import { formatTL } from './format';

/** Haftalık mama, hayvan başına. */
export const PET_FOOD: Record<Stage, number> = { 1: 100, 2: 300, 3: 1000, 4: 3000 };
const THIEF_CHANCE = 0.03;
const MICE_CHANCE = 0.05;
const MICE_DAMAGE = 10;

export type PetBlock = 'yetersiz-para' | 'zaten-var' | null;

export function keepPet(s: GameState, itemId: string): GameState | PetBlock {
  const item = s.inventory.find((i) => i.id === itemId && i.category === 'kopek');
  if (!item) return null;
  if (s.pets.dog) return 'zaten-var';
  const dog: Pet = { name: item.brand, brand: item.brand, model: item.model, happiness: 80, fed: false };
  return {
    ...s, pets: { ...s.pets, dog },
    inventory: s.inventory.filter((i) => i.id !== itemId), forSale: s.forSale.filter((f) => f.itemId !== itemId),
  };
}

export function adoptCat(s: GameState): GameState | PetBlock {
  if (s.pets.cat) return 'zaten-var';
  return { ...s, pets: { ...s.pets, cat: { name: 'Tekir', happiness: 80, fed: false } } };
}

const list = (s: GameState) => [s.pets.dog, s.pets.cat].filter((p): p is Pet => p !== null);

export function feedCost(s: GameState): number {
  return list(s).filter((p) => !p.fed).length * PET_FOOD[s.stage];
}

export function feedPets(s: GameState): GameState | PetBlock {
  const cost = feedCost(s);
  if (cost === 0) return null;
  if (s.money < cost) return 'yetersiz-para';
  const fed = (p: Pet | null) => (p ? { ...p, fed: true, happiness: Math.min(100, p.happiness + 5) } : null);
  return { ...s, money: s.money - cost, pets: { dog: fed(s.pets.dog), cat: fed(s.pets.cat) }, summary: { ...s.summary, spent: s.summary.spent + cost } };
}

/** Hafta sonu: beslenmeyen üzülür; mutlu köpek itibar getirir; hırsız ve fare olayları. */
export function settlePets(s: GameState, rng: RNG): GameState {
  const notes = [...s.summary.notes];
  const week = (p: Pet | null): Pet | null => (p ? { ...p, fed: false, happiness: Math.max(0, Math.min(100, p.happiness + (p.fed ? 5 : -20))) } : null);
  const dog = week(s.pets.dog);
  const cat = week(s.pets.cat);
  let { reputation } = s;
  let family = s.family;
  if (dog && dog.happiness >= 60) reputation = Math.min(100, reputation + 1);
  if (dog && dog.happiness < 30) {
    family = { ...family, trust: Math.max(0, family.trust - 5) };
    notes.push(`${dog.name} çok üzgün: onu beslemeyi unutma`);
  }
  let inventory = s.inventory;
  let forSale = s.forSale;
  if (inventory.length > 0 && rng.chance(THIEF_CHANCE)) {
    if (dog) notes.push(`${dog.name} gece hırsızı kaçırdı`);
    else {
      const stolen = rng.pick(inventory);
      inventory = inventory.filter((i) => i.id !== stolen.id);
      forSale = forSale.filter((f) => f.itemId !== stolen.id);
      notes.push(`Hırsız garaja girdi: ${stolen.brand} ${stolen.model} çalındı. Bir bekçi köpeği işe yarardı`);
    }
  }
  if (inventory.length > 0 && !cat && rng.chance(MICE_CHANCE)) {
    const bitten = rng.pick(inventory);
    inventory = inventory.map((i) => (i.id === bitten.id ? { ...i, condition: Math.max(0, i.condition - MICE_DAMAGE) } : i));
    notes.push(`Fareler ${bitten.brand} ${bitten.model} eşyasının kablolarını kemirdi. Bir kedi işe yarardı`);
  }
  return { ...s, pets: { dog, cat }, reputation, family, inventory, forSale, summary: { ...s.summary, notes } };
}

export const petFoodText = (s: GameState) => `Mama · ${formatTL(feedCost(s))}`;
