import { useState } from 'react';
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

export default function App() {
  const { view, broken, dispatch, reset } = useGame();
  const [tab, setTab] = useState<Tab>('ilanlar');
  const [listingId, setListingId] = useState<string | null>(null);

  if (broken || !view) return <BrokenSaveScreen onReset={reset} />;
  const { state } = view;
  const overlay = state.pendingTransition !== null
    ? <TransitionScreen to={state.pendingTransition} onContinue={() => dispatch({ type: 'completeTransition' })} />
    : state.phase === 'evening'
      ? <EveningScreen view={view} dispatch={dispatch} />
      : state.won && !state.wonSeen
        ? <EndScreen state={state} onContinue={() => dispatch({ type: 'dismissWin' })} />
        : null;

  return (
    <div className="app">
      <TopBar state={state} onEndDay={() => dispatch({ type: 'endDay' })} />
      <main className="screen">
        {tab === 'ilanlar' ? <ListingsScreen state={state} onOpen={setListingId} /> : null}
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
      {overlay}
      {!listingId && !overlay ? <Toast message={view.message} stamp={view} /> : null}
    </div>
  );
}
