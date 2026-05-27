import { useState } from 'react';

import SplashScreen     from './screens/SplashScreen';
import OnboardRole      from './screens/OnboardRole';
import OnboardSchool    from './screens/OnboardSchool';
import OnboardGrade     from './screens/OnboardGrade';
import OnboardConfirm   from './screens/OnboardConfirm';
import HomeScreen       from './screens/HomeScreen';
import ACDCScreen       from './screens/ACDCScreen';
import ResourcesScreen  from './screens/ResourcesScreen';
import EventsScreen     from './screens/EventsScreen';
import SettingsScreen   from './screens/SettingsScreen';
import PathwaysScreen        from './screens/PathwaysScreen';
import ApplyScreen           from './screens/ApplyScreen';
import NotificationsScreen   from './screens/NotificationsScreen';

const STORAGE_KEY = 'tcdc_v1';

const NAV_TABS = [
  { id: 'home',      label: 'Home',      screen: 'home'      },
  { id: 'acdc',      label: 'My ACDC',   screen: 'acdc'      },
  { id: 'resources', label: 'Resources', screen: 'resources' },
  { id: 'events',    label: 'Events',    screen: 'events'    },
  { id: 'settings',  label: 'Settings',  screen: 'settings'  },
];

function getStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveStored(role, school, grade) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ role, school, grade }));
}

export default function App() {
  const stored = getStored();
  const [screen,  setScreen]  = useState('splash');
  const [role,    setRole]    = useState(stored.role   || null);
  const [school,  setSchool]  = useState(stored.school || null);
  const [grade,   setGrade]   = useState(stored.grade  || null);
  const [animKey, setAnimKey] = useState(0);

  const go = (s) => { setAnimKey(k => k + 1); setScreen(s); };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRole(null); setSchool(null); setGrade(null); go('onboard_role');
  };

  const navProps = { tabs: NAV_TABS, onNavigate: go };

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return (
          <SplashScreen onComplete={() => {
            const s = getStored();
            if (s.role && s.school) { setRole(s.role); setSchool(s.school); setGrade(s.grade || null); go('home'); }
            else go('onboard_role');
          }} />
        );

      case 'onboard_role':
        return <OnboardRole onSelect={r => { setRole(r); go('onboard_school'); }} />;

      case 'onboard_school':
        return (
          <OnboardSchool
            role={role}
            onSelect={sc => { setSchool(sc); setGrade(null); go(sc.id === 'txh' ? 'onboard_grade' : 'onboard_confirm'); }}
            onBack={() => go('onboard_role')}
          />
        );

      case 'onboard_grade':
        return school ? (
          <OnboardGrade
            onSelect={g => { setGrade(g); go('onboard_confirm'); }}
            onBack={() => go('onboard_school')}
          />
        ) : null;

      case 'onboard_confirm':
        return role && school ? (
          <OnboardConfirm
            role={role}
            school={school}
            grade={grade}
            onConfirm={() => { saveStored(role, school, grade); go('home'); }}
            onBack={() => go(school.id === 'txh' ? 'onboard_grade' : 'onboard_school')}
          />
        ) : null;

      case 'home':
        return role && school ? (
          <HomeScreen role={role} school={school} grade={grade} {...navProps} />
        ) : (
          <OnboardRole onSelect={r => { setRole(r); go('onboard_school'); }} />
        );

      case 'acdc':
        return <ACDCScreen school={school || { id:'dept', name:'Your School' }} grade={grade} {...navProps} />;

      case 'resources':
        return <ResourcesScreen {...navProps} />;

      case 'events':
        return <EventsScreen role={role} school={school} {...navProps} />;

      case 'settings':
        return (
          <SettingsScreen
            role={role || 'student'}
            school={school || { name:'Your School' }}
            grade={grade}
            onChangeRole={reset}
            onChangeSchool={() => go('onboard_school')}
            {...navProps}
          />
        );

      case 'notifications':
        return <NotificationsScreen {...navProps} />;

      case 'pathways':
        return <PathwaysScreen onNavigate={go} />;

      case 'apply':
        return <ApplyScreen onNavigate={go} />;

      default:
        return <SplashScreen onComplete={() => go('onboard_role')} />;
    }
  };

  return (
    <div
      key={animKey}
      style={{ width:'100%', height:'100%', overflow:'hidden', position:'relative' }}
    >
      {renderScreen()}
    </div>
  );
}
