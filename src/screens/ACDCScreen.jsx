import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import Card from '../components/Card';
import { getAcdcForSchool } from '../data/acdc';
import { C, FF } from '../tokens';

function ContactIcon({ type }) {
  const p = { width:17, height:17, viewBox:'0 0 24 24', fill:'none', stroke:C.blue, strokeWidth:2, strokeLinecap:'round' };
  if (type === 'email') return <svg {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>;
  if (type === 'phone') return <svg {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.85a19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
  return <svg {...p}><path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 22V12h6v10"/></svg>;
}

export default function ACDCScreen({ school, onNavigate, tabs }) {
  const acdc = getAcdcForSchool(school.id);
  const initials = acdc.name.split(' ').map(w => w[0]).join('').slice(0, 2);

  const contacts = [
    { type: 'email',  label: 'Email',  val: acdc.email,  href: `mailto:${acdc.email}` },
    { type: 'phone',  label: 'Phone',  val: acdc.phone,  href: `tel:${acdc.phone}` },
    { type: 'office', label: 'Office', val: acdc.office, href: null },
  ];

  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:C.bg, display:'flex', flexDirection:'column' }}>
      <BlueHeader style={{ paddingBottom:52 }}>
        <PageTitle title="My ACDC" sub="Your Academic Coach for Dual Credit" />
      </BlueHeader>

      <div style={{ flex:1, overflowY:'auto', padding:'0 14px 100px', marginTop:-42 }}>

        {/* Coach card */}
        <Card style={{ padding:'24px 20px', marginBottom:14, textAlign:'center' }}>
          <div style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,rgba(6,89,144,.12),rgba(6,89,144,.3))', border:'3.5px solid #fff', boxShadow:'0 6px 20px rgba(6,89,144,.2)', margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:FF, fontSize:28, fontWeight:900, color:C.blue }}>{initials}</span>
          </div>
          <div style={{ fontFamily:FF, fontSize:20, fontWeight:900, color:C.text, letterSpacing:'-0.4px' }}>{acdc.name}</div>
          <div style={{ fontFamily:FF, fontSize:13, color:C.blue, fontWeight:600, marginTop:3 }}>Academic Coach for Dual Credit</div>
          <div style={{ fontFamily:FF, fontSize:12, color:C.text3, marginTop:2 }}>{school.name}</div>
          <button style={{ marginTop:18, width:'100%', height:50, background:'#EAFF00', border:'none', borderRadius:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#022b52" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <span style={{ fontFamily:FF, fontSize:15, fontWeight:800, color:'#022b52' }}>Schedule a Meeting</span>
          </button>
        </Card>

        <div style={{ fontFamily:FF, fontSize:11, fontWeight:700, color:C.text3, textTransform:'uppercase', letterSpacing:'1.4px', marginBottom:9, paddingLeft:4 }}>Contact</div>

        {contacts.map(c => (
          <Card
            key={c.type}
            style={{ padding:'13px 16px', marginBottom:8, display:'flex', alignItems:'center', gap:13, cursor: c.href ? 'pointer' : 'default' }}
            onClick={c.href ? () => window.open(c.href) : undefined}
          >
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(6,89,144,.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <ContactIcon type={c.type} />
            </div>
            <div>
              <div style={{ fontFamily:FF, fontSize:10.5, fontWeight:700, color:C.text3, textTransform:'uppercase', letterSpacing:'0.8px' }}>{c.label}</div>
              <div style={{ fontFamily:FF, fontSize:13.5, fontWeight:600, color:C.text, marginTop:1 }}>{c.val}</div>
            </div>
          </Card>
        ))}

        <Card style={{ padding:'15px 17px', marginTop:8 }}>
          <div style={{ fontFamily:FF, fontSize:14, fontWeight:800, color:C.text, marginBottom:7 }}>About Your ACDC</div>
          <p style={{ fontFamily:FF, fontSize:13, color:C.text2, lineHeight:1.65 }}>
            Your Academic Coach for Dual Credit is your dedicated guide through the entire dual credit journey. From course selection and registration to TSI prep, they are here to make the experience smooth and successful for you and your family.
          </p>
        </Card>
      </div>

      <BottomNav active="acdc" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
