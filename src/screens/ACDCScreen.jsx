import { useState } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { useIsTablet } from '../hooks/useIsTablet';
import Card from '../components/Card';
import { getAcdcForSchool } from '../data/acdc';
import { buildSchedulingUrl } from '../data/buildSchedulingUrl';
import { C, FF } from '../tokens';

const LIME   = '#EAFF00';
const BLUE   = '#065990';
const DARK   = '#022b52';

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

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Derive 1–2 initials from a name */
function initials(name) {
  return name.split(' ').filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 2);
}

// ── CoachPhoto ────────────────────────────────────────────────────────────────

function CoachPhoto({ photo, name, size = 96 }) {
  const [err, setErr] = useState(false);
  const mono = initials(name);

  if (photo && !err) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setErr(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover',
          border: `3.5px solid ${BLUE}`,
          boxShadow: '0 6px 24px rgba(6,89,144,.28)',
          display: 'block',
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, rgba(6,89,144,.18), rgba(6,89,144,.38))`,
      border: `3.5px solid ${BLUE}`,
      boxShadow: '0 6px 24px rgba(6,89,144,.28)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: FF, fontSize: size * 0.3, fontWeight: 900, color: BLUE }}>{mono}</span>
    </div>
  );
}

// ── OfficeCard ───────────────────────────────────────────────────────────────

function OfficeCard() {
  return (
    <Card style={{ padding: '28px 20px 24px', marginBottom: 14, textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: 'rgba(6,89,144,.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
          stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>

      <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: DARK, marginBottom: 6, letterSpacing: '-0.3px' }}>
        Contact the DC Office
      </div>

      <div style={{ height: 1, background: 'rgba(6,89,144,.08)', margin: '16px 0' }} />

      <a
        href="tel:903-823-3456"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          textDecoration: 'none', marginBottom: 18,
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(6,89,144,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
        </div>
        <span style={{ fontFamily: FF, fontSize: 17, fontWeight: 700, color: BLUE }}>
          903-823-3456
        </span>
      </a>

      <div style={{ background: 'rgba(6,89,144,.05)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: BLUE, marginBottom: 4 }}>
          Office Hours
        </div>
        <div style={{ fontFamily: FF, fontSize: 13, color: DARK, fontWeight: 500 }}>
          Mon–Thu 8am–5pm
        </div>
        <div style={{ fontFamily: FF, fontSize: 13, color: DARK, fontWeight: 500 }}>
          Fri 8am–4pm
        </div>
      </div>

      <p style={{ fontFamily: FF, fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>
        An Academic Coach for Dual Credit will be assigned to assist you.
      </p>
    </Card>
  );
}

// ── CoachCard ─────────────────────────────────────────────────────────────────

function CoachCard({ acdc, school, grade, isTablet }) {
  const contextLine = getFullSchoolName(school.id);

  const gradeLabel = (() => {
    if (!acdc.txhGrades?.length) return null;
    const map = { Freshman: '9th', Sophomore: '10th', Junior: '11th', Senior: '12th' };
    const nums = acdc.txhGrades.map(g => map[g] || g);
    return `Texas High  ${nums.join(' & ')} Grade`;
  })();

  if (isTablet) {
    /* Horizontal layout: photo left, details right */
    return (
      <Card style={{ padding: '28px 24px 24px', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <CoachPhoto photo={acdc.photo} name={acdc.name} size={110} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FF, fontSize: 24, fontWeight: 900, color: DARK, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              {acdc.name}
            </div>
            <div style={{ fontFamily: FF, fontSize: 13, color: BLUE, fontWeight: 700, marginTop: 4 }}>
              Academic Coach for Dual Credit
            </div>
            <div style={{ fontFamily: FF, fontSize: 12, color: '#6b7280', marginTop: 3 }}>
              {contextLine}
            </div>
            <div style={{ height: 1, background: 'rgba(6,89,144,.08)', margin: '16px 0 14px' }} />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={`tel:${acdc.phone}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6,89,144,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                </div>
                <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 700, color: BLUE }}>{acdc.phone}</span>
              </a>
              {acdc.schedulingUrl && (
                <button
                  onClick={() => window.open(buildSchedulingUrl(), '_blank', 'noopener,noreferrer')}
                  style={{
                    height: 44, padding: '0 20px',
                    background: LIME, border: 'none', borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 900, color: BLUE, letterSpacing: '-0.1px' }}>
                    Schedule Advising
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  /* Original vertical / mobile layout */
  return (
    <Card style={{ padding: '12px 14px 12px', marginBottom: 10, textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <CoachPhoto photo={acdc.photo} name={acdc.name} size={62} />
      </div>

      <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: DARK, letterSpacing: '-0.4px', lineHeight: 1.15 }}>
        {acdc.name}
      </div>
      <div style={{ fontFamily: FF, fontSize: 12, color: BLUE, fontWeight: 700, marginTop: 2 }}>
        Academic Coach for Dual Credit
      </div>
      <div style={{ fontFamily: FF, fontSize: 11, color: '#6b7280', marginTop: 1 }}>
        {contextLine}
      </div>

      <div style={{ height: 1, background: 'rgba(6,89,144,.08)', margin: '10px 0 10px' }} />

      {/* Three icon buttons row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>

        {/* Calendar — Electric Lime fill, BLUE icon */}
        <button
          onClick={() => window.open(buildSchedulingUrl(), '_blank', 'noopener,noreferrer')}
          style={{
            width: 48, height: 48, borderRadius: 14,
            background: LIME, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.3" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </button>

        {/* Phone — gray fill, BLUE icon */}
        <a
          href={`tel:${acdc.phone}`}
          style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(6,89,144,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.3" strokeLinecap="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
        </a>

        {/* Envelope — Royal Blue fill, Lime icon */}
        {acdc.email ? (
          <a
            href={`mailto:${acdc.email}`}
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: BLUE,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              textDecoration: 'none',
            }}
          >
            <svg width="20" height="16" viewBox="0 0 24 20" fill="none" stroke={LIME} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/>
            </svg>
          </a>
        ) : (
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: BLUE, opacity: 0.35,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="20" height="16" viewBox="0 0 24 20" fill="none" stroke={LIME} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/>
            </svg>
          </div>
        )}

      </div>
    </Card>
  );
}

// ── AboutCard ─────────────────────────────────────────────────────────────────

function AboutCard() {
  const bullets = [
    'Course selection and eligibility',
    'Registration and payment deadlines',
    'TSI prep and testing',
    'College applications and goal setting',
    'Financial assistance options',
  ];

  return (
    <Card style={{ padding: '12px 14px 14px', marginBottom: 10 }}>
      <p style={{ fontFamily: FF, fontSize: 12, color: '#374151', lineHeight: 1.55, margin: '0 0 8px' }}>
        <strong>Academic Coaches for Dual Credit (ACDCs) serve as the connection between you, your high school, and Texarkana College.</strong>{' '}<strong>Your ACDC can help you with:</strong>
      </p>
      <ul style={{ margin: '0 0 8px', paddingLeft: 18, listStyleType: 'disc' }}>
        {bullets.map(b => (
          <li key={b} style={{ fontFamily: FF, fontSize: 12, color: '#374151', lineHeight: 1.5, marginBottom: 2, display: 'list-item' }}>
            {b}
          </li>
        ))}
      </ul>
      <p style={{ fontFamily: FF, fontSize: 12, color: '#374151', lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
        Your ACDC is on your campus and in your corner all semester long.
      </p>
    </Card>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ACDCScreen({ school, grade, onNavigate, tabs }) {
  const isTablet     = useIsTablet();
  const acdc         = getAcdcForSchool(school.id, grade);
  const isUnassigned = school.unassigned === true;
  const sidePad      = isTablet ? '0 24px 40px' : '0 14px 100px';

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle title="My ACDC" sub="Your Academic Coach for Dual Credit" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: sidePad, marginTop: -28 }}>
        {isUnassigned ? <OfficeCard /> : <CoachCard acdc={acdc} school={school} grade={grade} isTablet={isTablet} />}
        <AboutCard />
      </div>

      <BottomNav active="acdc" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
