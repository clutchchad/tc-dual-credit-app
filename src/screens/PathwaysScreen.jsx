import { useMemo, useState } from 'react';
import BottomNav from '../components/BottomNav';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import { PATHWAYS } from '../data/pathways';
import { SCHOOLS } from '../data/schools';
import { C, FF } from '../tokens';

// ── School color bar ──────────────────────────────────────────────────────────

function SchoolColorBar({ school, onBack }) {
  return (
    <div style={{
      backgroundColor: school.color,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 14,
      paddingRight: 14,
      flexShrink: 0,
    }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px 0 0', display: 'flex', alignItems: 'center' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={school.textColor || '#ffffff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}
      <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 700, color: school.textColor || '#ffffff' }}>
        Pathway Plans at {school.name}
      </span>
    </div>
  );
}

// ── Pathway list (scrollable cards) ──────────────────────────────────────────

function PathwayList({ school }) {
  const pathways = useMemo(
    () => PATHWAYS.filter(p => p.school === school.id),
    [school.id]
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 80px' }}>
      <p style={{ fontFamily: FF, fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 14 }}>
        Tap any pathway to open the full Early Enrollment Pathway Plan.
      </p>

      <div>
        {pathways.length > 0 ? (
          pathways.map(pathway => {
            const displayName = pathway.name.replace(/^EEPP\s*–\s*/, '');
            return (
              <button
                key={pathway.id}
                onClick={() => window.open(pathway.pdfUrl, '_blank', 'noopener,noreferrer')}
                style={{
                  width: '100%', background: '#fff', border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '16px 14px', marginBottom: 10,
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
                <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 600, color: '#1f2937', textAlign: 'left' }}>
                  {displayName}
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EAFF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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

function SchoolPicker({ onSelect }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 14px 80px' }}>
      <h2 style={{ fontFamily: FF, fontSize: 22, fontWeight: 900, color: '#1f2937', marginBottom: 4, letterSpacing: '-0.3px' }}>
        Browse Pathway Plans
      </h2>
      <p style={{ fontFamily: FF, fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 20 }}>
        Select a high school to explore available dual credit pathways.
      </p>

      <div>
        {BROWSABLE_SCHOOLS.map(school => (
          <button
            key={school.id}
            onClick={() => onSelect(school)}
            style={{
              width: '100%', background: '#fff', border: `1px solid ${C.border}`,
              borderRadius: 12, padding: '16px 14px', marginBottom: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', transition: 'box-shadow .15s',
              boxShadow: '0 1px 3px rgba(0,0,0,.06)',
            }}
            onMouseDown={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.1)'; }}
            onMouseUp={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}
            onTouchStart={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.1)'; }}
            onTouchEnd={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: school.color, flexShrink: 0 }} />
              <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 600, color: '#1f2937' }}>
                {school.name}
              </span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EAFF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
      <BlueHeader>
        <PageTitle title="Pathways" />
      </BlueHeader>

      {/* School color bar — shown when a school is active */}
      {activeSchool && (
        <SchoolColorBar
          school={activeSchool}
          onBack={isGuest && browsingSchool ? () => setBrowsingSchool(null) : null}
        />
      )}

      {/* Main content */}
      {activeSchool ? (
        <PathwayList school={activeSchool} />
      ) : (
        <SchoolPicker onSelect={setBrowsingSchool} />
      )}

      <BottomNav active="pathways" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
