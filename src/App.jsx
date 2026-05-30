import { useState } from 'react';

import SplashScreen       from './screens/SplashScreen';
import OnboardRole        from './screens/OnboardRole';
import OnboardStudentID   from './screens/OnboardStudentID';
import OnboardSchool      from './screens/OnboardSchool';
import OnboardGrade       from './screens/OnboardGrade';
import OnboardConfirm     from './screens/OnboardConfirm';
import HomeScreen         from './screens/HomeScreen';
import ACDCScreen         from './screens/ACDCScreen';
import ResourcesScreen    from './screens/ResourcesScreen';
import EventsScreen       from './screens/EventsScreen';
import MoreScreen         from './screens/MoreScreen';
import PathwaysScreen     from './screens/PathwaysScreen';
import ApplyScreen        from './screens/ApplyScreen';
import NotificationsScreen from './screens/NotificationsScreen';

const STORAGE_KEY = 'tcdc_v1';

const NAV_TABS = [
  { id: 'home',      label: 'Home',      screen: 'home'      },
  { id: 'acdc',      label: 'My ACDC',   screen: 'acdc'      },
  { id: 'resources', label: 'Resources', screen: 'resources' },
  { id: 'events',    label: 'Events',    screen: 'events'    },
  { id: 'more',      label: 'More',      screen: 'more'      },
];

function getStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveStored(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  const stored = getStored();

  const [screen,             setScreen]             = useState('splash');
  const [role,               setRole]               = useState(stored.role               || null);
  const [school,             setSchool]             = useState(stored.school             || null);
  const [grade,              setGrade]              = useState(stored.grade              || null);
  const [studentId,          setStudentId]          = useState(stored.studentId          || null);
  const [firstName,          setFirstName]          = useState(stored.firstName          || null);
  const [isJenzabarVerified, setIsJenzabarVerified] = useState(stored.isJenzabarVerified || false);
  const [animKey,            setAnimKey]            = useState(0);

  const go = (s) => { setAnimKey(k => k + 1); setScreen(s); };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRole(null); setSchool(null); setGrade(null);
    setStudentId(null); setFirstName(null); setIsJenzabarVerified(false);
    go('onboard_role');
  };

  const navProps = { tabs: NAV_TABS, onNavigate: go };

  /* Shared OnboardRole renderer — used in two cases */
  const renderOnboardRole = () => (
    <OnboardRole
      onSelect={r => { setRole(r); go('onboard_student_id'); }}
      onGuestSelect={() => {
        setRole('guest');
        saveStored({ role: 'guest' });
        go('home');
      }}
    />
  );

  const renderScreen = () => {
    switch (screen) {

      case 'splash':
        return (
          <SplashScreen onComplete={() => {
            const s = getStored();
            if (s.role === 'guest') {
              setRole('guest');
              go('home');
            } else if (s.role && s.school) {
              setRole(s.role);
              setSchool(s.school);
              setGrade(s.grade              || null);
              setStudentId(s.studentId      || null);
              setFirstName(s.firstName      || null);
              setIsJenzabarVerified(s.isJenzabarVerified || false);
              go('home');
            } else {
              go('onboard_role');
            }
          }} />
        );

      case 'onboard_role':
        return renderOnboardRole();

      case 'onboard_student_id':
        return (
          <OnboardStudentID
            role={role}
            onVerified={({ schoolObj, gradeVal, studentIdVal, firstNameVal, lastNameVal }) => {
              setSchool(schoolObj);
              setGrade(gradeVal);
              setStudentId(studentIdVal);
              setFirstName(firstNameVal);
              setIsJenzabarVerified(true);
              // Pre-save so confirm screen can read data if needed
              saveStored({
                ...getStored(),
                role,
                school: schoolObj,
                grade: gradeVal,
                studentId: studentIdVal,
                firstName: firstNameVal,
                lastName: lastNameVal,
                isJenzabarVerified: true,
              });
              go('onboard_confirm');
            }}
            onSkip={() => go('onboard_school')}
            onBack={() => go('onboard_role')}
          />
        );

      case 'onboard_school':
        return (
          <OnboardSchool
            role={role}
            onSelect={sc => {
              setSchool(sc);
              setGrade(null);
              go(sc.id === 'txh' ? 'onboard_grade' : 'onboard_confirm');
            }}
            onBack={() => go('onboard_student_id')}
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
        return (role && (school || isJenzabarVerified)) ? (
          <OnboardConfirm
            role={role}
            school={school}
            grade={grade}
            studentId={studentId}
            firstName={firstName}
            isJenzabarVerified={isJenzabarVerified}
            onConfirm={() => {
              saveStored({ role, school, grade, studentId, firstName, isJenzabarVerified });
              go('home');
            }}
            onBack={() => {
              if (isJenzabarVerified) go('onboard_student_id');
              else go(school?.id === 'txh' ? 'onboard_grade' : 'onboard_school');
            }}
          />
        ) : null;

      case 'home':
        if (role === 'guest') {
          return <HomeScreen role="guest" school={null} grade={null} {...navProps} />;
        }
        return role && school ? (
          <HomeScreen role={role} school={school} grade={grade} {...navProps} />
        ) : (
          renderOnboardRole()
        );

      case 'acdc':
        // Guests have no school — redirect to More (profile CTA)
        if (!school) return (
          <MoreScreen
            role={role || 'guest'}
            school={null}
            grade={null}
            onChangeRole={reset}
            onChangeSchool={() => go('onboard_school')}
            {...navProps}
          />
        );
        return <ACDCScreen school={school} grade={grade} {...navProps} />;

      case 'resources':
        return <ResourcesScreen {...navProps} />;

      case 'events':
        return <EventsScreen role={role} school={school} {...navProps} />;

      case 'more':
        return (
          <MoreScreen
            role={role || 'guest'}
            school={school || { name: 'Your School' }}
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
      style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}
    >
      {renderScreen()}
    </div>
  );
}
