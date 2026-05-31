import { useState, useEffect } from 'react';
import {
  collection, addDoc, query, orderBy,
  doc, deleteDoc, onSnapshot, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { useFirestore } from '../hooks/useFirestore';
import { schools as schoolList } from '../data/schools';

// ── Constants ─────────────────────────────────────────────────────────────────
const SCHOOLS = [{ id: 'all', name: 'All Schools' }, ...schoolList];
const TABS = ['Send Notification', 'Announcements'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function schoolName(id) {
  if (!id || id === 'all') return 'All Schools';
  return schoolList.find(s => s.id === id)?.name || id;
}
function audienceName(r) {
  if (!r || r === 'all') return 'All';
  if (r === 'student') return 'Students';
  if (r === 'parent')  return 'Parents';
  return r;
}
function fmtTs(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tc-blue';

// ── Sub-components ────────────────────────────────────────────────────────────

function SchoolSelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
      {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );
}

function AudienceSelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
      <option value="all">All</option>
      <option value="student">Students</option>
      <option value="parent">Parents</option>
    </select>
  );
}

function StatusBadge({ status }) {
  const isSent = status === 'sent' || status === 'success';
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
      style={
        isSent
          ? { background: 'rgba(22,163,74,.12)', color: '#15803d' }
          : { background: 'rgba(234,255,0,.25)', color: '#4a5000' }
      }
    >
      {isSent ? 'Sent' : 'Scheduled'}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 1 — SEND NOTIFICATION
// ═════════════════════════════════════════════════════════════════════════════
function SendNotificationTab({ db }) {
  const [mode,    setMode]    = useState('now'); // 'now' | 'later'
  const [title,   setTitle]   = useState('');
  const [message, setMessage] = useState('');
  const [school,  setSchool]  = useState('all');
  const [role,    setRole]    = useState('all');
  const [date,    setDate]    = useState('');
  const [time,    setTime]    = useState('');
  const [status,  setStatus]  = useState(null); // null | 'sending' | 'success' | 'error'
  const [errMsg,  setErrMsg]  = useState('');

  const [notifList, setNotifList] = useState([]);

  // Merge notification-history (sent) + scheduled-notifications (pending)
  const [historyList,   setHistoryList]   = useState([]);
  const [scheduledList, setScheduledList] = useState([]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'notification-history'), orderBy('sentAt', 'desc'));
    return onSnapshot(q, snap => {
      setHistoryList(snap.docs.map(d => ({ id: d.id, _type: 'sent', ...d.data() })));
    }, () => {});
  }, [db]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'scheduled-notifications'), orderBy('scheduledAt', 'asc'));
    return onSnapshot(q, snap => {
      setScheduledList(
        snap.docs
          .map(d => ({ id: d.id, _type: 'scheduled', ...d.data() }))
          .filter(d => d.active !== false && !d.fired)
      );
    }, () => {});
  }, [db]);

  // Merge: scheduled first (upcoming), then sent (newest first)
  const merged = [
    ...scheduledList,
    ...historyList,
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setErrMsg('');

    try {
      if (mode === 'now') {
        const res = await fetch('/api/send-notification', {
          method:  'POST',
          headers: {
            'Content-Type':   'application/json',
            'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET || '',
          },
          body: JSON.stringify({ title, body: message, targetSchool: school, targetRole: role }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
      } else {
        // Schedule Later
        const [yr, mo, dy] = date.split('-').map(Number);
        const [hr, min]    = time.split(':').map(Number);
        const scheduledAt  = new Date(yr, mo - 1, dy, hr, min, 0, 0).toISOString();
        const res = await fetch('/api/schedule-notification', {
          method:  'POST',
          headers: {
            'Content-Type':   'application/json',
            'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET || '',
          },
          body: JSON.stringify({ title, message, scheduledAt, targetSchool: school, targetRole: role }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
      }

      setStatus('success');
      setTitle(''); setMessage(''); setSchool('all'); setRole('all');
      setDate(''); setTime('');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus('error');
      setErrMsg(err.message);
    }
  }

  async function handleCancelScheduled(id) {
    if (!db) return;
    await deleteDoc(doc(db, 'scheduled-notifications', id));
  }

  return (
    <div className="space-y-6">
      {/* Form card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">

        {/* Segmented toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
          {['now', 'later'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="px-5 py-2 text-sm font-semibold transition-colors"
              style={
                mode === m
                  ? { background: '#065990', color: '#fff' }
                  : { background: '#f9fafb', color: '#374151' }
              }
            >
              {m === 'now' ? 'Send Now' : 'Schedule Later'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text" required
              value={title} onChange={e => setTitle(e.target.value)}
              className={inputCls} placeholder="Notification title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              required rows={3}
              value={message} onChange={e => setMessage(e.target.value)}
              className={inputCls} placeholder="Notification message"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target School</label>
              <SchoolSelect value={school} onChange={setSchool} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <AudienceSelect value={role} onChange={setRole} />
            </div>
          </div>

          {mode === 'later' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date" required={mode === 'later'}
                    value={date} onChange={e => setDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time" required={mode === 'later'}
                    value={time} onChange={e => setTime(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Notifications are processed once per day. Scheduled notifications may be
                delivered up to 24 hours after the selected time.
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ background: '#065990', color: '#fff' }}
            >
              {status === 'sending'
                ? (mode === 'now' ? 'Sending…' : 'Scheduling…')
                : (mode === 'now' ? 'Send' : 'Schedule')}
            </button>
            {status === 'success' && (
              <span className="text-green-600 text-sm font-medium">
                ✓ {mode === 'now' ? 'Sent!' : 'Scheduled!'}
              </span>
            )}
            {status === 'error' && (
              <span className="text-red-600 text-sm font-medium">Error: {errMsg}</span>
            )}
          </div>
        </form>
      </div>

      {/* Notifications list */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Notifications {merged.length > 0 && `(${merged.length})`}
        </h2>
        {merged.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            {db ? 'No notifications yet.' : 'Connecting to Firestore…'}
          </p>
        ) : (
          <div className="space-y-2">
            {merged.map(item => {
              const isScheduled = item._type === 'scheduled';
              const dateTs      = isScheduled ? item.scheduledAt : item.sentAt;
              const preview     = (item.message || item.body || '').slice(0, 80);
              return (
                <div
                  key={`${item._type}-${item.id}`}
                  className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{preview}</p>
                    <p className="text-xs text-gray-400">
                      {schoolName(item.targetSchool)}
                      {' · '}{audienceName(item.targetRole)}
                      {' · '}{isScheduled ? `Scheduled ${fmtTs(dateTs)}` : fmtTs(dateTs)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    <StatusBadge status={isScheduled ? 'scheduled' : 'sent'} />
                    {isScheduled && (
                      <button
                        onClick={() => handleCancelScheduled(item.id)}
                        className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 2 — ANNOUNCEMENTS
// ═════════════════════════════════════════════════════════════════════════════
function AnnouncementsTab({ db }) {
  const [title,   setTitle]   = useState('');
  const [message, setMessage] = useState('');
  const [school,  setSchool]  = useState('all');
  const [role,    setRole]    = useState('all');
  const [status,  setStatus]  = useState(null);

  const [list, setList] = useState([]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'announcements'), orderBy('postedAt', 'desc'));
    return onSnapshot(q, snap => {
      setList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
  }, [db]);

  async function handlePost(e) {
    e.preventDefault();
    if (!db) return;
    setStatus('saving');
    try {
      await addDoc(collection(db, 'announcements'), {
        title,
        message,
        targetSchool: school,
        targetRole:   role,
        postedAt:     serverTimestamp(),
      });
      setStatus('success');
      setTitle(''); setMessage(''); setSchool('all'); setRole('all');
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus('error');
    }
  }

  async function handleDelete(id) {
    if (!db) return;
    await deleteDoc(doc(db, 'announcements', id));
  }

  return (
    <div className="space-y-6">
      {/* Form card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <form onSubmit={handlePost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text" required
              value={title} onChange={e => setTitle(e.target.value)}
              className={inputCls} placeholder="Announcement title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              required rows={3}
              value={message} onChange={e => setMessage(e.target.value)}
              className={inputCls} placeholder="Announcement message"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target School</label>
              <SchoolSelect value={school} onChange={setSchool} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <AudienceSelect value={role} onChange={setRole} />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={status === 'saving' || !db}
              className="px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              style={{ background: '#EAFF00', color: '#022b52' }}
            >
              {status === 'saving' ? 'Posting…' : 'Post Announcement'}
            </button>
            {status === 'success' && <span className="text-green-600 text-sm font-medium">✓ Posted!</span>}
            {status === 'error'   && <span className="text-red-600 text-sm font-medium">Failed to post.</span>}
          </div>
        </form>
      </div>

      {/* Announcements list */}
      <div>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Announcements {list.length > 0 && `(${list.length})`}
        </h2>
        {list.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            {db ? 'No announcements yet.' : 'Connecting to Firestore…'}
          </p>
        ) : (
          <div className="space-y-2">
            {list.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-start justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{(item.message || '').slice(0, 80)}</p>
                  <p className="text-xs text-gray-400">
                    {schoolName(item.targetSchool)}
                    {' · '}{audienceName(item.targetRole)}
                    {' · '}{fmtTs(item.postedAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors shrink-0 mt-0.5"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', zIndex: 9999 }}>

      {/* Mobile layout */}
      <div className="md:hidden min-h-screen bg-gray-50 flex flex-col">

        {/* Mobile header */}
        <header className="px-4 py-4 shadow-lg" style={{ background: '#065990' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-xl text-white font-black text-lg leading-none"
                style={{ width: 38, height: 38, background: 'rgba(234,255,0,.15)', border: '2px solid rgba(234,255,0,.4)', letterSpacing: '-1px' }}
              >
                TC
              </div>
              <div>
                <div className="text-white font-black text-base leading-none tracking-tight">Dual Credit</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: '#EAFF00', letterSpacing: '1.5px' }}>ADMIN</div>
              </div>
            </div>
            <p className="text-xs font-medium" style={{ color: db ? 'rgba(234,255,0,.8)' : 'rgba(255,255,255,.5)' }}>
              {db ? '● Connected' : '○ Connecting…'}
            </p>
          </div>

          {/* Mobile tab bar */}
          <div className="flex mt-4 border-b border-white/20">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(i)}
                className="flex-1 pb-2.5 text-sm font-semibold transition-colors relative"
                style={{ color: activeTab === i ? '#EAFF00' : 'rgba(255,255,255,.6)' }}
              >
                {tab}
                {activeTab === i && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: '#EAFF00' }}
                  />
                )}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 px-4 py-5">
          {activeTab === 0 && <SendNotificationTab db={db} />}
          {activeTab === 1 && <AnnouncementsTab db={db} />}
        </main>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block min-h-screen bg-gray-50">

        {/* Desktop header */}
        <header className="px-8 py-5 shadow-lg" style={{ background: '#065990' }}>
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-xl text-white font-black text-xl leading-none"
                style={{ width: 44, height: 44, background: 'rgba(234,255,0,.15)', border: '2px solid rgba(234,255,0,.4)', letterSpacing: '-1px' }}
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
            <p className="text-xs font-medium" style={{ color: db ? 'rgba(234,255,0,.8)' : 'rgba(255,255,255,.5)' }}>
              {db ? '● Connected' : '○ Connecting to Firestore…'}
            </p>
          </div>

          {/* Desktop tab bar */}
          <div className="max-w-3xl mx-auto flex mt-5 border-b border-white/20">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(i)}
                className="px-6 pb-3 text-sm font-semibold transition-colors relative"
                style={{ color: activeTab === i ? '#EAFF00' : 'rgba(255,255,255,.6)' }}
              >
                {tab}
                {activeTab === i && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: '#EAFF00' }}
                  />
                )}
              </button>
            ))}
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-8 py-8">
          {activeTab === 0 && <SendNotificationTab db={db} />}
          {activeTab === 1 && <AnnouncementsTab db={db} />}
        </main>
      </div>
    </div>
  );
}
