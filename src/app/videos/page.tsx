'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import {
  getVideos, getSemesters, getSubjects, getPrograms, getCourses,
  unlockSubjectForStudent, unlockSemesterForStudent
} from '@/lib/db';
import { canAccess, getAccessReason, formatDate, formatINR } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Video, Semester, Subject, Program, Course } from '@/types';
import {
  Video as VideoIcon, Search, Play, Lock, Crown,
  Sparkles, Clock, CheckCircle, ExternalLink, GraduationCap,
  Compass, Calendar, ChevronDown, ChevronUp, Tag, BookOpen
} from 'lucide-react';

export default function VideosPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'semester' | 'year'>('semester');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'premium'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Course, Semester & Subject reveal controls
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showOtherSemesters, setShowOtherSemesters] = useState(false);
  const [showOtherSubjects, setShowOtherSubjects] = useState(false);

  // Upgrade Modal
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPremiumVideo, setSelectedPremiumVideo] = useState<Video | null>(null);
  const [payingUnlock, setPayingUnlock] = useState(false);

  useEffect(() => {
    Promise.all([
      getVideos(),
      getSemesters(),
      getSubjects(),
      getPrograms(),
      getCourses(),
    ]).then(([vids, sems, subs, progs, crss]) => {
      setVideos(vids);
      setSemesters(sems.sort((a, b) => a.number - b.number));
      setSubjects(subs);
      setPrograms(progs);
      setCourses(crss);
      setLoading(false);

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const p = params.get('program');
        const c = params.get('course');
        const s = params.get('semester');

        if (p) {
          setSelectedProgram(p);
        } else if (user?.programId && user.role !== 'admin') {
          setSelectedProgram(user.programId);
        }

        if (c) {
          setSelectedCourse(c);
        } else if (user?.courseId && user.role !== 'admin') {
          setSelectedCourse(user.courseId);
        }

        if (s) {
          setSelectedSemester(s);
        } else if (user?.semester && user.role !== 'admin') {
          const sem = sems.find(item => item.number === user.semester || item.id === `sem${user.semester}` || item.id === String(user.semester));
          if (sem) setSelectedSemester(sem.id);
        }
      }
    });
  }, [user]);

  // Sync selectedCourse, program and semester to enrolled details when user loads
  useEffect(() => {
    if (user && user.role !== 'admin') {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      if (!params?.get('course') && user.courseId && selectedCourse === 'all') {
        setSelectedCourse(user.courseId);
      }
      if (!params?.get('program') && user.programId && selectedProgram === 'all') {
        setSelectedProgram(user.programId);
      }
      if (!params?.get('semester') && user.semester && selectedSemester === 'all' && semesters.length > 0) {
        const sem = semesters.find(s => s.number === user.semester || s.id === `sem${user.semester}` || s.id === String(user.semester));
        if (sem) setSelectedSemester(sem.id);
      }
    }
  }, [user, selectedCourse, selectedProgram, selectedSemester, semesters]);

  // Enrolled course, program, semester & year info
  const enrolledCourse = useMemo(() => {
    return courses.find(c => c.id === user?.courseId);
  }, [courses, user?.courseId]);

  const enrolledProgram = useMemo(() => {
    return programs.find(p => p.id === (user?.programId || enrolledCourse?.programId));
  }, [programs, user?.programId, enrolledCourse]);

  const enrolledSemester = useMemo(() => {
    if (!user?.semester) return null;
    return (
      semesters.find(s => s.number === user.semester || s.id === `sem${user.semester}` || s.id === String(user.semester)) ||
      null
    );
  }, [semesters, user?.semester]);

  const enrolledYear = useMemo(() => {
    if (!user) return null;
    return user.year || (user.semester ? Math.ceil(user.semester / 2) : 1);
  }, [user]);

  const otherSemesters = useMemo(() => {
    if (!enrolledSemester) return semesters;
    return semesters.filter(s => s.id !== enrolledSemester.id);
  }, [semesters, enrolledSemester]);

  const availableCourses = useMemo(() => {
    if (selectedProgram === 'all') return courses;
    return courses.filter(c => c.programId === selectedProgram);
  }, [courses, selectedProgram]);

  const handleProgramSelect = (progId: string) => {
    setSelectedProgram(progId);
    setSelectedCourse('all');
    setSelectedSubject('all');
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedSubject('all');
  };

  const availableSubjects = useMemo(() => {
    return subjects.filter(sub => {
      if (selectedCourse !== 'all' && sub.courseId && sub.courseId !== selectedCourse) return false;
      if (viewMode === 'semester') {
        if (selectedSemester !== 'all' && sub.semesterId !== selectedSemester) return false;
      } else {
        if (selectedYear !== 'all') {
          const sem = semesters.find(s => s.id === sub.semesterId);
          const semYear = sem?.year || Math.ceil((sem?.number || 1) / 2);
          if (String(semYear) !== selectedYear) return false;
        }
      }
      return true;
    });
  }, [subjects, selectedCourse, selectedSemester, selectedYear, viewMode, semesters]);

  // User's enrolled subject IDs (from signup / profile)
  const enrolledSubjectIds = useMemo(() => {
    if (!user || user.role === 'admin') return [];
    if (user.selectedSubjectIds && user.selectedSubjectIds.length > 0) {
      return user.selectedSubjectIds;
    }
    // Fallback if not explicitly set: subjects in user's enrolled semester
    if (user.semester && subjects.length > 0) {
      return subjects
        .filter(s =>
          (!s.courseId || s.courseId === user.courseId) &&
          (s.semesterId === `sem${user.semester}` || s.semesterId === String(user.semester))
        )
        .map(s => s.id);
    }
    return [];
  }, [user, subjects]);

  // Enrolled subjects in current view
  const enrolledSubjects = useMemo(() => {
    if (enrolledSubjectIds.length === 0) return availableSubjects;
    return availableSubjects.filter(sub => enrolledSubjectIds.includes(sub.id));
  }, [availableSubjects, enrolledSubjectIds]);

  // Other subjects in current view (outside signup selection)
  const otherSubjects = useMemo(() => {
    if (enrolledSubjectIds.length === 0) return [];
    return availableSubjects.filter(sub => !enrolledSubjectIds.includes(sub.id));
  }, [availableSubjects, enrolledSubjectIds]);

  const hasEnrolledSubjectsInView = enrolledSubjects.length > 0;

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      if (selectedProgram !== 'all') {
        const course = courses.find(c => c.id === v.courseId);
        if (v.programId && v.programId !== selectedProgram) return false;
        if (course && course.programId !== selectedProgram) return false;
      }

      if (selectedCourse !== 'all') {
        if (v.courseId && v.courseId !== selectedCourse) return false;
        const sub = subjects.find(s => s.id === v.subjectId);
        if (sub?.courseId && sub.courseId !== selectedCourse) return false;
      }

      if (viewMode === 'semester') {
        if (selectedSemester !== 'all' && v.semesterId !== selectedSemester) return false;
      } else {
        if (selectedYear !== 'all') {
          const sem = semesters.find(s => s.id === v.semesterId);
          const semYear = sem?.year || Math.ceil((sem?.number || 1) / 2);
          if (String(semYear) !== selectedYear) return false;
        }
      }

      // Subject filter
      if (selectedSubject !== 'all') {
        if (v.subjectId !== selectedSubject) return false;
      } else if (user && user.role !== 'admin' && hasEnrolledSubjectsInView && !showOtherSubjects) {
        // By default, only show videos from enrolled subjects chosen during signup
        if (!enrolledSubjectIds.includes(v.subjectId)) return false;
      }

      if (filterType === 'free' && v.isPremium) return false;
      if (filterType === 'premium' && !v.isPremium) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(q);
        const matchesDesc = v.description.toLowerCase().includes(q);
        const subject = subjects.find(s => s.id === v.subjectId);
        const matchesSubject = subject?.name.toLowerCase().includes(q);
        const course = courses.find(c => c.id === v.courseId);
        const matchesCourse = course?.name.toLowerCase().includes(q) || course?.code.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSubject && !matchesCourse) return false;
      }

      return true;
    });
  }, [
    videos, selectedProgram, selectedCourse, selectedSemester, selectedYear,
    viewMode, selectedSubject, filterType, searchQuery, subjects, courses, semesters,
    user, hasEnrolledSubjectsInView, showOtherSubjects, enrolledSubjectIds
  ]);

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'Subject';
  const getSemesterName = (id: string) => semesters.find(s => s.id === id)?.name || 'Semester';
  const getCourseCode = (courseId?: string) => courses.find(c => c.id === courseId)?.code || '';
  const getSemesterYear = (semId: string) => {
    const sem = semesters.find(s => s.id === semId);
    return sem?.year || Math.ceil((sem?.number || 1) / 2);
  };

  const handlePayAndUnlockSubject = async () => {
    if (!user || !selectedPremiumVideo) return;
    setPayingUnlock(true);
    try {
      await unlockSubjectForStudent(user.id, selectedPremiumVideo.subjectId, 'upi', 149);
      await refreshUser();
      const subName = getSubjectName(selectedPremiumVideo.subjectId);
      addToast({
        type: 'success',
        title: 'Subject Unlocked!',
        message: `Extra access to ${subName} has been unlocked for your account.`,
      });
      const vidId = selectedPremiumVideo.id;
      setUpgradeModalOpen(false);
      router.push(`/videos/${vidId}`);
    } catch {
      addToast({ type: 'error', title: 'Unlock Failed', message: 'Could not complete unlock payment.' });
    } finally {
      setPayingUnlock(false);
    }
  };

  const handlePayAndUnlockSemester = async () => {
    if (!user || !selectedPremiumVideo) return;
    setPayingUnlock(true);
    try {
      await unlockSemesterForStudent(user.id, selectedPremiumVideo.semesterId, 'upi', 299);
      await refreshUser();
      const semName = getSemesterName(selectedPremiumVideo.semesterId);
      addToast({
        type: 'success',
        title: 'Semester Unlocked!',
        message: `Extra access to ${semName} has been unlocked for your account.`,
      });
      const vidId = selectedPremiumVideo.id;
      setUpgradeModalOpen(false);
      router.push(`/videos/${vidId}`);
    } catch {
      addToast({ type: 'error', title: 'Unlock Failed', message: 'Could not complete unlock payment.' });
    } finally {
      setPayingUnlock(false);
    }
  };

  const handleVideoClick = (video: Video) => {
    const accessible = canAccess(user, video);
    if (accessible) {
      router.push(`/videos/${video.id}`);
    } else {
      setSelectedPremiumVideo(video);
      setUpgradeModalOpen(true);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <VideoIcon className="w-6 h-6 text-teal-600" />
              Class Video Lecture Library
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Stream recorded masterclasses filtered by Degree Program, Course Branch, and Semester or Year.
            </p>
          </div>

          {!user?.isPremium && (
            <Link href="/plans">
              <Button variant="warning" size="sm" className="shadow-sm">
                <Crown className="w-4 h-4 mr-1.5" />
                Upgrade to Premium
              </Button>
            </Link>
          )}
        </div>

        {/* Level 1: Programs (B.Pharm, M.Pharm, Pharm.D, D.Pharm) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <GraduationCap className="w-4 h-4 text-teal-600" />
              <span>Select Program:</span>
            </div>
            {enrolledCourse && user?.role !== 'admin' && (
              <button
                onClick={() => setShowAllCourses(!showAllCourses)}
                className="text-[11px] text-teal-600 hover:text-teal-700 hover:underline cursor-pointer font-medium flex items-center gap-1"
              >
                <span>{showAllCourses ? 'Show Only My Enrolled Program' : 'Explore Other Programs'}</span>
                {showAllCourses ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!showAllCourses && enrolledProgram && user?.role !== 'admin' ? (
              <div className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-navy text-white shadow-sm flex items-center gap-2">
                <span>{enrolledProgram.name}</span>
                <span className="text-[10px] bg-white/20 text-teal-100 font-semibold px-2 py-0.5 rounded-full">
                  Enrolled Program
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleProgramSelect('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedProgram === 'all'
                      ? 'bg-navy text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Programs
                </button>
                {programs.map(prog => (
                  <button
                    key={prog.id}
                    onClick={() => handleProgramSelect(prog.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedProgram === prog.id
                        ? 'bg-navy text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {prog.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Level 2: Sub-Courses (B.Pharm, M.Pharm, Pharm.D, D.Pharm...) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Compass className="w-4 h-4 text-teal-600" />
              <span>
                {!showAllCourses && enrolledCourse && user?.role !== 'admin'
                  ? 'Your Enrolled Course Branch (From Signup):'
                  : 'Select Sub-Course / Degree:'}
              </span>
            </div>
            {enrolledCourse && user?.role !== 'admin' ? (
              <button
                onClick={() => setShowAllCourses(!showAllCourses)}
                className="text-[11px] text-teal-600 hover:text-teal-700 hover:underline cursor-pointer font-medium flex items-center gap-1"
              >
                <span>{showAllCourses ? `Show Only My Course (${enrolledCourse.code})` : 'Browse Other Courses'}</span>
                {showAllCourses ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : selectedCourse !== 'all' ? (
              <button
                onClick={() => setSelectedCourse('all')}
                className="text-[11px] text-teal-600 hover:underline cursor-pointer font-medium"
              >
                Reset Course
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!showAllCourses && enrolledCourse && user?.role !== 'admin' ? (
              <button
                onClick={() => setSelectedCourse(enrolledCourse.id)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 text-white shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>{enrolledCourse.code}: {enrolledCourse.name}</span>
                <span className="text-[10px] bg-teal-800 text-teal-100 px-2 py-0.5 rounded-full font-semibold">
                  Selected Course
                </span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleCourseSelect('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCourse === 'all'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-teal-50/70 text-teal-800 hover:bg-teal-100 border border-teal-200/50'
                  }`}
                >
                  All Courses
                </button>
                {availableCourses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => handleCourseSelect(course.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCourse === course.id
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-teal-50/70 text-teal-800 hover:bg-teal-100 border border-teal-200/50'
                    }`}
                  >
                    {course.code}
                    <span className="text-[10px] font-normal opacity-75 ml-1">({course.durationYears}y)</span>
                    {enrolledCourse?.id === course.id && (
                      <span className="text-[9px] bg-teal-200 text-teal-900 font-bold px-1.5 py-0.5 rounded ml-1">
                        Mine
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Level 3: Year vs Semester View Mode & Tabs */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Browse By:
              </span>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => {
                  setViewMode('semester');
                  setSelectedYear('all');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'semester'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                By Semester (Sem 1, 2...)
              </button>
              <button
                onClick={() => {
                  setViewMode('year');
                  setSelectedSemester('all');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'year'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                By Academic Year (1st, 2nd, 3rd Year)
              </button>
            </div>
          </div>

          {/* Semester Tabs */}
          {viewMode === 'semester' && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {!showOtherSemesters && enrolledSemester && user?.role !== 'admin' ? (
                <>
                  <button
                    onClick={() => setSelectedSemester(enrolledSemester.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-navy text-white shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <span>{enrolledSemester.name} (Year {enrolledSemester.year || Math.ceil(enrolledSemester.number / 2)})</span>
                    <span className="text-[10px] bg-teal-500/80 text-white font-semibold px-2 py-0.5 rounded-full">
                      Enrolled Semester
                    </span>
                  </button>

                  {otherSemesters.length > 0 && (
                    <button
                      onClick={() => setShowOtherSemesters(true)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-dashed border-slate-300"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Other Semesters ({otherSemesters.length})</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedSemester('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedSemester === 'all'
                        ? 'bg-navy text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Semesters
                  </button>
                  {semesters.map(sem => (
                    <button
                      key={sem.id}
                      onClick={() => setSelectedSemester(sem.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        selectedSemester === sem.id
                          ? 'bg-navy text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sem.name} (Year {sem.year || Math.ceil(sem.number / 2)})
                      {enrolledSemester?.id === sem.id && (
                        <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded ml-1">
                          Enrolled
                        </span>
                      )}
                    </button>
                  ))}
                  {enrolledSemester && user?.role !== 'admin' && (
                    <button
                      onClick={() => {
                        setShowOtherSemesters(false);
                        setSelectedSemester(enrolledSemester.id);
                      }}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-navy hover:underline cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Hide Other Semesters</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Year Tabs */}
          {viewMode === 'year' && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {!showOtherSemesters && enrolledYear && user?.role !== 'admin' ? (
                <>
                  <button
                    onClick={() => setSelectedYear(String(enrolledYear))}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-navy text-white shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <span>
                      {enrolledYear === 1 ? '1st Year (Sem 1 & 2)' : enrolledYear === 2 ? '2nd Year (Sem 3 & 4)' : enrolledYear === 3 ? '3rd Year (Sem 5 & 6)' : '4th Year (Sem 7 & 8)'}
                    </span>
                    <span className="text-[10px] bg-teal-500/80 text-white font-semibold px-2 py-0.5 rounded-full">
                      Enrolled Year
                    </span>
                  </button>

                  <button
                    onClick={() => setShowOtherSemesters(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-dashed border-slate-300"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Other Academic Years</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedYear('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedYear === 'all'
                        ? 'bg-navy text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Years
                  </button>
                  {[1, 2, 3, 4].map(yr => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(String(yr))}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        selectedYear === String(yr)
                          ? 'bg-navy text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {yr === 1 ? '1st Year (Sem 1 & 2)' : yr === 2 ? '2nd Year (Sem 3 & 4)' : yr === 3 ? '3rd Year (Sem 5 & 6)' : '4th Year (Sem 7 & 8)'}
                      {enrolledYear === yr && (
                        <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded ml-1">
                          Enrolled
                        </span>
                      )}
                    </button>
                  ))}
                  {enrolledYear && user?.role !== 'admin' && (
                    <button
                      onClick={() => {
                        setShowOtherSemesters(false);
                        setSelectedYear(String(enrolledYear));
                      }}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-navy hover:underline cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Hide Other Years</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Level 4: Subject Selection with "Other Subjects" reveal button */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Play className="w-4 h-4 text-teal-600" />
              <span>
                {hasEnrolledSubjectsInView && !showOtherSubjects
                  ? 'Enrolled Subjects (From Signup):'
                  : 'Select Subject:'}
              </span>
            </div>
            {selectedSubject !== 'all' && (
              <button
                onClick={() => setSelectedSubject('all')}
                className="text-[11px] text-teal-600 hover:underline cursor-pointer font-medium"
              >
                Reset to All Subjects
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* All Subjects button */}
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {hasEnrolledSubjectsInView && !showOtherSubjects
                ? `All Enrolled (${enrolledSubjects.length})`
                : `All Subjects (${availableSubjects.length})`}
            </button>

            {/* Enrolled Subjects chosen at signup */}
            {enrolledSubjects.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSubject === sub.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-teal-50/70 text-teal-800 hover:bg-teal-100 border border-teal-200/50'
                }`}
              >
                <Tag className="w-3 h-3" />
                <span>{sub.code ? `${sub.code}: ` : ''}{sub.name}</span>
              </button>
            ))}

            {/* Other Subjects Button to reveal others */}
            {otherSubjects.length > 0 && (
              <button
                onClick={() => {
                  const nextState = !showOtherSubjects;
                  setShowOtherSubjects(nextState);
                  if (!nextState && otherSubjects.some(s => s.id === selectedSubject)) {
                    setSelectedSubject('all');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  showOtherSubjects
                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80 font-medium'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {showOtherSubjects
                    ? 'Hide Other Subjects'
                    : `Other Subjects (${otherSubjects.length})`}
                </span>
                {showOtherSubjects ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            )}

            {/* Other Subjects revealed */}
            {showOtherSubjects && otherSubjects.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 animate-fadeIn ${
                  selectedSubject === sub.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50/60 text-slate-700 hover:bg-amber-100 border border-dashed border-amber-300'
                }`}
              >
                <Lock className="w-3 h-3 text-amber-600" />
                <span>{sub.code ? `${sub.code}: ` : ''}{sub.name}</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-1.5 py-0.5 rounded-md">
                  Other
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Level 5: Search & Subject Selector + Free/Premium Filter */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search lectures by title or topic..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            <div>
              <select
                value={selectedSubject}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedSubject(val);
                  if (otherSubjects.some(s => s.id === val)) {
                    setShowOtherSubjects(true);
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">
                  {hasEnrolledSubjectsInView && !showOtherSubjects
                    ? `All Enrolled Subjects (${enrolledSubjects.length})`
                    : `All Subjects (${availableSubjects.length})`}
                </option>
                {enrolledSubjects.length > 0 && (
                  <optgroup label="Enrolled Subjects">
                    {enrolledSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code}: {sub.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {otherSubjects.length > 0 && (
                  <optgroup label="Other Subjects">
                    {otherSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code}: {sub.name} (Other)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterType === 'all' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                }`}
              >
                All ({filteredVideos.length})
              </button>
              <button
                onClick={() => setFilterType('free')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterType === 'free' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setFilterType('premium')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterType === 'premium' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Premium
              </button>
            </div>
          </div>
        </Card>

        {/* Videos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton count={6} />
          </div>
        ) : filteredVideos.length === 0 ? (
          <EmptyState
            icon={VideoIcon}
            title="No video lectures match your selection"
            description="Try selecting a different program, sub-course, year or keyword."
            action={{
              label: 'Reset All Filters',
              onClick: () => {
                setSelectedProgram('all');
                setSelectedCourse('all');
                setSelectedSemester('all');
                setSelectedYear('all');
                setSelectedSubject('all');
                setFilterType('all');
                setSearchQuery('');
              },
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(vid => {
              const accessReason = getAccessReason(user, vid);
              const accessible = accessReason === 'granted';
              const courseCode = getCourseCode(vid.courseId);
              const semYear = getSemesterYear(vid.semesterId);

              return (
                <Card
                  key={vid.id}
                  className="flex flex-col border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer"
                  onClick={() => handleVideoClick(vid)}
                >
                  {/* Thumbnail Banner */}
                  <div className="relative aspect-video bg-gradient-to-tr from-slate-900 to-navy overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0E8F8A_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div className="relative z-10 w-12 h-12 rounded-full bg-white/90 text-navy flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                      {accessible ? (
                        <Play className="w-5 h-5 ml-0.5" />
                      ) : (
                        <Lock className="w-5 h-5 text-amber-500" />
                      )}
                    </div>

                    <span className="absolute bottom-2.5 right-2.5 bg-black/75 text-white text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs">
                      <Clock className="w-3 h-3" />
                      {vid.duration}
                    </span>

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {courseCode && (
                        <span className="bg-navy/90 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-xs">
                          {courseCode}
                        </span>
                      )}
                      {accessible ? (
                        vid.isPremium ? (
                          <Badge variant="warning" size="sm" className="shadow-sm">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm" className="shadow-sm">
                            Free • Enrolled
                          </Badge>
                        )
                      ) : accessReason === 'other_subject_locked' ? (
                        <Badge variant="neutral" size="sm" className="bg-amber-100 text-amber-900 border-amber-300 shadow-sm">
                          <Lock className="w-3 h-3 mr-1 text-amber-700" />
                          Other Subject • ₹149
                        </Badge>
                      ) : accessReason === 'other_semester_locked' ? (
                        <Badge variant="neutral" size="sm" className="bg-purple-100 text-purple-900 border-purple-300 shadow-sm">
                          <Lock className="w-3 h-3 mr-1 text-purple-700" />
                          Other Semester • ₹299
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" className="shadow-sm">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium Required
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">
                        <span>{getSubjectName(vid.subjectId)}</span>
                        <span className="text-slate-400 font-normal">
                          {getSemesterName(vid.semesterId)} • Yr {semYear}
                        </span>
                      </div>
                      <h3 className="font-bold text-navy text-sm sm:text-base group-hover:text-teal-600 transition-colors line-clamp-2">
                        {vid.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                        {vid.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {formatDate(vid.createdAt)}
                      </span>
                      {accessible ? (
                        <span className="text-xs font-semibold text-teal-600 flex items-center gap-1 group-hover:underline">
                          Watch Lecture &rarr;
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {accessReason === 'other_subject_locked'
                            ? 'Unlock Subject (₹149)'
                            : accessReason === 'other_semester_locked'
                            ? 'Unlock Semester (₹299)'
                            : 'Upgrade to Watch'}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Upgrade / Extra Unlock Modal */}
        <Modal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          title={
            selectedPremiumVideo
              ? getAccessReason(user, selectedPremiumVideo) === 'other_subject_locked'
                ? 'Unlock Other Subject • Extra Payment Required'
                : getAccessReason(user, selectedPremiumVideo) === 'other_semester_locked'
                ? 'Unlock Other Semester • Extra Payment Required'
                : 'Premium Plan Required'
              : 'Video Locked'
          }
          size="md"
        >
          {selectedPremiumVideo && (() => {
            const reason = getAccessReason(user, selectedPremiumVideo);
            const subName = getSubjectName(selectedPremiumVideo.subjectId);
            const semName = getSemesterName(selectedPremiumVideo.semesterId);

            if (reason === 'other_subject_locked') {
              return (
                <div className="text-center py-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50">
                    <BookOpen className="w-7 h-7" />
                  </div>

                  <h3 className="text-lg font-bold text-navy">
                    Unlock Extra Subject Video: {subName}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
                    Your current subscription covers your enrolled subjects from signup. Even with Premium, accessing lectures in other subjects requires a separate add-on payment.
                  </p>

                  <div className="bg-amber-50/70 p-4 rounded-xl mt-5 text-left border border-amber-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        Subject Video Masterclass Pass
                      </span>
                      <span className="text-sm font-extrabold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                        ₹149 One-time
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        Full HD video lectures for all chapters in {subName}
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        Practical lab walkthroughs and case discussions
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => setUpgradeModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="warning"
                      onClick={handlePayAndUnlockSubject}
                      loading={payingUnlock}
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Pay Extra ₹149 & Unlock
                    </Button>
                  </div>
                </div>
              );
            }

            if (reason === 'other_semester_locked') {
              return (
                <div className="text-center py-3">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4 ring-8 ring-purple-50">
                    <Calendar className="w-7 h-7" />
                  </div>

                  <h3 className="text-lg font-bold text-navy">
                    Unlock Extra Semester Videos: {semName}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
                    Your academic plan covers Semester {user?.semester || 1}. Accessing video lectures in other semesters requires an extra semester unlock payment.
                  </p>

                  <div className="bg-purple-50/70 p-4 rounded-xl mt-5 text-left border border-purple-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                        Semester Video Pass
                      </span>
                      <span className="text-sm font-extrabold text-purple-900 bg-purple-200/70 px-2 py-0.5 rounded">
                        ₹299 One-time
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                        Complete video lectures across all subjects in {semName}
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                        Revision masterclasses & exam prep walkthroughs
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => setUpgradeModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="warning"
                      onClick={handlePayAndUnlockSemester}
                      loading={payingUnlock}
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Pay Extra ₹299 & Unlock
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div className="text-center py-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50/50">
                  <Crown className="w-7 h-7" />
                </div>

                <h3 className="text-lg font-bold text-navy">
                  Premium Required for {selectedPremiumVideo.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
                  This masterclass is part of your enrolled academic curriculum, but requires an active StudyHub Premium subscription to stream.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl mt-5 text-left border border-slate-200/80">
                  <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                    StudyHub Premium Includes:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      1080p Full HD video streaming for all enrolled semester lectures
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      Downloadable lecture summary notes & timestamps
                    </li>
                  </ul>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <Button variant="ghost" onClick={() => setUpgradeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Link href="/plans" onClick={() => setUpgradeModalOpen(false)}>
                    <Button variant="warning">
                      <Crown className="w-4 h-4 mr-1.5" />
                      View Premium Plans
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })()}
        </Modal>
      </div>
    </StudentLayout>
  );
}
