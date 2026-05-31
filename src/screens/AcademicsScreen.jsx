// All data in this screen is currently sourced from the mock studentProfile.js.
// When Jenzabar API access is confirmed, replace getStudentProfile() with the real API call.
// No component changes needed — only the data source changes.

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { useIsTablet } from '../hooks/useIsTablet';
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
        width: 54, height: 48, borderRadius: 13, flexShrink: 0,
        background: 'rgba(6,89,144,.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
      }}>
        <span style={{ fontFamily: FF, fontSize: 17, fontWeight: 900, color: BLUE, letterSpacing: '-0.5px', lineHeight: 1 }}>
          {course.grade || '—'}
        </span>
        {course.numericGrade != null && (
          <span style={{ fontFamily: FF, fontSize: 10, fontWeight: 600, color: BLUE, opacity: 0.65, lineHeight: 1 }}>
            {course.numericGrade}
          </span>
        )}
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

// ── Section 3: Completed Courses ─────────────────────────────────────────────

function downloadTranscriptPDF({ firstName, lastName, studentId, school, grade, gpa, transcriptHistory }) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth();
  let y = 56;

  // Header
  doc.setFillColor(2, 43, 82);
  doc.rect(0, 0, W, 80, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(234, 255, 0);
  doc.text('Texarkana College', 40, 36);
  doc.setFontSize(11);
  doc.setTextColor(200, 220, 255);
  doc.text('Dual Credit Unofficial Transcript', 40, 56);

  y = 108;

  // Student info block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(2, 43, 82);
  doc.text(`${firstName} ${lastName}`, 40, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 80);
  doc.text(`Student ID: ${studentId || '—'}`, 40, y); y += 14;
  if (school) doc.text(`High School: ${school}`, 40, y), y += 14;
  if (grade)  doc.text(`Grade Level: ${grade}`, 40, y), y += 14;
  if (gpa)    doc.text(`Cumulative GPA: ${gpa}`, 40, y), y += 14;

  y += 12;
  doc.setDrawColor(200, 210, 230);
  doc.line(40, y, W - 40, y);
  y += 18;

  // Semesters
  for (const sem of transcriptHistory) {
    // Check page overflow
    if (y > 680) { doc.addPage(); y = 50; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(6, 89, 144);
    doc.text(sem.semester, 40, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 110, 130);
    doc.text(`${sem.hoursEarned} hrs  ·  GPA ${sem.gpa.toFixed(2)}`, W - 40, y, { align: 'right' });
    y += 16;

    // Column headers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 130, 150);
    doc.text('Course ID', 52, y);
    doc.text('Course Name', 120, y);
    doc.text('Hrs', W - 100, y, { align: 'right' });
    doc.text('Grade', W - 40, y, { align: 'right' });
    y += 12;

    for (const c of sem.courses) {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 40, 60);
      doc.text(c.courseId, 52, y);
      doc.text(c.name, 120, y);
      doc.text(String(c.hours), W - 100, y, { align: 'right' });
      doc.text(c.grade, W - 40, y, { align: 'right' });
      y += 14;
    }
    y += 10;
    doc.setDrawColor(220, 225, 235);
    doc.line(40, y, W - 40, y);
    y += 14;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 36;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 165);
  doc.text(
    'This is an unofficial transcript for informational purposes only. For official transcripts visit texarkanacollege.edu.',
    W / 2, footerY, { align: 'center' }
  );

  doc.save(`TC_Unofficial_Transcript_${lastName || 'Student'}.pdf`);
}

function SemesterAccordion({ semester }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: `1px solid ${C.border}`,
      boxShadow: '0 1px 5px rgba(0,0,0,.04)',
      marginBottom: 8, overflow: 'hidden',
    }}>
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 15px', textAlign: 'left',
        }}
      >
        <div>
          <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>
            {semester.semester}
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: BLUE,
              background: 'rgba(6,89,144,.09)', borderRadius: 20, padding: '2px 8px',
            }}>
              {semester.hoursEarned} hrs
            </span>
            <span style={{
              fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: BLUE,
              background: 'rgba(6,89,144,.09)', borderRadius: 20, padding: '2px 8px',
            }}>
              GPA {semester.gpa.toFixed(2)}
            </span>
          </div>
        </div>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={C.text3} strokeWidth="2.2" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s', flexShrink: 0 }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Expanded course list */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '4px 15px 12px' }}>
          {/* Column labels */}
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '8px 0 6px',
            borderBottom: `1px solid rgba(0,0,0,.06)`,
            marginBottom: 4,
          }}>
            <span style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.8px', width: 80, flexShrink: 0 }}>ID</span>
            <span style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.8px', flex: 1 }}>Course</span>
            <span style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.8px', width: 30, textAlign: 'center' }}>Hrs</span>
            <span style={{ fontFamily: FF, fontSize: 9.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.8px', width: 50, textAlign: 'right' }}>Grade</span>
          </div>

          {semester.courses.map(c => (
            <div
              key={c.courseId}
              style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid rgba(0,0,0,.04)` }}
            >
              <span style={{
                fontFamily: 'monospace', fontSize: 10.5, color: C.text3,
                background: 'rgba(0,0,0,.04)', borderRadius: 5, padding: '1px 5px',
                width: 80, flexShrink: 0, display: 'inline-block',
              }}>
                {c.courseId}
              </span>
              <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 600, color: C.text, flex: 1, paddingLeft: 6, lineHeight: 1.3 }}>
                {c.name}
              </span>
              <span style={{ fontFamily: FF, fontSize: 12, fontWeight: 600, color: C.text2, width: 30, textAlign: 'center' }}>
                {c.hours}
              </span>
              <span style={{
                fontFamily: FF, fontSize: 12, fontWeight: 800, color: BLUE,
                width: 50, textAlign: 'right',
              }}>
                {c.grade}{c.numericGrade != null ? ` / ${c.numericGrade}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AcademicHistoryAccordion({ history }) {
  const [open, setOpen] = useState(false);
  const sorted = [...history].reverse();
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: `1px solid ${C.border}`,
      boxShadow: '0 1px 5px rgba(0,0,0,.04)',
      marginBottom: 8, overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 15px', textAlign: 'left',
        }}
      >
        <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text }}>
          Completed Courses
        </span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={C.text3} strokeWidth="2.2" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s', flexShrink: 0 }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '10px 10px 4px' }}>
          {sorted.map(sem => <SemesterAccordion key={sem.semester} semester={sem} />)}
        </div>
      )}
    </div>
  );
}

function CompletedCoursesSection({ profile, studentId, firstName, lastName, grade }) {
  const history = profile.transcriptHistory || [];
  const totalHours = history.reduce((sum, s) => sum + s.hoursEarned, 0);
  const cumulativeGpa = profile.gpa ?? null;

  const stored = readStored();
  const schoolObj = stored.school || null;
  const schoolName = schoolObj?.name || profile.highSchool || null;

  return (
    <div style={{ marginTop: 14 }}>

      {history.length === 0 ? (
        <p style={{ fontFamily: FF, fontSize: 13, color: C.text3, textAlign: 'center', padding: '16px 0' }}>
          No completed semesters on record.
        </p>
      ) : (
        <AcademicHistoryAccordion history={history} />
      )}

      {/* Cumulative stats — GPA first, Hours Earned second */}
      <div style={{
        display: 'flex', gap: 10, marginTop: 4, marginBottom: 14,
      }}>
        {cumulativeGpa !== null && (
          <div style={{
            flex: 1, background: '#fff', borderRadius: 14,
            border: `2px solid ${BLUE}`,
            padding: '11px 14px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: BLUE, letterSpacing: '-0.5px' }}>{cumulativeGpa}</div>
            <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: BLUE, marginTop: 2 }}>Cumulative GPA</div>
          </div>
        )}
        <div style={{
          flex: 1, background: '#fff', borderRadius: 14,
          border: `2px solid ${BLUE}`,
          padding: '11px 14px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: BLUE, letterSpacing: '-0.5px' }}>{totalHours}</div>
          <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: BLUE, marginTop: 2 }}>Total Hours Earned</div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={() => downloadTranscriptPDF({
          firstName,
          lastName,
          studentId,
          school: schoolName,
          grade,
          gpa: cumulativeGpa,
          transcriptHistory: history,
        })}
        style={{
          width: '100%', height: 46, borderRadius: 13,
          background: LIME, border: 'none',
          cursor: 'pointer', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 8,
          transition: 'opacity .15s',
        }}
        onMouseDown={e  => e.currentTarget.style.opacity = '0.75'}
        onMouseUp={e    => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        onTouchStart={e => e.currentTarget.style.opacity = '0.75'}
        onTouchEnd={e   => e.currentTarget.style.opacity = '1'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span style={{ fontFamily: FF, fontSize: 13.5, fontWeight: 800, color: BLUE }}>
          Download Unofficial Transcript
        </span>
      </button>

    </div>
  );
}

// ── Section 4: Credit Hours Summary ──────────────────────────────────────────

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
        <div style={{ flex: 1, textAlign: 'center', background: BLUE, borderRadius: 10, padding: '8px 4px' }}>
          <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{earned}</div>
          <div style={{ fontFamily: FF, fontSize: 10, fontWeight: 600, color: '#fff', marginTop: 1 }}>Hours Earned</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', background: LIME, borderRadius: 10, padding: '8px 4px' }}>
          <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: BLUE, letterSpacing: '-0.5px' }}>{pending}</div>
          <div style={{ fontFamily: FF, fontSize: 10, fontWeight: 600, color: BLUE, marginTop: 1 }}>In Progress</div>
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
      {/* Request button — filled blue */}
      <button
        onClick={() => window.open(
          'https://tsorder.studentclearinghouse.org/school/select',
          '_blank', 'noopener,noreferrer'
        )}
        style={{
          width: '100%', height: 44, borderRadius: 13,
          background: BLUE, border: `2px solid ${LIME}`,
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
          stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        <span style={{ fontFamily: FF, fontSize: 13.5, fontWeight: 800, color: '#fff' }}>
          Request Official Transcript
        </span>
      </button>

      <p style={{ fontFamily: FF, fontSize: 12.5, color: C.text2, lineHeight: 1.55, marginBottom: 8 }}>
        Official transcripts are processed through the TC Registrar's Office.
      </p>
      <p style={{ fontFamily: FF, fontSize: 11, color: C.text3, textAlign: 'center', lineHeight: 1.5, marginBottom: 6 }}>
        Search for Texarkana College when prompted to select your school.
      </p>
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
      <BottomNav active="academics" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}

// ── Main content (student + parent share this) ────────────────────────────────

function AcademicsContent({ profile, isParent, onNavigate, tabs, isTablet }) {
  const stored    = readStored();
  const GRADE_WORD = { 9: 'Freshman', 10: 'Sophomore', 11: 'Junior', 12: 'Senior' };
  const grade     = stored.grade || (profile.grade ? GRADE_WORD[profile.grade] || '' : '');
  const firstName = stored.firstName || profile.firstName || '';
  const lastName  = stored.lastName  || profile.lastName  || '';
  const studentId = stored.studentId || profile.studentId || '';

  const metaLine = grade || '';
  const gpa            = profile.gpa            ?? null;
  const graduationYear = profile.graduationYear ?? null;

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
          title={isParent ? "Student's Academics" : 'Academics'}
        />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: isTablet ? '14px 24px 40px' : '14px 14px 100px' }}>

        {/* Identity card — name, school/grade, student ID */}
        <div style={{
          background: BLUE, borderRadius: 20,
          boxShadow: '0 4px 18px rgba(6,89,144,.30)',
          padding: '18px 18px 16px',
          marginBottom: 14,
        }}>
          {/* Name */}
          <div style={{ fontFamily: FF, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 4 }}>
            {firstName} {lastName}
          </div>

          {/* Student ID — plain white text */}
          {studentId && (
            <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: 'rgba(255,255,255,.65)', letterSpacing: '0.4px', marginBottom: 10 }}>
              {studentId}
            </div>
          )}

          {/* Grade pill */}
          {metaLine && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: FF, fontSize: 11, fontWeight: 700, color: BLUE,
                background: 'rgba(234,255,0,.85)', borderRadius: 20, padding: '3px 10px',
              }}>
                {metaLine}
              </span>
            </div>
          )}
        </div>

        {/* Section 2 — Credit Hours */}
        <div style={{ marginTop: 14 }}>
          <SectionHeading label="Program Progress" />
          <CreditHoursSection
            earned={creditHours.earned}
            pending={creditHours.pending}
            total={creditHours.total}
            target={creditHours.target}
          />
        </div>

        {/* Section 3 — Current Courses */}
        <div style={{ marginTop: 14 }}>
          <SectionHeading label="Current Courses" />
          {(profile.currentCourses || []).map(c => (
            <CourseCard key={c.courseId} course={c} />
          ))}
        </div>

        {/* Section 4 — Completed Courses (students + parents only) */}
        <CompletedCoursesSection
          profile={profile}
          studentId={studentId}
          firstName={firstName}
          lastName={lastName}
          grade={grade}
        />

        {/* Section 5 — Transcript */}
        <div style={{ marginTop: 14 }}>
          <TranscriptCard />
        </div>
      </div>

      <BottomNav active="academics" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}

// ── Default export ────────────────────────────────────────────────────────────

export default function AcademicsScreen({ role, onNavigate, tabs }) {
  const isTablet = useIsTablet();
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
      onNavigate={onNavigate}
      tabs={tabs}
      isTablet={isTablet}
    />
  );
}
