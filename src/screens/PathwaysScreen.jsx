import { useMemo } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { PATHWAYS } from '../data/pathways';
import { SCHOOLS } from '../data/schools';
import { C, FF } from '../tokens';

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function PathwaysScreen({ onNavigate, tabs }) {
  // Read school from localStorage
  const stored = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('tcdc_v1') || '{}'); }
    catch { return {}; }
  }, []);

  const schoolId = stored.school || null;
  const school = useMemo(() => {
    if (!schoolId) return null;
    return SCHOOLS.find(s => s.id === schoolId);
  }, [schoolId]);

  const pathways = useMemo(() => {
    if (!school) return [];
    return PATHWAYS.filter(p => p.school === school.id);
  }, [school]);

  const isGuest = !school;

  const handlePathwayClick = (pdfUrl) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      {!isGuest && (
        <div style={{ backgroundColor: school.color, height: 64, display: 'flex', alignItems: 'center', paddingLeft: 14, paddingRight: 14 }}>
          <span style={{ fontFamily: FF, fontSize: 18, fontWeight: 800, color: school.textColor || '#ffffff' }}>
            {school.name}
          </span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 80px' }}>
        {isGuest ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 400, textAlign: 'center', paddingTop: 40,
          }}>
            <div style={{
              background: '#fff', borderRadius: 16, padding: '32px 24px', maxWidth: 320,
              boxShadow: '0 2px 8px rgba(0,0,0,.06)',
            }}>
              <p style={{ fontFamily: FF, fontSize: 15, color: '#374151', fontWeight: 500, marginBottom: 24, lineHeight: 1.6 }}>
                Select your school to see available pathway plans
              </p>
              <button
                onClick={() => onNavigate('onboard_role')}
                style={{
                  width: '100%', height: 46, borderRadius: 12, border: 'none',
                  background: '#EAFF00', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FF, fontSize: 14, fontWeight: 900, color: '#022b52',
                  transition: 'opacity .15s',
                }}
                onMouseDown={e => e.currentTarget.style.opacity = '0.8'}
                onMouseUp={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                onTouchStart={e => e.currentTarget.style.opacity = '0.8'}
                onTouchEnd={e => e.currentTarget.style.opacity = '1'}
              >
                Set Up My Profile
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 6 }}>
              <h2 style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: '#1f2937', marginBottom: 2, letterSpacing: '-0.3px' }}>
                Pathway Plans at {school.name}
              </h2>
              <p style={{ fontFamily: FF, fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                Tap any pathway to open the full Early Enrollment Pathway Plan PDF.
              </p>
            </div>

            <div style={{ marginTop: 14 }}>
              {pathways.length > 0 ? (
                pathways.map(pathway => {
                  const displayName = pathway.name.replace(/^EEPP\s*–\s*/, '');
                  return (
                    <button
                      key={pathway.id}
                      onClick={() => handlePathwayClick(pathway.pdfUrl)}
                      style={{
                        width: '100%', background: '#fff', border: `1px solid ${C.border}`,
                        borderRadius: 12, padding: '16px 14px', marginBottom: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer', transition: 'box-shadow .15s, transform .15s',
                        boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                      }}
                      onMouseDown={e => {
                        e.currentTarget.style.transform = 'scale(0.98)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.1)';
                      }}
                      onMouseUp={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)';
                      }}
                      onTouchStart={e => {
                        e.currentTarget.style.transform = 'scale(0.98)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.1)';
                      }}
                      onTouchEnd={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)';
                      }}
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
                  No pathways available for your school.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav active="pathways" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
