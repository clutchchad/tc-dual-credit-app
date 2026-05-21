import { useState, useEffect } from 'react';
import { FF } from '../tokens';

function useTime() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return t
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(' AM', '')
    .replace(' PM', '');
}

export default function StatusBar({ dark = false }) {
  const time = useTime();
  const ic = dark ? 'rgba(255,255,255,0.92)' : '#0A1628';

  return (
    <div style={{
      height: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 22px',
      flexShrink: 0,
      position: 'relative',
      zIndex: 20,
      paddingTop: 'env(safe-area-inset-top, 0px)',
    }}>
      <span style={{ fontFamily: FF, fontSize: 15, fontWeight: 700, color: ic, letterSpacing: '-0.2px' }}>
        {time}
      </span>

      {/* Dynamic Island */}
      <div style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        top: 9, width: 120, height: 32,
        background: '#000', borderRadius: 20, zIndex: 21,
      }} />

      {/* Status icons */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {/* Signal */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill={ic}>
          <rect x="0"    y="7"   width="3" height="5"   rx="0.8" />
          <rect x="4.5"  y="4.5" width="3" height="7.5" rx="0.8" />
          <rect x="9"    y="2"   width="3" height="10"  rx="0.8" />
          <rect x="13.5" y="0"   width="3" height="12"  rx="0.8" />
        </svg>
        {/* Wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <circle cx="8" cy="10" r="1.4" fill={ic} />
          <path d="M4.4 6.8C5.5 5.6 6.7 5 8 5s2.5.6 3.6 1.8" stroke={ic} strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <path d="M1.2 3.8C3.2 1.5 5.5.3 8 .3s4.8 1.2 6.8 3.5" stroke={ic} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </svg>
        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <div style={{ width: 23, height: 11, borderRadius: 3, border: `1.5px solid ${ic}`, display: 'flex', alignItems: 'center', padding: '1.5px 1.5px', boxSizing: 'border-box' }}>
            <div style={{ width: '76%', height: '100%', background: ic, borderRadius: 1.5 }} />
          </div>
          <div style={{ width: 2, height: 5, background: ic, borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}
