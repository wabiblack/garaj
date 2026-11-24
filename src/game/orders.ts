import type { GameState, Item, Order, Season, Tag } from './types';
import type { RNG } from './rng';
import { CATEGORIES_BY_STAGE, CATEGORY_LABEL } from './catalog';
import { marketValue, round10 } from './pricing';

const BUYERS = ['Derya', 'Kemal', 'Oya', 'Nihat', 'Selim', 'Gül', 'Tarık', 'Melek', 'Rıza', 'Sevda'];
const ORDER_CHANCE = 0.4;
const MAX_ORDERS = 2;
const ORDER_DAYS = 3;
const ORDER_BONUS = 0.3;
export const TAG_LABEL: Record<Tag, string> = { '4x4': '4x4', cabrio: 'Üstü açık', klasik: 'Klasik', nadir: 'Nadir' };

export function orderMatches(order: Order, item: Item): boolean {
  return (
    item.category === order.category &&
    item.condition >= order.minCondition &&
    (!order.tag || item.tags.includes(order.tag)) &&
    !item.defects.some((d) => d.known)
  );
}

export function orderPrice(order: Order, item: Item, season: Season, index = 1): number {
  return round10(marketValue(item, season, index) * (1 + order.bonus));
}

export function orderTitle(order: Order): string {
  const what = (order.tag ? `${TAG_LABEL[order.tag].toLocaleLowerCase('tr-TR')} ` : '') + CATEGORY_LABEL[order.category].toLocaleLowerCase('tr-TR');
  return `${order.buyerName} ${what} arıyor`;
}

function newOrder(state: GameState, rng: RNG): Order {
  const tag: Tag | undefined = state.stage >= 3 && rng.chance(0.3) ? rng.pick<Tag>(['4x4', 'cabrio']) : undefined;
  return {
    id: rng.id('or'),
    buyerName: rng.pick(BUYERS),
    category: rng.pick(CATEGORIES_BY_STAGE[state.stage]),
    ...(tag ? { tag } : {}),
    minCondition: rng.int(10, 15) * 5,
    bonus: ORDER_BONUS,
    daysLeft: ORDER_DAYS,
  };
}

/** Günü bir azaltır, süresi dolanları düşürür, yer varsa yeni sipariş getirir. */
export function updateOrders(state: GameState, rng: RNG): { orders: Order[]; notes: string[] } {
  const notes: string[] = [];
  const orders = state.orders.flatMap((o) => {
    if (o.daysLeft <= 1) {
      notes.push(`${o.buyerName} siparişinden vazgeçti`);
      return [];
    }
    return [{ ...o, daysLeft: o.daysLeft - 1 }];
  });
  if (orders.length < MAX_ORDERS && rng.chance(ORDER_CHANCE)) {
    const o = newOrder(state, rng);
    orders.push(o);
    notes.push(`Yeni sipariş: ${orderTitle(o)}`);
  }
  return { orders, notes };
}
