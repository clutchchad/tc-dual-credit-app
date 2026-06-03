import { useMemo, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { BlueHeader } from '../components/BlueHeader';
import { useIsTablet } from '../hooks/useIsTablet';
import { PATHWAYS } from '../data/pathways';
import { SCHOOLS } from '../data/schools';
import { C, FF } from '../tokens';

const FULL_SCHOOL_NAMES = {
  txh:       'Texas High School',
  le:        'Liberty-Eylau High School',
  hooks:     'Hooks High School',
  pg:        'Pleasant Grove High School',
  bloomburg: 'Bloomburg High School',
  avery:     'Avery High School',
  dekalb:    'DeKalb High School',
  maud:      'Maud High School',
  prem:      'Premier High School',
  nb:        'New Boston High School',
  simms:     'James Bowie High School',
  atlanta:   'Atlanta High School',
  qc:        'Queen City High School',
  mcleod:    'McLeod High School',
  lk:        'Linden-Kildare High School',
  rw:        'Redwater High School',
  datx:      'Digital Academy of Texas',
  'ar-premier': 'Premier High School - Arkansas',
};

function getFullSchoolName(id) {
  return FULL_SCHOOL_NAMES[id] || id;
}

// ── School color bar ──────────────────────────────────────────────────────────

function SchoolColorBar({ school, onBack }) {
  const textColor = school.textColor || '#ffffff';
  return (
    <div style={{
      backgroundColor: school.color,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 14,
      paddingRight: 14,
      flexShrink: 0,
      gap: 8,
    }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px 0 0', display: 'flex', alignItems: 'center' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}
      <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 700, color: textColor }}>
        Pathway Plans at {getFullSchoolName(school.id)}
      </span>
    </div>
  );
}

// ── Pathway list (scrollable cards) ──────────────────────────────────────────

function PathwayList({ school, isTablet }) {
  const pathways = useMemo(
    () => PATHWAYS.filter(p => p.school === school.id),
    [school.id]
  );

  const sidePad  = isTablet ? '14px 24px 40px' : '14px 14px 150px';
  const gridCols = isTablet ? 'repeat(2, 1fr)' : '1fr';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: sidePad }}>
      <p style={{ fontFamily: FF, fontSize: isTablet ? 14 : 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 14 }}>
        Tap any pathway to open the full Early Enrollment Pathway Plan.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isTablet ? 10 : 0 }}>
        {pathways.length > 0 ? (
          pathways.map(pathway => {
            const displayName = pathway.name.replace(/^EEPP\s*–\s*/, '');
            return (
              <button
                key={pathway.id}
                onClick={() => window.open(pathway.pdfUrl, '_blank', 'noopener,noreferrer')}
                style={{
                  width: '100%', background: '#fff', border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '16px 14px', marginBottom: isTablet ? 0 : 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'box-shadow .15s, transform .15s',
                  boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.1)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}
                onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.1)'; }}
                onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}
              >
                <span style={{ fontFamily: FF, fontSize: isTablet ? 16 : 15, fontWeight: 600, color: '#1f2937', textAlign: 'left' }}>
                  {displayName}
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#065990" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            );
          })
        ) : (
          <p style={{ fontFamily: FF, fontSize: 13, color: '#6b7280', textAlign: 'center', paddingTop: 40 }}>
            No pathways available for this school.
          </p>
        )}
      </div>
    </div>
  );
}

// ── School picker for guests ──────────────────────────────────────────────────

const BROWSABLE_SCHOOLS = SCHOOLS.filter(s => !s.unassigned);

function SchoolPicker({ onSelect, isTablet }) {
  const sidePad  = isTablet ? '20px 24px 80px' : '20px 14px 150px';
  const gridCols = isTablet ? 'repeat(2, 1fr)' : '1fr';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: sidePad }}>
      <h2 style={{ fontFamily: FF, fontSize: isTablet ? 26 : 22, fontWeight: 900, color: '#1f2937', marginBottom: 4, letterSpacing: '-0.3px' }}>
        Browse Pathway Plans
      </h2>
      <p style={{ fontFamily: FF, fontSize: isTablet ? 14 : 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 20 }}>
        Select a high school to explore available dual credit pathways.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: isTablet ? 10 : 0 }}>
        {BROWSABLE_SCHOOLS.map(school => (
          <button
            key={school.id}
            onClick={() => onSelect(school)}
            style={{
              width: '100%', background: school.color, border: `1px solid ${school.color}`,
              borderRadius: 12, padding: '16px 14px', marginBottom: isTablet ? 0 : 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', transition: 'box-shadow .15s',
              boxShadow: '0 1px 3px rgba(0,0,0,.12)',
            }}
            onMouseDown={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.22)'; }}
            onMouseUp={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.12)'; }}
            onTouchStart={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.22)'; }}
            onTouchEnd={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.12)'; }}
          >
            <span style={{ fontFamily: FF, fontSize: isTablet ? 16 : 15, fontWeight: 600, color: school.textColor }}>
              {school.name}
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={school.textColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function PathwaysScreen({ onNavigate, tabs }) {
  const isTablet = useIsTablet();
  const [browsingSchool, setBrowsingSchool] = useState(null);

  const stored = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('tcdc_v1') || '{}'); }
    catch { return {}; }
  }, []);

  const rawSchool = stored.school || null;
  const schoolId = rawSchool
    ? (typeof rawSchool === 'object' ? rawSchool.id : rawSchool)
    : null;
  const school = useMemo(() => {
    if (!schoolId) return null;
    return SCHOOLS.find(s => s.id === schoolId);
  }, [schoolId]);

  const isGuest = !school;
  const activeSchool = isGuest ? browsingSchool : school;

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Standard blue header — always Royal Blue */}
      <BlueHeader />

      {/* School color bar — shown when a school is active */}
      {activeSchool && (
        <SchoolColorBar
          school={activeSchool}
          onBack={isGuest && browsingSchool ? () => setBrowsingSchool(null) : null}
        />
      )}

      {/* Main content */}
      {activeSchool ? (
        <PathwayList school={activeSchool} isTablet={isTablet} />
      ) : (
        <SchoolPicker onSelect={setBrowsingSchool} isTablet={isTablet} />
      )}

      <BottomNav active="pathways" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
