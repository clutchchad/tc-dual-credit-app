/**
 * AcdcPortalHomeScreen — ACDC Staff Portal toolkit.
 *
 * Shows the coach's own profile (name, title, assigned schools) and a set of
 * action cards for their daily workflow. FERPA-safe: no student data is stored,
 * displayed, or queried anywhere on this screen.
 */
import { useState } from 'react';
import { BlueHeader } from '../components/BlueHeader';
import { C, FF } from '../tokens';

const BLUE = '#065990';
const LIME = '#EAFF00';
const DARK = '#022b52';

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

// ── Coach avatar ──────────────────────────────────────────────────────────────

function CoachAvatar({ photo, name, size = 64 }) {
  const [err, setErr] = useState(false);
  const initials = (name || '')
    .split(' ')
    .filter(w => /^[A-Z]/.test(w))
    .map(w => w[0])
    .join('')
    .slice(0, 2);

  if (photo && !err) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setErr(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover',
          border: '3px solid rgba(255,255,255,.4)',
          display: 'block', flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(255,255,255,.18)',
      border: '3px solid rgba(255,255,255,.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: FF, fontSize: size * 0.3, fontWeight: 900, color: '#fff' }}>
        {initials}
      </span>
    </div>
  );
}

// ── Toolkit action card ───────────────────────────────────────────────────────

function ToolkitCard({ icon, label, sublabel, accent = BLUE, lime = false, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', background: lime ? LIME : '#fff',
        border: lime ? 'none' : `1px solid ${C.border}`,
        borderRadius: 18, padding: '15px 16px',
        marginBottom: 10, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
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
      <div style={{
        width: 46, height: 46, borderRadius: 13, flexShrink: 0,
        background: lime ? `${BLUE}18` : `${accent}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 800, color: lime ? DARK : C.text, lineHeight: 1.2 }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontFamily: FF, fontSize: 12, color: lime ? `${DARK}99` : C.text3, marginTop: 3, lineHeight: 1.4 }}>
            {sublabel}
          </div>
        )}
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke={lime ? DARK : C.text3} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, opacity: 0.6 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AcdcPortalHomeScreen({ coach, onNavigate, onExit }) {
  // Build school list — include Texas High if txhGrades is populated
  const schoolList = [
    ...(coach.txhGrades?.length ? ['txh'] : []),
    ...(coach.schools || []),
  ];

  const emailSubject = encodeURIComponent('Dual Credit — Information for You');
  const emailBody    = encodeURIComponent(
    `Hi,\n\nI'm ${coach.name}, your Academic Coach for Dual Credit at Texarkana College.\n\nI'm reaching out to share some information about your dual credit courses. Please let me know if you have any questions.\n\n${coach.name}\nTC Dual Credit`
  );

  const smsBody = encodeURIComponent(
    `Hi, this is ${coach.name} from TC Dual Credit. I wanted to reach out about your dual credit enrollment. Reply here or call ${coach.phone}.`
  );

  return (
    <div
      className="tc-screen"
      style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}
    >
      {/* ── Blue header with coach identity ── */}
      <div style={{
        background: `linear-gradient(160deg, ${DARK} 0%, ${BLUE} 100%)`,
        flexShrink: 0,
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
        paddingBottom: 28,
        paddingLeft: 20,
        paddingRight: 20,
      }}>
        {/* Back / exit row */}
        <button
          onClick={onExit}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 0 16px', color: 'rgba(255,255,255,.7)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span style={{ fontFamily: FF, fontSize: 12, fontWeight: 600 }}>Exit Portal</span>
        </button>

        {/* Coach row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CoachAvatar photo={coach.photo} name={coach.name} size={62} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: LIME, textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 4 }}>
              ACDC Staff Portal
            </div>
            <div style={{ fontFamily: FF, fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              {coach.name}
            </div>
            <div style={{ fontFamily: FF, fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 3 }}>
              {coach.title || 'Academic Coach for Dual Credit'}
            </div>
          </div>
        </div>

        {/* Assigned schools row */}
        {schoolList.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {schoolList.map(id => (
              <span
                key={id}
                style={{
                  fontFamily: FF, fontSize: 11, fontWeight: 700,
                  color: LIME, background: 'rgba(234,255,0,.15)',
                  borderRadius: 20, padding: '3px 10px',
                  border: '1px solid rgba(234,255,0,.25)',
                }}
              >
                {getSchoolName(id)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Scrollable toolkit ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 14px 60px' }}>

        <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 12, paddingLeft: 2 }}>
          Your Toolkit
        </div>

        {/* Send Resources & Docs */}
        <ToolkitCard
          lime
          label="Send Resources & Docs"
          sublabel="Browse student resources and documents to share"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
          }
          onClick={() => onNavigate('resources')}
        />

        {/* Look Up Pathway Plans */}
        <ToolkitCard
          label="Look Up Pathway Plans"
          sublabel="Browse pathway plans for any partner school"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/>
              <path d="M12 19h4.5a3.5 3.5 0 000-7h-8a3.5 3.5 0 010-7H12"/>
            </svg>
          }
          onClick={() => onNavigate('pathways')}
        />

        {/* Email a Student */}
        {/* FERPA: native mailto handoff only — app opens device mail client.
            No recipient address, message content, or send record is stored anywhere. */}
        <ToolkitCard
          label="Email a Student"
          sublabel="Opens your email app — no contact stored by this app"
          icon={
            <svg width="22" height="20" viewBox="0 0 24 20" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="16" rx="2"/>
              <path d="M2 7l10 6 10-6"/>
            </svg>
          }
          onClick={() => {
            window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
          }}
        />

        {/* Text a Student */}
        {/* FERPA: native sms handoff only — app opens device SMS client.
            No recipient number, message content, or send record is stored anywhere. */}
        <ToolkitCard
          label="Text a Student"
          sublabel="Opens your SMS app — no contact stored by this app"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          }
          onClick={() => {
            window.location.href = `sms:?&body=${smsBody}`;
          }}
        />

        {/* Contact info strip */}
        {(coach.phone || coach.email) && (
          <div style={{
            background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16,
            padding: '14px 16px', marginTop: 6,
          }}>
            <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
              Your Contact Info
            </div>
            {coach.phone && (
              <a href={`tel:${coach.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: coach.email ? 10 : 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${BLUE}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                </div>
                <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 700, color: BLUE }}>{coach.phone}</span>
              </a>
            )}
            {coach.email && (
              <a href={`mailto:${coach.email}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${BLUE}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="14" viewBox="0 0 24 20" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="16" rx="2"/>
                    <path d="M2 7l10 6 10-6"/>
                  </svg>
                </div>
                <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 700, color: BLUE }}>{coach.email}</span>
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
