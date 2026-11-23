/** mulberry32: [0,1) aralığında değer ve yeni durum döner. */
export function next(state: number): [value: number, newState: number] {
  const s = (state + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

export interface RNG {
  float(): number;
  int(min: number, max: number): number;
  range(min: number, max: number): number;
  pick<T>(arr: readonly T[]): T;
  chance(p: number): boolean;
  id(prefix: string): string;
  state(): number;
}

export function createRng(seed: number): RNG {
  let s = seed >>> 0;
  const float = () => {
    const [v, n] = next(s);
    s = n;
    return v;
  };
  const int = (min: number, max: number) => min + Math.floor(float() * (max - min + 1));
  return {
    float,
    int,
    range: (min, max) => min + float() * (max - min),
    pick: (arr) => arr[int(0, arr.length - 1)],
    chance: (p) => float() < p,
    id: (prefix) => `${prefix}-${Math.floor(float() * 2 ** 32).toString(36)}`,
    state: () => s,
  };
}
