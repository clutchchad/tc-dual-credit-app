import { BlueHeader, PageTitle } from '../components/BlueHeader';
import { pathways } from '../data/pathways';
import { C, FF } from '../tokens';

export default function PathwaysScreen({ onNavigate }) {
  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:C.bg, display:'flex', flexDirection:'column' }}>
      <BlueHeader>
        <PageTitle title="Pathway Plans" sub="Choose your academic direction" onBack={() => onNavigate('home')} />
      </BlueHeader>

      <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 40px' }}>
        <div style={{ background:'rgba(6,89,144,.07)', borderRadius:14, padding:'12px 15px', marginBottom:14, border:'1px solid rgba(6,89,144,.14)' }}>
          <p style={{ fontFamily:FF, fontSize:13, color:C.blue, fontWeight:500, lineHeight:1.6 }}>
            Each pathway is a sequence of dual credit courses leading toward a college degree or career certification.
          </p>
        </div>

        {pathways.map(p => (
          <div
            key={p.id}
            style={{ background:'#fff', borderRadius:20, overflow:'hidden', marginBottom:10, border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}
          >
            <div style={{ background:p.color, padding:'13px 17px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:FF, fontSize:17, fontWeight:800, color:'#fff' }}>{p.name}</span>
              <div style={{ background:'rgba(255,255,255,.2)', borderRadius:10, padding:'3px 10px' }}>
                <span style={{ fontFamily:FF, fontSize:11, fontWeight:700, color:'#fff' }}>{p.courses} courses</span>
              </div>
            </div>
            <div style={{ padding:'11px 17px' }}>
              <p style={{ fontFamily:FF, fontSize:13, color:C.text2, lineHeight:1.5 }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
