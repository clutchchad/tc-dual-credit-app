import { FF } from '../tokens';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

function NavIcon({ id, active }) {
  const col = active ? DARK : 'rgba(255,255,255,0.78)';
  const sw  = active ? 2.2 : 1.8;
  const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: col, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };

  if (id === 'more') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={col}>
        <circle cx="12" cy="5"  r="1.75"/>
        <circle cx="12" cy="12" r="1.75"/>
        <circle cx="12" cy="19" r="1.75"/>
      </svg>
    );
  }

  const icons = {
    home:      <svg {...base}><path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 22V12h6v10"/></svg>,
    acdc:      <svg {...base}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    pathways:  <svg {...base}><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M12 19h4.5a3.5 3.5 0 000-7h-8a3.5 3.5 0 010-7H12"/></svg>,
    transfer:  <svg {...base}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
    resources: <svg {...base}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  };
  return icons[id] || null;
}

export default function SideNav({ active, onNavigate, tabs }) {
  return (
    <div style={{
      width: 220,
      height: '100%',
      background: BLUE,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)',
      paddingBottom: 20,
      borderRight: '1px solid rgba(255,255,255,0.08)',
      zIndex: 10,
    }}>
      {/* TC branding */}
      <div style={{ padding: '0 20px 28px' }}>
        <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: LIME, letterSpacing: '-0.5px', lineHeight: 1 }}>TC</div>
        <div style={{ fontFamily: FF, fontSize: 11, color: 'rgba(255,255,255,0.50)', marginTop: 2 }}>Dual Credit</div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' }}>
        {tabs.map(tab => {
          const on = active === tab.screen;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.screen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: on ? LIME : 'transparent',
                transition: 'background .15s',
                textAlign: 'left',
              }}
            >
              <NavIcon id={tab.id} active={on} />
              <span style={{
                fontFamily: FF,
                fontSize: 14,
                fontWeight: on ? 800 : 600,
                color: on ? DARK : 'rgba(255,255,255,0.85)',
                letterSpacing: '-0.1px',
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
