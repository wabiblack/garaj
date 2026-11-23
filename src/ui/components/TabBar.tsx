export type Tab = 'ilanlar' | 'garaj' | 'satis' | 'profil';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'ilanlar', label: 'İlanlar', icon: 'M4 5h16M4 12h16M4 19h10' },
  { id: 'garaj', label: 'Garaj', icon: 'M3 10l9-6 9 6v10H3zM7 20v-6h10v6' },
  { id: 'satis', label: 'Satış', icon: 'M4 12l8-8h8v8l-8 8zM15 9h.01' },
  { id: 'profil', label: 'Profil', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0' },
];

export function TabBar({ active, onChange, badges = {} }: {
  active: Tab;
  onChange(tab: Tab): void;
  badges?: Partial<Record<Tab, number>>;
}) {
  return (
    <nav className="tabbar" role="tablist" aria-label="Ana menü">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={'tab' + (active === t.id ? ' tab--active' : '')}
          onClick={() => onChange(t.id)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="tab__icon">
            <path d={t.icon} />
          </svg>
          <span>{t.label}</span>
          {badges[t.id] ? <span className="tab__badge" aria-hidden="true">{badges[t.id]}</span> : null}
        </button>
      ))}
    </nav>
  );
}
