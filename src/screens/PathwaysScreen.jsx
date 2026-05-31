import { useMemo } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import { pathways } from '../data/pathways';
import { schools } from '../data/schools';
import { C, FF } from '../tokens';

const FALLBACK_PDF = 'https://dualcredit.texarkanacollege.edu/find-your-pathway-plan/';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** True if a pathway is available to the given schoolId */
function pathwayMatchesSchool(pathway, schoolId) {
  if (pathway.school === 'all') return true;
  if (Array.isArray(pathway.school)) return pathway.school.includes(schoolId);
  return false;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ label }) {
  return (
    <div style={{ marginBottom: 8, marginTop: 6 }}>
      <span style={{
        fontFamily: FF, fontSize: 11, fontWeight: 800,
        color: C.blue, textTransform: 'uppercase', letterSpacing: '0.8px',
      }}>
        {label}
      </span>
    </div>
  );
}

function PathwayCard({ pathway, pdfUrl }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      border: `1px solid ${C.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
      marginBottom: 10,
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        background: 'linear-gradient(135deg, #065990, #022b52)',
        padding: '13px 17px',
      }}>
        <span style={{ fontFamily: FF, fontSize: 17, fontWeight: 800, color: '#fff' }}>
          {pathway.title}
        </span>
      </div>

      <div style={{ padding: '13px 17px 15px' }}>
        {/* Description */}
        <p style={{ fontFamily: FF, fontSize: 13, color: C.text2, lineHeight: 1.6, marginBottom: 12 }}>
          {pathway.description}
        </p>

        {/* Course list */}
        <div style={{ marginBottom: 14 }}>
          {pathway.courses.map(c => (
            <div
              key={c.courseId}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                paddingBottom: 5, marginBottom: 5,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <span style={{
                fontFamily: FF, fontSize: 9.5, fontWeight: 700,
                color: C.blue, background: 'rgba(6,89,144,.1)',
                borderRadius: 5, padding: '2px 6px',
                flexShrink: 0, letterSpacing: '0.3px',
              }}>
                {c.courseId}
              </span>
              <span style={{ fontFamily: FF, fontSize: 13, color: C.text, fontWeight: 500 }}>
                {c.name}
              </span>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
          style={{
            width: '100%', height: 40, borderRadius: 12, border: 'none',
            background: '#EAFF00', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'opacity .15s',
          }}
          onMouseDown={e  => e.currentTarget.style.opacity = '0.8'}
          onMouseUp={e    => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onTouchStart={e => e.currentTarget.style.opacity = '0.8'}
          onTouchEnd={e   => e.currentTarget.style.opacity = '1'}
        >
          <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 800, color: '#022b52' }}>
            View Pathway Plan
          </span>
          {/* External link icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="#022b52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function PathwaysScreen({ onNavigate }) {
  // Read school from localStorage
  const stored = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('tcdc_v1') || '{}'); }
    catch { return {}; }
  }, []);
  const role     = stored.role     || 'guest';
  const schoolId = stored.school   || null;

  const isGuest = role === 'guest' || !schoolId;

  // Resolve the school-specific pathway PDF URL (falls back to generic landing page)
  const schoolPdfUrl = useMemo(() => {
    if (isGuest || !schoolId) return FALLBACK_PDF;
    const record = schools.find(s => s.id === (schoolId?.id || schoolId));
    return record?.pathwayPdfUrl || FALLBACK_PDF;
  }, [isGuest, schoolId]);

  // For authenticated users: split into school-specific and universal lists
  const { schoolSpecific, universal } = useMemo(() => {
    if (isGuest) return { schoolSpecific: [], universal: [] };
    const specific = pathways.filter(p => p.school !== 'all' && Array.isArray(p.school));
    const univ     = pathways.filter(p => p.school === 'all');
    const mySpecific = specific.filter(p => p.school.includes(schoolId));
    return { schoolSpecific: mySpecific, universal: univ };
  }, [isGuest, schoolId]);

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader>
        <PageTitle title="Pathway Plans" sub="Choose your academic direction" onBack={() => onNavigate('home')} />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 60px' }}>

        {/* Guest banner */}
        {isGuest && (
          <div style={{
            background: 'rgba(6,89,144,.07)',
            border: '1px solid rgba(6,89,144,.18)',
            borderRadius: 14, padding: '12px 15px', marginBottom: 14,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            {/* Info icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontFamily: FF, fontSize: 13, color: C.blue, fontWeight: 500, lineHeight: 1.6 }}>
              Set up your profile to see pathways available at your school.
            </p>
          </div>
        )}

        {/* Guest: show all pathways unfiltered */}
        {isGuest && pathways.map(p => <PathwayCard key={p.id} pathway={p} pdfUrl={FALLBACK_PDF} />)}

        {/* Authenticated: school-specific first, then universal */}
        {!isGuest && (
          <>
            {schoolSpecific.length > 0 && (
              <>
                <SectionHeader label="Pathways at Your School" />
                {schoolSpecific.map(p => <PathwayCard key={p.id} pathway={p} pdfUrl={schoolPdfUrl} />)}
                <div style={{ marginBottom: 6 }} />
              </>
            )}

            <SectionHeader label="Available to All Schools" />
            {universal.map(p => <PathwayCard key={p.id} pathway={p} pdfUrl={schoolPdfUrl} />)}
          </>
        )}
      </div>
    </div>
  );
}
