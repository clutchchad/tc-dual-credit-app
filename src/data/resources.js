/**
 * Mock resources — structured as Firestore documents for easy replacement.
 * Replace with: getDocs(collection(db,'resources'))
 */
export const resources = [
  { id: '1', type: 'pdf',      title: 'Student Handbook',      desc: 'Rights, responsibilities and policies',   tag: 'PDF'      },
  { id: '2', type: 'video',    title: 'How Dual Credit Works', desc: '3-min explainer video',                  tag: 'Video'    },
  { id: '3', type: 'calendar', title: 'Drop Deadlines',        desc: 'Spring and Summer 2025 schedule',        tag: 'Calendar' },
  { id: '4', type: 'pdf',      title: 'Tuition and Payment',   desc: 'Costs, waivers and billing details',     tag: 'PDF'      },
  { id: '5', type: 'guide',    title: 'Moodle Tutorial',       desc: 'Getting started with your online LMS',   tag: 'Guide'    },
  { id: '6', type: 'pdf',      title: 'Course Catalog',        desc: 'Available dual credit courses',          tag: 'PDF'      },
  { id: '7', type: 'video',    title: 'Parent Orientation',    desc: '5-min overview for families',            tag: 'Video'    },
  { id: '8', type: 'calendar', title: 'Academic Calendar',     desc: '2025-2026 full year',                    tag: 'Calendar' },
  { id: '9', type: 'pdf',      title: 'TSI Assessment Guide',  desc: 'Placement test prep and information',    tag: 'PDF'      },
];
