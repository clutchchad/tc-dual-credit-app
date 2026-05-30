// MOCK DATA LAYER — Jenzabar API replacement target
// When Jenzabar API access is confirmed, replace getStudentProfile() with:
// return await fetch("/api/jenzabar/student-profile").then(r => r.json())
// The shape of mockStudentProfile defines the data contract — do not change field names.
// App engagement data (streaks, weekend opens) stays in localStorage — never in this file.

const mockStudentProfile = {
  firstName: "Alex",
  lastName: "Sosa",
  studentId: "TC-2024-00142",
  email: null,
  highSchool: "Texas High",
  grade: 11,
  role: "student",

  enrollmentStatus: "active",
  applicationSubmitted: true,
  enrolledInFirstClass: true,
  currentSemester: "Fall 2026",
  currentCourses: [
    { courseId: "ENGL-1301", name: "Composition I", hours: 3, status: "enrolled" },
    { courseId: "HIST-1301", name: "US History I", hours: 3, status: "enrolled" },
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
};

export const getStudentProfile = async () => {
  return mockStudentProfile;
};
