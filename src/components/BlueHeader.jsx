import StatusBar from './StatusBar';
import { FF } from '../tokens';

export function BlueHeader({ children, style = {} }) {
  return (
    <div style={{
      background: 'linear-gradient(148deg,#011e3a 0%,#065990 65%,#1077be 100%)',
      flexShrink: 0,
      ...style,
    }}>
      <StatusBar dark />
      <div style={{ padding: '2px 22px 20px' }}>{children}</div>
    </div>
  );
}

export function PageTitle({ title, sub, onBack }) {
  return (
    <>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,.75)', padding: '4px 0', marginBottom: 8,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 600 }}>Back</span>
        </button>
      )}
      <h1 style={{ fontFamily: FF, fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', marginBottom: sub ? 4 : 0 }}>
        {title}
      </h1>
      {sub && (
        <p style={{ fontFamily: FF, fontSize: 13, color: 'rgba(255,255,255,.6)' }}>{sub}</p>
      )}
    </>
  );
}
