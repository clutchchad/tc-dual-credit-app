import { useState } from 'react';
import { C, FF } from '../tokens';

export default function OnboardRole({ onSelect }) {
  const [picked, setPicked] = useState(null);
  const choose = (r) => { setPicked(r); setTimeout(() => onSelect(r), 180); };

  const cards = [
    {
      role: 'student',
      label: "I'm a Student",
      bg: '#EAFF00',
      iconBg: 'rgba(6,89,144,.1)',
      iconBorder: 'rgba(6,89,144,.25)',
      labelColor: '#065990',
      icon: (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
          <path d="M21 9L37 17.5L21 26L5 17.5Z" fill="#065990"/>
          <path d="M13 20.5v6c0 2.8 3.6 5.5 8 5.5s8-2.7 8-5.5v-6" fill="rgba(6,89,144,.75)"/>
          <line x1="37" y1="17.5" x2="37" y2="27" stroke="rgba(6,89,144,.65)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      role: 'parent',
      label: "I'm a Parent/Guardian",
      bg: 'linear-gradient(135deg,#022b52 0%,#065990 100%)',
      iconBg: 'rgba(234,255,0,.12)',
      iconBorder: 'rgba(234,255,0,.35)',
      labelColor: '#fff',
      icon: (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
          <circle cx="14" cy="13" r="6" fill="rgba(255,255,255,.9)"/>
          <circle cx="28" cy="15" r="5" fill="rgba(255,255,255,.7)"/>
          <path d="M2 38c0-7 5.4-12.5 12-12.5S26 31 26 38" fill="rgba(255,255,255,.9)"/>
          <path d="M22 38c0-5.5 3.6-10 9-10s9 4.5 9 10" fill="rgba(255,255,255,.55)"/>
        </svg>
      ),
    },
  ];



  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:'#fff', display:'flex', flexDirection:'column', paddingTop:'env(safe-area-inset-top, 0px)' }}>
      <div style={{ flex:1, overflow:'auto', padding:'20px 22px 40px' }}>
        <div style={{ fontFamily:FF, fontSize:12, fontWeight:700, color:C.blue, textTransform:'uppercase', letterSpacing:'1.8px', marginBottom:10 }}>Step 1 of 3</div>
        <h1 style={{ fontFamily:FF, fontSize:30, fontWeight:900, color:C.text, letterSpacing:'-1px', lineHeight:1.1, marginBottom:6 }}>Who are you?</h1>
        <p style={{ fontFamily:FF, fontSize:14, color:C.text2, marginBottom:30 }}>We'll personalize your experience.</p>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {cards.map(card => (
            <button
              key={card.role}
              onClick={() => choose(card.role)}
              style={{
                border: picked===card.role ? `2.5px solid ${C.blue}` : `2px solid ${C.border}`,
                borderRadius: 24, overflow: 'hidden', cursor: 'pointer',
                background: 'none', padding: 0, textAlign: 'left',
                transform: picked===card.role ? 'scale(0.97)' : 'scale(1)',
                transition: 'all .15s ease',
                boxShadow: picked===card.role ? `0 0 0 4px rgba(6,89,144,.12)` : '0 2px 16px rgba(0,0,0,.07)',
              }}
            >
              <div style={{ background: card.bg, padding: '28px 26px 26px', position: 'relative' }}>
                <div style={{ width:76, height:76, borderRadius:20, background:card.iconBg, border:`1.5px solid ${card.iconBorder}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                  {card.icon}
                </div>
                <div style={{ fontFamily:FF, fontSize:22, fontWeight:800, color:card.labelColor }}>{card.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
