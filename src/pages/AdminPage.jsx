import { useState, useEffect } from 'react';
import {
  collection, addDoc, query, orderBy, limit,
  doc, updateDoc, deleteDoc, onSnapshot, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { useFirestore } from '../hooks/useFirestore';
import { schools as schoolList } from '../data/schools';

// ── Constants ─────────────────────────────────────────────────────────────────
const SCHOOLS = [{ id: 'all', name: 'All Schools' }, ...schoolList];

const CAT_COLORS = {
  'Announcement': { bg: 'rgba(6,89,144,.10)',   color: '#065990' },
  'Reminder':     { bg: 'rgba(249,115,22,.10)', color: '#c2410c' },
  'TC Promise':   { bg: 'rgba(22,163,74,.10)',  color: '#15803d' },
  'Event':        { bg: 'rgba(124,58,237,.10)', color: '#7c3aed' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function schoolName(id) {
  if (!id || id === 'all') return 'All Schools';
  return schoolList.find(s => s.id === id)?.name || id;
}
function roleName(r) {
  if (!r || r === 'all') return 'All';
  if (r === 'student')   return 'Students';
  if (r === 'parent')    return 'Parents';
  if (r === 'guest')     return 'Guests';
  return r;
}
function fmtDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
function fmtTs(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}
function relTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return fmtTs(ts);
}

// ── Shared role options ───────────────────────────────────────────────────────
const ROLE_OPTIONS = (
  <>
    <option value="all">All</option>
    <option value="student">Students Only</option>
    <option value="parent">Parents Only</option>
    <option value="guest">Guests Only</option>
  </>
);

// ── Section divider ───────────────────────────────────────────────────────────
function SectionDivider({ number, title, subtitle }) {
  return (
    <div className="flex items-center gap-4 pt-2">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-tc-blue text-white text-xs font-bold shrink-0">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-bold text-gray-900 leading-none">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const db = useFirestore();

  // ── Send Now ──────────────────────────────────────────────────────────────
  const [pushTitle,   setPushTitle]   = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushSchool,  setPushSchool]  = useState('all');
  const [pushRole,    setPushRole]    = useState('all');
  const [pushStatus,  setPushStatus]  = useState(null);
  const [pushError,   setPushError]   = useState('');

  // ── Scheduled notifications ───────────────────────────────────────────────
  const [schedTitle,    setSchedTitle]    = useState('');
  const [schedMessage,  setSchedMessage]  = useState('');
  const [schedDate,     setSchedDate]     = useState('');
  const [schedTime,     setSchedTime]     = useState('');
  const [schedSchool,   setSchedSchool]   = useState('all');
  const [schedRole,     setSchedRole]     = useState('all');
  const [schedStatus,   setSchedStatus]   = useState(null);
  const [scheduledList, setScheduledList] = useState([]);

  // ── ACDC Messages ─────────────────────────────────────────────────────────
  const [acdcMessages, setAcdcMessages] = useState([]);

  // ── Timeline ──────────────────────────────────────────────────────────────
  const [tlTitle,      setTlTitle]      = useState('');
  const [tlBody,       setTlBody]       = useState('');
  const [tlCategory,   setTlCategory]   = useState('Announcement');
  const [tlRole,       setTlRole]       = useState('all');
  const [tlSchool,     setTlSchool]     = useState('all');
  const [tlStatus,     setTlStatus]     = useState(null);
  const [timelineList, setTimelineList] = useState([]);

  // ── Events & Deadlines ────────────────────────────────────────────────────
  const [evTitle,    setEvTitle]    = useState('');
  const [evType,     setEvType]     = useState('Event');
  const [evDate,     setEvDate]     = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evSchool,   setEvSchool]   = useState('all');
  const [evStatus,   setEvStatus]   = useState(null);
  const [eventsList, setEventsList] = useState([]);

  // ── Notification history ──────────────────────────────────────────────────
  const [history, setHistory] = useState([]);

  // ── Firestore listeners ───────────────────────────────────────────────────
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'scheduled-notifications'), orderBy('scheduledAt', 'asc'));
    return onSnapshot(q, snap => {
      setScheduledList(
        snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.active !== false && !d.fired)
      );
    }, () => {});
  }, [db]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'acdc-messages'), orderBy('timestamp', 'desc'), limit(20));
    return onSnapshot(q, snap => {
      setAcdcMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
  }, [db]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'timeline'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, snap => {
      setTimelineList(
        snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.active !== false).slice(0, 10)
      );
    }, () => {});
  }, [db]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    return onSnapshot(q, snap => {
      setEventsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
  }, [db]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'notification-history'), orderBy('sentAt', 'desc'));
    return onSnapshot(q, snap => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
  }, [db]);

  // ── Send Now ──────────────────────────────────────────────────────────────
  async function handleSendNow(e) {
    e.preventDefault();
    setPushStatus('sending');
    setPushError('');
    try {
      const res = await fetch('/api/send-notification', {
        method:  'POST',
        headers: {
          'Content-Type':   'application/json',
          'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET || '',
        },
        body: JSON.stringify({
          title:        pushTitle,
          body:         pushMessage,
          targetSchool: pushSchool,
          targetRole:   pushRole,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setPushStatus('success');
      setPushTitle(''); setPushMessage('');
      setPushSchool('all'); setPushRole('all');
      setTimeout(() => setPushStatus(null), 3000);
    } catch (err) {
      setPushStatus('error');
      setPushError(err.message);
    }
  }

  // ── Schedule a notification ───────────────────────────────────────────────
  async function handleSchedule(e) {
    e.preventDefault();
    if (!db) return;
    setSchedStatus('saving');
    try {
      const [year, month, day] = schedDate.split('-').map(Number);
      const [hour, minute]     = schedTime.split(':').map(Number);
      const scheduledAt = Timestamp.fromDate(new Date(year, month - 1, day, hour, minute, 0, 0));
      await addDoc(collection(db, 'scheduled-notifications'), {
        title: schedTitle, message: schedMessage, scheduledAt,
        targetSchool: schedSchool, targetRole: schedRole,
        recurrence: 'none', active: true, fired: false, createdAt: Timestamp.now(),
      });
      setSchedStatus('success');
      setSchedTitle(''); setSchedMessage(''); setSchedDate(''); setSchedTime('');
      setSchedSchool('all'); setSchedRole('all');
      setTimeout(() => setSchedStatus(null), 3000);
    } catch { setSchedStatus('error'); }
  }

  async function handleCancelSched(id) {
    if (!db) return;
    await updateDoc(doc(db, 'scheduled-notifications', id), { active: false });
  }
  async function handleDeleteSched(id) {
    if (!db) return;
    await deleteDoc(doc(db, 'scheduled-notifications', id));
  }

  // ── ACDC Messages ─────────────────────────────────────────────────────────
  async function handleMarkRead(id) {
    if (!db) return;
    await updateDoc(doc(db, 'acdc-messages', id), { status: 'read' });
  }
  async function handleDeleteMessage(id) {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    if (!db) return;
    await deleteDoc(doc(db, 'acdc-messages', id));
  }

  // ── Timeline ──────────────────────────────────────────────────────────────
  async function handlePostTimeline(e) {
    e.preventDefault();
    if (!db) return;
    setTlStatus('saving');
    try {
      await addDoc(collection(db, 'timeline'), {
        title:      tlTitle,
        body:       tlBody,
        category:   tlCategory,
        targetRole: tlRole,
        school:     tlSchool,
        active:     true,
        timestamp:  serverTimestamp(),
      });
      setTlStatus('success');
      setTlTitle(''); setTlBody('');
      setTlCategory('Announcement'); setTlRole('all'); setTlSchool('all');
      setTimeout(() => setTlStatus(null), 3000);
    } catch { setTlStatus('error'); }
  }

  async function handleDeleteTimeline(id) {
    if (!db) return;
    await updateDoc(doc(db, 'timeline', id), { active: false });
  }

  // ── Events & Deadlines ────────────────────────────────────────────────────
  async function handlePostEvent(e) {
    e.preventDefault();
    if (!db) return;
    setEvStatus('saving');
    try {
      await addDoc(collection(db, 'events'), {
        title:    evTitle,
        type:     evType,
        date:     evDate,
        ...(evLocation ? { location: evLocation } : {}),
        school:    evSchool,
        active:    true,
        createdAt: serverTimestamp(),
      });
      setEvStatus('success');
      setEvTitle(''); setEvType('Event'); setEvDate(''); setEvLocation(''); setEvSchool('all');
      setTimeout(() => setEvStatus(null), 3000);
    } catch { setEvStatus('error'); }
  }

  async function handleDeleteEvent(id) {
    if (!db) return;
    await deleteDoc(doc(db, 'events', id));
  }

  // ── Shared class strings ──────────────────────────────────────────────────
  const inputCls =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tc-blue';

  const unreadCount = acdcMessages.filter(m => m.status !== 'read').length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', zIndex: 9999 }}>

      {/* Mobile block */}
      <div className="flex md:hidden items-center justify-center h-screen bg-tc-blue">
        <div className="text-center px-8">
          <div className="text-tc-lime text-5xl mb-4">🖥</div>
          <h1 className="text-white text-xl font-bold mb-2">Desktop Only</h1>
          <p className="text-blue-200 text-sm">
            The admin dashboard is only available on desktop screens.
          </p>
        </div>
      </div>

      {/* Desktop content */}
      <div className="hidden md:block min-h-screen bg-gray-50">

        {/* ── Header ── */}
        <header className="bg-tc-blue px-8 py-5 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* TC wordmark */}
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-xl text-white font-black text-xl leading-none"
                  style={{ width: 44, height: 44, background: 'rgba(234,255,0,.15)', border: '2px solid rgba(234,255,0,.4)', fontFamily: 'system-ui, sans-serif', letterSpacing: '-1px' }}
                >
                  TC
                </div>
                <div>
                  <div className="text-white font-black text-lg leading-none tracking-tight" style={{ letterSpacing: '-0.5px' }}>
                    Dual Credit
                  </div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: '#EAFF00', letterSpacing: '1.5px' }}>
                    ADMIN
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              {!db
                ? <p className="text-blue-200 text-xs">Connecting to Firestore…</p>
                : <p className="text-xs font-medium" style={{ color: 'rgba(234,255,0,.8)' }}>● Connected</p>
              }
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-8 py-8 space-y-10">

          {/* ══════════════════════════════════════════════════════════════
              SECTION 1 — SEND NOTIFICATION NOW
          ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <SectionDivider number="1" title="Send Notification Now" subtitle="Push immediately to subscribed devices" />
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSendNow} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text" required
                    value={pushTitle} onChange={e => setPushTitle(e.target.value)}
                    className={inputCls} placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    required rows={3}
                    value={pushMessage} onChange={e => setPushMessage(e.target.value)}
                    className={inputCls} placeholder="Notification message"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target School</label>
                    <select value={pushSchool} onChange={e => setPushSchool(e.target.value)} className={inputCls}>
                      {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                    <select value={pushRole} onChange={e => setPushRole(e.target.value)} className={inputCls}>
                      {ROLE_OPTIONS}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="submit" disabled={pushStatus === 'sending'}
                    className="bg-tc-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-tc-mid disabled:opacity-50 transition-colors"
                  >
                    {pushStatus === 'sending' ? 'Sending…' : 'Send Now'}
                  </button>
                  {pushStatus === 'success' && <span className="text-green-600 text-sm font-medium">✓ Sent successfully!</span>}
                  {pushStatus === 'error'   && <span className="text-red-600 text-sm font-medium">Error: {pushError}</span>}
                </div>
              </form>
            </section>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 2 — SCHEDULED NOTIFICATIONS
          ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <SectionDivider number="2" title="Scheduled Notifications" subtitle="Queue a notification for future delivery" />
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm mb-5">
                ⚠ Scheduled notifications are processed once daily. A notification scheduled
                less than 24 hours from now may not send until the following day.
              </p>
              <form onSubmit={handleSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text" required
                    value={schedTitle} onChange={e => setSchedTitle(e.target.value)}
                    className={inputCls} placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    required rows={3}
                    value={schedMessage} onChange={e => setSchedMessage(e.target.value)}
                    className={inputCls} placeholder="Notification message"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date" required
                      value={schedDate} onChange={e => setSchedDate(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time" required
                      value={schedTime} onChange={e => setSchedTime(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target School</label>
                    <select value={schedSchool} onChange={e => setSchedSchool(e.target.value)} className={inputCls}>
                      {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                    <select value={schedRole} onChange={e => setSchedRole(e.target.value)} className={inputCls}>
                      {ROLE_OPTIONS}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="submit" disabled={schedStatus === 'saving' || !db}
                    className="bg-tc-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-tc-mid disabled:opacity-50 transition-colors"
                  >
                    {schedStatus === 'saving' ? 'Scheduling…' : 'Schedule Notification'}
                  </button>
                  {schedStatus === 'success' && <span className="text-green-600 text-sm font-medium">✓ Scheduled!</span>}
                  {schedStatus === 'error'   && <span className="text-red-600 text-sm font-medium">Failed to schedule.</span>}
                </div>
              </form>

              {scheduledList.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                    Upcoming Scheduled ({scheduledList.length})
                  </h3>
                  <div className="space-y-2">
                    {scheduledList.map(item => (
                      <div key={item.id} className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {fmtTs(item.scheduledAt)}
                            {item.targetSchool && item.targetSchool !== 'all' ? ` · ${schoolName(item.targetSchool)}` : ''}
                            {item.targetRole   && item.targetRole   !== 'all' ? ` · ${roleName(item.targetRole)}`    : ''}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleCancelSched(item.id)} className="text-xs px-3 py-1.5 border border-amber-400 text-amber-700 rounded-md hover:bg-amber-50 transition-colors">Cancel</button>
                          <button onClick={() => handleDeleteSched(item.id)} className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 3 — ACDC MESSAGES
          ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <SectionDivider
              number="3"
              title="ACDC Messages"
              subtitle={unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'Student reach-out messages'}
            />
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {acdcMessages.length === 0 ? (
                <p className="text-sm text-gray-400">{db ? 'No messages yet.' : 'Connecting…'}</p>
              ) : (
                <div className="space-y-3">
                  {acdcMessages.map(msg => {
                    const isUnread = msg.status !== 'read';
                    return (
                      <div
                        key={msg.id}
                        className={`rounded-xl border px-5 py-4 ${isUnread ? 'border-tc-blue bg-blue-50' : 'border-gray-200 bg-white'}`}
                      >
                        {/* Top row — name, ID, timestamp, status badge */}
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-gray-900">{msg.name || '—'}</span>
                              {msg.studentId && (
                                <span className="text-xs text-gray-400 font-mono">ID: {msg.studentId}</span>
                              )}
                              <span className="text-xs text-gray-400">{relTime(msg.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {msg.school && (
                                <span className="text-xs text-gray-500">{schoolName(msg.school)}</span>
                              )}
                              {msg.acdcName && (
                                <>
                                  <span className="text-xs text-gray-300">→</span>
                                  <span className="text-xs text-gray-500">ACDC: {msg.acdcName}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {isUnread ? (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#EAFF00', color: '#022b52' }}>
                                Unread
                              </span>
                            ) : (
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                                Read
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Message body */}
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">{msg.message}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkRead(msg.id)}
                              className="text-xs px-3 py-1.5 bg-tc-blue text-white rounded-md hover:bg-tc-mid transition-colors font-medium"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 4 — TIMELINE
          ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <SectionDivider number="4" title="Timeline" subtitle="Post cards to the Home screen timeline feed" />
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handlePostTimeline} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text" required
                    value={tlTitle} onChange={e => setTlTitle(e.target.value)}
                    className={inputCls} placeholder="Card title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                  <textarea
                    required rows={3}
                    value={tlBody} onChange={e => setTlBody(e.target.value)}
                    className={inputCls} placeholder="Card body text"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={tlCategory} onChange={e => setTlCategory(e.target.value)} className={inputCls}>
                      <option value="Announcement">Announcement</option>
                      <option value="Reminder">Reminder</option>
                      <option value="TC Promise">TC Promise</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                    <select value={tlRole} onChange={e => setTlRole(e.target.value)} className={inputCls}>
                      <option value="all">All</option>
                      <option value="student">Students Only</option>
                      <option value="parent">Parents Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target School</label>
                    <select value={tlSchool} onChange={e => setTlSchool(e.target.value)} className={inputCls}>
                      {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="submit" disabled={tlStatus === 'saving' || !db}
                    className="px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                    style={{ background: '#EAFF00', color: '#022b52' }}
                  >
                    {tlStatus === 'saving' ? 'Posting…' : 'Post to Timeline'}
                  </button>
                  {tlStatus === 'success' && <span className="text-green-600 text-sm font-medium">✓ Posted!</span>}
                  {tlStatus === 'error'   && <span className="text-red-600 text-sm font-medium">Failed to post.</span>}
                </div>
              </form>

              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  Recent Posts {timelineList.length > 0 && `(${timelineList.length})`}
                </h3>
                {timelineList.length === 0 ? (
                  <p className="text-sm text-gray-400">{db ? 'No timeline posts yet.' : 'Connecting…'}</p>
                ) : (
                  <div className="space-y-2">
                    {timelineList.map(item => {
                      const cs = CAT_COLORS[item.category] || CAT_COLORS['Announcement'];
                      return (
                        <div key={item.id} className="flex items-start justify-between gap-4 border border-gray-200 rounded-lg px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: cs.bg, color: cs.color }}
                              >
                                {item.category}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.body}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {fmtTs(item.timestamp)}
                              {' · '}{roleName(item.targetRole)}
                              {' · '}{schoolName(item.school)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteTimeline(item.id)}
                            className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors shrink-0"
                          >Delete</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 5 — EVENTS & DEADLINES
          ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <SectionDivider number="5" title="Events &amp; Deadlines" subtitle="Post events and deadlines visible in the app calendar" />
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handlePostEvent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text" required
                      value={evTitle} onChange={e => setEvTitle(e.target.value)}
                      className={inputCls} placeholder="Event or deadline title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={evType} onChange={e => setEvType(e.target.value)} className={inputCls}>
                      <option value="Event">Event</option>
                      <option value="Deadline">Deadline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date" required
                      value={evDate} onChange={e => setEvDate(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={evLocation} onChange={e => setEvLocation(e.target.value)}
                      className={inputCls} placeholder="e.g. TC Campus"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target School</label>
                    <select value={evSchool} onChange={e => setEvSchool(e.target.value)} className={inputCls}>
                      {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="submit" disabled={evStatus === 'saving' || !db}
                    className="px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                    style={{ background: '#EAFF00', color: '#022b52' }}
                  >
                    {evStatus === 'saving' ? 'Posting…' : 'Post Event'}
                  </button>
                  {evStatus === 'success' && <span className="text-green-600 text-sm font-medium">✓ Posted!</span>}
                  {evStatus === 'error'   && <span className="text-red-600 text-sm font-medium">Failed to post.</span>}
                </div>
              </form>

              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  All Events &amp; Deadlines {eventsList.length > 0 && `(${eventsList.length})`}
                </h3>
                {eventsList.length === 0 ? (
                  <p className="text-sm text-gray-400">{db ? 'No events or deadlines yet.' : 'Connecting…'}</p>
                ) : (
                  <div className="space-y-2">
                    {eventsList.map(ev => {
                      const isDeadline = ev.type === 'Deadline';
                      return (
                        <div key={ev.id} className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={
                                  isDeadline
                                    ? { background: 'rgba(249,115,22,.10)', color: '#c2410c' }
                                    : { background: 'rgba(124,58,237,.10)', color: '#7c3aed' }
                                }
                              >
                                {ev.type || 'Event'}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{ev.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {fmtDate(ev.date)}
                              {ev.location ? ` · ${ev.location}` : ''}
                              {' · '}{schoolName(ev.school)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors shrink-0"
                          >Delete</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 6 — NOTIFICATION HISTORY (read-only log)
          ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            <SectionDivider number="6" title="Notification History" subtitle="Log of all sent push notifications" />
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {history.length === 0 ? (
                <p className="text-sm text-gray-400">{db ? 'No notifications sent yet.' : 'Connecting…'}</p>
              ) : (
                <div className="space-y-3">
                  {history.map(item => (
                    <div key={item.id} className="border border-gray-100 rounded-lg px-4 py-3 bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600 mt-0.5">{item.body}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {fmtTs(item.sentAt)}
                            {item.targetSchool && item.targetSchool !== 'all' ? ` · ${schoolName(item.targetSchool)}` : ''}
                            {item.targetRole   && item.targetRole   !== 'all' ? ` · ${roleName(item.targetRole)}`   : ''}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${item.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.status || 'sent'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

        </main>
      </div>
    </div>
  );
}
