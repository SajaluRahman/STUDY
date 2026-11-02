/**
 * Seed demo data into localStorage for Pharmacy Portal.
 * Tailored exclusively for Pharmacy education: B.Pharm, M.Pharm, Pharm.D, D.Pharm.
 */

import type { User, Semester, Subject, Material, Video, Plan, Payment, Program, Course } from '@/types';
import { isSeeded, markSeeded, resetAllData } from './db';
import { DEFAULT_PROGRAMS, DEFAULT_COURSES, DEFAULT_SEMESTERS } from './curriculumData';

export function seedDemoData(): void {
  if (typeof window === 'undefined') return;

  const PHARMACY_VERSION = 'studyhub_pharmacy_v3';
  const isMigrated = localStorage.getItem(PHARMACY_VERSION) === 'true';

  const programs: Program[] = DEFAULT_PROGRAMS;
  const courses: Course[] = DEFAULT_COURSES;
  const semesters: Semester[] = DEFAULT_SEMESTERS;

  // ─── Pharmacy Subjects ────────────────────────────────────
  const subjects: Subject[] = [
    // ── B.Pharm Subjects (PCI Standard Syllabus) ────────────
    // Semester 1 (Year 1)
    { id: 'sub-bp101', name: 'Human Anatomy & Physiology I', code: 'BP101T', semesterId: 'sem1', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp102', name: 'Pharmaceutical Analysis I', code: 'BP102T', semesterId: 'sem1', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp103', name: 'Pharmaceutics I (General & Dispensing)', code: 'BP103T', semesterId: 'sem1', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp104', name: 'Pharmaceutical Inorganic Chemistry', code: 'BP104T', semesterId: 'sem1', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },

    // Semester 2 (Year 1)
    { id: 'sub-bp201', name: 'Human Anatomy & Physiology II', code: 'BP201T', semesterId: 'sem2', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp202', name: 'Pharmaceutical Organic Chemistry I', code: 'BP202T', semesterId: 'sem2', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp203', name: 'Biochemistry', code: 'BP203T', semesterId: 'sem2', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp204', name: 'Pathophysiology of Common Diseases', code: 'BP204T', semesterId: 'sem2', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },

    // Semester 3 (Year 2)
    { id: 'sub-bp301', name: 'Pharmaceutical Organic Chemistry II', code: 'BP301T', semesterId: 'sem3', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp302', name: 'Physical Pharmaceutics I', code: 'BP302T', semesterId: 'sem3', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp303', name: 'Pharmaceutical Microbiology', code: 'BP303T', semesterId: 'sem3', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp304', name: 'Pharmaceutical Engineering', code: 'BP304T', semesterId: 'sem3', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },

    // Semester 4 (Year 2)
    { id: 'sub-bp401', name: 'Pharmaceutical Organic Chemistry III', code: 'BP401T', semesterId: 'sem4', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp402', name: 'Medicinal Chemistry I', code: 'BP402T', semesterId: 'sem4', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp403', name: 'Physical Pharmaceutics II', code: 'BP403T', semesterId: 'sem4', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp404', name: 'Pharmacology I', code: 'BP404T', semesterId: 'sem4', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp405', name: 'Pharmacognosy & Phytochemistry I', code: 'BP405T', semesterId: 'sem4', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },

    // Semester 5 (Year 3)
    { id: 'sub-bp501', name: 'Medicinal Chemistry II', code: 'BP501T', semesterId: 'sem5', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp502', name: 'Industrial Pharmacy I', code: 'BP502T', semesterId: 'sem5', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp503', name: 'Pharmacology II (CVS & CNS)', code: 'BP503T', semesterId: 'sem5', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp504', name: 'Pharmacognosy & Phytochemistry II', code: 'BP504T', semesterId: 'sem5', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp505', name: 'Pharmaceutical Jurisprudence & Ethics', code: 'BP505T', semesterId: 'sem5', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },

    // Semester 6 (Year 3)
    { id: 'sub-bp601', name: 'Medicinal Chemistry III', code: 'BP601T', semesterId: 'sem6', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp602', name: 'Pharmacology III (Chemotherapy & Toxicology)', code: 'BP602T', semesterId: 'sem6', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp603', name: 'Herbal Drug Technology', code: 'BP603T', semesterId: 'sem6', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp604', name: 'Biopharmaceutics & Pharmacokinetics', code: 'BP604T', semesterId: 'sem6', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp605', name: 'Pharmaceutical Biotechnology', code: 'BP605T', semesterId: 'sem6', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },

    // Semester 7 (Year 4)
    { id: 'sub-bp701', name: 'Instrumental Methods of Analysis', code: 'BP701T', semesterId: 'sem7', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp702', name: 'Industrial Pharmacy II', code: 'BP702T', semesterId: 'sem7', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp703', name: 'Pharmacy Practice & Clinical Pharmacy', code: 'BP703T', semesterId: 'sem7', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp704', name: 'Novel Drug Delivery Systems (NDDS)', code: 'BP704T', semesterId: 'sem7', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },

    // Semester 8 (Year 4)
    { id: 'sub-bp801', name: 'Biostatistics & Research Methodology', code: 'BP801T', semesterId: 'sem8', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp802', name: 'Social & Preventive Pharmacy', code: 'BP802T', semesterId: 'sem8', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-bp803', name: 'Pharmaceutical Marketing & Regulatory Science', code: 'BP803ET', semesterId: 'sem8', courseId: 'course-bpharm-regular', programId: 'prog-bpharm', createdAt: '2026-01-10T10:00:00Z' },

    // ── M.Pharm Specialization Subjects ─────────────────────
    { id: 'sub-mph-mpc101', name: 'Modern Pharmaceutical Analytical Techniques', code: 'MPH101T', semesterId: 'sem1', courseId: 'course-mpharm-ceutics', programId: 'prog-mpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-mph-dds102', name: 'Drug Delivery Systems & Nanomedicine', code: 'MPH102T', semesterId: 'sem1', courseId: 'course-mpharm-ceutics', programId: 'prog-mpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-mph-bio201', name: 'Advanced Biopharmaceutics & Pharmacokinetics', code: 'MPH201T', semesterId: 'sem2', courseId: 'course-mpharm-ceutics', programId: 'prog-mpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-mpl-scr102', name: 'Advanced Pharmacological Screening Methods', code: 'MPL102T', semesterId: 'sem1', courseId: 'course-mpharm-col', programId: 'prog-mpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-mpl-tox201', name: 'Molecular Pharmacology & Clinical Toxicology', code: 'MPL201T', semesterId: 'sem2', courseId: 'course-mpharm-col', programId: 'prog-mpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-mch-cad101', name: 'Advanced Medicinal Chemistry & Computer Aided Drug Design (CADD)', code: 'MPC101T', semesterId: 'sem1', courseId: 'course-mpharm-chem', programId: 'prog-mpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-mqa-gmp101', name: 'Quality Management Systems & cGMP Auditing', code: 'MQA101T', semesterId: 'sem1', courseId: 'course-mpharm-qa', programId: 'prog-mpharm', createdAt: '2026-01-10T10:00:00Z' },

    // ── Pharm.D Clinical Subjects ───────────────────────────
    { id: 'sub-pd-clp101', name: 'Clinical Pharmacy Practice & Ward Rounds', code: 'PD101', semesterId: 'sem1', courseId: 'course-pharmd-regular', programId: 'prog-pharmd', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-pd-ptx201', name: 'Pharmacotherapeutics I (Cardiovascular & Respiratory)', code: 'PD201', semesterId: 'sem3', courseId: 'course-pharmd-regular', programId: 'prog-pharmd', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-pd-ptx301', name: 'Pharmacotherapeutics II (Oncology, Renal & Infectious)', code: 'PD301', semesterId: 'sem5', courseId: 'course-pharmd-regular', programId: 'prog-pharmd', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-pd-hsp401', name: 'Hospital Pharmacy & Drug Information Service', code: 'PD401', semesterId: 'sem7', courseId: 'course-pharmd-regular', programId: 'prog-pharmd', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-pd-tdm501', name: 'Clinical Pharmacokinetics & Therapeutic Drug Monitoring (TDM)', code: 'PD501', semesterId: 'sem9', courseId: 'course-pharmd-regular', programId: 'prog-pharmd', createdAt: '2026-01-10T10:00:00Z' },

    // ── D.Pharm Diploma Subjects ────────────────────────────
    { id: 'sub-dp101', name: 'Pharmaceutics (Theory & Formulation)', code: 'ER20-11T', semesterId: 'sem1', courseId: 'course-dpharm-regular', programId: 'prog-dpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-dp102', name: 'Pharmaceutical Chemistry', code: 'ER20-12T', semesterId: 'sem1', courseId: 'course-dpharm-regular', programId: 'prog-dpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-dp103', name: 'Pharmacognosy', code: 'ER20-13T', semesterId: 'sem1', courseId: 'course-dpharm-regular', programId: 'prog-dpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-dp104', name: 'Human Anatomy & Physiology', code: 'ER20-14T', semesterId: 'sem1', courseId: 'course-dpharm-regular', programId: 'prog-dpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-dp201', name: 'Pharmacology', code: 'ER20-21T', semesterId: 'sem3', courseId: 'course-dpharm-regular', programId: 'prog-dpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-dp202', name: 'Community Pharmacy & Management', code: 'ER20-22T', semesterId: 'sem3', courseId: 'course-dpharm-regular', programId: 'prog-dpharm', createdAt: '2026-01-10T10:00:00Z' },
    { id: 'sub-dp203', name: 'Hospital & Clinical Pharmacy', code: 'ER20-25T', semesterId: 'sem3', courseId: 'course-dpharm-regular', programId: 'prog-dpharm', createdAt: '2026-01-10T10:00:00Z' },
  ];

  // ─── Pharmacy Study Materials ─────────────────────────────
  const materials: Material[] = [
    // B.Pharm Notes
    {
      id: 'mat-hap1',
      title: 'Human Anatomy & Physiology I - Complete Cardiovascular & Neural Notes',
      description: 'Comprehensive handwritten revision diagrams for cardiac cycle, action potential, and cranial nerves.',
      semesterId: 'sem1',
      subjectId: 'sub-bp101',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://drive.google.com/file/d/hap-1-complete-notes/view',
      isPremium: false,
      createdAt: '2026-02-01T10:00:00Z',
    },
    {
      id: 'mat-analysis1',
      title: 'Pharmaceutical Analysis - Acid-Base & Redox Titration Quick Revision',
      description: 'Standardization procedures, indicator theories, primary vs secondary standards with solved calculations.',
      semesterId: 'sem1',
      subjectId: 'sub-bp102',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://drive.google.com/file/d/pharma-analysis-notes/view',
      isPremium: true,
      createdAt: '2026-02-02T10:00:00Z',
    },
    {
      id: 'mat-ceutics1',
      title: 'Pharmaceutics I - Posology & Prescription Incompatibility Solved Guide',
      description: 'Dose calculations for pediatric & geriatric patients, therapeutic and chemical incompatibilities.',
      semesterId: 'sem1',
      subjectId: 'sub-bp103',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://drive.google.com/file/d/pharmaceutics-1-guide/view',
      isPremium: false,
      createdAt: '2026-02-03T10:00:00Z',
    },
    {
      id: 'mat-poc2',
      title: 'Pharmaceutical Organic Chemistry II - Benzene & Phenol Reactions Chart',
      description: 'Electrophilic aromatic substitution mechanism, activating/deactivating groups, and Friedel-Crafts reaction.',
      semesterId: 'sem3',
      subjectId: 'sub-bp301',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://drive.google.com/file/d/poc-2-benzene-notes/view',
      isPremium: false,
      createdAt: '2026-02-04T10:00:00Z',
    },
    {
      id: 'mat-micro',
      title: 'Pharmaceutical Microbiology - Sterilization & Antibiotic Assay Manual',
      description: 'Moist vs dry heat validation, D-value & Z-value calculations, and cup-plate microbiological assay.',
      semesterId: 'sem3',
      subjectId: 'sub-bp303',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://drive.google.com/file/d/microbiology-practical-guide/view',
      isPremium: true,
      createdAt: '2026-02-05T10:00:00Z',
    },
    {
      id: 'mat-medchem1',
      title: 'Medicinal Chemistry I - Autonomic Drugs Structure-Activity Relationship (SAR)',
      description: 'Adrenergic & cholinergic agonists, antagonists SAR schemes with GPAT previous exam high-yield summaries.',
      semesterId: 'sem4',
      subjectId: 'sub-bp402',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://drive.google.com/file/d/medchem-1-sar-notes/view',
      isPremium: true,
      createdAt: '2026-02-06T10:00:00Z',
    },
    {
      id: 'mat-col1',
      title: 'Pharmacology I - General Principles & Receptor Transduction Mechanisms',
      description: 'GPCR signaling, ion channels, dose-response curves, therapeutic index, and drug bioavailability equations.',
      semesterId: 'sem4',
      subjectId: 'sub-bp404',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://drive.google.com/file/d/pharmacology-1-mechanisms/view',
      isPremium: false,
      createdAt: '2026-02-07T10:00:00Z',
    },
    {
      id: 'mat-cognosy',
      title: 'Pharmacognosy & Phytochemistry - Alkaloids & Glycosides Extraction Chart',
      description: 'Chemical tests (Dragendorff, Mayer, Keller-Kiliani), biological source, and active therapeutic constituents.',
      semesterId: 'sem5',
      subjectId: 'sub-bp504',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://drive.google.com/file/d/pharmacognosy-phytochem-notes/view',
      isPremium: false,
      createdAt: '2026-02-08T10:00:00Z',
    },
    {
      id: 'mat-medchem2',
      title: 'Medicinal Chemistry II - Antineoplastic & Cardiovascular Drug Synthesis',
      description: 'Complete synthesis pathways for Methotrexate, Fluorouracil, Atenolol, and Nifedipine with GPAT flashcards.',
      semesterId: 'sem5',
      subjectId: 'sub-bp501',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://drive.google.com/file/d/medchem-2-synthesis/view',
      isPremium: true,
      createdAt: '2026-02-09T10:00:00Z',
    },
    {
      id: 'mat-biopharm',
      title: 'Biopharmaceutics & Pharmacokinetics - Compartmental Modeling & Clearance',
      description: 'One-compartment open IV bolus model, elimination rate constant Ke, AUC trapezoidal rule, and renal clearance.',
      semesterId: 'sem6',
      subjectId: 'sub-bp604',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://drive.google.com/file/d/biopharmaceutics-numerical-guide/view',
      isPremium: true,
      createdAt: '2026-02-10T10:00:00Z',
    },
    {
      id: 'mat-ndds',
      title: 'Novel Drug Delivery Systems (NDDS) - Liposomes, Nanoparticles & Patches',
      description: 'Formulation principles for targeted drug delivery, stealth liposomes, ocular inserts, and transdermal permeation.',
      semesterId: 'sem7',
      subjectId: 'sub-bp704',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://drive.google.com/file/d/ndds-liposomes-nanoparticles/view',
      isPremium: true,
      createdAt: '2026-02-11T10:00:00Z',
    },

    // M.Pharm Materials
    {
      id: 'mat-mph-nanomed',
      title: 'M.Pharm: Advanced Nanocarriers & Target-Specific Drug Release',
      description: 'Polymeric micelles, solid lipid nanoparticles (SLN), dendrimers, and stimuli-responsive release kinetics.',
      semesterId: 'sem1',
      subjectId: 'sub-mph-dds102',
      courseId: 'course-mpharm-ceutics',
      programId: 'prog-mpharm',
      link: 'https://drive.google.com/file/d/mpharm-nanocarriers-notes/view',
      isPremium: true,
      createdAt: '2026-02-12T10:00:00Z',
    },
    {
      id: 'mat-mpl-screen',
      title: 'M.Pharm: Animal Models & In Vivo Screening Methods in Pharmacology',
      description: 'Screening models for antidiabetic, anti-inflammatory, and antidepressant drugs according to CPCSEA guidelines.',
      semesterId: 'sem1',
      subjectId: 'sub-mpl-scr102',
      courseId: 'course-mpharm-col',
      programId: 'prog-mpharm',
      link: 'https://drive.google.com/file/d/pharmacology-screening-models/view',
      isPremium: false,
      createdAt: '2026-02-13T10:00:00Z',
    },

    // Pharm.D Materials
    {
      id: 'mat-pd-tdm',
      title: 'Pharm.D: Therapeutic Drug Monitoring (TDM) & Aminoglycoside Dosing',
      description: 'Individualized dosage calculations for Vancomycin, Digoxin, and Phenytoin with renal impairment adjustments.',
      semesterId: 'sem9',
      subjectId: 'sub-pd-tdm501',
      courseId: 'course-pharmd-regular',
      programId: 'prog-pharmd',
      link: 'https://drive.google.com/file/d/pharmd-tdm-protocols/view',
      isPremium: true,
      createdAt: '2026-02-14T10:00:00Z',
    },
    {
      id: 'mat-pd-ptx',
      title: 'Pharm.D: Clinical Practice Guidelines for Heart Failure & Hypertension',
      description: 'ACC/AHA and ESC guidelines, ACEi vs ARB selection, contraindications, and clinical bedside case discussions.',
      semesterId: 'sem3',
      subjectId: 'sub-pd-ptx201',
      courseId: 'course-pharmd-regular',
      programId: 'prog-pharmd',
      link: 'https://drive.google.com/file/d/pharmd-cardio-guidelines/view',
      isPremium: false,
      createdAt: '2026-02-15T10:00:00Z',
    },

    // D.Pharm Materials
    {
      id: 'mat-dp-comm',
      title: 'D.Pharm: Community Pharmacy Dispensing & OTC Drug Counseling Manual',
      description: 'Prescription reading, patient counseling on antibiotic adherence, storage condition signs, and Schedule H drugs.',
      semesterId: 'sem3',
      subjectId: 'sub-dp202',
      courseId: 'course-dpharm-regular',
      programId: 'prog-dpharm',
      link: 'https://drive.google.com/file/d/dpharm-dispensing-manual/view',
      isPremium: false,
      createdAt: '2026-02-16T10:00:00Z',
    },
  ];

  // ─── Pharmacy Video Lectures ──────────────────────────────
  const videos: Video[] = [
    // B.Pharm Videos
    {
      id: 'vid-pharma-ans',
      title: 'Autonomic Nervous System: Sympathetic vs Parasympathetic Receptors',
      description: 'Complete visual walkthrough of Alpha 1/2, Beta 1/2/3 receptors, acetylcholine release, and second messengers.',
      semesterId: 'sem4',
      subjectId: 'sub-bp404',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://www.youtube.com/watch?v=qSaxpQbk1w4',
      thumbnail: '',
      duration: '52 min',
      isPremium: false,
      createdAt: '2026-02-20T10:00:00Z',
    },
    {
      id: 'vid-pharma-medchem',
      title: 'Beta-Lactam Antibiotics: Penicillin & Cephalosporin SAR Mastery',
      description: 'Detailed analysis of thiazolidine ring, beta-lactam stability, beta-lactamase inhibitors (Clavulanic acid).',
      semesterId: 'sem6',
      subjectId: 'sub-bp601',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://www.youtube.com/watch?v=Fj2F2bS6i2s',
      thumbnail: '',
      duration: '1h 05min',
      isPremium: true,
      createdAt: '2026-02-21T10:00:00Z',
    },
    {
      id: 'vid-pharma-tablets',
      title: 'Industrial Pharmacy: Tablet Manufacturing & Compression Defects',
      description: 'Capping, lamination, sticking, picking, and chipping defects explained with preventive industrial measures.',
      semesterId: 'sem5',
      subjectId: 'sub-bp502',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://www.youtube.com/watch?v=6P3F204y12w',
      thumbnail: '',
      duration: '45 min',
      isPremium: false,
      createdAt: '2026-02-22T10:00:00Z',
    },
    {
      id: 'vid-pharma-hplc',
      title: 'Instrumental Analysis: HPLC Chromatography Instrumentation & Peak Resolving',
      description: 'Stationary phases, reverse phase C18 columns, gradient elution, retention time, and theoretical plates calculation.',
      semesterId: 'sem7',
      subjectId: 'sub-bp701',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://www.youtube.com/watch?v=y3hKzN_9Q0M',
      thumbnail: '',
      duration: '1h 15min',
      isPremium: true,
      createdAt: '2026-02-23T10:00:00Z',
    },
    {
      id: 'vid-pharma-pk',
      title: 'Pharmacokinetics: First-Order vs Zero-Order Elimination & Half-Life Equations',
      description: 'Solving standard university numericals on clearance, volume of distribution (Vd), and steady-state concentration (Css).',
      semesterId: 'sem6',
      subjectId: 'sub-bp604',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://www.youtube.com/watch?v=2B1k3n849gQ',
      thumbnail: '',
      duration: '38 min',
      isPremium: true,
      createdAt: '2026-02-24T10:00:00Z',
    },
    {
      id: 'vid-pharma-gpat',
      title: 'GPAT & NIPER Master Strategy: Top 50 High-Yield Medicinal Chemistry & Pharmacology Topics',
      description: 'Previous 10-year question pattern analysis, essential drug classification tricks, and mnemonic cheat sheets.',
      semesterId: 'sem8',
      subjectId: 'sub-bp801',
      courseId: 'course-bpharm-regular',
      programId: 'prog-bpharm',
      link: 'https://www.youtube.com/watch?v=VzLq42B9mY0',
      thumbnail: '',
      duration: '1h 30min',
      isPremium: true,
      createdAt: '2026-02-25T10:00:00Z',
    },

    // M.Pharm Videos
    {
      id: 'vid-mpharm-liposomes',
      title: 'M.Pharm: Liposomal Drug Delivery Systems Formulation & Characterization',
      description: 'Thin-film hydration method, extrusion, particle size analysis by Dynamic Light Scattering (DLS), and zeta potential.',
      semesterId: 'sem1',
      subjectId: 'sub-mph-dds102',
      courseId: 'course-mpharm-ceutics',
      programId: 'prog-mpharm',
      link: 'https://www.youtube.com/watch?v=n8M49_kZqR0',
      thumbnail: '',
      duration: '48 min',
      isPremium: false,
      createdAt: '2026-02-26T10:00:00Z',
    },

    // Pharm.D Videos
    {
      id: 'vid-pharmd-rounds',
      title: 'Pharm.D: How to Review Patient Medical Charts & Identify Drug Interactions',
      description: 'Step-by-step case demonstration: Identifying pharmacokinetic interactions, adverse drug reactions (ADR), and SOAP note preparation.',
      semesterId: 'sem1',
      subjectId: 'sub-pd-clp101',
      courseId: 'course-pharmd-regular',
      programId: 'prog-pharmd',
      link: 'https://www.youtube.com/watch?v=T9v8xX01k9M',
      thumbnail: '',
      duration: '56 min',
      isPremium: true,
      createdAt: '2026-02-27T10:00:00Z',
    },
  ];

  // ─── Plans ───────────────────────────────────────────────
  const plans: Plan[] = [
    {
      id: 'plan1',
      name: 'Pharmacy Monthly Pass',
      price: 199,
      validityDays: 30,
      features: [
        'Unlimited access to all B.Pharm & D.Pharm PDF notes',
        'Stream all HD pharmacology & pharmaceutics video lectures',
        'Downloadable question banks with model answers',
        'Formula & SAR cheat sheets for fast revision',
      ],
      isActive: true,
      isMostPopular: false,
      createdAt: '2026-01-01T10:00:00Z',
    },
    {
      id: 'plan2',
      name: 'Semester Pharmacy Pass',
      price: 499,
      validityDays: 180,
      features: [
        'Everything in Monthly Pass',
        'Full 6-month validity for your complete semester',
        'Previous 5-year solved university question papers',
        'Exclusive GPAT / NIPER preparation video masterclasses',
        'Access to M.Pharm & Pharm.D advanced clinical resources',
      ],
      isActive: true,
      isMostPopular: true,
      createdAt: '2026-01-01T10:00:00Z',
    },
    {
      id: 'plan3',
      name: 'Yearly Pharmacy Pro + GPAT',
      price: 799,
      validityDays: 365,
      features: [
        'Full 365 days unlimited access (Both Semesters)',
        'Access all B.Pharm, M.Pharm, Pharm.D & D.Pharm courses',
        'Complete GPAT / NIPER Mock Test Series & notes',
        'Offline PDF download archive & lab practical manuals',
        'Direct mentor doubt-clearing assistance',
      ],
      isActive: true,
      isMostPopular: false,
      createdAt: '2026-01-01T10:00:00Z',
    },
  ];

  // ─── Users ───────────────────────────────────────────────
  const premiumExpiry = new Date();
  premiumExpiry.setDate(premiumExpiry.getDate() + 150);

  const users: User[] = [
    {
      id: 'admin1',
      name: 'Admin User',
      email: 'admin@studyhub.com',
      phone: '9876543210',
      password: 'Admin@123',
      role: 'admin',
      semester: 0,
      isPremium: false,
      premiumExpiry: null,
      isBlocked: false,
      createdAt: '2026-01-01T10:00:00Z',
    },
    {
      id: 'student1',
      name: 'Rahul Sharma',
      email: 'student@studyhub.com',
      phone: '9876543211',
      password: 'Student@123',
      role: 'student',
      programId: 'prog-bpharm',
      courseId: 'course-bpharm-regular',
      year: 2,
      semester: 3,
      isPremium: false,
      premiumExpiry: null,
      isBlocked: false,
      createdAt: '2026-02-15T10:00:00Z',
    },
    {
      id: 'student2',
      name: 'Priya Patel',
      email: 'premium@studyhub.com',
      phone: '9876543212',
      password: 'Premium@123',
      role: 'student',
      programId: 'prog-bpharm',
      courseId: 'course-bpharm-regular',
      year: 3,
      semester: 5,
      isPremium: true,
      premiumExpiry: premiumExpiry.toISOString(),
      isBlocked: false,
      createdAt: '2026-03-01T10:00:00Z',
    },
    {
      id: 'student3',
      name: 'Amit Kumar',
      email: 'amit@studyhub.com',
      phone: '9876543213',
      password: 'Amit@123',
      role: 'student',
      programId: 'prog-pharmd',
      courseId: 'course-pharmd-regular',
      year: 2,
      semester: 3,
      isPremium: false,
      premiumExpiry: null,
      isBlocked: false,
      createdAt: '2026-04-10T10:00:00Z',
    },
    {
      id: 'student4',
      name: 'Sneha Reddy',
      email: 'sneha@studyhub.com',
      phone: '9876543214',
      password: 'Sneha@123',
      role: 'student',
      programId: 'prog-mpharm',
      courseId: 'course-mpharm-ceutics',
      year: 1,
      semester: 2,
      isPremium: true,
      premiumExpiry: premiumExpiry.toISOString(),
      isBlocked: false,
      createdAt: '2026-05-20T10:00:00Z',
    },
  ];

  // ─── Payments ────────────────────────────────────────────
  const payments: Payment[] = [
    {
      id: 'pay1',
      studentId: 'student2',
      studentName: 'Priya Patel',
      studentEmail: 'premium@studyhub.com',
      planId: 'plan2',
      planName: 'Semester Pharmacy Pass',
      amount: 499,
      status: 'success',
      method: 'upi',
      transactionId: 'TXN2026050112345PHARM',
      date: '2026-05-01T14:30:00Z',
    },
    {
      id: 'pay2',
      studentId: 'student4',
      studentName: 'Sneha Reddy',
      studentEmail: 'sneha@studyhub.com',
      planId: 'plan3',
      planName: 'Yearly Pharmacy Pro + GPAT',
      amount: 799,
      status: 'success',
      method: 'card',
      transactionId: 'TXN2026060567890PHARM',
      date: '2026-06-05T09:15:00Z',
    },
    {
      id: 'pay3',
      studentId: 'student1',
      studentName: 'Rahul Sharma',
      studentEmail: 'student@studyhub.com',
      planId: 'plan1',
      planName: 'Pharmacy Monthly Pass',
      amount: 199,
      status: 'failed',
      method: 'netbanking',
      transactionId: 'TXN2026070298765PHARM',
      date: '2026-07-02T16:45:00Z',
    },
  ];

  // Always seed if not yet migrated to Pharmacy
  if (!isMigrated || !isSeeded()) {
    localStorage.setItem('studyhub_programs', JSON.stringify(programs));
    localStorage.setItem('studyhub_courses', JSON.stringify(courses));
    localStorage.setItem('studyhub_semesters', JSON.stringify(semesters));
    localStorage.setItem('studyhub_subjects', JSON.stringify(subjects));
    localStorage.setItem('studyhub_materials', JSON.stringify(materials));
    localStorage.setItem('studyhub_videos', JSON.stringify(videos));
    localStorage.setItem('studyhub_plans', JSON.stringify(plans));
    localStorage.setItem('studyhub_payments', JSON.stringify(payments));
    localStorage.setItem('studyhub_users', JSON.stringify(users));

    // Update active session user if present
    const sessionStr = localStorage.getItem('studyhub_session');
    if (sessionStr) {
      try {
        const sess = JSON.parse(sessionStr);
        if (sess?.user?.role === 'student') {
          sess.user.programId = 'prog-bpharm';
          sess.user.courseId = 'course-bpharm-regular';
          localStorage.setItem('studyhub_session', JSON.stringify(sess));
        }
      } catch {
        // ignore
      }
    }

    markSeeded();
    localStorage.setItem(PHARMACY_VERSION, 'true');
  }
}

export async function resetAndReseed(): Promise<void> {
  await resetAllData();
  seedDemoData();
}
