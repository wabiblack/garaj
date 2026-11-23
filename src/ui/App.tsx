import { useEffect, useRef, useState } from 'react';
import { cue } from './feedback';
import { ACHIEVEMENTS } from '../game/career';
import type { GameView } from '../game/reducer';
import { TabBar, type Tab } from './components/TabBar';
import { TopBar } from './components/TopBar';
import { Toast } from './components/Toast';
import { useGame } from './useGame';
import { ListingsScreen } from './screens/ListingsScreen';
import { NegotiationSheet } from './screens/NegotiationSheet';
import { BrokenSaveScreen } from './screens/BrokenSaveScreen';
import { GarageScreen } from './screens/GarageScreen';
import { SalesScreen } from './screens/SalesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { EveningScreen } from './screens/EveningScreen';
import { TransitionScreen } from './screens/TransitionScreen';
import { EndScreen } from './screens/EndScreen';
import { BankruptScreen } from './screens/BankruptScreen';
import { IntroScreen } from './screens/IntroScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { isBankrupt } from '../game/progression';
import { AuctionSheet } from './screens/AuctionSheet';
import { StoryScreen } from './screens/StoryScreen';
import type { Listing } from '../game/types';

export default function App() {
  return (
    <ErrorBoundary>
      <Game />
    </ErrorBoundary>
  );
}

function Game() {
  const { view, broken, fresh, dispatch, reset } = useGame();
  const [introDone, setIntroDone] = useState(false);
  const [tab, setTab] = useState<Tab>('ilanlar');
  const [listingId, setListingId] = useState<string | null>(null);
  const [auction, setAuction] = useState<Listing | null>(null);
  const achievement = useFeedback(view);

  if (broken || !view) return <BrokenSaveScreen onReset={reset} />;
  const { state } = view;
  const overlay = fresh && !introDone && state.day === 1 && state.stats.sales === 0
    ? <IntroScreen onStart={() => setIntroDone(true)} />
    : state.pendingTransition !== null
    ? <TransitionScreen to={state.pendingTransition} onContinue={() => dispatch({ type: 'completeTransition' })} />
    : state.phase === 'evening'
      ? <EveningScreen view={view} dispatch={dispatch} />
      : (state.won && !state.wonSeen) || (state.stage === 4 && state.branches >= 3 && !state.finalSeen)
        ? <EndScreen state={state} onContinue={() => dispatch({ type: 'dismissWin' })} />
        : state.story.pending
          ? <StoryScreen id={state.story.pending} state={state} onChoose={(index) => dispatch({ type: 'storyChoice', index })} />
          : isBankrupt(state)
          ? <BankruptScreen state={state} onRestart={() => dispatch({ type: 'restartStage' })} />
          : null;

  return (
    <div className="app">
      <TopBar state={state} onEndDay={() => dispatch({ type: 'endDay' })} />
      <main className="screen">
        {tab === 'ilanlar' ? (
          <ListingsScreen
            state={state}
            onOpen={(id) => {
              const l = state.listings.find((x) => x.id === id);
              if (l?.special === 'mezat' && l.auctionMax !== undefined) setAuction(l);
              else setListingId(id);
            }}
          />
        ) : null}
        {tab === 'garaj' ? <GarageScreen view={view} dispatch={dispatch} /> : null}
        {tab === 'satis' ? <SalesScreen view={view} dispatch={dispatch} /> : null}
        {tab === 'profil' ? <ProfileScreen view={view} dispatch={dispatch} onNewGame={reset} /> : null}
      </main>
      <TabBar active={tab} onChange={setTab} badges={{ satis: state.forSale.length }} />
      {listingId ? (
        <NegotiationSheet
          key={listingId}
          listingId={listingId}
          view={view}
          dispatch={dispatch}
          onClose={() => setListingId(null)}
          onGoGarage={() => setTab('garaj')}
        />
      ) : null}
      {auction ? (
        <AuctionSheet
          key={auction.id}
          listing={auction}
          view={view}
          dispatch={dispatch}
          onClose={() => setAuction(null)}
          onGoGarage={() => setTab('garaj')}
        />
      ) : null}
      {overlay}
      {!listingId && !auction && !overlay ? <Toast message={view.message} stamp={view} /> : null}
      {achievement ? <div className="achievement-toast" role="status"><span aria-hidden="true">★</span>{achievement}</div> : null}
    </div>
  );
}

/** Oyun olaylarına ses/titreşimle karşılık verir; yeni başarımı birkaç saniye gösterir. */
function useFeedback(view: GameView | null): string | null {
  const prev = useRef(view);
  const [achievement, setAchievement] = useState<string | null>(null);
  useEffect(() => {
    const before = prev.current;
    prev.current = view;
    if (!view || !before || before === view) return;
    const a = before.state, b = view.state;
    const fresh = b.achievements.filter((id) => !a.achievements.includes(id));
    if (fresh.length > 0) {
      setAchievement(`Başarım: ${ACHIEVEMENTS[fresh[fresh.length - 1]].title}`);
      cue('achievement');
    } else if (b.stats.sales > a.stats.sales) cue('coin');
    else if (view.lastOffer?.kind === 'accepted' && view.lastOffer !== before.lastOffer) cue('deal');
    else if (view.message && view.message !== before.message && /yetmiyor|dolu|vazgeçti/.test(view.message)) cue('error');
  }, [view]);
  useEffect(() => {
    if (!achievement) return;
    const t = setTimeout(() => setAchievement(null), 3200);
    return () => clearTimeout(t);
  }, [achievement]);
  return achievement;
}
