/**
 * ACDC contact data — verified from dualcredit.texarkanacollege.edu (May 2026)
 *
 * No email addresses are listed on the site; phone + scheduling link only.
 *
 * Texas High is split by grade:
 *   9th & 10th  → Brooke Barrett
 *   11th        → Mckenzee Harmon
 *   12th        → Kate Page
 *
 * Dummy demo account: Abigail Beecher (tcId: '4321')
 */

const SCHEDULING_URL = 'https://share.hsforms.com/2IWy_TsLAQeu7ZOr9qVzCOgxach';

export const acdcContacts = [
  {
    id: 'bbarrett',
    name: 'Brooke Barrett',
    phone: '903-823-3368',
    photo: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/04/brooke-barrett.jpg',
    schedulingUrl: SCHEDULING_URL,
    // Texas High 9th & 10th grade; remaining schools below
    schools: ['le', 'hooks', 'rw'],
    txhGrades: ['Freshman', 'Sophomore'],
  },
  {
    id: 'rchristen',
    name: 'Rylee Christen',
    phone: '903-823-3200',
    photo: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/08/113A5495-scaled.jpg',
    schedulingUrl: SCHEDULING_URL,
    schools: ['pg', 'bloomburg', 'avery'],
    txhGrades: [],
  },
  {
    id: 'mharmon',
    name: 'Mckenzee Harmon',
    phone: '903-823-3314',
    photo: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/04/mckenzee-harmon.jpg',
    schedulingUrl: SCHEDULING_URL,
    // Texas High 11th grade; remaining schools below
    schools: ['dekalb', 'maud', 'prem'],
    txhGrades: ['Junior'],
  },
  {
    id: 'kpage',
    name: 'Kate Page',
    phone: '903-823-3312',
    photo: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/08/113A5500.jpg',
    schedulingUrl: SCHEDULING_URL,
    // Texas High 12th grade; remaining schools below
    schools: ['nb', 'simms'],
    txhGrades: ['Senior'],
  },
  {
    id: 'lwebb',
    name: 'Victoria (Lexie) Webb',
    phone: '903-823-3133',
    photo: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/04/kate-page.jpg',
    schedulingUrl: SCHEDULING_URL,
    schools: ['atlanta', 'qc', 'mcleod', 'lk'],
    txhGrades: [],
  },
  // ── Dummy demo account ───────────────────────────────────────────────────────
  {
    id: 'abeecher',
    tcId: '4321',
    name: 'Abigail Beecher',
    phone: '903-823-3106',
    email: 'a.beecher@tc.edu',
    photo: '/fakeacdc.png',
    schedulingUrl: SCHEDULING_URL,
    schools: [],
    txhGrades: [],
  },
];

/**
 * Look up an ACDC profile by TC staff ID.
 * Used during onboarding when the entered TC ID belongs to an ACDC, not a student.
 */
export function getAcdcByTcId(tcId) {
  return acdcContacts.find(c => c.tcId === String(tcId)) || null;
}

/**
 * Look up the ACDC coach for a given school id and optional grade.
 * Grade is only meaningful for Texas High (txh).
 */
export function getAcdcForSchool(schoolId, grade = null) {
  if (schoolId === 'txh') {
    if (grade === 'Junior')  return acdcContacts.find(c => c.id === 'mharmon');
    if (grade === 'Senior')  return acdcContacts.find(c => c.id === 'kpage');
    // Freshman, Sophomore, or no grade selected yet
    return acdcContacts.find(c => c.id === 'bbarrett');
  }
  return acdcContacts.find(c => c.schools.includes(schoolId));
}
