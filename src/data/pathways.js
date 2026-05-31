/**
 * Dual Credit pathway records — structured as Firestore documents for easy replacement.
 * Replace with: getDocs(collection(db, 'pathways'))
 *
 * school: 'all'           → visible to all schools
 * school: ['le','hooks']  → visible only to students at those school ids (see schools.js)
 */
export const pathways = [
  // ── Universal Pathways ───────────────────────────────────────────────────────
  {
    id: 'business',
    title: 'Business & Entrepreneurship',
    school: 'all',
    description:
      'Build a foundation in business principles, economics, and communication skills that transfer to any four-year business program.',
    courses: [
      { courseId: 'BUSG-1301', name: 'Introduction to Business' },
      { courseId: 'ECON-2301', name: 'Principles of Macroeconomics' },
      { courseId: 'ENGL-1301', name: 'Composition I' },
      { courseId: 'BCIS-1305', name: 'Business Computer Applications' },
    ],
    pdfUrl: 'https://dualcredit.texarkanacollege.edu/find-your-pathway-plan/',
  },
  {
    id: 'stem',
    title: 'STEM & Engineering',
    school: 'all',
    description:
      'Prepare for science, technology, engineering, and math programs with college-level courses that count toward your degree.',
    courses: [
      { courseId: 'MATH-2412', name: 'Pre-Calculus' },
      { courseId: 'MATH-2413', name: 'Calculus I' },
      { courseId: 'PHYS-2425', name: 'University Physics I' },
      { courseId: 'ENGL-1301', name: 'Composition I' },
    ],
    pdfUrl: 'https://dualcredit.texarkanacollege.edu/find-your-pathway-plan/',
  },
  {
    id: 'health',
    title: 'Health Sciences',
    school: 'all',
    description:
      'Start your journey toward nursing, pre-med, or allied health with foundational science and communication courses.',
    courses: [
      { courseId: 'BIOL-2401', name: 'Anatomy & Physiology I' },
      { courseId: 'BIOL-2402', name: 'Anatomy & Physiology II' },
      { courseId: 'CHEM-1411', name: 'General Chemistry I' },
      { courseId: 'ENGL-1301', name: 'Composition I' },
    ],
    pdfUrl: 'https://dualcredit.texarkanacollege.edu/find-your-pathway-plan/',
  },
  {
    id: 'liberal-arts',
    title: 'Liberal Arts & Education',
    school: 'all',
    description:
      'Explore humanities, social sciences, and communication — ideal for students pursuing education, psychology, or social work.',
    courses: [
      { courseId: 'ENGL-1301', name: 'Composition I' },
      { courseId: 'ENGL-1302', name: 'Composition II' },
      { courseId: 'HIST-1301', name: 'US History I' },
      { courseId: 'PSYC-2301', name: 'Introduction to Psychology' },
    ],
    pdfUrl: 'https://dualcredit.texarkanacollege.edu/find-your-pathway-plan/',
  },
  {
    id: 'cte-it',
    title: 'Information Technology',
    school: 'all',
    description:
      'Build skills in computer systems, networking, and cybersecurity that prepare you for a career in tech or a four-year CS degree.',
    courses: [
      { courseId: 'BCIS-1305', name: 'Business Computer Applications' },
      { courseId: 'COSC-1301', name: 'Introduction to Computing' },
      { courseId: 'ITNW-1325', name: 'Fundamentals of Networking' },
    ],
    pdfUrl: 'https://dualcredit.texarkanacollege.edu/find-your-pathway-plan/',
  },

  // ── School-Specific Pathways ─────────────────────────────────────────────────
  {
    id: 'cte-auto',
    title: 'Automotive Technology',
    school: ['le', 'hooks', 'rw'],
    description:
      'Hands-on training in automotive systems, diagnostics, and repair — earn college credit while building real career skills.',
    courses: [
      { courseId: 'AUMT-1305', name: 'Introduction to Automotive Technology' },
      { courseId: 'AUMT-1316', name: 'Automotive Electrical Systems' },
      { courseId: 'AUMT-1319', name: 'Automotive Engine Repair' },
    ],
    pdfUrl: 'https://dualcredit.texarkanacollege.edu/find-your-pathway-plan/',
  },
  {
    id: 'cte-cosmo',
    title: 'Cosmetology',
    school: ['txh', 'pg'],
    description:
      'Begin your cosmetology career with dual credit courses that count toward your hours and your degree.',
    courses: [
      { courseId: 'CSME-1310', name: 'Introduction to Cosmetology' },
      { courseId: 'CSME-1401', name: 'Theory of Cosmetology I' },
    ],
    pdfUrl: 'https://dualcredit.texarkanacollege.edu/find-your-pathway-plan/',
  },
  {
    id: 'cte-culinary',
    title: 'Culinary Arts',
    school: ['txh', 'le'],
    description:
      'Develop professional cooking skills and food service knowledge with college-level culinary courses.',
    courses: [
      { courseId: 'CHEF-1301', name: 'Basic Food Preparation' },
      { courseId: 'CHEF-1205', name: 'Sanitation and Safety' },
    ],
    pdfUrl: 'https://dualcredit.texarkanacollege.edu/find-your-pathway-plan/',
  },
];
