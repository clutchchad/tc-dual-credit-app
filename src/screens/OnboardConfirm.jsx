import { useState, useEffect } from 'react';
import { C, FF } from '../tokens';

export default function OnboardConfirm({ role, school, grade, onConfirm, onBack }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const rows = [
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
      label: 'You are',
      value: role === 'student' ? 'A Student' : 'A Parent',
      bg: C.blue,
    },
    {
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/></svg>,
      label: 'Your school',
      value: school.name,
      bg: 'rgba(6,89,144,.1)',
    },
    ...(school.id === 'txh' && grade ? [{
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
      label: 'Your grade',
      value: grade,
      bg: 'rgba(6,89,144,.1)',
    }] : []),
  ];

  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:'#fff', display:'flex', flexDirection:'column', paddingTop:'env(safe-area-inset-top, 0px)' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px 26px', textAlign:'center' }}>

        {/* Animated check */}
        <div style={{
          width:88, height:88, borderRadius:'50%',
          background:'linear-gradient(135deg,#022b52,#065990)',
          display:'flex', alignItems:'center', justifyContent:'center',
          marginBottom:26,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(.5)',
          transition: 'all .5s cubic-bezier(.34,1.56,.64,1)',
          boxShadow:'0 14px 36px rgba(6,89,144,.35)',
        }}>
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <path
              d="M9 21l8 8 16-16"
              stroke="#EAFF00"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="45"
              strokeDashoffset={visible ? 0 : 45}
              style={{ transition: 'stroke-dashoffset .5s .28s ease' }}
            />
          </svg>
        </div>

        <h1 style={{ fontFamily:FF, fontSize:32, fontWeight:900, color:C.text, letterSpacing:'-1px', marginBottom:8 }}>You're all set!</h1>
        <p style={{ fontFamily:FF, fontSize:14, color:C.text2, marginBottom:30 }}>Here's how we've set things up for you.</p>

        {/* Summary */}
        <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:10, marginBottom:30 }}>
          {rows.map((row, i) => (
            <div key={i} style={{ padding:'15px 18px', borderRadius:18, background:C.bg, border:`1.5px solid ${C.border}`, display:'flex', alignItems:'center', gap:13 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:row.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {row.icon}
              </div>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontFamily:FF, fontSize:11, fontWeight:700, color:C.text3, textTransform:'uppercase', letterSpacing:'1px' }}>{row.label}</div>
                <div style={{ fontFamily:FF, fontSize:16, fontWeight:800, color:C.text }}>{row.value}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onConfirm}
          style={{ width:'100%', height:54, background:'#EAFF00', border:'none', borderRadius:16, cursor:'pointer', marginBottom:12, boxShadow:'0 4px 20px rgba(234,255,0,.35)' }}
        >
          <span style={{ fontFamily:FF, fontSize:16, fontWeight:800, color:'#022b52' }}>Get Started</span>
        </button>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', padding:'8px 0' }}>
          <span style={{ fontFamily:FF, fontSize:14, fontWeight:600, color:C.text3 }}>Change My Choices</span>
        </button>
      </div>
    </div>
  );
}
