/**
 * AcdcLookupTab — Student Look Up tab for the ACDC portal.
 *
 * The ACDC enters a TC student ID and sees that student's full academic
 * progress — the same cards/sections the student sees on their own
 * Academic Progress screen, rendered via the shared AcademicsBody export.
 *
 * Known demo IDs:
 *   123456 → Alex Sosa (Texas High, Junior)
 *   654321 → Frank Lopez (Pleasant Grove, Freshman)
 */
import { useState, useRef } from 'react';
import { C, FF } from '../tokens';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import { AcademicsBody } from './AcademicsScreen';
import { lookupStudentById } from '../data/studentProfile';
import { SCHOOLS } from '../data/schools';

const BLUE = '#065990';
const DARK = '#022b52';
const LIME = '#EAFF00';

const GRADE_WORD = { 9: 'Freshman', 10: 'Sophomore', 11: 'Junior', 12: 'Senior' };

// Resolve school brand colors from the student's highSchool name string
function resolveSchool(highSchoolName) {
  if (!highSchoolName) return { name: null, color: BLUE, textColor: '#fff' };
  const match = SCHOOLS.find(s =>
    s.name.toLowerCase() === highSchoolName.toLowerCase()
  );
  return match
    ? { name: match.name, color: match.color, textColor: match.textColor }
    : { name: highSchoolName, color: BLUE, textColor: '#fff' };
}

// ── Empty / prompt state ──────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: 'rgba(6,89,144,.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/>
          <path d="M21 21l-4.35-4.35"/>
          <path d="M11 8v6M8 11h6"/>
        </svg>
      </div>
      <div style={{ fontFamily: FF, fontSize: 16, fontWeight: 800, color: DARK,
        letterSpacing: '-0.3px', marginBottom: 8 }}>
        Look Up a Student
      </div>
      <p style={{ fontFamily: FF, fontSize: 13, color: C.text2, lineHeight: 1.6, maxWidth: 240, margin: 0 }}>
        Enter a student's TC ID number above to view their academic progress.
      </p>
    </div>
  );
}

// ── Not-found state ───────────────────────────────────────────────────────────

function NotFoundState({ searchedId }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      border: `1px solid ${C.border}`,
      boxShadow: '0 2px 10px rgba(0,0,0,.05)',
      padding: '28px 20px', textAlign: 'center',
      margin: '8px 0',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: 'rgba(239,68,68,.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={C.red} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M15 9l-6 6M9 9l6 6"/>
        </svg>
      </div>
      <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 800, color: DARK,
        letterSpacing: '-0.2px', marginBottom: 6 }}>
        No Student Found
      </div>
      <p style={{ fontFamily: FF, fontSize: 13, color: C.text2, lineHeight: 1.55, margin: 0 }}>
        No student record matches TC&nbsp;ID{' '}
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: DARK }}>
          {searchedId}
        </span>
        . Check the ID and try again.
      </p>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AcdcLookupTab() {
  const [inputId,    setInputId]    = useState('');
  const [status,     setStatus]     = useState('idle');   // 'idle' | 'found' | 'not-found'
  const [profile,    setProfile]    = useState(null);
  const [searchedId, setSearchedId] = useState('');
  const inputRef = useRef(null);

  function handleSearch() {
    const trimmed = inputId.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }

    setSearchedId(trimmed);
    const found = lookupStudentById(trimmed);
    setProfile(found);
    setStatus(found ? 'found' : 'not-found');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  // Resolved school info for the found profile
  const school = profile ? resolveSchool(profile.highSchool) : null;
  const gradeLabel = profile?.grade ? GRADE_WORD[profile.grade] || String(profile.grade) : '';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Blue header */}
      <BlueHeader style={{ paddingBottom: 36 }}>
        <PageTitle title="Student Look Up" sub="View academic progress by TC student ID" />
      </BlueHeader>

      {/* Scrollable body — overlaps header */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 100px', marginTop: -28 }}>

        {/* ── Search card ── */}
        <div style={{
          background: '#fff', borderRadius: 20,
          border: `1px solid ${C.border}`,
          boxShadow: '0 2px 14px rgba(6,89,144,.10)',
          padding: '16px 16px',
          marginBottom: 16,
        }}>
          <div style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3,
            textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>
            TC Student ID
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={inputId}
              onChange={e => setInputId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 654321"
              style={{
                flex: 1,
                height: 48,
                borderRadius: 13,
                border: `1.5px solid ${C.border}`,
                padding: '0 14px',
                fontFamily: FF,
                fontSize: 16,
                fontWeight: 700,
                color: DARK,
                background: C.bg,
                outline: 'none',
                letterSpacing: '0.5px',
                WebkitAppearance: 'none',
              }}
              onFocus={e  => (e.target.style.borderColor = BLUE)}
              onBlur={e   => (e.target.style.borderColor = C.border)}
            />

            {/* Look Up button */}
            <button
              onClick={handleSearch}
              style={{
                height: 48, borderRadius: 13, border: 'none',
                background: BLUE, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '0 18px', flexShrink: 0,
                transition: 'opacity .15s',
              }}
              onMouseDown={e  => (e.currentTarget.style.opacity = '0.75')}
              onMouseUp={e    => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              onTouchStart={e => (e.currentTarget.style.opacity = '0.75')}
              onTouchEnd={e   => (e.currentTarget.style.opacity = '1')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 800, color: '#fff' }}>
                Look Up
              </span>
            </button>
          </div>

          {/* Hint — only in idle/not-found */}
          {status !== 'found' && (
            <p style={{ fontFamily: FF, fontSize: 11.5, color: C.text3, margin: '10px 0 0', lineHeight: 1.5 }}>
              Enter the student's 6-digit TC ID number to pull their academic record.
            </p>
          )}
        </div>

        {/* ── Results area ── */}
        {status === 'idle' && <EmptyState />}

        {status === 'not-found' && <NotFoundState searchedId={searchedId} />}

        {status === 'found' && profile && (
          <AcademicsBody
            profile={profile}
            firstName={profile.firstName}
            lastName={profile.lastName}
            studentId={profile.studentId}
            grade={gradeLabel}
            schoolName={school?.name}
            schoolColor={school?.color}
            schoolText={school?.textColor}
          />
        )}

      </div>
    </div>
  );
}
