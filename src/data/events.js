/**
 * Mock events — structured as Firestore documents for easy replacement.
 * Replace with: const q = query(collection(db,'events'), orderBy('days'));
 */
export const events = [
  { id: '1', title: 'Summer Registration Opens', date: 'May 28', type: 'deadline', days: 7  },
  { id: '2', title: 'TSIA Prep Workshop',         date: 'Jun 3',  type: 'event',    days: 13 },
  { id: '3', title: 'Drop Deadline: Spring',      date: 'Jun 10', type: 'deadline', days: 20 },
  { id: '4', title: 'Dual Credit Info Night',     date: 'Jun 17', type: 'event',    days: 27 },
  { id: '5', title: 'Fall Enrollment Begins',     date: 'Jul 1',  type: 'deadline', days: 41 },
];
