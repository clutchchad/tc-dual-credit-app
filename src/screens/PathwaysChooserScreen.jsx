import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { useIsTablet } from '../hooks/useIsTablet';
import { C, FF } from '../tokens';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

export default function PathwaysChooserScreen({ school, role, onNavigate, tabs }) {
  const isTablet = useIsTablet();

  const hsBg      = school?.color     || `linear-gradient(135deg, ${DARK}, ${BLUE})`;
  const hsTxt     = school?.textColor || '#ffffff';
  const hsSubTxt  = school ? 'rgba(255,255,255,.70)' : 'rgba(255,255,255,.70)';
  const hsSub     = school ? `Pathway plans at ${school.name}` : 'Select your high school to see your pathway options';

  const handleHighSchool = () => {
    if (!school) onNavigate('onboard_school');
    else onNavigate('pathways');
  };

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle title="Pathways" sub="Choose your pathway type" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: isTablet ? '16px 28px 40px' : '16px 14px 140px', marginTop: -24 }}>

        {/* High School Pathway — school color */}
        <button
          onClick={handleHighSchool}
          style={{
            width: '100%', borderRadius: 20,
            padding: '20px 18px', marginBottom: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
            textAlign: 'left', boxSizing: 'border-box', border: 'none',
            background: hsBg,
            boxShadow: '0 4px 18px rgba(0,0,0,.18)',
          }}
          onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={hsTxt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/>
              <path d="M12 19h4.5a3.5 3.5 0 000-7h-8a3.5 3.5 0 010-7H12"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FF, fontSize: 16, fontWeight: 900, color: hsTxt, letterSpacing: '-0.3px', marginBottom: 4 }}>
              High School Pathway
            </div>
            <div style={{ fontFamily: FF, fontSize: 12.5, color: hsSubTxt, lineHeight: 1.45 }}>
              {hsSub}
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hsTxt} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, opacity: 0.7 }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* Transfer Pathway */}
        <button
          onClick={() => onNavigate('transfer')}
          style={{
            width: '100%', borderRadius: 20,
            padding: '20px 18px', marginBottom: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
            textAlign: 'left', boxSizing: 'border-box',
            background: '#fff', border: `1px solid ${C.border}`,
            boxShadow: '0 2px 12px rgba(0,0,0,.06)',
          }}
          onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: `${BLUE}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FF, fontSize: 16, fontWeight: 900, color: C.text, letterSpacing: '-0.3px', marginBottom: 4 }}>
              Transfer Pathway
            </div>
            <div style={{ fontFamily: FF, fontSize: 12.5, color: C.text3, lineHeight: 1.45 }}>
              Explore transfer options to four-year universities
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

      </div>

      <BottomNav active="pathways_chooser" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
