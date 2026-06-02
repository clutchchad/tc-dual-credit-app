import { useState } from 'react';
import { useIsTablet } from './hooks/useIsTablet';
import SideNav from './components/SideNav';

import SplashScreen       from './screens/SplashScreen';
import OnboardRole        from './screens/OnboardRole';
import PathwaysChooserScreen from './screens/PathwaysChooserScreen';
import OnboardSchool      from './screens/OnboardSchool';
import OnboardGrade       from './screens/OnboardGrade';
import OnboardConfirm     from './screens/OnboardConfirm';
import HomeScreen         from './screens/HomeScreen';
import ACDCScreen         from './screens/ACDCScreen';
import ResourcesScreen      from './screens/ResourcesScreen';
import EventsScreen         from './screens/EventsScreen';
import MoreScreen           from './screens/MoreScreen';
import PathwaysScreen       from './screens/PathwaysScreen';
import ApplyScreen          from './screens/ApplyScreen';
import NotificationsScreen  from './screens/NotificationsScreen';
import ImportantDatesScreen from './screens/ImportantDatesScreen';
import TransferPathwayScreen   from './screens/TransferPathwayScreen';
import ScheduleAdvisingScreen  from './screens/ScheduleAdvisingScreen';
import OutreachFormScreen      from './screens/OutreachFormScreen';
import AcdcPortalLookupScreen  from './screens/AcdcPortalLookupScreen';
import AcdcPortalHomeScreen   from './screens/AcdcPortalHomeScreen';
import AcdcLoginScreen    from './screens/AcdcLoginScreen';
import AcdcConfirmScreen  from './screens/AcdcConfirmScreen';
import AcdcHomeScreen     from './screens/AcdcHomeScreen';

const STORAGE_KEY = 'tcdc_v1';

const NAV_TABS = [
  { id: 'home',      label: 'Home',      screen: 'home'             },
  { id: 'acdc',      label: 'My ACDC',   screen: 'acdc'             },
  { id: 'pathways',  label: 'Pathways',  screen: 'pathways_chooser' },
  { id: 'resources', label: 'Resources', screen: 'resources'        },
  { id: 'more',      label: 'More',      screen: 'more'             },
];

const GUEST_NAV_TABS = [
  { id: 'home',      label: 'Home',      screen: 'home'             },
  { id: 'acdc',      label: 'My ACDC',   screen: 'acdc'             },
  { id: 'pathways',  label: 'Pathways',  screen: 'pathways_chooser' },
  { id: 'resources', label: 'Resources', screen: 'resources'        },
  { id: 'more',      label: 'More',      screen: 'more'             },
];

function getStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveStored(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  const stored = getStored();

  const [screen,      setScreen]      = useState('splash');
  const [role,        setRole]        = useState(stored.role        || null);
  const [school,      setSchool]      = useState(stored.school      || null);
  const [grade,       setGrade]       = useState(stored.grade       || null);
  const [acdcProfile, setAcdcProfile] = useState(stored.acdcProfile || null);
  const [portalCoach, setPortalCoach] = useState(null);
  const [animKey,     setAnimKey]     = useState(0);

  const go = (s) => { setAnimKey(k => k + 1); setScreen(s); };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRole(null); setSchool(null); setGrade(null); setAcdcProfile(null);
    go('onboard_role');
  };

  const isTablet = useIsTablet();

  const navProps      = { tabs: NAV_TABS,       onNavigate: go };
  const guestNavProps = { tabs: GUEST_NAV_TABS, onNavigate: go };

  const ONBOARDING_SCREENS = ['splash', 'onboard_role', 'onboard_school', 'onboard_grade', 'onboard_confirm', 'change_school', 'apply'];
  const showSideNav = isTablet && !ONBOARDING_SCREENS.includes(screen);
  const activeTabs  = (!role || role === 'guest') ? GUEST_NAV_TABS : NAV_TABS;

  /* Shared OnboardRole renderer — used in two cases */
  const renderOnboardRole = () => (
    <OnboardRole
      onSelect={r => { setRole(r); go('onboard_school'); }}
      onGuestSelect={() => {
        setRole('guest');
        saveStored({ role: 'guest' });
        go('home');
      }}
      onAdminTap={() => go('acdc_portal')}
    />
  );

  const renderScreen = () => {
    switch (screen) {

      case 'splash':
        return (
          <SplashScreen
            onComplete={() => {
              const s = getStored();
              if (s.role === 'acdc' && s.acdcProfile) {
                // Returning ACDC — restore profile and land directly in the portal
                setRole('acdc');
                setAcdcProfile(s.acdcProfile);
                go('acdc_home');
              } else if (s.role === 'guest') {
                setRole('guest');
                go('home');
              } else if (s.role && s.school) {
                setRole(s.role);
                setSchool(s.school);
                setGrade(s.grade || null);
                go('home');
              } else {
                go('onboard_role');
              }
            }}
          />
        );

      case 'onboard_role':
        return renderOnboardRole();

      case 'onboard_school':
        return (
          <OnboardSchool
            role={role}
            onSelect={sc => {
              setSchool(sc);
              setGrade(null);
              go('onboard_grade');
            }}
            onBack={() => go('onboard_role')}
          />
        );

      // Change My School path (from More screen) — skips grade picker if grade already stored
      case 'change_school':
        return (
          <OnboardSchool
            role={role}
            onSelect={sc => {
              setSchool(sc);
              const storedGrade = getStored().grade;
              if (sc.id === 'txh' && !storedGrade) {
                // Only show grade picker for Texas High when no grade is on record
                go('onboard_grade');
              } else {
                // Keep existing grade; go straight to confirm
                go('onboard_confirm');
              }
            }}
            onBack={() => go('more')}
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
        return (role && school) ? (
          <OnboardConfirm
            role={role}
            school={school}
            grade={grade}
            onConfirm={() => {
              saveStored({ ...getStored(), role, school, grade });
              go('home');
            }}
            onBack={() => go('onboard_grade')}
          />
        ) : null;

      // ── ACDC portal flow ──────────────────────────────────────────────────────
      case 'acdc_login':
        return (
          <AcdcLoginScreen
            onVerified={(profile) => {
              setAcdcProfile(profile);
              go('acdc_confirm');
            }}
            onBack={() => go('splash')}
          />
        );

      case 'acdc_confirm':
        return acdcProfile ? (
          <AcdcConfirmScreen
            acdc={acdcProfile}
            onConfirm={() => {
              setRole('acdc');
              saveStored({ ...getStored(), role: 'acdc', acdcProfile });
              go('acdc_home');
            }}
            onBack={() => go('acdc_login')}
          />
        ) : null;

      case 'acdc_home':
        return (
          <AcdcHomeScreen
            acdc={acdcProfile || getStored().acdcProfile}
            onSignOut={() => {
              localStorage.removeItem(STORAGE_KEY);
              setRole(null); setAcdcProfile(null);
              go('splash');
            }}
          />
        );

      case 'home': {
        // Use localStorage as ground truth — avoids any React state batching lag
        const liveStored = getStored();
        const resolvedRole = role || liveStored.role;
        // ACDCs have their own portal — redirect if they somehow land here
        if (resolvedRole === 'acdc') go('acdc_home');
        if (resolvedRole === 'guest') {
          return <HomeScreen role="guest" school={null} grade={null} {...guestNavProps} />;
        }
        return resolvedRole && school ? (
          <HomeScreen role={resolvedRole} school={school} grade={grade} {...navProps} />
        ) : (
          renderOnboardRole()
        );
      }

      case 'outreach': {
        const isGuest = (role || 'guest') === 'guest';
        return <OutreachFormScreen role={role || 'guest'} school={school} {...(isGuest ? guestNavProps : navProps)} />;
      }

      case 'schedule_advising': {
        const isGuest = (role || 'guest') === 'guest';
        return <ScheduleAdvisingScreen school={school} grade={grade} {...(isGuest ? guestNavProps : navProps)} />;
      }

      case 'acdc':
        // Guests have no school — redirect to More (profile CTA)
        if (!school) return (
          <MoreScreen
            role={role || 'guest'}
            school={null}
            grade={null}
            onChangeRole={reset}
            onChangeSchool={() => go('change_school')}
            {...guestNavProps}
          />
        );
        return <ACDCScreen school={school} grade={grade} {...navProps} />;

      case 'resources': {
        const isGuest = (role || 'guest') === 'guest';
        return <ResourcesScreen {...(isGuest ? guestNavProps : navProps)} />;
      }

      case 'events':
        return <EventsScreen role={role} school={school} {...navProps} />;

      case 'more': {
        const isGuest = (role || 'guest') === 'guest';
        return (
          <MoreScreen
            role={role || 'guest'}
            school={school || { name: 'Your School' }}
            grade={grade}
            onChangeRole={reset}
            onChangeSchool={() => go('change_school')}
            {...(isGuest ? guestNavProps : navProps)}
          />
        );
      }

      case 'notifications':
        return <NotificationsScreen {...navProps} />;

      case 'pathways': {
        const isGuest = (role || 'guest') === 'guest';
        return <PathwaysScreen {...(isGuest ? guestNavProps : navProps)} />;
      }

      case 'dates': {
        const isGuest = (role || 'guest') === 'guest';
        return <ImportantDatesScreen {...(isGuest ? guestNavProps : navProps)} />;
      }

      case 'apply':
        return <ApplyScreen onNavigate={go} />;

      case 'transfer': {
        const isGuest = (role || 'guest') === 'guest';
        return <TransferPathwayScreen {...(isGuest ? guestNavProps : navProps)} />;
      }

      case 'pathways_chooser': {
        const isGuest = (role || 'guest') === 'guest';
        return (
          <PathwaysChooserScreen
            school={school}
            role={role || 'guest'}
            onNavigate={go}
            tabs={isGuest ? GUEST_NAV_TABS : NAV_TABS}
          />
        );
      }

      // ── ACDC Staff Portal (last-name self-lookup, no auth) ────────────────────
      case 'acdc_portal':
        return (
          <AcdcPortalLookupScreen
            onFound={(coach) => { setPortalCoach(coach); go('acdc_portal_home'); }}
            onBack={() => go('onboard_role')}
          />
        );

      case 'acdc_portal_home':
        return portalCoach ? (
          <AcdcPortalHomeScreen
            coach={portalCoach}
            onNavigate={go}
            onExit={() => go('onboard_role')}
          />
        ) : null;

      default:
        return <SplashScreen onComplete={() => go('onboard_role')} />;
    }
  };

  return (
    <div
      key={animKey}
      style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', display: 'flex' }}
    >
      {showSideNav && (
        <SideNav active={screen} onNavigate={go} tabs={activeTabs} />
      )}
      <div style={{ flex: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
        {renderScreen()}
      </div>
    </div>
  );
}
