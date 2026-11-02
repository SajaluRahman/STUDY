'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/auth';
import { getPrograms, getCourses, getSubjects } from '@/lib/db';
import { DEFAULT_PROGRAMS, DEFAULT_COURSES } from '@/lib/curriculumData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Program, Course, Subject } from '@/types';
import {
  GraduationCap, Mail, Lock, User, Phone, ArrowRight,
  BookOpen, Calendar, CheckSquare, Shield
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { addToast } = useToast();

  const [programs, setPrograms] = useState<Program[]>(DEFAULT_PROGRAMS);
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    programId: DEFAULT_PROGRAMS[0]?.id || 'prog-bpharm',
    courseId: DEFAULT_COURSES[0]?.id || 'course-bpharm-regular',
    year: '1',
    semester: '1',
    selectedSubjectIds: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getPrograms(), getCourses(), getSubjects()]).then(([progs, crss, subs]) => {
      const activeProgs = progs.length > 0 ? progs : DEFAULT_PROGRAMS;
      const activeCourses = crss.length > 0 ? crss : DEFAULT_COURSES;
      setPrograms(activeProgs);
      setCourses(activeCourses);
      setSubjects(subs);

      const curProg = activeProgs[0]?.id || 'prog-bpharm';
      const related = activeCourses.filter(c => c.programId === curProg);
      const chosenCourseId = related[0]?.id || activeCourses[0]?.id || 'course-bpharm-regular';

      // Default enrolled subjects for Sem 1
      const defaultSubs = subs
        .filter(s => (s.courseId === chosenCourseId || !s.courseId) && (s.semesterId === 'sem1' || s.semesterId === '1'))
        .map(s => s.id);

      setForm(f => ({
        ...f,
        programId: curProg,
        courseId: chosenCourseId,
        selectedSubjectIds: defaultSubs,
      }));
    });
  }, []);

  const getSubjectsForSelection = (courseId: string, semNum: string) => {
    return subjects.filter(s =>
      (s.courseId === courseId || !s.courseId) &&
      (s.semesterId === `sem${semNum}` || s.semesterId === semNum)
    );
  };

  const handleProgramChange = (progId: string) => {
    const related = courses.filter(c => c.programId === progId);
    const newCourseId = related[0]?.id || '';
    const relevantSubs = getSubjectsForSelection(newCourseId, '1').map(s => s.id);
    setForm(f => ({
      ...f,
      programId: progId,
      courseId: newCourseId,
      year: '1',
      semester: '1',
      selectedSubjectIds: relevantSubs,
    }));
  };

  const handleCourseChange = (courseId: string) => {
    const relevantSubs = getSubjectsForSelection(courseId, form.semester).map(s => s.id);
    setForm(f => ({
      ...f,
      courseId,
      selectedSubjectIds: relevantSubs,
    }));
  };

  const handleSemesterChange = (semester: string, year?: string) => {
    const relevantSubs = getSubjectsForSelection(form.courseId, semester).map(s => s.id);
    setForm(f => ({
      ...f,
      semester,
      ...(year ? { year } : {}),
      selectedSubjectIds: relevantSubs,
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      programId: form.programId,
      courseId: form.courseId,
      year: parseInt(form.year),
      semester: parseInt(form.semester),
      selectedSubjectIds: form.selectedSubjectIds,
    });

    setLoading(false);
    if ('error' in result) {
      addToast({ type: 'error', title: 'Registration Failed', message: result.error });
      return;
    }
    await refreshUser();
    addToast({
      type: 'success',
      title: 'Welcome to StudyHub!',
      message: 'Your student account has been created.',
    });
    router.push('/dashboard');
  };

  const availableCourses = courses.filter(c => c.programId === form.programId);
  const programsToRender = programs.length > 0 ? programs : DEFAULT_PROGRAMS;
  const coursesToRender = availableCourses.length > 0
    ? availableCourses
    : courses.length > 0
    ? courses
    : DEFAULT_COURSES;

  const selectedCourse = courses.find(c => c.id === form.courseId) || coursesToRender[0];
  const maxYears = selectedCourse?.durationYears || 3;
  const maxSemesters = selectedCourse?.totalSemesters || 6;

  const yearOptions = Array.from({ length: maxYears }, (_, i) => i + 1);
  const semesterOptions = Array.from({ length: maxSemesters }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 mb-4 shadow-lg shadow-teal-200">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy">Student Registration</h1>
            <p className="text-sm text-slate-500 mt-1">Enroll in your university course & explore study resources</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                error={errors.name}
                icon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="student@university.edu"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Phone Number"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                error={errors.phone}
                icon={<Phone className="w-4 h-4" />}
                required
              />

              {/* Program & Course Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Degree Program
                  </label>
                  <select
                    value={form.programId || programsToRender[0]?.id}
                    onChange={e => handleProgramChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {programsToRender.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sub-Course / Branch
                  </label>
                  <select
                    value={form.courseId || coursesToRender[0]?.id}
                    onChange={e => handleCourseChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {coursesToRender.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Year & Semester Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Year
                  </label>
                  <select
                    value={form.year}
                    onChange={e => {
                      const yr = e.target.value;
                      const defaultSem = yr === '1' ? '1' : yr === '2' ? '3' : yr === '3' ? '5' : '7';
                      handleSemesterChange(defaultSem, yr);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {yearOptions.map(yr => (
                      <option key={yr} value={yr}>
                        {yr === 1 ? '1st Year' : yr === 2 ? '2nd Year' : yr === 3 ? '3rd Year' : `${yr}th Year`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Semester
                  </label>
                  <select
                    value={form.semester}
                    onChange={e => handleSemesterChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {semesterOptions.map(num => (
                      <option key={num} value={num}>
                        Semester {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Enrolled Subjects for Free Tier */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                    Enrolled Subjects (Free Access Scope)
                  </label>
                  <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                    {form.selectedSubjectIds.length} included
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                  {getSubjectsForSelection(form.courseId || coursesToRender[0]?.id, form.semester).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No specific subjects listed for this semester.</p>
                  ) : (
                    getSubjectsForSelection(form.courseId || coursesToRender[0]?.id, form.semester).map(sub => {
                      const isChecked = form.selectedSubjectIds.includes(sub.id);
                      return (
                        <label
                          key={sub.id}
                          className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-navy cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm(f => ({ ...f, selectedSubjectIds: [...f.selectedSubjectIds, sub.id] }));
                              } else {
                                setForm(f => ({ ...f, selectedSubjectIds: f.selectedSubjectIds.filter(id => id !== sub.id) }));
                              }
                            }}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                          />
                          <span className="font-bold text-teal-700 font-mono text-[11px] bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                            {sub.code}
                          </span>
                          <span className="truncate font-medium">{sub.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Premium applies to your enrolled semester & subjects. Other subjects/semesters require extra payment to unlock.</span>
                </p>
              </div>

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full justify-center mt-6"
              >
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-4">
              Demo passwords are saved locally in browser storage.
            </p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
