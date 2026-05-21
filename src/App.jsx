import { useState } from 'react';
import { useNavOrder } from './hooks/useNavOrder';
import { useLocation } from './hooks/useLocation';

import SplashScreen     from './screens/SplashScreen';
import OnboardRole      from './screens/OnboardRole';
import OnboardSchool    from './screens/OnboardSchool';
import OnboardConfirm   from './screens/OnboardConfirm';
import HomeScreen       from './screens/HomeScreen';
import ACDCScreen       from './screens/ACDCScreen';
import ResourcesScreen  from './screens/ResourcesScreen';
import EventsScreen     from './screens/EventsScreen';
import SettingsScreen   from './screens/SettingsScreen';
import PathwaysScreen   from './screens/PathwaysScreen';
import ApplyScreen      from './screens/ApplyScreen';

const STORAGE_KEY = 'tcdc_v1';

function getStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveStored(role, school) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ role, school }));
}

export default function App() {
  // GPS diagnostic logging — console-only, no UI impact
  useLocation();

  const stored = getStored();
  const [screen,  setScreen]  = useState('splash');
  const [role,    setRole]    = useState(stored.role   || null);
  const [school,  setSchool]  = useState(stored.school || null);
  const [animKey, setAnimKey] = useState(0);
  const [tabs,    setTabs]    = useNavOrder();

  const go = (s) => { setAnimKey(k => k + 1); setScreen(s); };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRole(null); setSchool(null); go('onboard_role');
  };

  const navProps = { tabs, onNavigate: go };

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return (
          <SplashScreen onComplete={() => {
            const s = getStored();
            if (s.role && s.school) { setRole(s.role); setSchool(s.school); go('home'); }
            else go('onboard_role');
          }} />
        );

      case 'onboard_role':
        return <OnboardRole onSelect={r => { setRole(r); go('onboard_school'); }} />;

      case 'onboard_school':
        return (
          <OnboardSchool
            role={role}
            onSelect={sc => { setSchool(sc); go('onboard_confirm'); }}
            onBack={() => go('onboard_role')}
          />
        );

      case 'onboard_confirm':
        return role && school ? (
          <OnboardConfirm
            role={role}
            school={school}
            onConfirm={() => { saveStored(role, school); go('home'); }}
            onBack={() => go('onboard_school')}
          />
        ) : null;

      case 'home':
        return role && school ? (
          <HomeScreen role={role} school={school} {...navProps} />
        ) : (
          <OnboardRole onSelect={r => { setRole(r); go('onboard_school'); }} />
        );

      case 'acdc':
        return <ACDCScreen school={school || { id:'dept', name:'Your School' }} {...navProps} />;

      case 'resources':
        return <ResourcesScreen {...navProps} />;

      case 'events':
        return <EventsScreen {...navProps} />;

      case 'settings':
        return (
          <SettingsScreen
            role={role || 'student'}
            school={school || { name:'Your School' }}
            onChangeRole={reset}
            onChangeSchool={() => go('onboard_school')}
            tabs={tabs}
            onTabsChange={setTabs}
            {...navProps}
          />
        );

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
