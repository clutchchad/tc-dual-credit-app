import { useState } from 'react';
import { C, FF } from '../tokens';

const GRADES = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

export default function OnboardGrade({ onSelect, onBack }) {
  const [sel, setSel] = useState(null);

  const pick = (g) => { setSel(g); setTimeout(() => onSelect(g), 180); };

  return (
    <div className="tc-screen" style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div style={{ padding: '6px 22px 20px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: C.blue, padding: '6px 0', marginBottom: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span style={{ fontFamily: FF, fontSize: 14, fontWeight: 600 }}>Back</span>
        </button>
        <div style={{ fontFamily: FF, fontSize: 12, fontWeight: 700, color: '#ff6e00', textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 8 }}>Texas High School</div>
        <h1 style={{ fontFamily: FF, fontSize: 27, fontWeight: 900, color: C.text, letterSpacing: '-0.8px', marginBottom: 4 }}>Your grade</h1>
        <p style={{ fontFamily: FF, fontSize: 13, color: C.text2 }}>What grade are you in this year?</p>
      </div>
      <div style={{ flex: 1, padding: '0 14px 16px' }}>
        {GRADES.map(g => {
          const on = sel === g;
          return (
            <button
              key={g}
              onClick={() => pick(g)}
              style={{
                display: 'flex', alignItems: 'center', width: '100%',
                padding: '17px 16px', marginBottom: 8,
                borderRadius: 16,
                border: on ? `2px solid ${C.blue}` : `1.5px solid ${C.border}`,
                background: on ? 'rgba(6,89,144,.05)' : '#fff',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all .14s', boxSizing: 'border-box',
              }}
            >
              <span style={{ fontFamily: FF, fontSize: 16, fontWeight: 700, color: on ? C.blue : C.text, flex: 1 }}>{g}</span>
              {on && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
