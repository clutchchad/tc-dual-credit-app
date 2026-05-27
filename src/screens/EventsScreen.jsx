import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { C, FF } from '../tokens';

// ── Helpers ─────────────────────────────────────────────────────────────────

function matchesUser(docData, schoolId, role) {
  const schoolOk = !schoolId || docData.school === 'all' || docData.school === schoolId;
  const roleOk   = !role     || docData.role   === 'all' || docData.role   === role;
  return schoolOk && roleOk;
}

function fmtDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function daysUntil(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today  = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86_400_000);
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label, top }) {
  return (
    <div style={{
      fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3,
      textTransform: 'uppercase', letterSpacing: '1.4px',
      marginBottom: 8, marginTop: top ? 20 : 0, paddingLeft: 4,
    }}>
      {label}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 12px', fontFamily: FF, fontSize: 13, color: C.text3 }}>
      {message}
    </div>
  );
}

function ItemCard({ item, type }) {
  const dateStr  = type === 'deadline' ? item.dueDate : item.date;
  const days     = daysUntil(dateStr);
  const urgColor =
    days === null  ? C.text3 :
    days <= 7      ? C.red   :
    days <= 14     ? C.orange :
                     C.green;

  return (
    <div style={{ display: 'flex', gap: 13, marginBottom: 12 }}>
      {/* Timeline spine */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 22, flexShrink: 0 }}>
        <div style={{
          width: 13, height: 13, borderRadius: '50%',
          background: type === 'deadline' ? C.red : C.blue,
          border: `3px solid ${type === 'deadline' ? '#fee2e2' : '#dbeafe'}`,
          marginTop: 16, flexShrink: 0,
        }} />
      </div>

      {/* Card body */}
      <div style={{
        flex: 1, background: '#fff', borderRadius: 14,
        border: `1px solid ${C.border}`, padding: '13px 15px',
        boxShadow: '0 1px 4px rgba(0,0,0,.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>
              {item.title}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: FF, fontSize: 12, color: C.text3 }}>
                {type === 'deadline' ? 'Due ' : ''}{fmtDate(dateStr)}
                {type === 'event' && item.time ? ` · ${item.time}` : ''}
              </span>
              {type === 'event' && item.location && (
                <>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', background: C.border }} />
                  <span style={{ fontFamily: FF, fontSize: 12, color: C.text3 }}>{item.location}</span>
                </>
              )}
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: C.border }} />
              <span style={{
                fontFamily: FF, fontSize: 12, fontWeight: 600,
                color: type === 'deadline' ? C.red : C.blue,
              }}>
                {type === 'deadline' ? 'Deadline' : 'Event'}
              </span>
            </div>
            {item.description ? (
              <div style={{ fontFamily: FF, fontSize: 12, color: C.text2, marginTop: 6, lineHeight: 1.45 }}>
                {item.description}
              </div>
            ) : null}
          </div>

          {days !== null && (
            <div style={{ background: `${urgColor}14`, borderRadius: 9, padding: '4px 9px', flexShrink: 0 }}>
              <span style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: urgColor }}>
                {days >= 0 ? `${days}d` : 'Past'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function EventsScreen({ role, school, onNavigate, tabs }) {
  const userSchoolId = school?.id  || null;
  const userRole     = role        || null;

  const [events,          setEvents]          = useState([]);
  const [deadlines,       setDeadlines]       = useState([]);
  const [eventsReady,     setEventsReady]     = useState(false);
  const [deadlinesReady,  setDeadlinesReady]  = useState(false);

  const loading = !eventsReady || !deadlinesReady;

  useEffect(() => {
    const qE = query(collection(db, 'dcEvents'),    orderBy('date',    'asc'));
    const qD = query(collection(db, 'dcDeadlines'), orderBy('dueDate', 'asc'));

    const unsubE = onSnapshot(
      qE,
      snap => {
        setEvents(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(ev => matchesUser(ev, userSchoolId, userRole))
        );
        setEventsReady(true);
      },
      () => setEventsReady(true)   // on error, stop loading — show empty state
    );

    const unsubD = onSnapshot(
      qD,
      snap => {
        setDeadlines(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(dl => matchesUser(dl, userSchoolId, userRole))
        );
        setDeadlinesReady(true);
      },
      () => setDeadlinesReady(true)
    );

    return () => { unsubE(); unsubD(); };
  }, [userSchoolId, userRole]);

  return (
    <div
      className="tc-screen"
      style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}
    >
      <BlueHeader>
        <PageTitle title="Events" sub="Deadlines and upcoming events" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 100px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 40, fontFamily: FF, fontSize: 13, color: C.text3 }}>
            Loading…
          </div>
        ) : (
          <>
            {/* ── Upcoming Events ── */}
            <SectionLabel label="Upcoming Events" />
            {events.length === 0 ? (
              <EmptyState message="No upcoming events for your school." />
            ) : (
              events.map(ev => <ItemCard key={ev.id} item={ev} type="event" />)
            )}

            {/* ── Deadlines ── */}
            <SectionLabel label="Deadlines" top />
            {deadlines.length === 0 ? (
              <EmptyState message="No upcoming deadlines for your school." />
            ) : (
              deadlines.map(dl => <ItemCard key={dl.id} item={dl} type="deadline" />)
            )}
          </>
        )}
      </div>

      <BottomNav active="events" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
