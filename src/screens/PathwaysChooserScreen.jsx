import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { useIsTablet } from '../hooks/useIsTablet';
import { C, FF } from '../tokens';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

export default function PathwaysChooserScreen({ school, role, onNavigate, tabs }) {
  const isTablet = useIsTablet();

  const handleHighSchool = () => {
    if (!school) {
      onNavigate('onboard_school');
    } else {
      onNavigate('pathways');
    }
  };

  const cards = [
    {
      key: 'hs',
      title: 'High School Pathway',
      sub: school
        ? `Pathway plans at ${school.name}`
        : 'Select your high school to see your pathway options',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/>
          <path d="M12 19h4.5a3.5 3.5 0 000-7h-8a3.5 3.5 0 010-7H12"/>
        </svg>
      ),
      onTap: handleHighSchool,
      primary: true,
    },
    {
      key: 'transfer',
      title: 'Transfer Pathway',
      sub: 'Explore transfer options to four-year universities',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9"/>
          <path d="M3 11V9a4 4 0 014-4h14"/>
          <polyline points="7 23 3 19 7 15"/>
          <path d="M21 13v2a4 4 0 01-4 4H3"/>
        </svg>
      ),
      onTap: () => onNavigate('transfer'),
      primary: false,
    },
  ];

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle title="Pathways" sub="Choose your pathway type" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: isTablet ? '16px 28px 40px' : '16px 14px 140px', marginTop: -24 }}>
        {cards.map(card => (
          <button
            key={card.key}
            onClick={card.onTap}
            style={{
              width: '100%', borderRadius: 20,
              padding: '20px 18px',
              marginBottom: 14,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 16,
              textAlign: 'left', boxSizing: 'border-box',
              background: card.primary ? `linear-gradient(135deg, ${DARK}, ${BLUE})` : '#fff',
              boxShadow: card.primary ? '0 6px 28px rgba(6,89,144,.28)' : `0 2px 12px rgba(0,0,0,.06)`,
              border: card.primary ? 'none' : `1px solid ${C.border}`,
            }}
            onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: card.primary ? 'rgba(255,255,255,.12)' : `${BLUE}10`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {card.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: FF, fontSize: 16, fontWeight: 900,
                color: card.primary ? '#fff' : C.text,
                letterSpacing: '-0.3px', marginBottom: 4,
              }}>
                {card.title}
              </div>
              <div style={{
                fontFamily: FF, fontSize: 12.5,
                color: card.primary ? 'rgba(255,255,255,.7)' : C.text3,
                lineHeight: 1.45,
              }}>
                {card.sub}
              </div>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={card.primary ? 'rgba(255,255,255,.6)' : C.text3}
              strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>

      <BottomNav active="pathways_chooser" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
