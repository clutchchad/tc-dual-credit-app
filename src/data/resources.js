/**
 * Verified resource records — sourced from dualcredit.texarkanacollege.edu and TC student tools.
 * Structured as Firestore documents for easy replacement.
 * Replace with: getDocs(collection(db, 'resources'))
 */
export const resources = [
  // ── Digital Tools ────────────────────────────────────────────────────────────
  {
    id: 'mytc-portal',
    type: 'guide',
    title: 'myTC Portal',
    desc: 'Access your grades, coursework, transcripts, and student account.',
    url: 'https://my.texarkanacollege.edu/ics',
  },
  {
    id: 'moodle',
    type: 'guide',
    title: 'Moodle',
    desc: 'Log in to your dual credit courses and access assignments.',
    url: 'https://tconline.texarkanacollege.edu/my/',
  },
  {
    id: 'service-desk',
    type: 'guide',
    title: 'TC Service Desk',
    desc: 'Get technical support for your TC student tools and accounts.',
    url: 'https://support.texarkanacollege.edu/',
  },
  {
    id: 'student-email',
    type: 'guide',
    title: 'TC Student Email',
    desc: 'Access your official Texarkana College Outlook email account.',
    url: 'https://outlook.office365.com/mail/',
  },
  {
    id: 'library-access',
    type: 'guide',
    title: 'DC Library Access',
    desc: 'Access library resources available to dual credit students.',
    url: 'https://guides.texarkanacollege.edu/c.php?g=369443',
  },

  // ── Videos ───────────────────────────────────────────────────────────────────
  {
    id: 'dc-info-video',
    type: 'video',
    title: 'Dual Credit Information Video',
    desc: 'Learn key details about dual credit courses, enrollment, and student benefits.',
    url: 'https://youtu.be/KSVxs1nCqkk',
  },
  {
    id: 'orientation-video',
    type: 'video',
    title: 'New Student Orientation Video',
    desc: 'Start strong by learning about student tools and support resources.',
    url: 'https://vimeo.com/1108539219/0d38a67080',
  },
  {
    id: 'moodle-tutorials',
    type: 'video',
    title: 'Moodle Student Tutorials',
    desc: 'Step-by-step video tutorials for accessing and using your courses in Moodle.',
    url: 'https://txkcol.edu/DC-Moodle',
  },

  // ── PDFs ─────────────────────────────────────────────────────────────────────
  {
    id: 'academic-calendar',
    type: 'pdf',
    title: '2025–2026 Academic Calendar',
    desc: 'Find important dates for the current dual credit school year.',
    url: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/07/2025-2026-Dual-Credit-Calendar.pdf',
  },
  {
    id: 'payment-info',
    type: 'pdf',
    title: 'Payment Information & Refund Schedule',
    desc: 'Access payment instructions and refund deadlines for dual credit registration.',
    url: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/07/Dual-Credit-Payment-Information.pdf',
  },
  {
    id: 'drop-deadlines',
    type: 'pdf',
    title: 'Drop Deadlines',
    desc: 'Find important drop and refund dates for the current semester.',
    url: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/08/Dual-Credit-Drop-Deadlines.pdf',
  },
  {
    id: 'policy-manual',
    type: 'pdf',
    title: 'Policy & Procedure Manual',
    desc: 'Review the full 2025–2026 dual credit policies and student expectations.',
    url: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/07/2025-2026-Dual-Credit-Policy-Procedure-Manual.pdf',
  },
  {
    id: 'registration-contract',
    type: 'pdf',
    title: 'Registration Contract',
    desc: 'Download and review the dual credit registration contract for this school year.',
    url: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/07/2025-2026-Dual-Credit-Registration-Contract.pdf',
  },
  {
    id: 'drop-form',
    type: 'pdf',
    title: 'Drop Form',
    desc: 'Download the form to drop a dual credit course.',
    url: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/08/Dual-Credit-Drop-Form.pdf',
  },
  {
    id: 'enrollment-scores',
    type: 'pdf',
    title: 'Course Enrollment Scores & Prerequisites',
    desc: 'Review required scores and prerequisites for dual credit course enrollment.',
    url: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/08/2025-2026-Dual-Credit-Course-Enrollment-Scores-and-Prerequisites.pdf',
  },
  {
    id: 'distance-ed-handbook',
    type: 'pdf',
    title: 'Distance Education Handbook',
    desc: 'Understand the expectations and tools for online dual credit courses.',
    url: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/04/Online-Course-Handbook-for-Students.pdf',
  },
  {
    id: 'meningitis-waiver',
    type: 'pdf',
    title: 'Bacterial Meningitis Waiver',
    desc: 'Download the required bacterial meningitis vaccination waiver form.',
    url: 'https://dualcredit.texarkanacollege.edu/wp-content/uploads/2025/04/Bacterial-Meningitis-Vaccination-form-1.pdf',
  },

  // ── Informational ─────────────────────────────────────────────────────────────
  {
    id: 'faqs',
    type: 'guide',
    title: 'Dual Credit FAQs & Myths',
    desc: 'Get answers to the most common questions about the dual credit program.',
    url: 'https://dualcredit.texarkanacollege.edu/about/myths-faqs/',
  },
  {
    id: 'transfer-planning',
    type: 'guide',
    title: 'Transfer Planning',
    desc: 'Find out how your dual credit hours transfer to four-year colleges and universities.',
    url: 'https://dualcredit.texarkanacollege.edu/resources-for-students-parents/transfer-planning/',
  },
  {
    id: 'financial-planning',
    type: 'guide',
    title: 'Financial Planning',
    desc: 'Understand your payment options and financial planning resources for dual credit.',
    url: 'https://dualcredit.texarkanacollege.edu/resources-for-students-parents/financial-planning/',
  },
  {
    id: 'parent-info',
    type: 'guide',
    title: 'Parent Information',
    desc: 'Resources and information specifically for parents and guardians of dual credit students.',
    url: 'https://dualcredit.texarkanacollege.edu/resources-for-students-parents/parent-information/',
  },
  {
    id: 'transcript-request',
    type: 'guide',
    title: 'Transcript Request',
    desc: 'Request an official Texarkana College transcript.',
    url: 'https://www.texarkanacollege.edu/academics/registrar/request-transcript/',
  },
  {
    id: 'apply-dc',
    type: 'guide',
    title: 'Apply for Dual Credit',
    desc: 'Ready to enroll? Start your dual credit application here.',
    url: 'https://txkcol.edu/applydc',
  },
];
