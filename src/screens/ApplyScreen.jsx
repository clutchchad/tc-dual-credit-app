import { BlueHeader, PageTitle } from '../components/BlueHeader';
import Card from '../components/Card';
import { C, FF } from '../tokens';

const STEPS = [
  { n:1, done:true,  title:'Check Eligibility',   desc:'TSI score requirements, GPA and grade level' },
  { n:2, done:true,  title:'Choose Your Courses',  desc:'Review pathways and pick courses with your ACDC' },
  { n:3, done:false, title:'Get School Approval',  desc:'HS counselor and parent signatures required' },
  { n:4, done:false, title:'Submit Application',   desc:'Complete the ApplyDC form online' },
  { n:5, done:false, title:"You're Enrolled",      desc:'Receive your TC student ID and Moodle access' },
];

export default function ApplyScreen({ onNavigate }) {
  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:C.bg, display:'flex', flexDirection:'column' }}>
      <BlueHeader>
        <PageTitle title="Apply" sub="Dual Credit enrollment steps" onBack={() => onNavigate('home')} />
      </BlueHeader>

      <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 40px' }}>
        {STEPS.map((s, i) => (
          <div key={s.n} style={{ display:'flex', gap:14, marginBottom:10 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, width:32 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%',
                background: s.done ? C.blue : C.bg,
                border: `2px solid ${s.done ? C.blue : C.border}`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                {s.done
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5 9-9"/></svg>
                  : <span style={{ fontFamily:FF, fontSize:12, fontWeight:800, color:C.text3 }}>{s.n}</span>
                }
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width:2, flex:1, background: s.done ? C.blue : C.border, minHeight:18, marginTop:4 }} />
              )}
            </div>
            <Card style={{ flex:1, padding:'11px 15px', marginBottom:0 }}>
              <div style={{ fontFamily:FF, fontSize:14, fontWeight:700, color:C.text }}>{s.title}</div>
              <div style={{ fontFamily:FF, fontSize:12, color:C.text2, marginTop:3, lineHeight:1.5 }}>{s.desc}</div>
            </Card>
          </div>
        ))}

        <button
          style={{ width:'100%', height:54, background:'#EAFF00', border:'none', borderRadius:16, cursor:'pointer', marginTop:12, boxShadow:'0 4px 24px rgba(234,255,0,.3)' }}
          onMouseDown={e => e.currentTarget.style.transform='scale(0.98)'}
          onMouseUp={e   => e.currentTarget.style.transform='scale(1)'}
          onMouseLeave={e=> e.currentTarget.style.transform='scale(1)'}
          onTouchStart={e=> e.currentTarget.style.transform='scale(0.98)'}
          onTouchEnd={e  => e.currentTarget.style.transform='scale(1)'}
        >
          <span style={{ fontFamily:FF, fontSize:16, fontWeight:800, color:'#022b52' }}>Start Application</span>
        </button>
        <p style={{ fontFamily:FF, fontSize:12, color:C.text3, textAlign:'center', marginTop:12 }}>
          You will be taken to the ApplyDC portal to complete enrollment.
        </p>
      </div>
    </div>
  );
}
