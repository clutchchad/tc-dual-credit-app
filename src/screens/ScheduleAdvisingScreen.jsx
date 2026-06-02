/**
 * ScheduleAdvisingScreen — Schedule Advising with your ACDC.
 *
 * Routing-and-handoff only. FERPA-safe: the app does not store the
 * advising request, the user's contact info, or any record of interaction.
 * All three contact methods (booking link, email, phone) are native device
 * handoffs — the user's mail app, browser, or phone app handles the rest.
 */
import { useState } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { useIsTablet } from '../hooks/useIsTablet';
import { getAcdcForSchool } from '../data/acdc';
import { buildSchedulingUrl } from '../data/buildSchedulingUrl';
import { C, FF } from '../tokens';

const BLUE  = '#065990';
const LIME  = '#EAFF00';
const DARK  = '#022b52';

// DC office fallback email — sample, replace with real office address
const DC_OFFICE_EMAIL = 'dualcredit@texarkanacollege.edu'; // sample — replace with verified address

// ── Coach avatar with initials fallback ──────────────────────────────────────

function CoachPhoto({ photo, name, size = 84 }) {
  const [err, setErr] = useState(false);
  const mono = (name || '').split(' ').filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 2);

  if (photo && !err) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setErr(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover',
          border: `3px solid ${BLUE}`,
          boxShadow: '0 4px 18px rgba(6,89,144,.22)',
          display: 'block', flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, rgba(6,89,144,.15), rgba(6,89,144,.35))`,
      border: `3px solid ${BLUE}`,
      boxShadow: '0 4px 18px rgba(6,89,144,.22)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontFamily: FF, fontSize: size * 0.3, fontWeight: 900, color: BLUE }}>{mono}</span>
    </div>
  );
}

// ── Action card ───────────────────────────────────────────────────────────────

function ActionCard({ icon, label, sublabel, lime = false, href, hrefTarget, onClick }) {
  const handleClick = () => {
    if (href) {
      if (hrefTarget === '_blank') {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    }
    if (onClick) onClick();
  };

  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%',
        background: lime ? LIME : '#fff',
        border: lime ? 'none' : `1px solid ${C.border}`,
        borderRadius: 18,
        padding: '15px 16px',
        marginBottom: 10,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        textAlign: 'left', boxSizing: 'border-box',
        boxShadow: lime ? '0 4px 20px rgba(234,255,0,.32)' : '0 2px 8px rgba(0,0,0,.04)',
        transition: 'transform .1s',
      }}
      onMouseDown={e  => e.currentTarget.style.transform = 'scale(0.98)'}
      onMouseUp={e    => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
      onTouchEnd={e   => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Icon well */}
      <div style={{
        width: 46, height: 46, borderRadius: 13, flexShrink: 0,
        background: lime ? `${BLUE}18` : `${BLUE}10`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: lime ? DARK : C.text, letterSpacing: '-0.2px' }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontFamily: FF, fontSize: 12, color: lime ? `${DARK}88` : C.text3, marginTop: 3, lineHeight: 1.4 }}>
            {sublabel}
          </div>
        )}
      </div>

      {/* Chevron */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke={lime ? DARK : C.text3} strokeWidth="2.5" strokeLinecap="round"
        style={{ flexShrink: 0, opacity: 0.5 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  );
}

// ── No-school guest state ─────────────────────────────────────────────────────

function NoSchoolPrompt({ onNavigate }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px 120px', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18, marginBottom: 20,
        background: `${BLUE}10`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>
          <path d="M9 22V12h6v10"/>
        </svg>
      </div>
      <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: DARK, letterSpacing: '-0.3px', marginBottom: 8 }}>
        Set Up Your School First
      </div>
      <p style={{ fontFamily: FF, fontSize: 14, color: C.text2, lineHeight: 1.6, marginBottom: 28, maxWidth: 280 }}>
        To connect you with the right Academic Coach, we need to know your high school. Set up your profile to continue.
      </p>
      <button
        onClick={() => onNavigate('onboard_role')}
        style={{
          height: 50, padding: '0 32px', borderRadius: 14, border: 'none',
          background: LIME, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(234,255,0,.35)',
        }}
      >
        <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: DARK }}>
          Set Up Profile
        </span>
      </button>
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ScheduleAdvisingScreen({ school, grade, onNavigate, tabs }) {
  const isTablet = useIsTablet();

  const acdc = school ? getAcdcForSchool(school.id, grade) : null;

  // Email address: use coach's own email if present, otherwise fall back to DC office.
  // FERPA: mailto handoff opens the device mail app only — no email address,
  // message content, or send record is stored by this app.
  const toEmail  = acdc?.email || DC_OFFICE_EMAIL;
  const subject  = encodeURIComponent('Dual Credit Advising Request');
  const body     = encodeURIComponent(
    `Hello,\n\nI would like to schedule an advising meeting to discuss my dual credit courses and pathway options.\n\nPlease let me know your availability.\n\nThank you.`
  );

  const sidePad = isTablet ? '0 24px 40px' : '0 14px 120px';

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>

      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle
          title="Schedule Advising"
          onBack={() => onNavigate('acdc')}
        />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: sidePad, marginTop: -28 }}>

        {/* No school state */}
        {!school && <NoSchoolPrompt onNavigate={onNavigate} />}

        {/* Coach + booking */}
        {school && acdc && (
          <>
            {/* Coach identity card */}
            <div style={{
              background: '#fff', borderRadius: 20,
              border: `1px solid ${C.border}`,
              padding: '18px 16px 16px',
              marginBottom: 18,
              boxShadow: '0 2px 12px rgba(6,89,144,.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <CoachPhoto photo={acdc.photo} name={acdc.name} size={72} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.1px', marginBottom: 3 }}>
                    Your Academic Coach
                  </div>
                  <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: DARK, letterSpacing: '-0.4px', lineHeight: 1.2 }}>
                    {acdc.name}
                  </div>
                  <div style={{ fontFamily: FF, fontSize: 13, color: BLUE, fontWeight: 700, marginTop: 2 }}>
                    {acdc.title || 'Academic Coach for Dual Credit'}
                  </div>
                </div>
              </div>

              {/* What advising covers */}
              <div style={{
                background: `${BLUE}07`, borderRadius: 12,
                padding: '11px 13px',
                border: `1px solid ${BLUE}14`,
              }}>
                <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>
                  What advising covers
                </div>
                <p style={{ fontFamily: FF, fontSize: 13, color: C.text2, lineHeight: 1.55, margin: 0 }}>
                  Course selection and eligibility · Pathway and transfer planning · Registration deadlines · TSI prep · Financial assistance options
                </p>
              </div>
            </div>

            {/* Booking options */}
            <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.3px', marginBottom: 10, paddingLeft: 2 }}>
              How to connect
            </div>

            {/* 1. Book a Meeting — primary action (lime) */}
            {acdc.schedulingUrl && (
              <ActionCard
                lime
                label="Book a Meeting"
                sublabel="Opens the official Meet with an ACDC scheduling form"
                href={buildSchedulingUrl()}
                hrefTarget="_blank"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01"/>
                  </svg>
                }
              />
            )}

            {/* 2. Email to Schedule */}
            {/* FERPA: mailto opens device mail app only — app stores no recipient, subject, body, or send record. */}
            <ActionCard
              label="Email to Schedule"
              sublabel={`Sends to ${acdc.email ? acdc.name : 'the TC Dual Credit office'}`}
              href={`mailto:${toEmail}?subject=${subject}&body=${body}`}
              icon={
                <svg width="22" height="18" viewBox="0 0 24 20" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="16" rx="2"/>
                  <path d="M2 7l10 6 10-6"/>
                </svg>
              }
            />

            {/* 3. Call */}
            {/* FERPA: tel: opens device phone app only — app stores no call record. */}
            {acdc.phone && (
              <ActionCard
                label="Call"
                sublabel={acdc.phone}
                href={`tel:${acdc.phone}`}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                }
              />
            )}

          </>
        )}

        {/* No ACDC assigned — office fallback */}
        {school && !acdc && (
          <div style={{
            background: '#fff', borderRadius: 18,
            border: `1px solid ${C.border}`,
            padding: '18px 16px', marginBottom: 10,
          }}>
            <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: DARK, marginBottom: 6 }}>
              Contact the DC Office
            </div>
            <p style={{ fontFamily: FF, fontSize: 13.5, color: C.text2, lineHeight: 1.55, marginBottom: 14, margin: '0 0 14px' }}>
              We weren't able to find an assigned coach for your school. The DC office can connect you with the right person.
            </p>
            <a
              href="tel:903-823-3456"
              style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${BLUE}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 700, color: BLUE }}>903-823-3456</span>
            </a>
          </div>
        )}

      </div>

      <BottomNav active="acdc" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
