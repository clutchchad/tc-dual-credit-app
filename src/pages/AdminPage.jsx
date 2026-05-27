import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, addDoc, query, orderBy,
  doc, updateDoc, deleteDoc, onSnapshot, Timestamp,
} from 'firebase/firestore';

export default function AdminPage() {
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushStatus, setPushStatus] = useState(null);
  const [pushError, setPushError] = useState('');

  const [schedTitle, setSchedTitle] = useState('');
  const [schedMessage, setSchedMessage] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedStatus, setSchedStatus] = useState(null);

  const [scheduledList, setScheduledList] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'scheduled-notifications'),
      orderBy('scheduledAt', 'asc')
    );
    return onSnapshot(q, snap => {
      setScheduledList(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(d => d.active !== false && !d.fired)
      );
    });
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'notification-history'),
      orderBy('sentAt', 'desc')
    );
    return onSnapshot(q, snap => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  async function handleSendNow(e) {
    e.preventDefault();
    setPushStatus('sending');
    setPushError('');
    try {
      const res = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': import.meta.env.VITE_ADMIN_SECRET || '',
        },
        body: JSON.stringify({ title: pushTitle, body: pushMessage }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setPushStatus('success');
      setPushTitle('');
      setPushMessage('');
      setTimeout(() => setPushStatus(null), 3000);
    } catch (err) {
      setPushStatus('error');
      setPushError(err.message);
    }
  }

  async function handleSchedule(e) {
    e.preventDefault();
    setSchedStatus('saving');
    try {
      const [year, month, day] = schedDate.split('-').map(Number);
      const [hour, minute] = schedTime.split(':').map(Number);
      const scheduledAt = Timestamp.fromDate(new Date(year, month - 1, day, hour, minute, 0, 0));
      await addDoc(collection(db, 'scheduled-notifications'), {
        title: schedTitle,
        message: schedMessage,
        scheduledAt,
        recurrence: 'none',
        active: true,
        fired: false,
        createdAt: Timestamp.now(),
      });
      setSchedStatus('success');
      setSchedTitle('');
      setSchedMessage('');
      setSchedDate('');
      setSchedTime('');
      setTimeout(() => setSchedStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setSchedStatus('error');
    }
  }

  async function handleCancel(id) {
    await updateDoc(doc(db, 'scheduled-notifications', id), { active: false });
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'scheduled-notifications', id));
  }

  function fmtTs(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  }

  const inputCls =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tc-blue';

  return (
    // position:fixed creates its own stacking/scroll context, escaping
    // the app's global overflow:hidden on html/body/#root entirely.
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
        </header>

        <main className="max-w-4xl mx-auto px-8 py-8 space-y-8">

          {/* Section 1: Send Now */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-tc-blue mb-4">Send Notification Now</h2>
            <form onSubmit={handleSendNow} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={pushTitle}
                  onChange={e => setPushTitle(e.target.value)}
                  className={inputCls}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  value={pushMessage}
                  onChange={e => setPushMessage(e.target.value)}
                  className={inputCls}
                  placeholder="Notification message"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={pushStatus === 'sending'}
                  className="bg-tc-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-tc-mid disabled:opacity-50 transition-colors"
                >
                  {pushStatus === 'sending' ? 'Sending…' : 'Send Now'}
                </button>
                {pushStatus === 'success' && (
                  <span className="text-green-600 text-sm font-medium">Sent successfully!</span>
                )}
                {pushStatus === 'error' && (
                  <span className="text-red-600 text-sm font-medium">Error: {pushError}</span>
                )}
              </div>
            </form>
          </section>

          {/* Section 2: Scheduled Notifications */}
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
                  type="text"
                  required
                  value={schedTitle}
                  onChange={e => setSchedTitle(e.target.value)}
                  className={inputCls}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  value={schedMessage}
                  onChange={e => setSchedMessage(e.target.value)}
                  className={inputCls}
                  placeholder="Notification message"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={schedDate}
                    onChange={e => setSchedDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={schedTime}
                    onChange={e => setSchedTime(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={schedStatus === 'saving'}
                  className="bg-tc-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-tc-mid disabled:opacity-50 transition-colors"
                >
                  {schedStatus === 'saving' ? 'Scheduling…' : 'Schedule Notification'}
                </button>
                {schedStatus === 'success' && (
                  <span className="text-green-600 text-sm font-medium">Scheduled!</span>
                )}
                {schedStatus === 'error' && (
                  <span className="text-red-600 text-sm font-medium">Failed to schedule</span>
                )}
              </div>
            </form>

            {scheduledList.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  Upcoming Scheduled
                </h3>
                <div className="space-y-2">
                  {scheduledList.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{fmtTs(item.scheduledAt)}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="text-xs px-3 py-1.5 border border-amber-400 text-amber-700 rounded-md hover:bg-amber-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Notification History */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-tc-blue mb-4">Notification History</h2>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400">No notifications sent yet.</p>
            ) : (
              <div className="space-y-3">
                {history.map(item => (
                  <div
                    key={item.id}
                    className="border border-gray-100 rounded-lg px-4 py-3 bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{item.body}</p>
                        <p className="text-xs text-gray-400 mt-1">{fmtTs(item.sentAt)}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                          item.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
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
