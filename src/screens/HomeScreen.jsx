import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import { getAcdcForSchool } from '../data/acdc';
import { C, FF } from '../tokens';

export default function HomeScreen({ role, school, onNavigate, tabs }) {
  const acdc = getAcdcForSchool(school.id);
  const shortName = school.name.replace(' HS', '').replace(' High', '');

  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:'#eef1f5', display:'flex', flexDirection:'column', position:'relative' }}>

      {/* ── HEADER ── */}
      <div style={{ background:'#065990', flexShrink:0 }}>
        <StatusBar dark />
        <div style={{ padding:'0 16px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:FF, fontSize:24, fontWeight:900, color:'#fff', letterSpacing:'-0.7px', lineHeight:1.1 }}>
              {role === 'student' ? 'Student' : 'Parent'}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#EAFF00', boxShadow:'0 0 5px #EAFF00' }} />
              <span style={{ fontFamily:FF, fontSize:12, color:'rgba(255,255,255,.6)', fontWeight:500 }}>{school.name}</span>
            </div>
          </div>
          {/* Weather pill + bell */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:20, padding:'5px 11px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" fill="#EAFF00"/>
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#EAFF00" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily:FF, fontSize:13, fontWeight:700, color:'#fff' }}>84°F</span>
            </div>
            <button style={{ width:36, height:36, borderRadius:11, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.14)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, padding:'10px 12px', paddingBottom:88, overflow:'hidden' }}>

        {/* ROW 1: Next Deadline + Next Event */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
          {/* Deadline */}
          <div style={{ borderRadius:18, overflow:'hidden', boxShadow:'0 4px 16px rgba(6,89,144,.22)' }}>
            <div style={{ background:'#065990', padding:'13px 13px 10px' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(234,255,0,.15)', border:'1px solid rgba(234,255,0,.3)', borderRadius:7, padding:'3px 8px', marginBottom:9 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'#EAFF00', animation:'tcPulse 2s infinite' }} />
                <span style={{ fontFamily:FF, fontSize:9.5, fontWeight:700, color:'#EAFF00', textTransform:'uppercase', letterSpacing:'1px' }}>Next Deadline</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                <div>
                  <div style={{ fontFamily:FF, fontSize:13.5, fontWeight:800, color:'#fff', letterSpacing:'-0.3px', lineHeight:1.25 }}>Summer<br/>Registration</div>
                  <div style={{ fontFamily:FF, fontSize:11, color:'rgba(255,255,255,.5)', marginTop:4 }}>May 28, 2025</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:FF, fontSize:34, fontWeight:900, color:'#EAFF00', lineHeight:1, letterSpacing:'-2px' }}>7</div>
                  <div style={{ fontFamily:FF, fontSize:9, color:'rgba(255,255,255,.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>days</div>
                </div>
              </div>
            </div>
            <button onClick={() => onNavigate('events')} style={{ width:'100%', background:'#fff', border:'none', padding:'8px 13px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:FF, fontSize:11, color:C.text2, fontWeight:500 }}>View all</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          {/* Event */}
          <div style={{ borderRadius:18, overflow:'hidden', boxShadow:'0 4px 16px rgba(10,61,98,.28)' }}>
            <div style={{ background:'#0a3d62', padding:'13px 13px 10px' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(147,210,255,.13)', border:'1px solid rgba(147,210,255,.28)', borderRadius:7, padding:'3px 8px', marginBottom:9 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'#93d2ff' }} />
                <span style={{ fontFamily:FF, fontSize:9.5, fontWeight:700, color:'#93d2ff', textTransform:'uppercase', letterSpacing:'1px' }}>Next Event</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                <div>
                  <div style={{ fontFamily:FF, fontSize:13.5, fontWeight:800, color:'#fff', letterSpacing:'-0.3px', lineHeight:1.25 }}>TSIA Prep<br/>Workshop</div>
                  <div style={{ fontFamily:FF, fontSize:11, color:'rgba(255,255,255,.5)', marginTop:4 }}>Jun 3 · TC Campus</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:FF, fontSize:34, fontWeight:900, color:'#93d2ff', lineHeight:1, letterSpacing:'-2px' }}>13</div>
                  <div style={{ fontFamily:FF, fontSize:9, color:'rgba(255,255,255,.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>days</div>
                </div>
              </div>
            </div>
            <button onClick={() => onNavigate('events')} style={{ width:'100%', background:'#fff', border:'none', padding:'8px 13px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:FF, fontSize:11, color:C.text2, fontWeight:500 }}>View all</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        {/* ROW 2: Last Notification */}
        <div style={{ background:'#fff', borderRadius:18, padding:'11px 14px', boxShadow:'0 2px 8px rgba(0,0,0,.05)', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:9 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#EAFF00' }} />
              <span style={{ fontFamily:FF, fontSize:10.5, fontWeight:700, color:C.text, textTransform:'uppercase', letterSpacing:'1.1px' }}>Last Notification</span>
            </div>
            <span onClick={() => onNavigate('events')} style={{ fontFamily:FF, fontSize:11.5, fontWeight:700, color:C.blue, cursor:'pointer' }}>See all</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:11 }}>
            <div style={{ width:42, height:42, borderRadius:13, background:'#065990', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#EAFF00" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:FF, fontSize:13, fontWeight:700, color:C.text, marginBottom:1 }}>Registration opens May 28</div>
              <div style={{ fontFamily:FF, fontSize:11.5, color:C.text2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Summer enrollment is now open for dual credit students.</div>
            </div>
            <div style={{ fontFamily:FF, fontSize:10.5, color:C.text3, flexShrink:0, paddingLeft:4 }}>2h ago</div>
          </div>
        </div>

        {/* ROW 3: My ACDC — tightened fixed height */}
        <div style={{ background:'#fff', borderRadius:18, padding:'13px 14px', boxShadow:'0 2px 8px rgba(0,0,0,.05)', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:11 }}>
            <span style={{ fontFamily:FF, fontSize:12, fontWeight:800, color:C.text, letterSpacing:'-0.1px' }}>My ACDC</span>
            <div style={{ background:'rgba(6,89,144,.08)', borderRadius:8, padding:'3px 9px' }}>
              <span style={{ fontFamily:FF, fontSize:10, fontWeight:700, color:C.blue }}>{shortName}</span>
            </div>
          </div>
          {/* Avatar + name */}
          <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:12 }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,rgba(6,89,144,.12),rgba(6,89,144,.32))', border:'2.5px solid #fff', boxShadow:'0 3px 10px rgba(6,89,144,.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontFamily:FF, fontSize:15, fontWeight:800, color:C.blue }}>
                {acdc.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <div style={{ fontFamily:FF, fontSize:15, fontWeight:800, color:C.text, letterSpacing:'-0.3px' }}>{acdc.name}</div>
              <div style={{ fontFamily:FF, fontSize:11.5, color:C.blue, fontWeight:600, marginTop:1 }}>Academic Coach for Dual Credit</div>
            </div>
          </div>
          {/* Actions */}
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ flex:1, height:40, background:'#EAFF00', border:'none', borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#022b52" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <span style={{ fontFamily:FF, fontSize:12.5, fontWeight:800, color:'#022b52' }}>Schedule a Meeting</span>
            </button>
            <a href={`mailto:${acdc.email}`} style={{ width:40, height:40, borderRadius:12, background:'#065990', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
            </a>
            <a href={`tel:${acdc.phone}`} style={{ width:40, height:40, borderRadius:12, background:'#065990', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            </a>
          </div>
        </div>

        {/* ROW 4: Apply banner */}
        <button
          onClick={() => onNavigate('apply')}
          style={{ width:'100%', background:'#EAFF00', border:'none', borderRadius:18, padding:'14px 16px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, boxSizing:'border-box', boxShadow:'0 4px 20px rgba(234,255,0,.28)' }}
          onMouseDown={e => e.currentTarget.style.transform='scale(0.98)'}
          onMouseUp={e   => e.currentTarget.style.transform='scale(1)'}
          onMouseLeave={e=> e.currentTarget.style.transform='scale(1)'}
          onTouchStart={e=> e.currentTarget.style.transform='scale(0.98)'}
          onTouchEnd={e  => e.currentTarget.style.transform='scale(1)'}
        >
          <div>
            <div style={{ fontFamily:FF, fontSize:16, fontWeight:900, color:'#022b52', letterSpacing:'-0.4px' }}>Apply for Dual Credit</div>
            <div style={{ fontFamily:FF, fontSize:11, color:'#044872', marginTop:2 }}>Start your college journey today</div>
          </div>
          <div style={{ width:40, height:40, borderRadius:12, background:'#022b52', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EAFF00" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </button>

      </div>

      <BottomNav active="home" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
