import { useState, useEffect } from 'react';
import {
  collection, addDoc, query, orderBy,
  doc, updateDoc, deleteDoc, onSnapshot, Timestamp,
} from 'firebase/firestore';
import { useFirestore } from '../hooks/useFirestore';
import { schools as schoolList } from '../data/schools';

const SCHOOLS = [{ id: 'all', name: 'All Schools' }, ...schoolList];

function schoolName(id) {
  if (!id || id === 'all') return 'All Schools';
  return schoolList.find(s => s.id === id)?.name || id;
}
function roleName(r) {
  if (!r || r === 'all') return 'All';
  if (r === 'student')   return 'Students';
  if (r === 'parent')    return 'Parents';
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
  const [schedStatus,   setSchedStatus]   = useState(null);
  const [scheduledList, setScheduledList] = useState([]);

  // ── Calendar Events ───────────────────────────────────────────────────────
  const [evtTitle,    setEvtTitle]    = useState('');
  const [evtDesc,     setEvtDesc]     = useState('');
  const [evtDate,     setEvtDate]     = useState('');
  const [evtTime,     setEvtTime]     = useState('');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtSchool,   setEvtSchool]   = useState('all');
  const [evtRole,     setEvtRole]     = useState('all');
  const [evtStatus,   setEvtStatus]   = useState(null);
  const [eventsList,  setEventsList]  = useState([]);

  // ── Deadlines ─────────────────────────────────────────────────────────────
  const [dlTitle,       setDlTitle]       = useState('');
  const [dlDesc,        setDlDesc]        = useState('');
  const [dlDate,        setDlDate]        = useState('');
  const [dlSchool,      setDlSchool]      = useState('all');
  const [dlRole,        setDlRole]        = useState('all');
  const [dlStatus,      setDlStatus]      = useState(null);
  const [deadlinesList, setDeadlinesList] = useState([]);

  // ── Notification history ──────────────────────────────────────────────────
  const [history, setHistory] = useState([]);

  // ── Firestore listeners — each re-runs once db becomes available ──────────
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
    const q = query(collection(db, 'notification-history'), orderBy('sentAt', 'desc'));
    return onSnapshot(q, snap => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
  }, [db]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'dcEvents'), orderBy('date', 'asc'));
    return onSnapshot(q, snap => {
      setEventsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
  }, [db]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'dcDeadlines'), orderBy('dueDate', 'asc'));
    return onSnapshot(q, snap => {
      setDeadlinesList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
        recurrence: 'none', active: true, fired: false, createdAt: Timestamp.now(),
      });
      setSchedStatus('success');
      setSchedTitle(''); setSchedMessage(''); setSchedDate(''); setSchedTime('');
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

  // ── Calendar Events ───────────────────────────────────────────────────────
  async function handleCreateEvent(e) {
    e.preventDefault();
    if (!db) return;
    setEvtStatus('saving');
    try {
      await addDoc(collection(db, 'dcEvents'), {
        title:       evtTitle,
        description: evtDesc,
        date:        evtDate,
        ...(evtTime     ? { time:     evtTime     } : {}),
        ...(evtLocation ? { location: evtLocation } : {}),
        school:    evtSchool,
        role:      evtRole,
        createdAt: Timestamp.now(),
      });
      setEvtStatus('success');
      setEvtTitle(''); setEvtDesc(''); setEvtDate(''); setEvtTime(''); setEvtLocation('');
      setEvtSchool('all'); setEvtRole('all');
      setTimeout(() => setEvtStatus(null), 3000);
    } catch { setEvtStatus('error'); }
  }

  async function handleDeleteEvent(id) {
    if (!db) return;
    await deleteDoc(doc(db, 'dcEvents', id));
  }

  // ── Deadlines ─────────────────────────────────────────────────────────────
  async function handleCreateDeadline(e) {
    e.preventDefault();
    if (!db) return;
    setDlStatus('saving');
    try {
      await addDoc(collection(db, 'dcDeadlines'), {
        title:   dlTitle,
        dueDate: dlDate,
        ...(dlDesc ? { description: dlDesc } : {}),
        school:    dlSchool,
        role:      dlRole,
        createdAt: Timestamp.now(),
      });
      setDlStatus('success');
      setDlTitle(''); setDlDesc(''); setDlDate('');
      setDlSchool('all'); setDlRole('all');
      setTimeout(() => setDlStatus(null), 3000);
    } catch { setDlStatus('error'); }
  }

  async function handleDeleteDeadline(id) {
    if (!db) return;
    await deleteDoc(doc(db, 'dcDeadlines', id));
  }

  // ── Shared class strings ──────────────────────────────────────────────────
  const inputCls =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tc-blue';

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

        <header className="bg-tc-blue px-8 py-5 shadow">
          <h1 className="text-white text-2xl font-bold tracking-tight">
            TC Dual Credit &mdash; Admin Dashboard
          </h1>
          {!db && (
            <p className="text-blue-200 text-xs mt-1">Connecting to Firestore…</p>
          )}
        </header>

        <main className="max-w-4xl mx-auto px-8 py-8 space-y-8">

          {/* ── Section 1: Send Notification Now ── */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-tc-blue mb-4">Send Notification Now</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                  <select value={pushSchool} onChange={e => setPushSchool(e.target.value)} className={inputCls}>
                    {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={pushRole} onChange={e => setPushRole(e.target.value)} className={inputCls}>
                    <option value="all">All</option>
                    <option value="student">Students Only</option>
                    <option value="parent">Parents Only</option>
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
                {pushStatus === 'success' && <span className="text-green-600 text-sm font-medium">Sent successfully!</span>}
                {pushStatus === 'error'   && <span className="text-red-600 text-sm font-medium">Error: {pushError}</span>}
              </div>
            </form>
          </section>

          {/* ── Section 2: Calendar Events ── */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-tc-blue mb-4">Calendar Events</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text" required
                  value={evtTitle} onChange={e => setEvtTitle(e.target.value)}
                  className={inputCls} placeholder="Event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={evtDesc} onChange={e => setEvtDesc(e.target.value)}
                  className={inputCls} placeholder="Event description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date" required
                    value={evtDate} onChange={e => setEvtDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="time"
                    value={evtTime} onChange={e => setEvtTime(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={evtLocation} onChange={e => setEvtLocation(e.target.value)}
                  className={inputCls} placeholder="e.g. TC Campus, Room 101"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                  <select value={evtSchool} onChange={e => setEvtSchool(e.target.value)} className={inputCls}>
                    {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={evtRole} onChange={e => setEvtRole(e.target.value)} className={inputCls}>
                    <option value="all">All</option>
                    <option value="student">Students Only</option>
                    <option value="parent">Parents Only</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit" disabled={evtStatus === 'saving' || !db}
                  className="bg-tc-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-tc-mid disabled:opacity-50 transition-colors"
                >
                  {evtStatus === 'saving' ? 'Creating…' : 'Create Event'}
                </button>
                {evtStatus === 'success' && <span className="text-green-600 text-sm font-medium">Event created!</span>}
                {evtStatus === 'error'   && <span className="text-red-600 text-sm font-medium">Failed to create event.</span>}
              </div>
            </form>

            <div className="mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">All Events</h3>
              {eventsList.length === 0 ? (
                <p className="text-sm text-gray-400">{db ? 'No events yet.' : 'Connecting…'}</p>
              ) : (
                <div className="space-y-2">
                  {eventsList.map(ev => (
                    <div key={ev.id} className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{ev.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {fmtDate(ev.date)}
                          {ev.time     ? ` · ${ev.time}`     : ''}
                          {ev.location ? ` · ${ev.location}` : ''}
                          {' · '}{schoolName(ev.school)}
                          {' · '}{roleName(ev.role)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors shrink-0"
                      >Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Section 3: Deadlines ── */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-tc-blue mb-4">Deadlines</h2>
            <form onSubmit={handleCreateDeadline} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text" required
                  value={dlTitle} onChange={e => setDlTitle(e.target.value)}
                  className={inputCls} placeholder="Deadline title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={dlDesc} onChange={e => setDlDesc(e.target.value)}
                  className={inputCls} placeholder="Additional details"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date" required
                    value={dlDate} onChange={e => setDlDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                  <select value={dlSchool} onChange={e => setDlSchool(e.target.value)} className={inputCls}>
                    {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={dlRole} onChange={e => setDlRole(e.target.value)} className={inputCls}>
                    <option value="all">All</option>
                    <option value="student">Students Only</option>
                    <option value="parent">Parents Only</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit" disabled={dlStatus === 'saving' || !db}
                  className="bg-tc-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-tc-mid disabled:opacity-50 transition-colors"
                >
                  {dlStatus === 'saving' ? 'Creating…' : 'Create Deadline'}
                </button>
                {dlStatus === 'success' && <span className="text-green-600 text-sm font-medium">Deadline created!</span>}
                {dlStatus === 'error'   && <span className="text-red-600 text-sm font-medium">Failed to create deadline.</span>}
              </div>
            </form>

            <div className="mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">All Deadlines</h3>
              {deadlinesList.length === 0 ? (
                <p className="text-sm text-gray-400">{db ? 'No deadlines yet.' : 'Connecting…'}</p>
              ) : (
                <div className="space-y-2">
                  {deadlinesList.map(dl => (
                    <div key={dl.id} className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{dl.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Due {fmtDate(dl.dueDate)}
                          {' · '}{schoolName(dl.school)}
                          {' · '}{roleName(dl.role)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteDeadline(dl.id)}
                        className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors shrink-0"
                      >Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Section 4: Schedule a Notification ── */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-tc-blue mb-3">Schedule a Notification</h2>

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
              <div className="flex items-center gap-4">
                <button
                  type="submit" disabled={schedStatus === 'saving' || !db}
                  className="bg-tc-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-tc-mid disabled:opacity-50 transition-colors"
                >
                  {schedStatus === 'saving' ? 'Scheduling…' : 'Schedule Notification'}
                </button>
                {schedStatus === 'success' && <span className="text-green-600 text-sm font-medium">Scheduled!</span>}
                {schedStatus === 'error'   && <span className="text-red-600 text-sm font-medium">Failed to schedule</span>}
              </div>
            </form>

            {scheduledList.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Upcoming Scheduled</h3>
                <div className="space-y-2">
                  {scheduledList.map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{fmtTs(item.scheduledAt)}</p>
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

          {/* ── Section 5: Notification History ── */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-tc-blue mb-4">Notification History</h2>
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

        </main>
      </div>
    </div>
  );
}
