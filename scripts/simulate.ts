import { gameReducer, type Action, type GameView } from '../src/game/reducer';
import { newGame } from '../src/game/newGame';
import { marketValue, round10 } from '../src/game/pricing';
import { repairCost } from '../src/game/prep';
import { storageLimit } from '../src/game/negotiation';

/** Basit oyuncu: makul fiyata alır, hazırlar, piyasa değerinden satar, en iyi teklifi kabul eder. */
export function simulate(seed: number, _policy: 'basit'): { daysToStage2: number; daysToStage3: number } {
  let v: GameView = { state: newGame(seed), message: null, lastOffer: null };
  const act = (a: Action) => { v = gameReducer(v, a); };
  let stage2Day = 0;
  let stage3Day = 0;

  for (let guard = 0; guard < 1500 && !stage3Day; guard++) {
    const s = v.state;
    if (s.pendingTransition) {
      if (s.pendingTransition === 2) stage2Day = s.day;
      else stage3Day = s.day;
      act({ type: 'completeTransition' });
      continue;
    }
    if (s.phase === 'day') {
      // Alım
      for (const l of [...s.listings].sort((a, b) => marketValue(b.item, s.season) - marketValue(a.item, s.season))) {
        if (marketValue(l.item, s.season) * 0.65 > v.state.money) continue;
        if (v.state.inventory.length >= storageLimit(v.state)) break;
        act({ type: 'inspect', listingId: l.id });
        const live = v.state.listings.find((x) => x.id === l.id);
        if (!live) continue;
        const mv = marketValue(live.item, v.state.season);
        let offer = round10(mv * 0.65);
        for (let tries = 0; tries < 3 && v.state.listings.some((x) => x.id === l.id); tries++) {
          if (offer > v.state.money) break;
          act({ type: 'offer', listingId: l.id, amount: offer });
          const r = v.lastOffer;
          if (!r || r.kind !== 'counter') break;
          if (r.price > mv * 0.82) break;
          offer = r.price;
        }
      }
      // Hazırlama ve satışa koyma
      for (const item of v.state.inventory) {
        for (const d of item.defects) {
          if (d.known && repairCost(d, v.state) < d.valueHit * item.baseValue) act({ type: 'repair', itemId: item.id, defectId: d.id });
        }
        act({ type: 'clean', itemId: item.id });
        act({ type: 'care', itemId: item.id });
        const live = v.state.inventory.find((i) => i.id === item.id)!;
        act({ type: 'listForSale', itemId: item.id, price: marketValue(live, v.state.season), disclosed: live.defects.some((d) => d.known) });
      }
      act({ type: 'endDay' });
    } else {
      const best = new Map<string, { id: string; amount: number }>();
      for (const o of v.state.offers) {
        const b = best.get(o.itemId);
        if (!b || o.amount > b.amount) best.set(o.itemId, { id: o.id, amount: o.amount });
      }
      for (const b of best.values()) act({ type: 'acceptOffer', offerId: b.id });
      if (v.state.pendingTransition) continue;
      act({ type: 'startNextDay' });
    }
  }
  return { daysToStage2: stage2Day, daysToStage3: stage3Day ? stage3Day - stage2Day : 999 };
}
