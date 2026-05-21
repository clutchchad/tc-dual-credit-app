import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import Card from '../components/Card';
import { events } from '../data/events';
import { C, FF } from '../tokens';

export default function EventsScreen({ onNavigate, tabs }) {
  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:C.bg, display:'flex', flexDirection:'column' }}>
      <BlueHeader>
        <PageTitle title="Events" sub="Deadlines and upcoming events" />
      </BlueHeader>

      <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 100px' }}>
        {events.map((ev, i) => {
          const urgColor = ev.days <= 10 ? C.red : ev.days <= 20 ? C.orange : C.green;
          return (
            <div key={ev.id} style={{ display:'flex', gap:13, marginBottom:12 }}>
              {/* Timeline spine */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:22, flexShrink:0 }}>
                <div style={{
                  width:13, height:13, borderRadius:'50%',
                  background: ev.type === 'deadline' ? C.red : C.blue,
                  border: `3px solid ${ev.type === 'deadline' ? '#fee2e2' : '#dbeafe'}`,
                  marginTop:16, flexShrink:0,
                }} />
                {i < events.length - 1 && (
                  <div style={{ width:2, flex:1, background:C.border, minHeight:24, marginTop:4 }} />
                )}
              </div>

              <Card style={{ flex:1, padding:'13px 15px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:FF, fontSize:14, fontWeight:700, color:C.text, marginBottom:5 }}>{ev.title}</div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ fontFamily:FF, fontSize:12, color:C.text3 }}>{ev.date}</span>
                      <div style={{ width:3, height:3, borderRadius:'50%', background:C.border }} />
                      <span style={{ fontFamily:FF, fontSize:12, fontWeight:600, color: ev.type==='deadline' ? C.red : C.blue }}>
                        {ev.type === 'deadline' ? 'Deadline' : 'Event'}
                      </span>
                    </div>
                  </div>
                  <div style={{ background:`${urgColor}14`, borderRadius:9, padding:'4px 9px', flexShrink:0 }}>
                    <span style={{ fontFamily:FF, fontSize:12, fontWeight:700, color:urgColor }}>{ev.days}d</span>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <BottomNav active="events" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
