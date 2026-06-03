/**
 * AcdcMoreTab — More tab for the ACDC Staff Portal.
 * Contains Sign Out, which clears the coach session and returns to role selection.
 */
import { C, FF } from '../tokens';
import { BlueHeader, PageTitle } from '../components/BlueHeader';

const BLUE = '#065990';
const DARK = '#022b52';

export default function AcdcMoreTab({ onSignOut }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <BlueHeader style={{ paddingBottom: 52 }}>
        <PageTitle title="More" />
      </BlueHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 120px', marginTop: -42 }}>

        {/* App version */}
        <div style={{
          background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14,
          padding: '13px 15px', display: 'flex', justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <span style={{ fontFamily: FF, fontSize: 13, color: C.text2 }}>App Version</span>
          <span style={{ fontFamily: FF, fontSize: 13, fontWeight: 600, color: C.text3 }}>1.0 Beta</span>
        </div>

        {/* Sign Out */}
        <button
          onClick={onSignOut}
          style={{
            width: '100%', background: '#fff', border: `1px solid ${C.border}`,
            borderRadius: 14, padding: '13px 15px', marginBottom: 7,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            textAlign: 'left', boxSizing: 'border-box',
          }}
          onMouseDown={e  => e.currentTarget.style.background = '#fef2f2'}
          onMouseUp={e    => e.currentTarget.style.background = '#fff'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          onTouchStart={e => e.currentTarget.style.background = '#fef2f2'}
          onTouchEnd={e   => e.currentTarget.style.background = '#fff'}
        >
          <div style={{ width: 34, height: 34, borderRadius: 10,
            background: 'rgba(220,38,38,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 600, color: '#dc2626', flex: 1 }}>
            Sign Out
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={C.text3} strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

      </div>
    </div>
  );
}
