import { formatINR, formatDate } from './utils';

/**
 * Data Access Layer for StudyHub
 * 
 * All localStorage interactions are centralized here.
 * To replace with real API calls later, simply swap the function bodies
 * with fetch()/axios calls — the component signatures stay the same.
 * 
 * Every function is async to mirror real API behavior.
 */

import type {
  User, Semester, Subject, Material, Video, Plan, Payment, AuthSession,
  Program, Course
} from '@/types';

// ─── Storage Keys ──────────────────────────────────────────────
const KEYS = {
  USERS: 'studyhub_users',
  PROGRAMS: 'studyhub_programs',
  COURSES: 'studyhub_courses',
  SEMESTERS: 'studyhub_semesters',
  SUBJECTS: 'studyhub_subjects',
  MATERIALS: 'studyhub_materials',
  VIDEOS: 'studyhub_videos',
  PLANS: 'studyhub_plans',
  PAYMENTS: 'studyhub_payments',
  SESSION: 'studyhub_session',
  SEEDED: 'studyhub_seeded',
};

// ─── Generic Helpers ───────────────────────────────────────────
function getStore<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// ─── Users ─────────────────────────────────────────────────────
export async function getUsers(): Promise<User[]> {
  return getStore<User>(KEYS.USERS);
}

export async function getUserById(id: string): Promise<User | null> {
  const users = getStore<User>(KEYS.USERS);
  return users.find(u => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = getStore<User>(KEYS.USERS);
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'isPremium' | 'premiumExpiry' | 'isBlocked'>): Promise<User> {
  const users = getStore<User>(KEYS.USERS);
  const user: User = {
    ...data,
    id: generateId(),
    isPremium: false,
    premiumExpiry: null,
    isBlocked: false,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  setStore(KEYS.USERS, users);
  return user;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = getStore<User>(KEYS.USERS);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  setStore(KEYS.USERS, users);
  return users[index];
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = getStore<User>(KEYS.USERS);
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  setStore(KEYS.USERS, filtered);
  return true;
}

import { DEFAULT_PROGRAMS, DEFAULT_COURSES } from './curriculumData';

// ─── Programs (UG, PG, Diploma, etc.) ─────────────────────────
export async function getPrograms(): Promise<Program[]> {
  const progs = getStore<Program>(KEYS.PROGRAMS);
  if (!progs || progs.length === 0) {
    if (typeof window !== 'undefined') {
      setStore(KEYS.PROGRAMS, DEFAULT_PROGRAMS);
    }
    return DEFAULT_PROGRAMS;
  }
  return progs;
}

export async function getProgramById(id: string): Promise<Program | null> {
  const programs = await getPrograms();
  return programs.find(p => p.id === id) || null;
}

export async function createProgram(data: Omit<Program, 'id' | 'createdAt'>): Promise<Program> {
  const programs = await getPrograms();
  const program: Program = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  programs.push(program);
  setStore(KEYS.PROGRAMS, programs);
  return program;
}

export async function updateProgram(id: string, updates: Partial<Program>): Promise<Program | null> {
  const programs = await getPrograms();
  const idx = programs.findIndex(p => p.id === id);
  if (idx === -1) return null;
  programs[idx] = { ...programs[idx], ...updates };
  setStore(KEYS.PROGRAMS, programs);
  return programs[idx];
}

export async function deleteProgram(id: string): Promise<boolean> {
  const programs = await getPrograms();
  const filtered = programs.filter(p => p.id !== id);
  if (filtered.length === programs.length) return false;
  setStore(KEYS.PROGRAMS, filtered);
  return true;
}

// ─── Courses (BCA, MCA, B.Com, M.Com, B.Tech, MBA, etc.) ───────
export async function getCourses(): Promise<Course[]> {
  const crss = getStore<Course>(KEYS.COURSES);
  if (!crss || crss.length === 0) {
    if (typeof window !== 'undefined') {
      setStore(KEYS.COURSES, DEFAULT_COURSES);
    }
    return DEFAULT_COURSES;
  }
  return crss;
}

export async function getCourseById(id: string): Promise<Course | null> {
  const courses = await getCourses();
  return courses.find(c => c.id === id) || null;
}

export async function getCoursesByProgram(programId: string): Promise<Course[]> {
  const courses = await getCourses();
  return courses.filter(c => c.programId === programId);
}

export async function createCourse(data: Omit<Course, 'id' | 'createdAt'>): Promise<Course> {
  const courses = getStore<Course>(KEYS.COURSES);
  const course: Course = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  courses.push(course);
  setStore(KEYS.COURSES, courses);
  return course;
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
  const courses = getStore<Course>(KEYS.COURSES);
  const idx = courses.findIndex(c => c.id === id);
  if (idx === -1) return null;
  courses[idx] = { ...courses[idx], ...updates };
  setStore(KEYS.COURSES, courses);
  return courses[idx];
}

export async function deleteCourse(id: string): Promise<boolean> {
  const courses = getStore<Course>(KEYS.COURSES);
  const filtered = courses.filter(c => c.id !== id);
  if (filtered.length === courses.length) return false;
  setStore(KEYS.COURSES, filtered);
  return true;
}

// ─── Semesters ─────────────────────────────────────────────────
export async function getSemesters(): Promise<Semester[]> {
  return getStore<Semester>(KEYS.SEMESTERS);
}

export async function getSemesterById(id: string): Promise<Semester | null> {
  const semesters = getStore<Semester>(KEYS.SEMESTERS);
  return semesters.find(s => s.id === id) || null;
}

export async function createSemester(data: Omit<Semester, 'id' | 'createdAt'>): Promise<Semester> {
  const semesters = getStore<Semester>(KEYS.SEMESTERS);
  const semester: Semester = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  semesters.push(semester);
  setStore(KEYS.SEMESTERS, semesters);
  return semester;
}

export async function updateSemester(id: string, updates: Partial<Semester>): Promise<Semester | null> {
  const semesters = getStore<Semester>(KEYS.SEMESTERS);
  const idx = semesters.findIndex(s => s.id === id);
  if (idx === -1) return null;
  semesters[idx] = { ...semesters[idx], ...updates };
  setStore(KEYS.SEMESTERS, semesters);
  return semesters[idx];
}

export async function deleteSemester(id: string): Promise<boolean> {
  const semesters = getStore<Semester>(KEYS.SEMESTERS);
  const filtered = semesters.filter(s => s.id !== id);
  if (filtered.length === semesters.length) return false;
  setStore(KEYS.SEMESTERS, filtered);
  return true;
}

// ─── Subjects ──────────────────────────────────────────────────
export async function getSubjects(): Promise<Subject[]> {
  return getStore<Subject>(KEYS.SUBJECTS);
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const subjects = getStore<Subject>(KEYS.SUBJECTS);
  return subjects.find(s => s.id === id) || null;
}

export async function getSubjectsBySemester(semesterId: string): Promise<Subject[]> {
  const subjects = getStore<Subject>(KEYS.SUBJECTS);
  return subjects.filter(s => s.semesterId === semesterId);
}

export async function createSubject(data: Omit<Subject, 'id' | 'createdAt'>): Promise<Subject> {
  const subjects = getStore<Subject>(KEYS.SUBJECTS);
  const subject: Subject = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  subjects.push(subject);
  setStore(KEYS.SUBJECTS, subjects);
  return subject;
}

export async function updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | null> {
  const subjects = getStore<Subject>(KEYS.SUBJECTS);
  const idx = subjects.findIndex(s => s.id === id);
  if (idx === -1) return null;
  subjects[idx] = { ...subjects[idx], ...updates };
  setStore(KEYS.SUBJECTS, subjects);
  return subjects[idx];
}

export async function deleteSubject(id: string): Promise<boolean> {
  const subjects = getStore<Subject>(KEYS.SUBJECTS);
  const filtered = subjects.filter(s => s.id !== id);
  if (filtered.length === subjects.length) return false;
  setStore(KEYS.SUBJECTS, filtered);
  return true;
}

// ─── Materials ─────────────────────────────────────────────────
export async function getMaterials(): Promise<Material[]> {
  return getStore<Material>(KEYS.MATERIALS);
}

export async function getMaterialById(id: string): Promise<Material | null> {
  const materials = getStore<Material>(KEYS.MATERIALS);
  return materials.find(m => m.id === id) || null;
}

export async function createMaterial(data: Omit<Material, 'id' | 'createdAt'>): Promise<Material> {
  const materials = getStore<Material>(KEYS.MATERIALS);
  const material: Material = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  materials.push(material);
  setStore(KEYS.MATERIALS, materials);
  return material;
}

export async function updateMaterial(id: string, updates: Partial<Material>): Promise<Material | null> {
  const materials = getStore<Material>(KEYS.MATERIALS);
  const idx = materials.findIndex(m => m.id === id);
  if (idx === -1) return null;
  materials[idx] = { ...materials[idx], ...updates };
  setStore(KEYS.MATERIALS, materials);
  return materials[idx];
}

export async function deleteMaterial(id: string): Promise<boolean> {
  const materials = getStore<Material>(KEYS.MATERIALS);
  const filtered = materials.filter(m => m.id !== id);
  if (filtered.length === materials.length) return false;
  setStore(KEYS.MATERIALS, filtered);
  return true;
}

// ─── Videos ────────────────────────────────────────────────────
export async function getVideos(): Promise<Video[]> {
  return getStore<Video>(KEYS.VIDEOS);
}

export async function getVideoById(id: string): Promise<Video | null> {
  const videos = getStore<Video>(KEYS.VIDEOS);
  return videos.find(v => v.id === id) || null;
}

export async function createVideo(data: Omit<Video, 'id' | 'createdAt'>): Promise<Video> {
  const videos = getStore<Video>(KEYS.VIDEOS);
  const video: Video = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  videos.push(video);
  setStore(KEYS.VIDEOS, videos);
  return video;
}

export async function updateVideo(id: string, updates: Partial<Video>): Promise<Video | null> {
  const videos = getStore<Video>(KEYS.VIDEOS);
  const idx = videos.findIndex(v => v.id === id);
  if (idx === -1) return null;
  videos[idx] = { ...videos[idx], ...updates };
  setStore(KEYS.VIDEOS, videos);
  return videos[idx];
}

export async function deleteVideo(id: string): Promise<boolean> {
  const videos = getStore<Video>(KEYS.VIDEOS);
  const filtered = videos.filter(v => v.id !== id);
  if (filtered.length === videos.length) return false;
  setStore(KEYS.VIDEOS, filtered);
  return true;
}

// ─── Plans ─────────────────────────────────────────────────────
export async function getPlans(): Promise<Plan[]> {
  return getStore<Plan>(KEYS.PLANS);
}

export async function getActivePlans(): Promise<Plan[]> {
  const plans = getStore<Plan>(KEYS.PLANS);
  return plans.filter(p => p.isActive);
}

export async function getPlanById(id: string): Promise<Plan | null> {
  const plans = getStore<Plan>(KEYS.PLANS);
  return plans.find(p => p.id === id) || null;
}

export async function createPlan(data: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan> {
  const plans = getStore<Plan>(KEYS.PLANS);
  const plan: Plan = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  plans.push(plan);
  setStore(KEYS.PLANS, plans);
  return plan;
}

export async function updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | null> {
  const plans = getStore<Plan>(KEYS.PLANS);
  const idx = plans.findIndex(p => p.id === id);
  if (idx === -1) return null;
  plans[idx] = { ...plans[idx], ...updates };
  setStore(KEYS.PLANS, plans);
  return plans[idx];
}

export async function deletePlan(id: string): Promise<boolean> {
  const plans = getStore<Plan>(KEYS.PLANS);
  const filtered = plans.filter(p => p.id !== id);
  if (filtered.length === plans.length) return false;
  setStore(KEYS.PLANS, filtered);
  return true;
}

// ─── Payments ──────────────────────────────────────────────────
export async function getPayments(): Promise<Payment[]> {
  return getStore<Payment>(KEYS.PAYMENTS);
}

export async function getPaymentsByStudent(studentId: string): Promise<Payment[]> {
  const payments = getStore<Payment>(KEYS.PAYMENTS);
  return payments.filter(p => p.studentId === studentId);
}

export async function createPayment(data: Omit<Payment, 'id' | 'transactionId'>): Promise<Payment> {
  const payments = getStore<Payment>(KEYS.PAYMENTS);
  const payment: Payment = {
    ...data,
    id: generateId(),
    transactionId: 'TXN' + Date.now().toString().slice(-10) + Math.random().toString(36).substring(2, 6).toUpperCase(),
  };
  payments.push(payment);
  setStore(KEYS.PAYMENTS, payments);
  return payment;
}

// ─── Premium Purchase ──────────────────────────────────────────
export async function purchasePlan(
  studentId: string,
  planId: string,
  method: 'upi' | 'card' | 'netbanking',
  success: boolean
): Promise<Payment> {
  const user = await getUserById(studentId);
  const plan = await getPlanById(planId);
  if (!user || !plan) throw new Error('User or plan not found');

  const payment = await createPayment({
    studentId,
    studentName: user.name,
    studentEmail: user.email,
    planId,
    planName: plan.name,
    amount: plan.price,
    status: success ? 'success' : 'failed',
    method,
    date: new Date().toISOString(),
  });

  if (success) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.validityDays);
    await updateUser(studentId, {
      isPremium: true,
      premiumExpiry: expiryDate.toISOString(),
    });
  }

  return payment;
}

// ─── Extra Subject & Semester Unlocks ─────────────────────────────
export async function unlockSubjectForStudent(
  studentId: string,
  subjectId: string,
  method: 'upi' | 'card' | 'netbanking' = 'upi',
  amount: number = 149
): Promise<Payment> {
  const user = await getUserById(studentId);
  const subject = await getSubjectById(subjectId);
  if (!user || !subject) throw new Error('User or subject not found');

  const payment = await createPayment({
    studentId,
    studentName: user.name,
    studentEmail: user.email,
    planId: `extra-sub-${subjectId}`,
    planName: `Extra Subject Unlock: ${subject.name} (${subject.code})`,
    amount,
    status: 'success',
    method,
    date: new Date().toISOString(),
  });

  const currentUnlocked = user.unlockedSubjectIds || [];
  if (!currentUnlocked.includes(subjectId)) {
    await updateUser(studentId, {
      unlockedSubjectIds: [...currentUnlocked, subjectId],
    });
  }

  return payment;
}

export async function unlockSemesterForStudent(
  studentId: string,
  semesterId: string,
  method: 'upi' | 'card' | 'netbanking' = 'upi',
  amount: number = 299
): Promise<Payment> {
  const user = await getUserById(studentId);
  const semesters = await getSemesters();
  const semester = semesters.find(s => s.id === semesterId);
  if (!user || !semester) throw new Error('User or semester not found');

  const payment = await createPayment({
    studentId,
    studentName: user.name,
    studentEmail: user.email,
    planId: `extra-sem-${semesterId}`,
    planName: `Extra Semester Unlock: ${semester.name}`,
    amount,
    status: 'success',
    method,
    date: new Date().toISOString(),
  });

  const currentUnlocked = user.unlockedSemesterIds || [];
  if (!currentUnlocked.includes(semesterId)) {
    await updateUser(studentId, {
      unlockedSemesterIds: [...currentUnlocked, semesterId],
    });
  }

  return payment;
}

// ─── Session ───────────────────────────────────────────────────
export async function getSession(): Promise<AuthSession | null> {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(KEYS.SESSION);
  return data ? JSON.parse(data) : null;
}

export async function setSession(session: AuthSession): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.SESSION);
}

// ─── Check and auto-expire premium ────────────────────────────
export async function checkPremiumExpiry(userId: string): Promise<User | null> {
  const user = await getUserById(userId);
  if (!user) return null;
  if (user.isPremium && user.premiumExpiry) {
    const expiry = new Date(user.premiumExpiry);
    if (expiry < new Date()) {
      return await updateUser(userId, { isPremium: false, premiumExpiry: null });
    }
  }
  return user;
}

// ─── Seed Check ────────────────────────────────────────────────
export function isSeeded(): boolean {
  if (typeof window === 'undefined') return true;
  const seeded = localStorage.getItem(KEYS.SEEDED) === 'true';
  const hasPrograms = Boolean(localStorage.getItem(KEYS.PROGRAMS));
  const hasCourses = Boolean(localStorage.getItem(KEYS.COURSES));
  return seeded && hasPrograms && hasCourses;
}

export function markSeeded(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.SEEDED, 'true');
}

// ─── Reset Demo Data ──────────────────────────────────────────
export async function resetAllData(): Promise<void> {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}

// ─── Stats (for admin dashboard) ──────────────────────────────
export async function getStats() {
  const users = await getUsers();
  const students = users.filter(u => u.role === 'student');
  const premiumStudents = students.filter(u => u.isPremium);
  const materials = await getMaterials();
  const videos = await getVideos();
  const programs = await getPrograms();
  const courses = await getCourses();
  const payments = await getPayments();
  const successPayments = payments.filter(p => p.status === 'success');
  const totalRevenue = successPayments.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalStudents: students.length,
    premiumStudents: premiumStudents.length,
    totalMaterials: materials.length,
    totalVideos: videos.length,
    totalPrograms: programs.length,
    totalCourses: courses.length,
    totalRevenue,
    totalPayments: payments.length,
    recentPayments: payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10),
    monthlyRevenue: getMonthlyRevenue(successPayments),
  };
}

function getMonthlyRevenue(payments: Payment[]) {
  const months: { [key: string]: number } = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    months[key] = 0;
  }
  payments.forEach(p => {
    const d = new Date(p.date);
    const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    if (months[key] !== undefined) months[key] += p.amount;
  });
  return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
}
