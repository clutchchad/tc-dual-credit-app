import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlueHeader, PageTitle } from '../components/BlueHeader';
import BottomNav from '../components/BottomNav';
import { C, FF } from '../tokens';

/* Nav icon mini for drag list */
function MiniNavIcon({ id }) {
  const p = { width:16, height:16, viewBox:'0 0 24 24', fill:'none', stroke:C.blue, strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round' };
  const icons = {
    home:      <svg {...p}><path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 22V12h6v10"/></svg>,
    acdc:      <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    resources: <svg {...p}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 9h8M8 13h5"/></svg>,
    events:    <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    settings:  <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  };
  return icons[id] || null;
}

/* Drag handle icon */
const DragHandle = ({ listeners, attributes }) => (
  <div
    {...listeners}
    {...attributes}
    style={{ padding:'4px 6px', cursor:'grab', color:C.text3, display:'flex', alignItems:'center', touchAction:'none' }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="4" y1="6"  x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
    </svg>
  </div>
);

/* Single sortable tab row */
function SortableTabRow({ tab }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display:'flex', alignItems:'center',
        background:'#fff',
        border:`1px solid ${C.border}`,
        borderRadius:14,
        padding:'10px 14px',
        marginBottom:7,
        gap:12,
      }}
    >
      <DragHandle listeners={listeners} attributes={attributes} />
      <div style={{ width:30, height:30, borderRadius:9, background:'rgba(6,89,144,.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <MiniNavIcon id={tab.id} />
      </div>
      <span style={{ fontFamily:FF, fontSize:14, fontWeight:600, color:C.text, flex:1 }}>{tab.label}</span>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2" strokeLinecap="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </div>
  );
}

/* Drag overlay row (clone while dragging) */
function TabRowOverlay({ tab }) {
  return (
    <div style={{
      display:'flex', alignItems:'center',
      background:'#fff',
      border:`1.5px solid ${C.blue}`,
      borderRadius:14,
      padding:'10px 14px',
      gap:12,
      boxShadow:'0 8px 24px rgba(0,0,0,.18)',
    }}>
      <div style={{ padding:'4px 6px', color:C.text3, display:'flex', alignItems:'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="4" y1="6"  x2="20" y2="6"/>
          <line x1="4" y1="12" x2="20" y2="12"/>
          <line x1="4" y1="18" x2="20" y2="18"/>
        </svg>
      </div>
      <div style={{ width:30, height:30, borderRadius:9, background:'rgba(6,89,144,.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <MiniNavIcon id={tab.id} />
      </div>
      <span style={{ fontFamily:FF, fontSize:14, fontWeight:600, color:C.blue, flex:1 }}>{tab.label}</span>
    </div>
  );
}

export default function SettingsScreen({ role, school, onChangeRole, onChangeSchool, onNavigate, tabs, onTabsChange }) {
  const [notifs, setNotifs] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = tabs.findIndex(t => t.id === active.id);
    const newIdx = tabs.findIndex(t => t.id === over.id);
    onTabsChange(arrayMove(tabs, oldIdx, newIdx));
  };

  const activeTab = tabs.find(t => t.id === activeId);

  const profileRows = [
    { label:'Change My School', icon:'school', action:onChangeSchool },
    { label:'Change My Role',   icon:'role',   action:onChangeRole  },
  ];

  return (
    <div className="tc-screen" style={{ width:'100%', height:'100%', background:C.bg, display:'flex', flexDirection:'column' }}>
      <BlueHeader style={{ paddingBottom:52 }}>
        <PageTitle title="Settings" />
      </BlueHeader>

      <div style={{ flex:1, overflowY:'auto', padding:'0 14px 100px', marginTop:-42 }}>

        {/* Profile card */}
        <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${C.border}`, boxShadow:'0 2px 10px rgba(0,0,0,.05)', padding:'17px 17px', marginBottom:18, display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg,#022b52,#065990)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
          <div>
            <div style={{ fontFamily:FF, fontSize:16, fontWeight:800, color:C.text }}>{role === 'student' ? 'Student' : 'Parent'}</div>
            <div style={{ fontFamily:FF, fontSize:13, color:C.text2, marginTop:1 }}>{school.name}</div>
          </div>
        </div>

        {/* Profile settings */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:FF, fontSize:10.5, fontWeight:700, color:C.text3, textTransform:'uppercase', letterSpacing:'1.4px', marginBottom:8, paddingLeft:4 }}>Profile</div>
          {profileRows.map(row => (
            <button
              key={row.label}
              onClick={row.action}
              style={{ width:'100%', background:'#fff', border:`1px solid ${C.border}`, borderRadius:14, padding:'13px 15px', marginBottom:7, cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left', boxSizing:'border-box' }}
            >
              <div style={{ width:34, height:34, borderRadius:10, background:'rgba(6,89,144,.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {row.icon === 'school'
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M3 9L12 2l9 7v11a1 1 0 01-1 1H4a1 1 0 01-1-1z"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                }
              </div>
              <span style={{ fontFamily:FF, fontSize:14, fontWeight:600, color:C.text, flex:1 }}>{row.label}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>

        {/* Preferences */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontFamily:FF, fontSize:10.5, fontWeight:700, color:C.text3, textTransform:'uppercase', letterSpacing:'1.4px', marginBottom:8, paddingLeft:4 }}>Preferences</div>
          <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:14, padding:'13px 15px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:'rgba(6,89,144,.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
            <span style={{ fontFamily:FF, fontSize:14, fontWeight:600, color:C.text, flex:1 }}>Push Notifications</span>
            <div
              onClick={() => setNotifs(n => !n)}
              style={{ width:44, height:26, borderRadius:13, background:notifs?C.blue:'#d1d5db', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}
            >
              <div style={{ position:'absolute', width:20, height:20, borderRadius:'50%', background:'#fff', top:3, left:notifs?21:3, transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.2)' }} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs — draggable */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontFamily:FF, fontSize:10.5, fontWeight:700, color:C.text3, textTransform:'uppercase', letterSpacing:'1.4px', marginBottom:4, paddingLeft:4 }}>Navigation Tabs</div>
          <p style={{ fontFamily:FF, fontSize:11.5, color:C.text3, marginBottom:10, paddingLeft:4 }}>Drag to reorder your bottom navigation.</p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tabs.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {tabs.map(tab => (
                <SortableTabRow key={tab.id} tab={tab} />
              ))}
            </SortableContext>

            <DragOverlay>
              {activeTab ? <TabRowOverlay tab={activeTab} /> : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* App version */}
        <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:14, padding:'13px 15px', display:'flex', justifyContent:'space-between', marginBottom:22 }}>
          <span style={{ fontFamily:FF, fontSize:13, color:C.text2 }}>App Version</span>
          <span style={{ fontFamily:FF, fontSize:13, fontWeight:600, color:C.text3 }}>1.0 Beta</span>
        </div>

        <div style={{ textAlign:'center', paddingBottom:10 }}>
          <div style={{ fontFamily:FF, fontSize:15, fontWeight:900, color:C.blue, letterSpacing:'-0.3px' }}>TC Dual Credit</div>
          <div style={{ fontFamily:FF, fontSize:11, color:C.text3, marginTop:2 }}>Texarkana College</div>
        </div>
      </div>

      <BottomNav active="settings" onNavigate={onNavigate} tabs={tabs} />
    </div>
  );
}
