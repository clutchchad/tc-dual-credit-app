import { useState } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { C, FF } from '../tokens';

const NOTIF_KEY = 'tcdc_v1_notifs';

const SAMPLE_NOTIFS = [
  { id: 1, title: 'Registration opens May 28', body: 'Summer enrollment is now open for dual credit students.', time: '2h ago' },
  { id: 2, title: 'TSIA Prep Workshop', body: 'Reminder: TSIA Prep Workshop is on Jun 3 at TC Campus.', time: '1d ago' },
  { id: 3, title: 'New resources added', body: 'Check out the updated course catalog for Fall 2025.', time: '3d ago' },
  { id: 4, title: 'Deadline reminder', body: 'Summer registration closes in 7 days — don\'t miss out.', time: '5d ago' },
];

export default function NotificationsScreen({ onNavigate, tabs }) {
  const [pushEnabled, setPushEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY)) ?? true; } catch { return true; }
  });

  const togglePush = () => {
    setPushEnabled(v => {
      const next = !v;
      localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader>
        <PageTitle title="Notifications" onBack={() => onNavigate('home')} />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 100px', marginTop: -42 }}>

        {/* Push notification opt-in */}
        <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 2px 10px rgba(0,0,0,.05)', padding: '15px 17px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(6,89,144,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FF, fontSize: 14, fontWeight: 700, color: C.text }}>Push Notifications</div>
            <div style={{ fontFamily: FF, fontSize: 11.5, color: C.text2, marginTop: 2 }}>
              {pushEnabled ? 'Receiving updates and reminders.' : 'Enable to get updates and reminders.'}
            </div>
          </div>
          <div
            onClick={togglePush}
            style={{ width: 44, height: 26, borderRadius: 13, background: pushEnabled ? C.blue : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}
          >
            <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: '#fff', top: 3, left: pushEnabled ? 21 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
          </div>
        </div>

        {/* Notifications list */}
        <div style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 8, paddingLeft: 4 }}>Recent</div>
        {SAMPLE_NOTIFS.map(n => (
          <div
            key={n.id}
            style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: '13px 14px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#065990', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#EAFF00" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FF, fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontFamily: FF, fontSize: 12, color: C.text2, lineHeight: 1.4 }}>{n.body}</div>
            </div>
            <div style={{ fontFamily: FF, fontSize: 10.5, color: C.text3, flexShrink: 0, paddingLeft: 4, paddingTop: 2 }}>{n.time}</div>
          </div>
        ))}
      </div>

      <BottomNav active="home" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
