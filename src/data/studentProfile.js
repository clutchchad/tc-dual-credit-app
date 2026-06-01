// MOCK DATA LAYER — Jenzabar API replacement target
// When Jenzabar API access is confirmed, replace getStudentProfile() with:
// return await fetch("/api/jenzabar/student-profile").then(r => r.json())
// The shape of mockStudentProfile defines the data contract — do not change field names.
// App engagement data (streaks, weekend opens) stays in localStorage — never in this file.

// ── Alex Sosa (demo student, TC ID 123456) ────────────────────────────────────
const alexSosa = {
  firstName: "Alex",
  lastName: "Sosa",
  studentId: null,
  email: 'alexsosa10@gmail.com',
  tcEmail: 'a.sosa3456@tc.edu',
  parentEmail: 'sosabichote@gmail.com',
  highSchool: "Texas High",
  grade: 11,
  role: "student",

  enrollmentStatus: "active",
  applicationSubmitted: true,
  enrolledInFirstClass: true,
  currentSemester: "Fall 2026",
  currentCourses: [
    { courseId: "ENGL-1301", name: "Composition I", hours: 3, status: "enrolled", grade: "B+", numericGrade: 88 },
    { courseId: "HIST-1301", name: "US History I",  hours: 3, status: "enrolled", grade: "A",  numericGrade: 95 },
  ],

  creditHoursEarned: 25,
  creditHoursPending: 6,
  creditHoursTotal: 31,
  associatesDegreeTarget: 60,

  milestones: {
    applicationSubmitted: true,
    enrolledInFirstClass: true,
    reached12Hours: true,
    reached15Hours: true,
    reached30Hours: true,
    reached45Hours: false,
    onTrackForAssociates: false,
    tcPromiseEligible: false,
  },

  transferIntentDeclared: false,
  transferTarget: null,
  graduationSemester: null,
  articulationReminderSent: false,

  tcPromiseEligible: false,
  tcPromiseStatus: null,

  // transcriptHistory — Jenzabar API replacement target
  // Replace with: getDocs(collection(db, 'transcriptHistory')) or Jenzabar transcript endpoint
  transcriptHistory: [
    {
      semester: 'Fall 2024',
      courses: [
        { courseId: 'ENGL-1301', name: 'Composition I',  hours: 3, grade: 'B+', numericGrade: 88, points: 9.9  },
        { courseId: 'HIST-1301', name: 'US History I',   hours: 3, grade: 'A',  numericGrade: 95, points: 12.0 },
      ],
      gpa: 3.83,
      hoursEarned: 6,
    },
    {
      semester: 'Spring 2025',
      courses: [
        { courseId: 'ENGL-1302', name: 'Composition II',             hours: 3, grade: 'A',  numericGrade: 95, points: 12.0 },
        { courseId: 'PSYC-2301', name: 'Introduction to Psychology', hours: 3, grade: 'B',  numericGrade: 83, points: 9.0  },
        { courseId: 'MATH-1314', name: 'College Algebra',            hours: 3, grade: 'B+', numericGrade: 88, points: 9.9  },
      ],
      gpa: 3.63,
      hoursEarned: 9,
    },
    {
      semester: 'Fall 2025',
      courses: [
        { courseId: 'HIST-1302', name: 'US History II',        hours: 3, grade: 'A',  numericGrade: 95, points: 12.0 },
        { courseId: 'SPCH-1315', name: 'Public Speaking',      hours: 3, grade: 'A-', numericGrade: 92, points: 11.1 },
        { courseId: 'BIOL-1406', name: 'Environmental Biology',hours: 4, grade: 'B+', numericGrade: 88, points: 13.2 },
      ],
      gpa: 3.80,
      hoursEarned: 10,
    },
  ],

  phone: '800-551-8900',
  address: {
    street: '1 Main St',
    city: 'Texarkana',
    state: 'TX',
    zip: '75503',
  },
  dateOfBirth: '10/10/2010',
  gpa: 3.99,
  graduationYear: '2028',
};

// ── Frank Lopez (demo student, TC ID 654321) ──────────────────────────────────
const frankLopez = {
  firstName: 'Frank',
  lastName: 'Lopez',
  studentId: '654321',
  email: 'frank.lopez@email.com',
  tcEmail: 'f.lopez654321@tc.edu',
  parentEmail: 'mlopez@email.com',
  highSchool: 'Pleasant Grove High School',
  grade: 9,
  role: 'student',

  enrollmentStatus: 'active',
  applicationSubmitted: true,
  enrolledInFirstClass: true,
  currentSemester: 'Spring 2026',
  currentCourses: [
    { courseId: 'MATH-1314', name: 'College Algebra',       hours: 3, status: 'enrolled', grade: 'B-', numericGrade: 81 },
    { courseId: 'BIOL-1406', name: 'Environmental Biology', hours: 4, status: 'enrolled', grade: 'C+', numericGrade: 78 },
  ],

  creditHoursEarned: 6,
  creditHoursPending: 7,
  creditHoursTotal: 13,
  associatesDegreeTarget: 60,

  milestones: {
    applicationSubmitted: true,
    enrolledInFirstClass: true,
    reached12Hours: false,
    reached15Hours: false,
    reached30Hours: false,
    reached45Hours: false,
    onTrackForAssociates: false,
    tcPromiseEligible: false,
  },

  transferIntentDeclared: false,
  transferTarget: null,
  graduationSemester: null,
  articulationReminderSent: false,

  tcPromiseEligible: false,
  tcPromiseStatus: null,

  pathway: 'Health Sciences',
  pathwayStatus: 'On Track',

  transcriptHistory: [
    {
      semester: 'Fall 2025',
      courses: [
        { courseId: 'ENGL-1301', name: 'Composition I',  hours: 3, grade: 'B',  numericGrade: 83, points: 9.0 },
        { courseId: 'HIST-1301', name: 'US History I',   hours: 3, grade: 'C+', numericGrade: 78, points: 6.9 },
      ],
      gpa: 2.65,
      hoursEarned: 6,
    },
  ],

  phone: '903-555-0182',
  address: {
    street: '412 Meadow Creek Dr',
    city: 'Texarkana',
    state: 'TX',
    zip: '75501',
  },
  dateOfBirth: '09/14/2011',
  gpa: 2.7,
  graduationYear: '2029',
};

// ── Lookup map — keyed by TC ID (string) ─────────────────────────────────────
const mockProfiles = {
  '123456': alexSosa,
  '654321': frankLopez,
};

export const getStudentProfile = async (tcId = '123456') => {
  return mockProfiles[String(tcId)] || alexSosa;
};

// ACDC lookup — returns the profile for a given TC ID, or null if not found.
// Unlike getStudentProfile, this does NOT fall back to alexSosa for unknown IDs.
export const lookupStudentById = (tcId) => {
  return mockProfiles[String(tcId)] || null;
};
