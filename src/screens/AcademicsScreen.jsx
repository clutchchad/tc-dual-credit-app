// All data in this screen is currently sourced from the mock studentProfile.js.
// When Jenzabar API access is confirmed, replace getStudentProfile() with the real API call.
// No component changes needed — only the data source changes.

import { useState, useEffect } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import CreditHoursBar from '../components/CreditHoursBar';
import { C, FF } from '../tokens';
import { getStudentProfile } from '../data/studentProfile';

const BLUE = '#065990';
const DARK = '#022b52';
const LIME = '#EAFF00';

// ── Helpers ────────────────────────────────────────────────────────────────────

function readStored() {
  try { return JSON.parse(localStorage.getItem('tcdc_v1') || '{}'); } catch { return {}; }
}

function SectionHeading({ label }) {
  return (
    <div style={{
      fontFamily: FF, fontSize: 10.5, fontWeight: 700,
      color: C.text3, textTransform: 'uppercase', letterSpacing: '1.4px',
      marginBottom: 8, paddingLeft: 2,
    }}>
      {label}
    </div>
  );
}

// ── Section 1: Enrollment Status ──────────────────────────────────────────────

function EnrollmentCard({ profile }) {
  const status = profile.enrollmentStatus || 'unknown';

  const badge = status === 'active'
    ? { label: 'Active',   bg: 'rgba(22,163,74,.12)',  color: '#15803d', dot: '#16a34a' }
    : status === 'pending'
    ? { label: 'Pending',  bg: 'rgba(217,119,6,.12)',  color: '#b45309', dot: '#d97706' }
    : { label: 'Inactive', bg: 'rgba(220,38,38,.10)',  color: '#b91c1c', dot: '#dc2626' };

  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      border: `1px solid ${C.border}`,
      boxShadow: '0 2px 10px rgba(0,0,0,.05)',
      padding: '16px 18px',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        {/* Semester label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: 'linear-gradient(135deg,#022b52,#065990)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: '-0.2px' }}>
              {profile.currentSemester || 'Fall 2026'}
            </div>
            <div style={{ fontFamily: FF, fontSize: 11, color: C.text3, marginTop: 1 }}>Current Semester</div>
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: badge.bg, borderRadius: 20, padding: '5px 11px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: badge.dot, flexShrink: 0 }} />
          <span style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: badge.color }}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Student name + ID */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        paddingTop: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: FF, fontSize: 12, color: C.text2, fontWeight: 500 }}>
          {profile.firstName} {profile.lastName}
        </span>
        <span style={{
          fontFamily: 'monospace', fontSize: 11.5, color: C.text3,
          background: 'rgba(0,0,0,.04)', borderRadius: 6, padding: '2px 7px',
        }}>
          {profile.studentId}
        </span>
      </div>
    </div>
  );
}

// ── Section 2: Current Courses ────────────────────────────────────────────────

function CourseCard({ course }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: `1px solid ${C.border}`,
      boxShadow: '0 1px 6px rgba(0,0,0,.04)',
      padding: '13px 15px',
      marginBottom: 8,
      display: 'flex', alignItems: 'center', gap: 13,
    }}>
      {/* Grade — prominent left accent */}
      <div style={{
        width: 48, height: 48, borderRadius: 13, flexShrink: 0,
        background: 'rgba(6,89,144,.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: FF, fontSize: 19, fontWeight: 900, color: BLUE, letterSpacing: '-0.5px' }}>
          {course.grade || '—'}
        </span>
      </div>

      {/* Course info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>
          {course.name}
        </div>
        <span style={{
          fontFamily: 'monospace', fontSize: 11, color: C.text3,
          background: 'rgba(0,0,0,.04)', borderRadius: 5, padding: '1px 6px',
        }}>
          {course.courseId}
        </span>
      </div>

      {/* Right side: hours pill + enrolled badge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <div style={{
          background: 'rgba(6,89,144,.1)', borderRadius: 20, padding: '3px 8px',
        }}>
          <span style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: BLUE }}>
            {course.hours} hr{course.hours !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{
          background: 'rgba(6,89,144,.1)', borderRadius: 20, padding: '3px 8px',
        }}>
          <span style={{ fontFamily: FF, fontSize: 10, fontWeight: 700, color: BLUE }}>
            Enrolled
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Section 3: Credit Hours Summary ──────────────────────────────────────────

function CreditHoursSection({ earned, pending, total, target }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      border: `1px solid ${C.border}`,
      boxShadow: '0 2px 10px rgba(0,0,0,.05)',
      padding: '16px 16px 18px',
      marginBottom: 10,
    }}>
      {/* Stat chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(6,89,144,.07)', borderRadius: 10, padding: '8px 4px' }}>
          <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: BLUE, letterSpacing: '-0.5px' }}>{earned}</div>
          <div style={{ fontFamily: FF, fontSize: 10, fontWeight: 600, color: BLUE, opacity: 0.7, marginTop: 1 }}>Earned</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(180,210,40,.14)', borderRadius: 10, padding: '8px 4px' }}>
          <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: '#5a7a00', letterSpacing: '-0.5px' }}>{pending}</div>
          <div style={{ fontFamily: FF, fontSize: 10, fontWeight: 600, color: '#5a7a00', opacity: 0.75, marginTop: 1 }}>In Progress</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,.04)', borderRadius: 10, padding: '8px 4px' }}>
          <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: C.text2, letterSpacing: '-0.5px' }}>
            {total} <span style={{ fontSize: 12, fontWeight: 600 }}>of {target}</span>
          </div>
          <div style={{ fontFamily: FF, fontSize: 10, fontWeight: 600, color: C.text3, marginTop: 1 }}>Total</div>
        </div>
      </div>

      {/* Shared bar + motivational line */}
      <CreditHoursBar earned={earned} pending={pending} total={total} target={target} />
    </div>
  );
}

// ── Section 4: Transcript ─────────────────────────────────────────────────────

function TranscriptCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      border: `1px solid ${C.border}`,
      boxShadow: '0 2px 10px rgba(0,0,0,.05)',
      padding: '18px 18px 16px',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        {/* Document icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg,#022b52,#065990)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: '-0.2px', marginBottom: 4 }}>
            Request Your Transcript
          </div>
          <p style={{ fontFamily: FF, fontSize: 12.5, color: C.text2, lineHeight: 1.55 }}>
            Official transcripts are processed through the TC Registrar's Office.
          </p>
        </div>
      </div>

      {/* Request button — lime outlined */}
      <button
        onClick={() => window.open(
          'https://www.texarkanacollege.edu/academics/registrar/request-transcript/',
          '_blank', 'noopener,noreferrer'
        )}
        style={{
          width: '100%', height: 44, borderRadius: 13,
          background: 'transparent', border: `2px solid ${LIME}`,
          cursor: 'pointer', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          marginBottom: 10,
          transition: 'opacity .15s',
        }}
        onMouseDown={e  => e.currentTarget.style.opacity = '0.75'}
        onMouseUp={e    => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        onTouchStart={e => e.currentTarget.style.opacity = '0.75'}
        onTouchEnd={e   => e.currentTarget.style.opacity = '1'}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={DARK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        <span style={{ fontFamily: FF, fontSize: 13.5, fontWeight: 800, color: DARK }}>
          Request Transcript
        </span>
      </button>

      <p style={{ fontFamily: FF, fontSize: 11, color: C.text3, textAlign: 'center', lineHeight: 1.5 }}>
        Transcript requests may take 3–5 business days.
      </p>
    </div>
  );
}

// ── Guest card ────────────────────────────────────────────────────────────────

function GuestAcademics({ onNavigate, tabs }) {
  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 22px',
        paddingTop: 'env(safe-area-inset-top, 24px)',
      }}>
        <div style={{
          width: '100%', background: '#fff', borderRadius: 28,
          border: `1px solid ${C.border}`,
          boxShadow: '0 4px 24px rgba(6,89,144,.09)',
          padding: '36px 24px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          {/* TC logo mark */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg,#022b52,#065990)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(6,89,144,.3)',
            marginBottom: 20,
          }}>
            <span style={{ fontFamily: FF, fontSize: 28, fontWeight: 900, color: LIME, letterSpacing: '-1px' }}>TC</span>
          </div>

          <div style={{ fontFamily: FF, fontSize: 22, fontWeight: 900, color: DARK, letterSpacing: '-0.5px', marginBottom: 10 }}>
            Your Academic Info
          </div>
          <p style={{ fontFamily: FF, fontSize: 14, color: C.text2, lineHeight: 1.6, margin: '0 0 28px' }}>
            Set up your profile to view your courses, grades, and credit hours.
          </p>

          <button
            onClick={() => onNavigate('onboard_role')}
            style={{
              width: '100%', height: 54, background: LIME, border: 'none', borderRadius: 16,
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(234,255,0,.35)',
            }}
          >
            <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 900, color: DARK }}>Get Started</span>
          </button>
        </div>
      </div>
      <BottomNav active="more" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}

// ── Main content (student + parent share this) ────────────────────────────────

function AcademicsContent({ profile, isParent, onBack, onNavigate, tabs }) {
  const stored    = readStored();
  const schoolName = stored.school?.name || profile.highSchool || '';
  const grade      = stored.grade        || (profile.grade ? `Grade ${profile.grade}` : '');

  const subtext = isParent
    ? [schoolName, grade].filter(Boolean).join(' · ')
    : [schoolName, grade].filter(Boolean).join(' · ');

  const creditHours = {
    earned:  profile.creditHoursEarned      ?? 0,
    pending: profile.creditHoursPending     ?? 0,
    total:   profile.creditHoursTotal       ?? 0,
    target:  profile.associatesDegreeTarget ?? 60,
  };

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader>
        <PageTitle
          title={isParent ? "My Student's Academics" : 'My Academics'}
          sub={subtext || undefined}
          onBack={onBack}
        />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 100px' }}>

        {/* Section 1 — Enrollment Status */}
        <SectionHeading label="Enrollment Status" />
        <EnrollmentCard profile={profile} />

        {/* Section 2 — Current Courses */}
        <div style={{ marginTop: 14 }}>
          <SectionHeading label="Current Courses" />
          {(profile.currentCourses || []).map(c => (
            <CourseCard key={c.courseId} course={c} />
          ))}
          <p style={{ fontFamily: FF, fontSize: 11, color: C.text3, textAlign: 'center', marginTop: 4, lineHeight: 1.5 }}>
            Grades shown are estimates. Verify at myTC portal.
          </p>
        </div>

        {/* Section 3 — Credit Hours */}
        <div style={{ marginTop: 14 }}>
          <SectionHeading label="Credit Hours" />
          <CreditHoursSection
            earned={creditHours.earned}
            pending={creditHours.pending}
            total={creditHours.total}
            target={creditHours.target}
          />
        </div>

        {/* Section 4 — Transcript */}
        <div style={{ marginTop: 14 }}>
          <SectionHeading label="Official Transcript" />
          <TranscriptCard />
        </div>
      </div>

      <BottomNav active="more" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}

// ── Default export ────────────────────────────────────────────────────────────

export default function AcademicsScreen({ role, onNavigate, tabs }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (role === 'guest') return;
    getStudentProfile().then(setProfile);
  }, [role]);

  if (role === 'guest') {
    return <GuestAcademics onNavigate={onNavigate} tabs={tabs} />;
  }

  if (!profile) {
    return (
      <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg,#022b52,#065990)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 900, color: LIME }}>TC</span>
          </div>
          <span style={{ fontFamily: FF, fontSize: 13, color: C.text3 }}>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <AcademicsContent
      profile={profile}
      isParent={role === 'parent'}
      onBack={() => onNavigate('home')}
      onNavigate={onNavigate}
      tabs={tabs}
    />
  );
}
