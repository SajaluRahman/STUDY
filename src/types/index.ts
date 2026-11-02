export type UserRole = 'student' | 'admin';

export interface Program {
  id: string;
  name: string; // e.g. 'Undergraduate (UG)'
  code: string; // e.g. 'UG'
  description?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  programId: string; // references Program.id (e.g. 'prog-ug' or 'prog-pg')
  name: string; // e.g. 'Bachelor of Computer Applications (BCA)'
  code: string; // e.g. 'BCA'
  durationYears: number; // e.g. 3
  totalSemesters: number; // e.g. 6
  description?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  // NOTE: In production, passwords must be hashed server-side and validated with JWT tokens.
  // Plain-text storage is only for this frontend demo.
  password: string;
  role: UserRole;
  programId?: string; // e.g. 'prog-ug'
  courseId?: string; // e.g. 'course-bca'
  year?: number; // e.g. 1, 2, 3
  semester: number;
  selectedSubjectIds?: string[]; // IDs of subjects chosen by the student for free access
  unlockedSubjectIds?: string[]; // Extra subjects unlocked via separate payment
  unlockedSemesterIds?: string[]; // Extra semesters unlocked via separate payment
  isPremium: boolean;
  premiumExpiry: string | null; // ISO date string
  isBlocked: boolean;
  createdAt: string; // ISO date string
}

export interface Semester {
  id: string;
  name: string;
  number: number;
  year?: number; // e.g. 1 (Sem 1 & 2), 2 (Sem 3 & 4), 3 (Sem 5 & 6)
  courseId?: string; // optional course reference or general
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semesterId: string;
  courseId?: string; // references Course.id (e.g. 'course-bca', 'course-mca')
  programId?: string; // references Program.id (e.g. 'prog-ug', 'prog-pg')
  createdAt: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  semesterId: string;
  subjectId: string;
  courseId?: string; // e.g. 'course-bca'
  programId?: string; // e.g. 'prog-ug'
  link: string;
  isPremium: boolean;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  semesterId: string;
  subjectId: string;
  courseId?: string; // e.g. 'course-bca'
  programId?: string; // e.g. 'prog-ug'
  link: string;
  thumbnail: string;
  duration: string;
  isPremium: boolean;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number; // in INR
  validityDays: number;
  features: string[];
  isActive: boolean;
  isMostPopular: boolean;
  createdAt: string;
}

export type PaymentStatus = 'success' | 'failed' | 'pending';
export type PaymentMethod = 'upi' | 'card' | 'netbanking';

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  planId: string;
  planName: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId: string;
  date: string; // ISO date string
}

export interface AuthSession {
  userId: string;
  role: UserRole;
  token: string; // demo token
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
