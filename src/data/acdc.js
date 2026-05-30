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
 * Schools flagged unassigned: true in schools.js (DATX, AR Premier) show the
 * main-office fallback card instead of a coach card.
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
    schools: ['pg', 'bl', 'av'],
    txhGrades: [],
  },
  {
    id: 'mharmon',
    name: 'Mckenzee Harmon',
    phone: '903-823-3314',
    photo: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/04/mckenzee-harmon.jpg',
    schedulingUrl: SCHEDULING_URL,
    // Texas High 11th grade; remaining schools below
    schools: ['dk', 'maud', 'prem'],
    txhGrades: ['Junior'],
  },
  {
    id: 'kpage',
    name: 'Kate Page',
    phone: '903-823-3312',
    photo: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/08/113A5500.jpg',
    schedulingUrl: SCHEDULING_URL,
    // Texas High 12th grade; remaining schools below
    schools: ['nb', 'jb'],
    txhGrades: ['Senior'],
  },
  {
    id: 'lwebb',
    name: 'Victoria (Lexie) Webb',
    phone: '903-823-3133',
    // TODO: The photo URL scraped from the site (kate-page.jpg) is mislabeled —
    // the file name and alt text point to Kate Page's photo, not Lexie Webb's.
    // A correct headshot must be supplied by the DC office before launch.
    photo: null,
    schedulingUrl: SCHEDULING_URL,
    schools: ['atl', 'qc', 'mc', 'lk'],
    txhGrades: [],
  },
];

/** Shown when a school has no assigned ACDC (e.g. DATX, AR Premier) */
export const OFFICE_FALLBACK = {
  id: 'dept',
  name: 'Dual Credit Office',
  phone: '903-823-3456',
  hours: 'Mon–Thu  8am–5pm  ·  Fri  8am–4pm',
  photo: null,
  schedulingUrl: null,
  isFallback: true,
};

/**
 * Look up the ACDC coach for a given school id and optional grade.
 * Grade is only meaningful for Texas High (txh).
 * Returns OFFICE_FALLBACK if no coach is assigned.
 */
export function getAcdcForSchool(schoolId, grade = null) {
  if (schoolId === 'txh') {
    if (grade === 'Junior')  return acdcContacts.find(c => c.id === 'mharmon') || OFFICE_FALLBACK;
    if (grade === 'Senior')  return acdcContacts.find(c => c.id === 'kpage')   || OFFICE_FALLBACK;
    // Freshman, Sophomore, or no grade selected yet
    return acdcContacts.find(c => c.id === 'bbarrett') || OFFICE_FALLBACK;
  }
  return acdcContacts.find(c => c.schools.includes(schoolId)) || OFFICE_FALLBACK;
}
