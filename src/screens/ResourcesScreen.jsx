import { useState } from 'react';
import { BlueHeader } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { resources } from '../data/resources';
import { C, FF } from '../tokens';

const TYPE_COLORS = { pdf:'#b91c1c', video:'#6d28d9', calendar:C.blue, guide:'#0d7654' };

function ResourceIcon({ type }) {
  const col = TYPE_COLORS[type] || C.text3;
  const p = { width:22, height:22, viewBox:'0 0 24 24', fill:'none', stroke:col, strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round' };
  if (type === 'pdf')      return <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>;
  if (type === 'video')    return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4V8z" fill={col} stroke="none"/></svg>;
  if (type === 'calendar') return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
  return <svg {...p}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>;
}

const FILTERS = [['all','All'],['pdf','PDF'],['video','Video'],['calendar','Calendar'],['guide','Guide']];

export default function ResourcesScreen({ onNavigate, tabs }) {
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? resources : resources.filter(r => r.type === filter);

  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:C.bg, display:'flex', flexDirection:'column' }}>
      <BlueHeader>
        <h1 style={{ fontFamily:FF, fontSize:26, fontWeight:900, color:'#fff', letterSpacing:'-0.8px', marginBottom:13 }}>Resources</h1>
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{ flexShrink:0, height:31, padding:'0 13px', borderRadius:20, border:'none', cursor:'pointer', background:filter===id?'#EAFF00':'rgba(255,255,255,.13)', transition:'background .15s' }}
            >
              <span style={{ fontFamily:FF, fontSize:12, fontWeight:700, color:filter===id?'#022b52':'rgba(255,255,255,.8)' }}>{label}</span>
            </button>
          ))}
        </div>
      </BlueHeader>

      <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 100px' }}>
        {list.map(r => {
          const col = TYPE_COLORS[r.type] || C.text3;
          return (
            <button
              key={r.id}
              style={{ width:'100%', background:'#fff', border:`1px solid ${C.border}`, borderRadius:18, padding:'13px 15px', marginBottom:9, cursor:'pointer', display:'flex', alignItems:'center', gap:13, textAlign:'left', boxShadow:'0 2px 8px rgba(0,0,0,.04)', transition:'transform .1s', boxSizing:'border-box' }}
              onMouseDown={e => e.currentTarget.style.transform='scale(0.98)'}
              onMouseUp={e   => e.currentTarget.style.transform='scale(1)'}
              onMouseLeave={e=> e.currentTarget.style.transform='scale(1)'}
              onTouchStart={e=> e.currentTarget.style.transform='scale(0.98)'}
              onTouchEnd={e  => e.currentTarget.style.transform='scale(1)'}
            >
              <div style={{ width:46, height:46, borderRadius:13, background:`${col}14`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <ResourceIcon type={r.type} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:FF, fontSize:14, fontWeight:700, color:C.text }}>{r.title}</div>
                <div style={{ fontFamily:FF, fontSize:12, color:C.text2, marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.desc}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, flexShrink:0 }}>
                <span style={{ fontFamily:FF, fontSize:9.5, fontWeight:700, color:col, background:`${col}14`, borderRadius:6, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{r.tag}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav active="resources" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
