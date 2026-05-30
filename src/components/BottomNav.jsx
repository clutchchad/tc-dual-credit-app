import { C, FF } from '../tokens';

const LIME = '#EAFF00';

function NavIcon({ id, active }) {
  // The "more" tab uses Electric Lime when active; all others use brand blue
  const col = active ? (id === 'more' ? LIME : C.blue) : C.text3;
  const sw  = active ? 2.2 : 1.8;
  const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: col, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };

  if (id === 'more') {
    // Vertical three-dot ellipsis — filled circles, no stroke
    const dotCol = active ? LIME : C.text3;
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={dotCol}>
        <circle cx="12" cy="5"  r="1.75"/>
        <circle cx="12" cy="12" r="1.75"/>
        <circle cx="12" cy="19" r="1.75"/>
      </svg>
    );
  }

  const icons = {
    home:      <svg {...base}><path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 22V12h6v10"/></svg>,
    acdc:      <svg {...base}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    resources: <svg {...base}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 9h8M8 13h5"/></svg>,
    events:    <svg {...base}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
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
        const isMore = tab.id === 'more';
        const activeColor = isMore ? LIME : C.blue;

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
                background: activeColor,
              }} />
            )}
            <NavIcon id={tab.id} active={on} />
            <span style={{
              fontFamily: FF,
              fontSize: 9.5,
              fontWeight: on ? 700 : 500,
              color: on ? activeColor : C.text3,
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
