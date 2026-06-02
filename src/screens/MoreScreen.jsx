import { useState } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { useIsTablet } from '../hooks/useIsTablet';
import { C, FF } from '../tokens';
import { resources } from '../data/resources';

const BLUE      = '#065990';
const DARK      = '#022b52';
const LIME      = '#EAFF00';

const FULL_SCHOOL_NAMES = {
  txh:          'Texas High School',
  le:           'Liberty-Eylau High School',
  hooks:        'Hooks High School',
  pg:           'Pleasant Grove High School',
  bloomburg:    'Bloomburg High School',
  avery:        'Avery High School',
  dekalb:       'DeKalb High School',
  maud:         'Maud High School',
  prem:         'Premier High School',
  nb:           'New Boston High School',
  simms:        'James Bowie High School',
  atlanta:      'Atlanta High School',
  qc:           'Queen City High School',
  mcleod:       'McLeod High School',
  lk:           'Linden-Kildare High School',
  rw:           'Redwater High School',
  datx:         'Digital Academy of Texas',
  'ar-premier': 'Premier High School - Arkansas',
};

function getStoredSchool() {
  try { return JSON.parse(localStorage.getItem('tcdc_v1') || '{}').school || null; } catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// Resources panel — collapsible dropdown, all roles
// ─────────────────────────────────────────────────────────────────────────────
const RES_TYPE_COLORS = { pdf: '#b91c1c', video: '#6d28d9', website: '#0d7654', info: '#0369a1' };
const RES_TYPE_LABELS = { pdf: 'Document', video: 'Video', website: 'Website', info: 'Info' };
const RES_FILTERS = [['all','All'],['pdf','Document'],['video','Video'],['website','Website'],['info','Info']];

function ResourcesPanel() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? resources : resources.filter(r => r.type === filter);

  return (
    <div style={{ position: 'relative', zIndex: open ? 20 : 1, marginBottom: 14 }}>
      {/* Header tap target */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: '#fff', border: `1px solid ${C.border}`,
          borderRadius: open ? '20px 20px 0 0' : 20,
          boxShadow: open ? '0 2px 0 rgba(0,0,0,.04)' : '0 2px 10px rgba(0,0,0,.05)',
          padding: '15px 17px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
          transition: 'border-radius .22s', boxSizing: 'border-box',
        }}
      >
        {/* Open book icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: `linear-gradient(135deg, ${DARK}, ${BLUE})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 900, color: C.text, letterSpacing: '-0.3px' }}>Resources</div>
          <div style={{ fontFamily: FF, fontSize: 12, color: C.text3, marginTop: 1 }}>Additional information, Documents, Websites, Videos</div>
        </div>

        {/* Item count pill */}
        <div style={{ background: 'rgba(6,89,144,.07)', borderRadius: 20, padding: '3px 9px', flexShrink: 0 }}>
          <span style={{ fontFamily: FF, fontSize: 10, fontWeight: 700, color: BLUE }}>{resources.length} items</span>
        </div>

        {/* Rotating chevron */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"
          style={{ flexShrink: 0, transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Expanded panel */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#fff', border: `1px solid ${C.border}`, borderTop: 'none',
          borderRadius: '0 0 20px 20px', boxShadow: '0 16px 40px rgba(0,0,0,.14)',
          padding: '12px 12px 16px', zIndex: 20, maxHeight: 460, overflowY: 'auto',
        }}>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
            {RES_FILTERS.map(([id, label]) => (
              <button
                key={id}
                onClick={e => { e.stopPropagation(); setFilter(id); }}
                style={{
                  flexShrink: 0, height: 28, padding: '0 11px', borderRadius: 20,
                  border: 'none', cursor: 'pointer',
                  background: filter === id ? BLUE : 'rgba(6,89,144,.08)',
                  transition: 'background .15s',
                }}
              >
                <span style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: filter === id ? '#fff' : BLUE }}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Resource rows */}
          {list.map(r => {
            const col = RES_TYPE_COLORS[r.type] || C.text3;
            const tag = RES_TYPE_LABELS[r.type] || r.type;
            return (
              <button
                key={r.id}
                onClick={() => window.open(r.url, '_blank', 'noopener,noreferrer')}
                style={{
                  width: '100%', background: C.bg, border: `1px solid ${C.border}`,
                  borderRadius: 13, padding: '11px 12px', marginBottom: 6,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 10, textAlign: 'left',
                  boxSizing: 'border-box', transition: 'transform .1s',
                }}
                onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: C.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.title}
                </span>
                <span style={{
                  fontFamily: FF, fontSize: 9.5, fontWeight: 700,
                  color: col, background: `${col}14`,
                  borderRadius: 6, padding: '2px 7px',
                  textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0,
                }}>
                  {tag}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pathways button — school-colored for known school, plain blue for guests
// ─────────────────────────────────────────────────────────────────────────────
function PathwaysButton({ onNavigate, schoolOverride }) {
  const stored     = getStoredSchool();
  const schoolObj  = schoolOverride || stored;
  const schoolId   = schoolObj?.id   || null;
  const schoolName = schoolId ? (FULL_SCHOOL_NAMES[schoolId] || schoolObj?.name || 'Your School') : null;
  const bgColor    = schoolObj?.color     || BLUE;
  const txtColor   = schoolObj?.textColor || '#ffffff';

  const label = schoolName ? `Pathway Plans at ${schoolName}` : 'Browse Pathway Plans';

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => onNavigate('pathways')}
        style={{
          width: '100%', background: bgColor, border: 'none',
          borderRadius: 14, padding: '14px 15px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
          textAlign: 'left', boxSizing: 'border-box',
          boxShadow: '0 2px 10px rgba(0,0,0,.12)',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(255,255,255,.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={txtColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/>
            <path d="M12 19h4.5a3.5 3.5 0 000-7h-8a3.5 3.5 0 010-7H12"/>
          </svg>
        </div>
        <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: txtColor, flex: 1, lineHeight: 1.3 }}>
          {label}
        </span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={txtColor} strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.7, flexShrink: 0 }}>
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Guest — minimal profile CTA
// ─────────────────────────────────────────────────────────────────────────────
function GuestMoreScreen({ onChangeRole, onNavigate, tabs }) {
  const isTablet = useIsTablet();
  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:C.bg, display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, overflowY:'auto', padding: isTablet ? '40px 24px 40px' : '24px 14px 150px', paddingTop:'calc(env(safe-area-inset-top, 0px) + 24px)', position:'relative' }}>
        {/* Profile CTA card */}
        <div style={{
          width:'100%', background:'#fff', borderRadius:28,
          border:`1px solid ${C.border}`,
          boxShadow:'0 4px 24px rgba(6,89,144,.09)',
          padding:'36px 24px 32px',
          display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
          marginBottom: 14,
        }}>
          {/* TC logo mark */}
          <div style={{
            width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg,#022b52,#065990)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 28px rgba(6,89,144,.3)',
            marginBottom:20,
          }}>
            <span style={{ fontFamily:FF, fontSize:28, fontWeight:900, color:LIME, letterSpacing:'-1px' }}>TC</span>
          </div>

          <div style={{ fontFamily:FF, fontSize:22, fontWeight:900, color:DARK, letterSpacing:'-0.5px', marginBottom:10 }}>
            Set Up Your Profile
          </div>
          <p style={{ fontFamily:FF, fontSize:14, color:C.text2, lineHeight:1.6, margin:'0 0 28px' }}>
            Unlock the full Dual Credit mobile app experience.
          </p>

          <button
            onClick={onChangeRole}
            style={{
              width:'100%', height:54, background:LIME, border:'none', borderRadius:16,
              cursor:'pointer', boxShadow:'0 4px 20px rgba(234,255,0,.35)',
            }}
          >
            <span style={{ fontFamily:FF, fontSize:16, fontWeight:900, color:DARK }}>Get Started</span>
          </button>
        </div>

        {/* Pathways — guest gets generic blue button */}
        <PathwaysButton onNavigate={onNavigate} schoolOverride={null} />

        {/* ACDC Staff Portal */}
        <button
          onClick={() => onNavigate('acdc_portal')}
          style={{
            width: '100%', background: '#fff', border: `1px solid ${C.border}`,
            borderRadius: 14, padding: '13px 15px', marginBottom: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            textAlign: 'left', boxSizing: 'border-box',
            boxShadow: '0 2px 8px rgba(0,0,0,.04)',
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `${BLUE}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text }}>ACDC Staff Portal</div>
            <div style={{ fontFamily: FF, fontSize: 12, color: C.text3, marginTop: 1 }}>For Academic Coaches — look up your profile & toolkit</div>
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>

      </div>
      <BottomNav active="more" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────
export default function MoreScreen({ role, school, grade, onChangeRole, onChangeSchool, onNavigate, tabs }) {
  const isTablet = useIsTablet();

  if (role === 'guest') {
    return <GuestMoreScreen onChangeRole={onChangeRole} onNavigate={onNavigate} tabs={tabs} />;
  }

  const profileRows = [
    { label: 'Change My School', icon: 'school', action: onChangeSchool },
    { label: 'Change My Role',   icon: 'role',   action: onChangeRole   },
  ];

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader style={{ paddingBottom: 52 }}>
        <PageTitle title="More" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: isTablet ? '0 24px 40px' : '0 14px 150px', marginTop: -42, position: 'relative' }}>

        {/* Resources — all roles */}
        <ResourcesPanel />

        {/* Pathways — school-colored button */}
        <PathwaysButton onNavigate={onNavigate} schoolOverride={school} />

        {/* ACDC Staff Portal */}
        <button
          onClick={() => onNavigate('acdc_portal')}
          style={{
            width: '100%', background: '#fff', border: `1px solid ${C.border}`,
            borderRadius: 14, padding: '13px 15px', marginBottom: 16,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            textAlign: 'left', boxSizing: 'border-box',
            boxShadow: '0 2px 8px rgba(0,0,0,.04)',
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `${BLUE}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text }}>ACDC Staff Portal</div>
            <div style={{ fontFamily: FF, fontSize: 12, color: C.text3, marginTop: 1 }}>For Academic Coaches — look up your profile & toolkit</div>
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        {/* Profile settings */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 8, paddingLeft: 4 }}>Profile</div>
          {profileRows.map(row => (
            <button
              key={row.label}
              onClick={row.action}
              style={{ width: '100%', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '13px 15px', marginBottom: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', boxSizing: 'border-box' }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6,89,144,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {row.icon === 'school'
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                }
              </div>
              <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 600, color: C.text, flex: 1 }}>{row.label}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>

        {/* App version */}
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '13px 15px', display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
          <span style={{ fontFamily: FF, fontSize: 13, color: C.text2 }}>App Version</span>
          <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 600, color: C.text3 }}>1.0 Beta</span>
        </div>

        <div style={{ textAlign: 'center', paddingBottom: 10 }}>
          <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 900, color: C.blue, letterSpacing: '-0.3px' }}>TC Dual Credit</div>
          <div style={{ fontFamily: FF, fontSize: 11, color: C.text3, marginTop: 2 }}>Texarkana College</div>
        </div>

      </div>

      <BottomNav active="more" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
