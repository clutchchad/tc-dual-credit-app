// MOCK DATA LAYER — Jenzabar API replacement target
// When Jenzabar API access is confirmed, replace getStudentProfile() with:
// return await fetch("/api/jenzabar/student-profile").then(r => r.json())
// The shape of mockStudentProfile defines the data contract — do not change field names.
// App engagement data (streaks, weekend opens) stays in localStorage — never in this file.

const mockStudentProfile = {
  firstName: "Alex",
  lastName: "Sosa",
  studentId: "TC-2024-00142",
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
    { courseId: "ENGL-1301", name: "Composition I", hours: 3, status: "enrolled", grade: "B+" },
    { courseId: "HIST-1301", name: "US History I",  hours: 3, status: "enrolled", grade: "A"  },
  ],

  creditHoursEarned: 24,
  creditHoursPending: 6,
  creditHoursTotal: 30,
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
        { courseId: 'ENGL-1301', name: 'Composition I',  hours: 3, grade: 'B+', points: 9.9  },
        { courseId: 'HIST-1301', name: 'US History I',   hours: 3, grade: 'A',  points: 12.0 },
      ],
      gpa: 3.83,
      hoursEarned: 6,
    },
    {
      semester: 'Spring 2025',
      courses: [
        { courseId: 'ENGL-1302', name: 'Composition II',             hours: 3, grade: 'A',  points: 12.0 },
        { courseId: 'PSYC-2301', name: 'Introduction to Psychology', hours: 3, grade: 'B',  points: 9.0  },
        { courseId: 'MATH-1314', name: 'College Algebra',            hours: 3, grade: 'B+', points: 9.9  },
      ],
      gpa: 3.63,
      hoursEarned: 9,
    },
    {
      semester: 'Fall 2025',
      courses: [
        { courseId: 'HIST-1302', name: 'US History II',        hours: 3, grade: 'A',  points: 12.0 },
        { courseId: 'SPCH-1315', name: 'Public Speaking',      hours: 3, grade: 'A-', points: 11.1 },
        { courseId: 'BIOL-1406', name: 'Environmental Biology',hours: 4, grade: 'B+', points: 13.2 },
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

export const getStudentProfile = async () => {
  return mockStudentProfile;
};
