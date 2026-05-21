import { useState } from 'react';
import StatusBar from '../components/StatusBar';
import { schools } from '../data/schools';
import { C, FF } from '../tokens';

function initials(name) {
  return name.split(' ').filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 3);
}

export default function OnboardSchool({ onSelect, onBack }) {
  const [q, setQ]     = useState('');
  const [sel, setSel] = useState(null);

  const list = schools.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    s.city.toLowerCase().includes(q.toLowerCase())
  );

  const pick = (school) => { setSel(school.id); setTimeout(() => onSelect(school), 180); };

  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:'#fff', display:'flex', flexDirection:'column' }}>
      <StatusBar />

      <div style={{ padding:'6px 22px 14px', flexShrink:0 }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:C.blue, padding:'6px 0', marginBottom:6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span style={{ fontFamily:FF, fontSize:14, fontWeight:600 }}>Back</span>
        </button>
        <div style={{ fontFamily:FF, fontSize:12, fontWeight:700, color:C.blue, textTransform:'uppercase', letterSpacing:'1.8px', marginBottom:8 }}>Step 2 of 3</div>
        <h1 style={{ fontFamily:FF, fontSize:27, fontWeight:900, color:C.text, letterSpacing:'-0.8px', marginBottom:4 }}>Your high school</h1>
        <p style={{ fontFamily:FF, fontSize:13, color:C.text2, marginBottom:16 }}>Select your partner high school.</p>

        {/* Search */}
        <div style={{ position:'relative' }}>
          <svg style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search schools..."
            style={{ width:'100%', height:46, paddingLeft:40, paddingRight:14, border:`1.5px solid ${C.border}`, borderRadius:14, fontFamily:FF, fontSize:14, outline:'none', background:C.bg, color:C.text, boxSizing:'border-box' }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 14px 16px' }}>
        {list.map(school => {
          const on = sel === school.id;
          return (
            <button
              key={school.id}
              onClick={() => pick(school)}
              style={{
                display:'flex', alignItems:'center', width:'100%',
                padding:'13px 14px', marginBottom:7,
                borderRadius:16,
                border: on ? `2px solid ${C.blue}` : `1.5px solid ${C.border}`,
                background: on ? `rgba(6,89,144,.05)` : '#fff',
                cursor:'pointer', textAlign:'left',
                transition:'all .14s', boxSizing:'border-box',
              }}
            >
              <div style={{ width:40, height:40, borderRadius:12, background:on?C.blue:C.bg, display:'flex', alignItems:'center', justifyContent:'center', marginRight:13, flexShrink:0, transition:'background .14s' }}>
                <span style={{ fontFamily:FF, fontSize:11, fontWeight:800, color:on?'#fff':C.text3 }}>{initials(school.name)}</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:FF, fontSize:15, fontWeight:700, color:on?C.blue:C.text }}>{school.name}</div>
                <div style={{ fontFamily:FF, fontSize:12, color:C.text3, marginTop:1 }}>{school.city}, TX</div>
              </div>
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
