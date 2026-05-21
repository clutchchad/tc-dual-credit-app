import { C, FF } from '../tokens';

function NavIcon({ id, active }) {
  const col = active ? C.blue : C.text3;
  const sw  = active ? 2.2 : 1.8;
  const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: col, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };

  const icons = {
    home:      <svg {...base}><path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 22V12h6v10"/></svg>,
    acdc:      <svg {...base}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    resources: <svg {...base}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 9h8M8 13h5"/></svg>,
    events:    <svg {...base}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    settings:  <svg {...base}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  };
  return icons[id] || null;
}

export default function BottomNav({ active, onNavigate, tabs }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 80,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${C.border}`,
      display: 'flex',
      alignItems: 'flex-start',
      paddingTop: 8,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 100,
    }}>
      {tabs.map(tab => {
        const on = active === tab.screen;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.screen)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
              position: 'relative',
            }}
          >
            {on && (
              <div style={{
                position: 'absolute', top: -8,
                width: 24, height: 3,
                borderRadius: 2,
                background: C.blue,
              }} />
            )}
            <NavIcon id={tab.id} active={on} />
            <span style={{
              fontFamily: FF,
              fontSize: 9.5,
              fontWeight: on ? 700 : 500,
              color: on ? C.blue : C.text3,
              letterSpacing: '0.1px',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
