'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  updateUser, getSemesters, getPrograms, getCourses, getSubjects
} from '@/lib/db';
import { DEFAULT_PROGRAMS, DEFAULT_COURSES, DEFAULT_SEMESTERS } from '@/lib/curriculumData';
import { formatDate, daysRemaining } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Semester, Program, Course, Subject } from '@/types';
import {
  User, Mail, Phone, Lock, Crown, Calendar,
  Shield, CheckCircle2, Sparkles, Layers, ArrowRight,
  GraduationCap, BookOpen
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [semesters, setSemesters] = useState<Semester[]>(DEFAULT_SEMESTERS);
  const [programs, setPrograms] = useState<Program[]>(DEFAULT_PROGRAMS);
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    programId: user?.programId || DEFAULT_PROGRAMS[0]?.id || 'prog-bpharm',
    courseId: user?.courseId || DEFAULT_COURSES[0]?.id || 'course-bpharm-regular',
    year: String(user?.year || Math.ceil((user?.semester || 1) / 2)),
    semester: String(user?.semester || 1),
    selectedSubjectIds: user?.selectedSubjectIds || [] as string[],
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([getSemesters(), getPrograms(), getCourses(), getSubjects()]).then(([sems, progs, crss, subs]) => {
      if (sems && sems.length > 0) setSemesters(sems.sort((a, b) => a.number - b.number));
      if (progs && progs.length > 0) setPrograms(progs);
      if (crss && crss.length > 0) setCourses(crss);
      if (subs && subs.length > 0) setSubjects(subs);
    });
  }, []);

  const getSubjectsForSelection = (courseId: string, semNum: string) => {
    return subjects.filter(s =>
      (s.courseId === courseId || !s.courseId) &&
      (s.semesterId === `sem${semNum}` || s.semesterId === semNum)
    );
  };

  useEffect(() => {
    if (!user) return;
    const initialSubjects = user.selectedSubjectIds && user.selectedSubjectIds.length > 0
      ? user.selectedSubjectIds
      : getSubjectsForSelection(user.courseId || DEFAULT_COURSES[0]?.id, String(user.semester || 1)).map(s => s.id);

    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      programId: user.programId || DEFAULT_PROGRAMS[0]?.id || 'prog-bpharm',
      courseId: user.courseId || DEFAULT_COURSES[0]?.id || 'course-bpharm-regular',
      year: String(user.year || Math.ceil((user.semester || 1) / 2)),
      semester: String(user.semester || 1),
      selectedSubjectIds: initialSubjects,
    });
  }, [user?.id, subjects.length]);

  const handleProgramChange = (progId: string) => {
    const related = courses.filter(c => c.programId === progId);
    const newCourseId = related[0]?.id || '';
    const relevantSubs = getSubjectsForSelection(newCourseId, '1').map(s => s.id);
    setProfileForm(f => ({
      ...f,
      programId: progId,
      courseId: newCourseId,
      year: '1',
      semester: '1',
      selectedSubjectIds: relevantSubs,
    }));
  };

  const handleCourseChange = (courseId: string) => {
    const relevantSubs = getSubjectsForSelection(courseId, profileForm.semester).map(s => s.id);
    setProfileForm(f => ({
      ...f,
      courseId,
      selectedSubjectIds: relevantSubs,
    }));
  };

  const handleSemesterChange = (semester: string, year?: string) => {
    const relevantSubs = getSubjectsForSelection(profileForm.courseId, semester).map(s => s.id);
    setProfileForm(f => ({
      ...f,
      semester,
      ...(year ? { year } : {}),
      selectedSubjectIds: relevantSubs,
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!profileForm.name.trim()) {
      addToast({ type: 'error', title: 'Name Required', message: 'Please enter your full name.' });
      return;
    }

    setProfileLoading(true);
    try {
      await updateUser(user.id, {
        name: profileForm.name,
        phone: profileForm.phone,
        programId: profileForm.programId,
        courseId: profileForm.courseId,
        year: parseInt(profileForm.year) || 1,
        semester: parseInt(profileForm.semester) || 1,
        selectedSubjectIds: profileForm.selectedSubjectIds,
      });
      await refreshUser();
      addToast({ type: 'success', title: 'Profile Updated', message: 'Your academic details & enrolled subjects have been saved.' });
    } catch {
      addToast({ type: 'error', title: 'Update Failed', message: 'Could not update your profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const errors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Enter current password';
    } else if (passwordForm.currentPassword !== user.password) {
      errors.currentPassword = 'Incorrect current password';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'Enter new password';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Must be at least 6 characters';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPasswordLoading(true);
    try {
      await updateUser(user.id, { password: passwordForm.newPassword });
      await refreshUser();
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast({ type: 'success', title: 'Password Changed', message: 'Your password was updated.' });
    } catch {
      addToast({ type: 'error', title: 'Update Failed', message: 'Could not update your password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const daysLeft = user?.premiumExpiry ? daysRemaining(user.premiumExpiry) : 0;
  const programsToRender = programs.length > 0 ? programs : DEFAULT_PROGRAMS;
  const currentProgram = programsToRender.find(p => p.id === (user?.programId || profileForm.programId));

  const availableCourses = courses.filter(c => c.programId === profileForm.programId);
  const coursesToRender = availableCourses.length > 0 ? availableCourses : (courses.length > 0 ? courses : DEFAULT_COURSES);
  const currentCourse = courses.find(c => c.id === (user?.courseId || profileForm.courseId)) || coursesToRender[0];

  const maxYears = currentCourse?.durationYears || 3;
  const maxSemesters = currentCourse?.totalSemesters || 6;
  const yearOptions = Array.from({ length: maxYears }, (_, i) => i + 1);
  const semesterOptions = Array.from({ length: maxSemesters }, (_, i) => i + 1);

  return (
    <StudentLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <User className="w-6 h-6 text-teal-600" />
            My Student Profile
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your personal academic details, enrolled program & branch, and account security.
          </p>
        </div>

        {/* Membership Status & Academic Badge Card */}
        <Card className="p-6 bg-gradient-to-r from-navy via-slate-900 to-navy text-white shadow-lg overflow-hidden relative">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#0E8F8A_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                user?.isPremium ? 'bg-amber-400/20 text-amber-400 ring-4 ring-amber-400/10' : 'bg-slate-800 text-slate-400'
              }`}>
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-xl font-bold">
                    {user?.isPremium ? 'StudyHub Premium Member' : 'Free Student Tier'}
                  </h3>
                  <Badge variant={user?.isPremium ? 'warning' : 'neutral'} size="sm">
                    {user?.isPremium ? 'Active' : 'Basic'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-300">
                  {currentCourse && (
                    <span className="bg-white/10 px-2.5 py-0.5 rounded-full font-semibold text-teal-300">
                      {currentCourse.code} • {currentCourse.name}
                    </span>
                  )}
                  {currentProgram && (
                    <span className="bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                      {currentProgram.name}
                    </span>
                  )}
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                    Year {user?.year || Math.ceil((user?.semester || 1) / 2)} • Sem {user?.semester || 1}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 max-w-md">
                  {user?.isPremium && user.premiumExpiry ? (
                    <>Your subscription is active and valid until <strong className="text-amber-400">{formatDate(user.premiumExpiry)}</strong> ({daysLeft} days remaining).</>
                  ) : (
                    'Upgrade to unlock unlimited high-yield notes, formula cheat sheets, and HD video lectures.'
                  )}
                </p>
              </div>
            </div>

            <Link href="/plans">
              <Button variant="warning" size="md" className="shrink-0 font-semibold shadow-md">
                <Sparkles className="w-4 h-4 mr-1.5" />
                {user?.isPremium ? 'Extend Subscription' : 'Upgrade to Premium'}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Form Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Details */}
          <Card className="p-6 bg-white border border-slate-200 shadow-sm">
            <h3 className="font-bold text-navy text-lg pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              Academic & Personal Details
            </h3>

            <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
              <Input
                label="Full Name"
                value={profileForm.name}
                onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Student Name"
                icon={<User className="w-4 h-4" />}
                required
              />

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address (Read-only)
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{user?.email}</span>
                </div>
              </div>

              <Input
                label="Phone Number"
                value={profileForm.phone}
                onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit mobile number"
                icon={<Phone className="w-4 h-4" />}
              />

              {/* Program & Course Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Degree Program
                  </label>
                  <select
                    value={profileForm.programId}
                    onChange={e => handleProgramChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    Course / Branch
                  </label>
                  <select
                    value={profileForm.courseId}
                    onChange={e => handleCourseChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {coursesToRender.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Year & Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={profileForm.year}
                    onChange={e => {
                      const yr = e.target.value;
                      const defaultSem = yr === '1' ? '1' : yr === '2' ? '3' : yr === '3' ? '5' : '7';
                      handleSemesterChange(defaultSem, yr);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    Semester
                  </label>
                  <select
                    value={profileForm.semester}
                    onChange={e => handleSemesterChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {semesterOptions.map(num => (
                      <option key={num} value={num}>
                        Semester {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Enrolled Subjects (Free Access Scope) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    Enrolled Subjects (Free Access Scope)
                  </label>
                  <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                    {profileForm.selectedSubjectIds.length} included
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                  {getSubjectsForSelection(profileForm.courseId || coursesToRender[0]?.id, profileForm.semester).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No specific subjects listed for this semester.</p>
                  ) : (
                    getSubjectsForSelection(profileForm.courseId || coursesToRender[0]?.id, profileForm.semester).map(sub => {
                      const isChecked = profileForm.selectedSubjectIds.includes(sub.id);
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
                                setProfileForm(f => ({ ...f, selectedSubjectIds: [...f.selectedSubjectIds, sub.id] }));
                              } else {
                                setProfileForm(f => ({ ...f, selectedSubjectIds: f.selectedSubjectIds.filter(id => id !== sub.id) }));
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

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                  loading={profileLoading}
                >
                  Save Academic Profile
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="p-6 bg-white border border-slate-200 shadow-sm">
            <h3 className="font-bold text-navy text-lg pb-3 border-b border-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-600" />
              Security & Password
            </h3>

            <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                error={passwordErrors.currentPassword}
                placeholder="••••••••"
                required
              />

              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                error={passwordErrors.newPassword}
                placeholder="At least 6 characters"
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                error={passwordErrors.confirmPassword}
                placeholder="Re-enter new password"
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full justify-center text-teal-700 border-teal-200 hover:bg-teal-50"
                  loading={passwordLoading}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
