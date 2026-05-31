import { C, FF } from '../tokens';

function NavIcon({ id, active }) {
  const col = active ? C.blue : C.text3;
  const sw  = active ? 2.2 : 1.8;
  const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: col, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };

  if (id === 'more') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={col}>
        <circle cx="12" cy="5"  r="1.75"/>
        <circle cx="12" cy="12" r="1.75"/>
        <circle cx="12" cy="19" r="1.75"/>
      </svg>
    );
  }

  const icons = {
    home:      <svg {...base}><path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 22V12h6v10"/></svg>,
    acdc:      <svg {...base}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    academics: <svg {...base}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    pathways:  <svg {...base}><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M12 19h4.5a3.5 3.5 0 000-7h-8a3.5 3.5 0 010-7H12"/></svg>,
    resources: <svg {...base}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    dates:     <svg {...base}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  };
  return icons[id] || null;
}

const BLUE = '#065990';

export default function BottomNav({ active, onNavigate, tabs }) {
  return (
    <div className="tc-bottom-nav" style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Tab bar */}
      <div style={{
        height: 80,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: 8,
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

      {/* Logo footer */}
      <div style={{
        background: BLUE,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4px 0',
        paddingBottom: 'calc(4px + env(safe-area-inset-bottom, 0px))',
      }}>
        <img
          src="/tcdclogo.png?v=2"
          alt="TC Dual Credit"
          style={{ width: 72, display: 'block', opacity: 0.85 }}
        />
      </div>
    </div>
  );
}
