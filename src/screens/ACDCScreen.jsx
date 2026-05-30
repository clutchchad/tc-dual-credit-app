import { useState } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import Card from '../components/Card';
import { getAcdcForSchool, OFFICE_FALLBACK } from '../data/acdc';
import { C, FF } from '../tokens';

const LIME   = '#EAFF00';
const BLUE   = '#065990';
const DARK   = '#022b52';

/** Derive 1–2 initials from a name */
function initials(name) {
  return name.split(' ').filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 2);
}

/** Circular photo — falls back to initials monogram if photo is null or fails to load */
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
          border: `3.5px solid ${LIME}`,
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
      border: `3.5px solid ${LIME}`,
      boxShadow: '0 6px 24px rgba(6,89,144,.28)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: FF, fontSize: size * 0.3, fontWeight: 900, color: BLUE }}>{mono}</span>
    </div>
  );
}

/** Coach card — warm, personal layout */
function CoachCard({ acdc, school, grade }) {
  // Build a context line like "Texas High · 11th Grade" or just the school name
  const contextLine = (() => {
    if (school.id === 'txh' && grade) return `Texas High · ${grade}`;
    return school.name;
  })();

  // Grade range label for TxH coaches
  const gradeLabel = (() => {
    if (!acdc.txhGrades?.length) return null;
    const map = { Freshman: '9th', Sophomore: '10th', Junior: '11th', Senior: '12th' };
    const nums = acdc.txhGrades.map(g => map[g] || g);
    return `Texas High  ${nums.join(' & ')} Grade`;
  })();

  return (
    <Card style={{ padding: '28px 20px 24px', marginBottom: 14, textAlign: 'center' }}>
      {/* Photo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <CoachPhoto photo={acdc.photo} name={acdc.name} size={96} />
      </div>

      {/* Name */}
      <div style={{ fontFamily: FF, fontSize: 22, fontWeight: 900, color: DARK, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
        {acdc.name}
      </div>

      {/* Title */}
      <div style={{ fontFamily: FF, fontSize: 13, color: BLUE, fontWeight: 700, marginTop: 4 }}>
        Academic Coach for Dual Credit
      </div>

      {/* Context — school / grade */}
      <div style={{ fontFamily: FF, fontSize: 12, color: '#6b7280', marginTop: 3 }}>
        {contextLine}
      </div>

      {/* Grade range badge (TxH only) */}
      {gradeLabel && (
        <div style={{
          display: 'inline-block', marginTop: 10,
          padding: '4px 12px', borderRadius: 20,
          background: 'rgba(6,89,144,.08)',
          fontFamily: FF, fontSize: 11, fontWeight: 700, color: BLUE,
          letterSpacing: '0.4px',
        }}>
          {gradeLabel}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(6,89,144,.08)', margin: '20px 0 18px' }} />

      {/* Phone */}
      <a
        href={`tel:${acdc.phone}`}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          textDecoration: 'none', marginBottom: 14,
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(6,89,144,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
        </div>
        <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 700, color: BLUE }}>
          {acdc.phone}
        </span>
      </a>

      {/* Schedule CTA */}
      {acdc.schedulingUrl && (
        <button
          onClick={() => window.open(acdc.schedulingUrl, '_blank')}
          style={{
            width: '100%', height: 52,
            background: LIME,
            border: 'none', borderRadius: 14,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            boxShadow: '0 2px 12px rgba(234,255,0,.35)',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 900, color: DARK, letterSpacing: '-0.2px' }}>
            Schedule Advising
          </span>
        </button>
      )}
    </Card>
  );
}

/** Fallback card for unassigned schools — shows main office contact */
function OfficeFallbackCard({ school }) {
  const { phone, hours } = OFFICE_FALLBACK;
  return (
    <Card style={{ padding: '28px 20px 24px', marginBottom: 14, textAlign: 'center' }}>
      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 14px',
        background: `linear-gradient(135deg, rgba(6,89,144,.12), rgba(6,89,144,.28))`,
        border: `3px solid ${LIME}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 18px rgba(6,89,144,.2)',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 22V12h6v10"/>
        </svg>
      </div>

      <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: DARK, letterSpacing: '-0.4px' }}>
        Dual Credit Office
      </div>
      <div style={{ fontFamily: FF, fontSize: 13, color: BLUE, fontWeight: 700, marginTop: 4 }}>
        Academic Coach for Dual Credit
      </div>
      <div style={{ fontFamily: FF, fontSize: 12, color: '#6b7280', marginTop: 3 }}>
        {school.name}
      </div>

      <div style={{ height: 1, background: 'rgba(6,89,144,.08)', margin: '20px 0 6px' }} />

      <div style={{ fontFamily: FF, fontSize: 11.5, color: '#6b7280', marginBottom: 14, lineHeight: 1.6 }}>
        An ACDC hasn't been assigned to your school yet.{'\n'}
        Reach the main office directly:
      </div>

      <a
        href={`tel:${phone}`}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          textDecoration: 'none', marginBottom: 14,
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: 'rgba(6,89,144,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
        </div>
        <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 700, color: BLUE }}>{phone}</span>
      </a>

      <div style={{
        fontFamily: FF, fontSize: 12, color: '#6b7280', fontWeight: 600,
        background: 'rgba(6,89,144,.05)', borderRadius: 10, padding: '8px 14px',
      }}>
        {hours}
      </div>
    </Card>
  );
}

/** About blurb */
function AboutCard() {
  return (
    <Card style={{ padding: '16px 18px', marginTop: 8 }}>
      <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 800, color: DARK, marginBottom: 7 }}>
        About Your ACDC
      </div>
      <p style={{ fontFamily: FF, fontSize: 13, color: '#374151', lineHeight: 1.68, margin: 0 }}>
        Your Academic Coach for Dual Credit is your dedicated guide through the entire dual credit journey —
        from course selection and registration to TSI prep and everything in between.
        They're here to make the experience smooth and successful for you and your family.
      </p>
    </Card>
  );
}

export default function ACDCScreen({ school, grade, onNavigate, tabs }) {
  const isUnassigned = school?.unassigned === true;
  const acdc = isUnassigned ? null : getAcdcForSchool(school.id, grade);

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader style={{ paddingBottom: 52 }}>
        <PageTitle title="My ACDC" sub="Your Academic Coach for Dual Credit" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 100px', marginTop: -42 }}>

        {isUnassigned
          ? <OfficeFallbackCard school={school} />
          : <CoachCard acdc={acdc} school={school} grade={grade} />
        }

        <AboutCard />
      </div>

      <BottomNav active="acdc" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
