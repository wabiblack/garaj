import { useState } from 'react';
import { TabBar, type Tab } from './components/TabBar';

export default function App() {
  const [tab, setTab] = useState<Tab>('ilanlar');
  return (
    <div className="app">
      <main className="screen" />
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
