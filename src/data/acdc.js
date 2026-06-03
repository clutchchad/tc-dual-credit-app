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
    firstName: 'Brooke',
    lastName: 'Barrett',
    name: 'Brooke Barrett',
    title: 'Academic Coach for Dual Credit',
    phone: '903-823-3368',
    photo: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/04/brooke-barrett.jpg',
    schedulingUrl: SCHEDULING_URL,
    // Texas High 9th & 10th grade; remaining schools below
    schools: ['le', 'hooks', 'rw'],
    txhGrades: ['Freshman', 'Sophomore'],
  },
  {
    id: 'rchristen',
    firstName: 'Rylee',
    lastName: 'Christen',
    name: 'Rylee Christen',
    title: 'Academic Coach for Dual Credit',
    phone: '903-823-3200',
    photo: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/08/113A5495-scaled.jpg',
    schedulingUrl: SCHEDULING_URL,
    schools: ['pg', 'bloomburg', 'avery'],
    txhGrades: [],
  },
  {
    id: 'mharmon',
    firstName: 'Mckenzee',
    lastName: 'Harmon',
    name: 'Mckenzee Harmon',
    title: 'Academic Coach for Dual Credit',
    phone: '903-823-3314',
    photo: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/04/mckenzee-harmon.jpg',
    schedulingUrl: SCHEDULING_URL,
    // Texas High 11th grade; remaining schools below
    schools: ['dekalb', 'maud', 'prem'],
    txhGrades: ['Junior'],
  },
  {
    id: 'kpage',
    firstName: 'Kate',
    lastName: 'Page',
    name: 'Kate Page',
    title: 'Academic Coach for Dual Credit',
    phone: '903-823-3312',
    photo: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/08/113A5500.jpg',
    schedulingUrl: SCHEDULING_URL,
    // Texas High 12th grade; remaining schools below
    schools: ['nb', 'simms'],
    txhGrades: ['Senior'],
  },
  {
    id: 'lwebb',
    firstName: 'Victoria',
    lastName: 'Webb',
    name: 'Victoria (Lexie) Webb',
    title: 'Academic Coach for Dual Credit',
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
    firstName: 'Abigail',
    lastName: 'Beecher',
    name: 'Abigail Beecher',
    title: 'Academic Coach for Dual Credit',
    phone: '903-823-3106',
    photo: '/fakeacdc.png',
    schedulingUrl: SCHEDULING_URL,
    schools: ['qc', 'pg', 'le', 'simms'],
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
 * Look up an ACDC profile by last name (case-insensitive).
 * Used by the ACDC Staff Portal self-lookup flow — coaches enter their own last name.
 * No student data is queried or returned.
 */
export function getAcdcByLastName(lastName) {
  const q = (lastName || '').trim().toLowerCase();
  if (!q) return null;
  return acdcContacts.find(c => c.lastName.toLowerCase() === q) || null;
}

export function getAcdcForSchool(schoolId) {
  if (schoolId === 'txh') return acdcContacts.find(c => c.id === 'bbarrett');
  return acdcContacts.find(c => c.schools.includes(schoolId));
}
