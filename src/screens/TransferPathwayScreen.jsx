import { useState, useMemo } from 'react';
import { BlueHeader } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { useIsTablet } from '../hooks/useIsTablet';
import { TRANSFER_COURSES } from '../data/transferCourses';
import { C, FF } from '../tokens';

const BLUE  = '#065990';
const LIME  = '#EAFF00';
const DARK  = '#022b52';

function ChevronIcon({ open }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={C.text3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s', flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={C.text3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

function CourseAccordion({ course }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      marginBottom: 9,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
    }}>
      {/* Collapsed header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '13px 15px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Code badge */}
        <div style={{
          background: `${BLUE}12`, borderRadius: 10, padding: '5px 10px',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: FF, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: '0.3px' }}>
            {course.tccnsCode}
          </span>
        </div>

        {/* Title + hours */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>
            {course.title}
          </div>
          <div style={{ fontFamily: FF, fontSize: 11.5, color: C.text3, marginTop: 2 }}>
            {course.creditHours} credit {course.creditHours === 1 ? 'hour' : 'hours'}
          </div>
        </div>

        <ChevronIcon open={open} />
      </button>

      {/* Expanded body */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '12px 15px 14px' }}>
          <div style={{ fontFamily: FF, fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 10 }}>
            Transfers to
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {course.transfersTo.map((dest, i) => (
              <div key={i} style={{
                background: C.bg, borderRadius: 12, padding: '10px 13px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: C.text }}>
                    {dest.institution}
                  </span>
                  <span style={{
                    fontFamily: FF, fontSize: 11.5, fontWeight: 800, color: BLUE,
                    background: `${BLUE}12`, borderRadius: 7, padding: '2px 8px',
                    flexShrink: 0,
                  }}>
                    {dest.equivalentCourse}
                  </span>
                </div>
                {dest.notes && (
                  <div style={{ fontFamily: FF, fontSize: 11.5, color: C.text2, marginTop: 4, lineHeight: 1.4 }}>
                    {dest.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResourceLinkCard({ title, desc, url }) {
  return (
    <button
      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
      style={{
        width: '100%', background: '#fff',
        border: `1px solid ${C.border}`, borderRadius: 18,
        padding: '14px 16px', marginBottom: 10,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
        textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,.04)',
        boxSizing: 'border-box', transition: 'transform .1s',
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
        background: `${BLUE}14`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4l3 3"/>
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text }}>
          {title}
        </div>
        <div style={{
          fontFamily: FF, fontSize: 12, color: C.text2, marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {desc}
        </div>
      </div>

      <ExternalLinkIcon />
    </button>
  );
}

const CATEGORY_FILTERS = [
  { id: 'all',        label: 'All' },
  { id: 'Academic',   label: 'Academic' },
  { id: 'Workforce',  label: 'Workforce' },
];

export default function TransferPathwayScreen({ onNavigate, tabs }) {
  const isTablet = useIsTablet();
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRANSFER_COURSES.filter(c => {
      const matchesCat = category === 'all' || c.category === category;
      const matchesQ   = !q || c.tccnsCode.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [query, category]);

  const sidePad = isTablet ? '16px 28px 40px' : '14px 14px 150px';

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <BlueHeader>
        <h1 style={{ fontFamily: FF, fontSize: isTablet ? 30 : 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', marginBottom: 13 }}>
          Transfer Pathway
        </h1>
        {/* Category filter pills */}
        <div style={{ display: 'flex', gap: 8, paddingBottom: 2 }}>
          {CATEGORY_FILTERS.map(f => {
            const on = category === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setCategory(f.id)}
                style={{
                  flexShrink: 0, height: 31, padding: '0 13px', borderRadius: 20,
                  border: 'none', cursor: 'pointer',
                  background: on ? LIME : 'rgba(255,255,255,.13)',
                  transition: 'background .15s',
                }}
              >
                <span style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: on ? DARK : 'rgba(255,255,255,.8)' }}>
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </BlueHeader>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: sidePad }}>

        {/* ── Section 1: Intro card ── */}
        <div style={{
          background: '#fff', borderRadius: 18, padding: '16px 18px',
          border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,.04)',
          marginBottom: 22,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${BLUE}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 014-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 01-4 4H3"/>
              </svg>
            </div>
            <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 800, color: DARK }}>
              Your Credits Travel With You
            </span>
          </div>
          <p style={{ fontFamily: FF, fontSize: 13.5, color: C.text2, lineHeight: 1.6, margin: 0 }}>
            Dual credit courses earned at Texarkana College are part of the{' '}
            <strong style={{ color: C.text }}>Texas Core Curriculum</strong>, which means they are designed
            to transfer to public colleges and universities across the state of Texas.
          </p>
          {/* Callout */}
          <div style={{
            marginTop: 12, borderRadius: 12, padding: '10px 13px',
            background: `${LIME}40`, border: `1.5px solid ${LIME}`,
          }}>
            <p style={{ fontFamily: FF, fontSize: 12.5, color: DARK, margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
              This is a planning tool to help you explore where your credits may go.
              Always confirm transferability directly with your intended university before making enrollment decisions.
            </p>
          </div>
        </div>

        {/* ── Section 2: Course Transfer Explorer ── */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: DARK, letterSpacing: '-0.4px', marginBottom: 12 }}>
            Course Transfer Explorer
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={C.text3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by code or title…"
              style={{
                width: '100%', height: 42, borderRadius: 13,
                border: `1.5px solid ${C.border}`, background: '#fff',
                fontFamily: FF, fontSize: 14, color: C.text,
                paddingLeft: 38, paddingRight: 14,
                boxSizing: 'border-box', outline: 'none',
              }}
            />
          </div>

          {filtered.length === 0 ? (
            <div style={{ fontFamily: FF, fontSize: 13.5, color: C.text3, textAlign: 'center', paddingTop: 24 }}>
              No courses match your search.
            </div>
          ) : (
            filtered.map(course => (
              <CourseAccordion key={course.tccnsCode} course={course} />
            ))
          )}
        </div>

        {/* ── Section 3: Plan Your Transfer resources ── */}
        <div>
          <div style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: DARK, letterSpacing: '-0.4px', marginBottom: 12 }}>
            Plan Your Transfer
          </div>

          <ResourceLinkCard
            title="Official Transfer Planning Page"
            desc="Dual Credit resources for students & parents"
            url="https://dualcredit.texarkanacollege.edu/resources-for-students-parents/transfer-planning/"
          />

          <div style={{
            background: '#fff', borderRadius: 18, padding: '14px 16px',
            border: `1px solid ${C.border}`, boxShadow: '0 2px 8px rgba(0,0,0,.04)',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: `${BLUE}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 5 }}>
                  Transfer Agreements
                </div>
                <p style={{ fontFamily: FF, fontSize: 12.5, color: C.text2, margin: 0, lineHeight: 1.55 }}>
                  Texarkana College has articulation agreements with several regional universities, including{' '}
                  <strong style={{ color: C.text }}>Texas A&M Texarkana</strong> and{' '}
                  <strong style={{ color: C.text }}>UT Tyler</strong>. These agreements guarantee
                  that eligible TC credits count toward specific degree programs at the partner institution.
                  Contact the TC Dual Credit office or your intended university's registrar to learn which
                  agreements apply to your planned major.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <BottomNav active="transfer" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
