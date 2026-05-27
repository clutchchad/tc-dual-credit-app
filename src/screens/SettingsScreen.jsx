import { useState } from 'react';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { C, FF } from '../tokens';

const NOTIF_KEY = 'tcdc_v1_notifs';

export default function SettingsScreen({ role, school, onChangeRole, onChangeSchool, onNavigate, tabs }) {
  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY)) ?? true; } catch { return true; }
  });

  const profileRows = [
    { label: 'Change My School', icon: 'school', action: onChangeSchool },
    { label: 'Change My Role',   icon: 'role',   action: onChangeRole   },
  ];

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <BlueHeader style={{ paddingBottom: 52 }}>
        <PageTitle title="Settings" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 100px', marginTop: -42 }}>

        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 2px 10px rgba(0,0,0,.05)', padding: '17px 17px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#022b52,#065990)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: FF, fontSize: 16, fontWeight: 800, color: C.text }}>{role === 'student' ? 'Student' : 'Parent'}</div>
            <div style={{ fontFamily: FF, fontSize: 13, color: C.text2, marginTop: 1 }}>{school.name}</div>
          </div>
        </div>

        {/* Profile settings */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 8, paddingLeft: 4 }}>Profile</div>
          {profileRows.map(row => (
            <button
              key={row.label}
              onClick={row.action}
              style={{ width: '100%', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '13px 15px', marginBottom: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', boxSizing: 'border-box' }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6,89,144,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {row.icon === 'school'
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                }
              </div>
              <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 600, color: C.text, flex: 1 }}>{row.label}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>

        {/* Preferences */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: FF, fontSize: 10.5, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 8, paddingLeft: 4 }}>Preferences</div>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(6,89,144,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
            <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 600, color: C.text, flex: 1 }}>Push Notifications</span>
            <div
              onClick={() => setNotifs(n => { const next = !n; localStorage.setItem(NOTIF_KEY, JSON.stringify(next)); return next; })}
              style={{ width: 44, height: 26, borderRadius: 13, background: notifs ? C.blue : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}
            >
              <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: '#fff', top: 3, left: notifs ? 21 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
            </div>
          </div>
        </div>

        {/* App version */}
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '13px 15px', display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
          <span style={{ fontFamily: FF, fontSize: 13, color: C.text2 }}>App Version</span>
          <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 600, color: C.text3 }}>1.0 Beta</span>
        </div>

        <div style={{ textAlign: 'center', paddingBottom: 10 }}>
          <div style={{ fontFamily: FF, fontSize: 15, fontWeight: 900, color: C.blue, letterSpacing: '-0.3px' }}>TC Dual Credit</div>
          <div style={{ fontFamily: FF, fontSize: 11, color: C.text3, marginTop: 2 }}>Texarkana College</div>
        </div>
      </div>

      <BottomNav active="settings" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
