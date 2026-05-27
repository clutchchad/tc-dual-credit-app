/**
 * ACDC contact data — scraped from dualcredit.texarkanacollege.edu/acdc-contacts
 * Individual emails follow the pattern first-initial + last-name @texarkanacollege.edu
 * (confirmed naming pattern; replace with official addresses if different)
 * Photos: replace placeholder `null` values with actual hosted image URLs.
 */
export const acdcContacts = [
  {
    id: 'bbarrett',
    name: 'Brooke Barrett',
    title: 'Academic Coach for Dual Credit',
    email: 'bbarrett@texarkanacollege.edu',
    phone: '(903) 823-3368',
    office: 'Dual Credit Center, Room 115',
    photo: null,
    schools: ['txh', 'le', 'hooks', 'rw'],
    // Texas High (9th–10th grade), Liberty-Eylau, Hooks, Redwater
  },
  {
    id: 'rchristen',
    name: 'Rylee Christen',
    title: 'Academic Coach for Dual Credit',
    email: 'rchristen@texarkanacollege.edu',
    phone: '(903) 823-3200',
    office: 'Dual Credit Center, Room 115',
    photo: null,
    schools: ['pg', 'bl', 'av'],
  },
  {
    id: 'mharmon',
    name: 'Mckenzee Harmon',
    title: 'Academic Coach for Dual Credit',
    email: 'mharmon@texarkanacollege.edu',
    phone: '(903) 823-3314',
    office: 'Dual Credit Center, Room 115',
    photo: null,
    schools: ['maud', 'dk', 'prem'],
  },
  {
    id: 'kpage',
    name: 'Kate Page',
    title: 'Academic Coach for Dual Credit',
    email: 'kpage@texarkanacollege.edu',
    phone: '(903) 823-3312',
    office: 'Dual Credit Center, Room 115',
    photo: null,
    schools: ['nb', 'gc', 'jb'],
  },
  {
    id: 'lwebb',
    name: 'Victoria (Lexie) Webb',
    title: 'Academic Coach for Dual Credit',
    email: 'vwebb@texarkanacollege.edu',
    phone: '(903) 823-3133',
    office: 'Dual Credit Center, Room 115',
    photo: null,
    schools: ['atl', 'qc', 'mc', 'lk'],
  },
];

const FALLBACK = {
  id: 'dept',
  name: 'Dual Credit Office',
  title: 'Academic Coach for Dual Credit',
  email: 'dualcredit@texarkanacollege.edu',
  phone: '(903) 823-3000',
  office: 'Dual Credit Center, Room 115',
  photo: null,
  schools: [],
};

/** Look up the ACDC coach for a given school id and optional grade (Texas High only) */
export function getAcdcForSchool(schoolId, grade = null) {
  if (schoolId === 'txh') {
    if (grade === 'Junior') return acdcContacts.find(c => c.id === 'mharmon') || FALLBACK;
    if (grade === 'Senior') return acdcContacts.find(c => c.id === 'kpage') || FALLBACK;
    // Freshman, Sophomore, or no grade
    return acdcContacts.find(c => c.id === 'bbarrett') || FALLBACK;
  }
  return acdcContacts.find(c => c.schools.includes(schoolId)) || FALLBACK;
}
