'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { getMaterials, getVideos, getSemesters, getSubjects, getCourses, getPrograms } from '@/lib/db';
import { formatDate, daysRemaining, canAccess } from '@/lib/utils';
import type { Material, Video, Semester, Subject, Course, Program } from '@/types';
import {
  Crown, BookOpen, Video as VideoIcon, Clock, ArrowRight, Lock,
  Sparkles, Calendar, TrendingUp, FileText, GraduationCap
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMaterials(), getVideos(), getSemesters(), getSubjects(),
      getCourses(), getPrograms()
    ]).then(
      ([m, v, s, sub, crses, progs]) => {
        setMaterials(m);
        setVideos(v);
        setSemesters(s);
        setSubjects(sub);
        setCourses(crses);
        setPrograms(progs);
        setLoading(false);
      }
    );
  }, []);

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || '';
  const getSemesterName = (id: string) => semesters.find(s => s.id === id)?.name || '';
  const enrolledCourse = courses.find(c => c.id === user?.courseId);
  const enrolledProgram = programs.find(p => p.id === (user?.programId || enrolledCourse?.programId));

  const recentMaterials = [...materials].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const recentVideos = [...videos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  const totalFree = materials.filter(m => !m.isPremium).length + videos.filter(v => !v.isPremium).length;
  const totalPremium = materials.filter(m => m.isPremium).length + videos.filter(v => v.isPremium).length;

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your studies today.</p>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl shadow-xs self-start sm:self-auto">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-navy">
                {enrolledCourse ? enrolledCourse.code : 'B.PHARM'} &bull; {enrolledProgram?.name || 'Bachelor of Pharmacy'}
              </p>
              <p className="text-[11px] text-slate-500">
                Academic Year {user?.year || 1} &bull; Semester {user?.semester || 1}
              </p>
            </div>
          </div>
        </div>

        {/* Premium Status + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Premium card */}
          {/* Premium card */}
          <div className={`relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between border ${
            user?.isPremium
              ? 'bg-gradient-to-br from-amber-50 via-amber-100/40 to-orange-50 border-amber-200 shadow-sm'
              : 'bg-gradient-to-br from-slate-50 to-slate-100/80 border-slate-200 shadow-sm'
          }`}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Crown className={`w-5 h-5 ${user?.isPremium ? 'text-amber-600' : 'text-slate-400'}`} />
                <Badge variant={user?.isPremium ? 'premium' : 'default'}>
                  {user?.isPremium ? 'Premium Active' : 'Free Plan'}
                </Badge>
              </div>
              {user?.isPremium && user.premiumExpiry ? (
                <div>
                  <p className="text-sm text-amber-900 font-bold">
                    {daysRemaining(user.premiumExpiry)} days remaining
                  </p>
                  <p className="text-xs text-amber-700 mt-1 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Expires {formatDate(user.premiumExpiry)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-600 mb-3 font-medium">Unlock all premium pharmacy content</p>
                  <Link href="/plans">
                    <Button size="sm" icon={<Sparkles className="w-4 h-4" />}>
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            {user?.isPremium && (
              <div className="absolute top-2 right-2 opacity-10 pointer-events-none">
                <Crown className="w-24 h-24 text-amber-600" />
              </div>
            )}
          </div>

          {/* Stats: Materials */}
          <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-all border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-navy tracking-tight">{materials.length}</p>
                <p className="text-sm font-medium text-slate-500">Study Materials</p>
              </div>
            </div>
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2">
              <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                {totalFree} Free
              </span>
              <span className="inline-flex items-center text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
                {totalPremium} Premium
              </span>
            </div>
          </Card>

          {/* Stats: Video Lectures */}
          <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-all border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 shadow-xs">
                <VideoIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-navy tracking-tight">{videos.length}</p>
                <p className="text-sm font-medium text-slate-500">Video Lectures</p>
              </div>
            </div>
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
              <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>New videos added regularly</span>
            </div>
          </Card>
        </div>

        {/* Recently Added Materials */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy">Recently Added Materials</h2>
            <Link href="/materials" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentMaterials.map(mat => {
                const accessible = canAccess(user, mat);
                return (
                  <Card key={mat.id} hover padding="none">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        {accessible ? (
                          <Badge variant={mat.isPremium ? 'premium' : 'free'}>
                            {mat.isPremium ? '👑 Premium' : 'Free'}
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <Lock className="w-3 h-3 mr-1 inline" /> Locked
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-navy text-sm mb-1 line-clamp-2">{mat.title}</h3>
                      <p className="text-xs text-slate-500 mb-3">{getSubjectName(mat.subjectId)}</p>
                      {accessible ? (
                        <a href={mat.link} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-full">
                            Open PDF
                          </Button>
                        </a>
                      ) : (
                        <Link href="/plans">
                          <Button variant="secondary" size="sm" className="w-full" icon={<Lock className="w-3.5 h-3.5" />}>
                            Upgrade to unlock
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Continue Watching */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy">Video Lectures</h2>
            <Link href="/videos" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentVideos.map(vid => {
                const accessible = canAccess(user, vid);
                return (
                  <Card key={vid.id} hover padding="none">
                    <div className="relative h-36 bg-gradient-to-br from-purple-100 to-blue-100 rounded-t-2xl flex items-center justify-center">
                      {accessible ? (
                        <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow-lg backdrop-blur-sm">
                          <VideoIcon className="w-6 h-6 text-purple-600 ml-1" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow-lg backdrop-blur-sm">
                          <Lock className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        {accessible ? (
                          <Badge variant={vid.isPremium ? 'premium' : 'free'}>
                            {vid.isPremium ? '👑 Premium' : 'Free'}
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <Lock className="w-3 h-3 mr-1 inline" /> Locked
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {vid.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-navy text-sm mb-1 line-clamp-1">{vid.title}</h3>
                      <p className="text-xs text-slate-500 mb-3">{getSubjectName(vid.subjectId)}</p>
                      {accessible ? (
                        <Link href={`/videos/${vid.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            Watch Now
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/plans">
                          <Button variant="secondary" size="sm" className="w-full" icon={<Lock className="w-3.5 h-3.5" />}>
                            Upgrade to unlock
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
