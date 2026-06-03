/**
 * AcdcHomeScreen — ACDC Staff Portal shell with five-tab bottom navigation.
 *
 * Tabs: Home | Contact Card | Pathways | Resources | More
 *
 * Home      — coach identity header + toolkit action cards
 * Contact Card — AcdcProfileTab (coach views their own public card)
 * Pathways  — pathway plans filtered to only the coach's assigned schools
 * Resources — AcdcResourcesTab (same resource library as student experience)
 * More      — AcdcMoreTab (Sign Out → returns to role selection)
 *
 * FERPA-safe: no student data stored, displayed, or queried anywhere in this file.
 * All email/SMS actions are native device hand-offs (mailto:, sms:) with no
 * recipient address, message body, or send record stored by this app.
 */
import { useState, useMemo } from 'react';
import { C, FF } from '../tokens';
import BottomNav from '../components/BottomNav';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import AcdcProfileTab  from './AcdcProfileTab';
import AcdcResourcesTab from './AcdcResourcesTab';
import AcdcMoreTab      from './AcdcMoreTab';
import { PATHWAYS } from '../data/pathways';
import { SCHOOLS }  from '../data/schools';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

// ── ACDC-specific tab bar (separate from student/parent bar) ──────────────────
const ACDC_TABS = [
  { id: 'home',      label: 'Home',         screen: 'home'      },
  { id: 'profile',   label: 'Contact Card', screen: 'profile'   },
  { id: 'pathways',  label: 'Pathways',     screen: 'pathways'  },
  { id: 'resources', label: 'Resources',    screen: 'resources' },
  { id: 'more',      label: 'More',         screen: 'more'      },
];

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

function getSchoolName(id) {
  return FULL_SCHOOL_NAMES[id] || id;
}

// ── Coach avatar (photo → initials fallback) ──────────────────────────────────
function CoachAvatar({ photo, name, size = 62 }) {
  const [err, setErr] = useState(false);
  const initials = (name ?? '').split(' ')
    .filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 2);

  if (photo && !err) {
    return (
      <img src={photo} alt={name} onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover',
          border: '3px solid rgba(255,255,255,.4)', display: 'block', flexShrink: 0 }} />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%',
      background: 'rgba(255,255,255,.18)', border: '3px solid rgba(255,255,255,.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: FF, fontSize: size * 0.3, fontWeight: 900, color: '#fff' }}>
        {initials}
      </span>
    </div>
  );
}

// ── Toolkit action card ───────────────────────────────────────────────────────
function ToolkitCard({ icon, label, sublabel, lime = false, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        width: '100%', background: lime ? LIME : '#fff',
        border: lime ? 'none' : `1px solid ${C.border}`,
        borderRadius: 18, padding: '15px 16px', marginBottom: 10,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
        textAlign: 'left', boxSizing: 'border-box',
        boxShadow: lime ? '0 4px 20px rgba(234,255,0,.3)' : '0 2px 8px rgba(0,0,0,.04)',
        transition: 'transform .1s',
      }}
      onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
      onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
      onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0,
        background: lime ? `${BLUE}18` : `${BLUE}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 800,
          color: lime ? DARK : C.text, lineHeight: 1.2 }}>{label}</div>
        {sublabel && (
          <div style={{ fontFamily: FF, fontSize: 12,
            color: lime ? `${DARK}99` : C.text3, marginTop: 3, lineHeight: 1.4 }}>
            {sublabel}
          </div>
        )}
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke={lime ? DARK : C.text3} strokeWidth="2.5" strokeLinecap="round"
        style={{ flexShrink: 0, opacity: 0.6 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  );
}

// ── Tab: Home ─────────────────────────────────────────────────────────────────
function TabHome({ acdc, onGoResources, onGoPathways, onSignOut }) {
  const schoolList = [
    ...(acdc?.txhGrades?.length ? ['txh'] : []),
    ...(acdc?.schools || []),
  ];

  const emailSubject = encodeURIComponent('Dual Credit — Information for You');
  const emailBody = encodeURIComponent(
    `Hi,\n\nI'm ${acdc?.name ?? 'your ACDC'}, your Academic Coach for Dual Credit at Texarkana College.\n\nI'm reaching out to share some information about your dual credit courses. Please let me know if you have any questions.\n\n${acdc?.name ?? ''}\nTC Dual Credit`
  );
  const smsBody = encodeURIComponent(
    `Hi, this is ${acdc?.name ?? 'your ACDC'} from TC Dual Credit. I wanted to reach out about your dual credit enrollment. Reply here or call ${acdc?.phone ?? ''}.`
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Gradient header — coach identity */}
      <div style={{
        background: `linear-gradient(160deg, ${DARK} 0%, ${BLUE} 100%)`,
        flexShrink: 0,
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        paddingBottom: 28, paddingLeft: 20, paddingRight: 20,
      }}>
        {/* Exit row */}
        <button onClick={onSignOut}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 0 16px', color: 'rgba(255,255,255,.7)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span style={{ fontFamily: FF, fontSize: 12, fontWeight: 600 }}>Exit Portal</span>
        </button>

        {/* Coach row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CoachAvatar photo={acdc?.photo} name={acdc?.name} size={62} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: LIME,
              textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 4 }}>
              ACDC Staff Portal
            </div>
            <div style={{ fontFamily: FF, fontSize: 22, fontWeight: 900, color: '#fff',
              letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              {acdc?.name ?? ''}
            </div>
            <div style={{ fontFamily: FF, fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 3 }}>
              {acdc?.title ?? 'Academic Coach for Dual Credit'}
            </div>
          </div>
        </div>

        {/* Assigned schools */}
        {schoolList.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {schoolList.map(id => (
              <span key={id} style={{
                fontFamily: FF, fontSize: 11, fontWeight: 700, color: LIME,
                background: 'rgba(234,255,0,.15)', borderRadius: 20, padding: '3px 10px',
                border: '1px solid rgba(234,255,0,.25)',
              }}>
                {getSchoolName(id)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Toolkit cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 14px 120px' }}>
        <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: C.text3,
          textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 12, paddingLeft: 2 }}>
          Your Toolkit
        </div>

        <ToolkitCard lime
          label="Send Resources & Docs"
          sublabel="Browse student resources and documents to share"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>}
          onClick={onGoResources}
        />

        <ToolkitCard
          label="Look Up Pathway Plans"
          sublabel="Browse pathway plans for your assigned schools"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M12 19h4.5a3.5 3.5 0 000-7h-8a3.5 3.5 0 010-7H12"/></svg>}
          onClick={onGoPathways}
        />

        {/* FERPA: native mailto handoff — no recipient, body, or send record stored */}
        <ToolkitCard
          label="Email a Student"
          sublabel="Opens your email app — no contact stored by this app"
          icon={<svg width="22" height="20" viewBox="0 0 24 20" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>}
          onClick={() => { window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`; }}
        />

        {/* FERPA: native sms handoff — no recipient number, message, or send record stored */}
        <ToolkitCard
          label="Text a Student"
          sublabel="Opens your SMS app — no contact stored by this app"
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
          onClick={() => { window.location.href = `sms:?&body=${smsBody}`; }}
        />
      </div>
    </div>
  );
}

// ── Tab: Pathways (filtered to coach's assigned schools) ──────────────────────
function TabPathways({ acdc }) {
  const [selectedSchool, setSelectedSchool] = useState(null);

  const assignedIds = useMemo(() => [
    ...(acdc?.txhGrades?.length ? ['txh'] : []),
    ...(acdc?.schools || []),
  ], [acdc]);

  const assignedSchools = useMemo(
    () => SCHOOLS.filter(s => assignedIds.includes(s.id)),
    [assignedIds]
  );

  const pathways = useMemo(
    () => selectedSchool ? PATHWAYS.filter(p => p.school === selectedSchool.id) : [],
    [selectedSchool]
  );

  if (selectedSchool) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <BlueHeader style={{ paddingBottom: 36 }}>
          <PageTitle
            title={selectedSchool.name}
            sub="Pathway plans"
            onBack={() => setSelectedSchool(null)}
          />
        </BlueHeader>

        {/* School color bar */}
        <div style={{ backgroundColor: selectedSchool.color, padding: '8px 16px', flexShrink: 0 }}>
          <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 700,
            color: selectedSchool.textColor || '#fff' }}>
            Pathway Plans at {selectedSchool.name}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 120px' }}>
          <p style={{ fontFamily: FF, fontSize: 13, color: C.text2, lineHeight: 1.6, marginBottom: 14 }}>
            Tap any pathway to open the full Early Enrollment Pathway Plan.
          </p>
          {pathways.length > 0 ? pathways.map(p => (
            <button key={p.id}
              onClick={() => window.open(p.pdfUrl, '_blank', 'noopener,noreferrer')}
              style={{
                width: '100%', background: '#fff', border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '16px 14px', marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                textAlign: 'left', boxSizing: 'border-box',
                transition: 'transform .1s',
              }}
              onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 600, color: C.text }}>
                {p.name.replace(/^EEPP\s*–\s*/, '')}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE}
                strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )) : (
            <p style={{ fontFamily: FF, fontSize: 13, color: C.text2, textAlign: 'center', paddingTop: 40 }}>
              No pathways available for this school.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle title="Pathways" sub="Your assigned schools" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 120px', marginTop: -24 }}>
        {assignedSchools.length > 0 ? assignedSchools.map(school => (
          <button key={school.id} onClick={() => setSelectedSchool(school)}
            style={{
              width: '100%', background: school.color, border: 'none',
              borderRadius: 14, padding: '14px 16px', marginBottom: 10,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
              textAlign: 'left', boxSizing: 'border-box',
              boxShadow: '0 2px 10px rgba(0,0,0,.12)', transition: 'transform .1s',
            }}
            onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 700,
              color: school.textColor || '#fff', flex: 1 }}>
              {school.name}
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={school.textColor || '#fff'} strokeWidth="2.5" strokeLinecap="round"
              style={{ flexShrink: 0, opacity: 0.8 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )) : (
          <p style={{ fontFamily: FF, fontSize: 14, color: C.text2, textAlign: 'center', paddingTop: 60 }}>
            No schools assigned to your profile.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Portal shell ──────────────────────────────────────────────────────────────
export default function AcdcHomeScreen({ acdc, onSignOut }) {
  const [activeTab, setActiveTab] = useState('home');

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <TabHome
            acdc={acdc}
            onGoResources={() => setActiveTab('resources')}
            onGoPathways={() => setActiveTab('pathways')}
            onSignOut={onSignOut}
          />
        );
      case 'profile':
        return <AcdcProfileTab acdc={acdc} />;
      case 'pathways':
        return <TabPathways acdc={acdc} />;
      case 'resources':
        return <AcdcResourcesTab />;
      case 'more':
        return <AcdcMoreTab onSignOut={onSignOut} />;
      default:
        return <TabHome acdc={acdc} onGoResources={() => setActiveTab('resources')} onGoPathways={() => setActiveTab('pathways')} onSignOut={onSignOut} />;
    }
  };

  return (
    <div className="tc-screen"
      style={{ width: '100%', height: '100%', background: C.bg,
        display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {renderTab()}
      <BottomNav active={activeTab} onNavigate={setActiveTab} tabs={ACDC_TABS} />
    </div>
  );
}
