import { cue } from '../feedback';
import { useEffect, useRef, useState } from 'react';
import type { Action, GameView } from '../../game/reducer';
import type { Listing } from '../../game/types';
import { AUCTION_BIDDERS, HAMMER_MS, auctionStep, rivalsWillRaise, startPrice } from '../../game/auction';
import { marketValue } from '../../game/pricing';
import { formatTL } from '../../game/format';
import { itemName } from '../../game/selling';
import { canBuy } from '../../game/negotiation';
import { Sheet } from '../components/Sheet';
import { Button } from '../components/Button';
import { Money } from '../components/Money';
import { ConditionBar, ItemImage, TagRow } from '../components/ItemCard';

type Phase = 'ready' | 'live' | 'won' | 'lost';
const TICK = 100;

/** Canlı mezat: son tekliften sonra çekiç 3 sn'de iner. Rakipler sınırlarına kadar artırır. */
export function AuctionSheet({ listing, view, dispatch, onClose, onGoGarage }: {
  listing: Listing; view: GameView; dispatch(a: Action): void; onClose(): void; onGoGarage(): void;
}) {
  const { state } = view;
  const step = auctionStep(listing);
  const [phase, setPhase] = useState<Phase>('ready');
  const [price, setPrice] = useState(startPrice(listing));
  const [leader, setLeader] = useState(AUCTION_BIDDERS[1]);
  const [left, setLeft] = useState(HAMMER_MS);
  const [log, setLog] = useState<string[]>([]);
  const rivalAt = useRef<number | null>(null);
  const finalPrice = useRef(0);
  const next = price + step;
  const block = canBuy(state, next);

  useEffect(() => {
    if (phase !== 'live') return;
    const t = setInterval(() => {
      setLeft((ms) => Math.max(0, ms - TICK));
    }, TICK);
    return () => clearInterval(t);
  }, [phase]);

  // Oyuncu öndeyken rakip bir süre sonra (sınırı izin verirse) artırır.
  useEffect(() => {
    if (phase !== 'live' || leader !== 'Sen' || !rivalsWillRaise(listing, price)) {
      rivalAt.current = null;
      return;
    }
    rivalAt.current ??= HAMMER_MS - 900 - Math.floor(Math.random() * 1200);
  }, [phase, leader, price, listing]);

  useEffect(() => {
    if (phase !== 'live') return;
    if (rivalAt.current !== null && left <= rivalAt.current) {
      const who = AUCTION_BIDDERS[Math.floor(Math.random() * AUCTION_BIDDERS.length)];
      const p = price + step;
      rivalAt.current = null;
      setPrice(p);
      setLeader(who);
      setLeft(HAMMER_MS);
      setLog((l) => [`${who}: ${formatTL(p)}`, ...l].slice(0, 4));
      return;
    }
    if (left > 0) return;
    cue('hammer');
    if (leader === 'Sen') {
      finalPrice.current = price;
      setPhase('won');
      dispatch({ type: 'winAuction', listingId: listing.id, price });
    } else {
      setPhase('lost');
      dispatch({ type: 'auctionLost', listingId: listing.id });
    }
  }, [left, phase, leader, price, step, listing.id, dispatch]);

  const bid = () => {
    setPrice(next);
    setLeader('Sen');
    setLeft(HAMMER_MS);
    setLog((l) => [`Sen: ${formatTL(next)}`, ...l].slice(0, 4));
  };
  const start = () => {
    setPhase('live');
    setLog([`${AUCTION_BIDDERS[1]}: ${formatTL(price)} (açılış)`]);
  };

  const { item } = listing;
  const pct = (left / HAMMER_MS) * 100;
  return (
    <Sheet open title="Canlı mezat" onClose={phase === 'live' ? () => undefined : onClose}>
      <div className="neg__banner"><ItemImage item={item} /></div>
      <div className="neg__name">{itemName(item)}</div>
      <ConditionBar value={item.condition} />
      <TagRow item={item} />
      <dl className="kv">
        <div><dt>Piyasa değeri</dt><dd><Money value={marketValue(item, state.season)} /></dd></div>
        <div><dt>Güncel fiyat</dt><dd><Money value={price} className="money--accent" /></dd></div>
        <div><dt>Önde</dt><dd className={leader === 'Sen' ? 'pos' : ''}>{leader}</dd></div>
      </dl>
      {phase === 'ready' ? (
        <>
          <p className="hint">Ekspertiz yok, mal olduğu gibi satılır. Son tekliften 3 saniye sonra çekiç iner.</p>
          <Button variant="primary" block onClick={start}>Mezata katıl</Button>
        </>
      ) : null}
      {phase === 'live' ? (
        <>
          <div className="hammer" aria-label="Çekiç süresi"><div className="hammer__fill" style={{ width: `${pct}%` }} /></div>
          <Button variant="primary" block disabled={leader === 'Sen' || block !== null} onClick={bid}>{`Artır · ${formatTL(next)}`}</Button>
          {block === 'yetersiz-para' ? <p className="hint">Bu fiyata paran yetmiyor</p> : block === 'depo-dolu' ? <p className="hint">Depon dolu</p> : null}
          <ul className="bidlog">{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
        </>
      ) : null}
      {phase === 'won' ? (
        <div className="result result--good">
          <strong>Çekiç indi, mezat senin!</strong> {formatTL(finalPrice.current)}.
          <Button variant="good" block onClick={() => { onClose(); onGoGarage(); }}>Garaja git</Button>
        </div>
      ) : null}
      {phase === 'lost' ? (
        <div className="result result--bad">
          Mezatı {leader} {formatTL(price)} ile kazandı.
          <Button block onClick={onClose}>Kapat</Button>
        </div>
      ) : null}
    </Sheet>
  );
}
