import type { Program, Course, Semester } from '@/types';

export const DEFAULT_PROGRAMS: Program[] = [
  {
    id: 'prog-bpharm',
    name: 'Bachelor of Pharmacy (B.Pharm)',
    code: 'B.PHARM',
    description: '4-Year undergraduate pharmacy program approved by Pharmacy Council of India (PCI)',
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 'prog-mpharm',
    name: 'Master of Pharmacy (M.Pharm)',
    code: 'M.PHARM',
    description: '2-Year postgraduate specialization degrees in Pharmaceutics, Pharmacology, Chemistry & QA',
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 'prog-pharmd',
    name: 'Doctor of Pharmacy (Pharm.D)',
    code: 'PHARM.D',
    description: '6-Year clinical doctorate pharmacy program focused on patient care, hospital ward rounds & therapeutics',
    createdAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 'prog-dpharm',
    name: 'Diploma in Pharmacy (D.Pharm)',
    code: 'D.PHARM',
    description: '2-Year foundational diploma program for community pharmacy, dispensing & hospital inventory',
    createdAt: '2026-01-01T10:00:00Z',
  },
];

export const DEFAULT_COURSES: Course[] = [
  // ─── B.Pharm Courses (Undergraduate) ──────────────────────
  {
    id: 'course-bpharm-regular',
    programId: 'prog-bpharm',
    name: 'Bachelor of Pharmacy (B.Pharm - 4 Years)',
    code: 'B.PHARM',
    durationYears: 4,
    totalSemesters: 8,
    description: 'Standard 4-year PCI syllabus covering medicinal chemistry, pharmacology, pharmaceutics, and pharmacognosy.',
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'course-bpharm-lateral',
    programId: 'prog-bpharm',
    name: 'B.Pharm Lateral Entry (Direct 2nd Year)',
    code: 'B.PHARM-LE',
    durationYears: 3,
    totalSemesters: 6,
    description: 'Direct entry into 2nd year (Semesters 3 to 8) for diploma holders in pharmacy.',
    createdAt: '2026-01-05T10:00:00Z',
  },

  // ─── M.Pharm Specializations (Postgraduate) ───────────────
  {
    id: 'course-mpharm-ceutics',
    programId: 'prog-mpharm',
    name: 'M.Pharm in Pharmaceutics',
    code: 'M.PHARM (P\'CEUTICS)',
    durationYears: 2,
    totalSemesters: 4,
    description: 'Novel drug delivery systems, nanomedicine, preformulation studies, and advanced biopharmaceutics.',
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'course-mpharm-col',
    programId: 'prog-mpharm',
    name: 'M.Pharm in Pharmacology',
    code: 'M.PHARM (P\'COLOGY)',
    durationYears: 2,
    totalSemesters: 4,
    description: 'Advanced molecular pharmacology, preclinical screening, clinical toxicology, and trial design.',
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'course-mpharm-chem',
    programId: 'prog-mpharm',
    name: 'M.Pharm in Pharmaceutical Chemistry',
    code: 'M.PHARM (P\'CHEM)',
    durationYears: 2,
    totalSemesters: 4,
    description: 'Computer-aided drug design (CADD), organic drug synthesis, chromatographic, and spectral analysis.',
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'course-mpharm-qa',
    programId: 'prog-mpharm',
    name: 'M.Pharm in Pharmaceutical Quality Assurance',
    code: 'M.PHARM (QA)',
    durationYears: 2,
    totalSemesters: 4,
    description: 'cGMP guidelines, pharmaceutical auditing, validation protocols, and global regulatory submissions.',
    createdAt: '2026-01-05T10:00:00Z',
  },

  // ─── Pharm.D Courses (Doctorate) ──────────────────────────
  {
    id: 'course-pharmd-regular',
    programId: 'prog-pharmd',
    name: 'Doctor of Pharmacy (Pharm.D - 6 Years)',
    code: 'PHARM.D',
    durationYears: 6,
    totalSemesters: 12,
    description: '6-year clinical program with comprehensive hospital ward clerkship, pharmacotherapy, and drug information.',
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'course-pharmd-pb',
    programId: 'prog-pharmd',
    name: 'Pharm.D Post Baccalaureate (3 Years)',
    code: 'PHARM.D-PB',
    durationYears: 3,
    totalSemesters: 6,
    description: '3-year clinical doctorate for B.Pharm graduates looking to specialize in hospital and bedside patient care.',
    createdAt: '2026-01-05T10:00:00Z',
  },

  // ─── D.Pharm Courses (Diploma) ────────────────────────────
  {
    id: 'course-dpharm-regular',
    programId: 'prog-dpharm',
    name: 'Diploma in Pharmacy (D.Pharm - 2 Years)',
    code: 'D.PHARM',
    durationYears: 2,
    totalSemesters: 4,
    description: 'Foundational 2-year diploma for registered pharmacists in community pharmacy and dispensing.',
    createdAt: '2026-01-05T10:00:00Z',
  },
];

export const DEFAULT_SEMESTERS: Semester[] = [
  { id: 'sem1', name: 'Semester 1', number: 1, year: 1, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'sem2', name: 'Semester 2', number: 2, year: 1, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'sem3', name: 'Semester 3', number: 3, year: 2, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'sem4', name: 'Semester 4', number: 4, year: 2, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'sem5', name: 'Semester 5', number: 5, year: 3, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'sem6', name: 'Semester 6', number: 6, year: 3, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'sem7', name: 'Semester 7', number: 7, year: 4, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'sem8', name: 'Semester 8', number: 8, year: 4, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'sem9', name: 'Semester 9', number: 9, year: 5, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'sem10', name: 'Semester 10', number: 10, year: 5, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'sem11', name: 'Semester 11', number: 11, year: 6, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'sem12', name: 'Semester 12', number: 12, year: 6, createdAt: '2026-01-10T10:00:00Z' },
];
