/**
 * buildSchedulingUrl.js
 *
 * Builds a pre-populated HubSpot scheduling URL from the student's profile
 * stored in localStorage (tcdc_v1). Omits any parameter whose value is
 * null or missing. Returns the bare base URL for guests / no stored data.
 */

const HSFORMS_BASE = 'https://share.hsforms.com/2IWy_TsLAQeu7ZOr9qVzCOgxach';

const GRADE_MAP = { Freshman: '9th', Sophomore: '10th', Junior: '11th', Senior: '12th' };

// Keyed by schools.js id → exact HubSpot internal dropdown value
const SCHOOL_MAP = {
  le:    'Liberty-Eylau High School',
  hooks: 'Hooks High School',
  rw:    'Redwater High School',
  txh:   'Texas High School',
  pg:    'Pleasant Grove High School',
  bloomburg: 'Bloomberg High School',   // HubSpot internal has "Bloomberg" typo — intentional
  avery:     'Avery High School',
  dekalb:    'DeKalb High School',
  maud:  'Maud High School',
  prem:  'Premiere High School',    // HubSpot internal has "Premiere" typo — intentional
  nb:    'New Boston High School',
  simms:  'James Bowie High School',
  atlanta: 'Atlanta High School',
  qc:      'Queen City High School',
  mcleod:  'McLeod High School',
  lk:    'Linden-Kildare High School',
};

export function buildSchedulingUrl() {
  let stored;
  try { stored = JSON.parse(localStorage.getItem('tcdc_v1') || '{}'); }
  catch { stored = {}; }

  const params = [];

  if (stored.firstName) params.push(`firstname=${encodeURIComponent(stored.firstName)}`);
  if (stored.lastName)  params.push(`lastname=${encodeURIComponent(stored.lastName)}`);

  const email = stored.role === 'student' ? stored.email
              : stored.role === 'parent'  ? stored.parentEmail
              : null;
  const resolvedEmail = email || stored.tcEmail || null;
  if (resolvedEmail) params.push(`email=${encodeURIComponent(resolvedEmail)}`);

  const gradeHs  = stored.grade      ? GRADE_MAP[stored.grade]          : null;
  const schoolHs = stored.school?.id ? SCHOOL_MAP[stored.school.id]     : null;

  if (gradeHs)  params.push(`grade=${encodeURIComponent(gradeHs)}`);
  if (schoolHs) params.push(`high_school_attended_dropdown=${encodeURIComponent(schoolHs)}`);

  return params.length ? `${HSFORMS_BASE}?${params.join('&')}` : HSFORMS_BASE;
}
