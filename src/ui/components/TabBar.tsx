export type Tab = 'ilanlar' | 'garaj' | 'satis' | 'profil';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'ilanlar', label: 'İlanlar', icon: 'M6 3.5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2zM8 8.5h8M8 12.5h8M8 16.5h5' },
  { id: 'garaj', label: 'Garaj', icon: 'M3.5 10.2 12 4l8.5 6.2V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19zM7.5 20.5v-7h9v7M7.5 17h9' },
  { id: 'satis', label: 'Satış', icon: 'M3.5 11.6V5a1.5 1.5 0 0 1 1.5-1.5h6.6a1.5 1.5 0 0 1 1 .44l7.5 7.5a1.5 1.5 0 0 1 0 2.12l-6.6 6.6a1.5 1.5 0 0 1-2.12 0l-7.5-7.5a1.5 1.5 0 0 1-.38-1.06zM8 8h.01' },
  { id: 'profil', label: 'Profil', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0' },
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
