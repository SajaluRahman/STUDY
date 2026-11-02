'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { getVideoById, getVideos, getSubjectById, getSemesterById } from '@/lib/db';
import { canAccess, formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { Video, Subject, Semester } from '@/types';
import {
  ChevronLeft, Play, Lock, Crown, Clock, Calendar,
  ExternalLink, Sparkles, BookOpen, Share2
} from 'lucide-react';

function VideoDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const videoId = params.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoId) return;

    setLoading(true);
    getVideoById(videoId).then(async (v) => {
      if (!v) {
        setLoading(false);
        return;
      }
      setVideo(v);

      const [sub, sem, allVids] = await Promise.all([
        getSubjectById(v.subjectId),
        getSemesterById(v.semesterId),
        getVideos(),
      ]);

      setSubject(sub);
      setSemester(sem);
      setRelatedVideos(
        allVids.filter(item => item.id !== v.id && (item.subjectId === v.subjectId || item.semesterId === v.semesterId)).slice(0, 4)
      );
      setLoading(false);
    });
  }, [videoId]);

  if (loading) {
    return (
      <StudentLayout>
        <PageSkeleton />
      </StudentLayout>
    );
  }

  if (!video) {
    return (
      <StudentLayout>
        <EmptyState
          icon={Play}
          title="Video Lecture Not Found"
          description="The video lecture you are looking for does not exist or has been removed."
          action={{
            label: 'Back to Videos',
            onClick: () => router.push('/videos'),
          }}
        />
      </StudentLayout>
    );
  }

  const accessible = canAccess(user, video);

  // Helper to normalize video embed URL if YouTube or Drive
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (url.includes('drive.google.com/file/d/')) {
      return url.replace('/view', '/preview');
    }
    return url;
  };

  const embedUrl = getEmbedUrl(video.link);

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Back Link */}
        <div>
          <Link
            href="/videos"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Video Library
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
              {accessible ? (
                embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center">
                    <Play className="w-12 h-12 text-teal-400 mb-3" />
                    <p className="font-semibold text-lg">{video.title}</p>
                    <a
                      href={video.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Video in New Tab
                    </a>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-tr from-slate-900 via-navy to-slate-900 text-white text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0E8F8A_1px,transparent_1px)] [background-size:20px_20px]" />
                  <div className="relative z-10 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-500/10">
                      <Lock className="w-8 h-8" />
                    </div>
                    <Badge variant="warning" size="md" className="mb-3">
                      <Crown className="w-3.5 h-3.5 mr-1" /> Resource Locked
                    </Badge>
                    <h2 className="text-xl font-bold">{video.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2">
                      This video lecture is outside your chosen enrolled subjects or requires Premium access. Upgrade now to stream all pharmacy lectures across every semester.
                    </p>
                    <div className="mt-6">
                      <Link href="/plans">
                        <Button variant="warning" size="md" className="shadow-lg">
                          <Sparkles className="w-4 h-4 mr-1.5" /> Unlock with Premium
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Meta Info */}
            <Card className="p-6 bg-white border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700">
                    {semester?.name}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {subject?.code}: {subject?.name}
                  </span>
                  {accessible ? (
                    video.isPremium ? (
                      <Badge variant="warning" size="sm">
                        <Crown className="w-3 h-3 mr-1" /> Premium
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        Free • Enrolled
                      </Badge>
                    )
                  ) : (
                    <Badge variant="neutral" size="sm" className="bg-amber-100 text-amber-800 border-amber-200">
                      <Lock className="w-3 h-3 mr-1" /> Locked • Pay to Unlock
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {video.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(video.createdAt)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h1 className="text-xl sm:text-2xl font-bold text-navy">
                  {video.title}
                </h1>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed whitespace-pre-line">
                  {video.description}
                </p>
              </div>

              {accessible && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 inline-flex items-center gap-1.5 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Source Video Link
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-500"
                    onClick={() => {
                      if (typeof navigator !== 'undefined') {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Video link copied to clipboard!');
                      }
                    }}
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1" />
                    Share
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Related Lectures Sidebar */}
          <div className="space-y-4">
            <h3 className="font-bold text-navy text-base flex items-center gap-2">
              <Play className="w-4 h-4 text-teal-600" />
              Related Lectures
            </h3>

            {relatedVideos.length === 0 ? (
              <p className="text-xs text-slate-500">No other lectures for this subject yet.</p>
            ) : (
              <div className="space-y-3">
                {relatedVideos.map(item => {
                  const itemAccessible = canAccess(user, item);
                  return (
                    <Card
                      key={item.id}
                      className="p-3 border border-slate-200 hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer group"
                      onClick={() => router.push(`/videos/${item.id}`)}
                    >
                      <div className="flex gap-3">
                        <div className="w-24 aspect-video rounded-lg bg-navy flex items-center justify-center shrink-0 relative overflow-hidden">
                          {itemAccessible ? (
                            <Play className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                          ) : (
                            <Lock className="w-4 h-4 text-amber-400" />
                          )}
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 text-white px-1 rounded">
                            {item.duration}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-navy group-hover:text-teal-600 transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-1.5">
                            {item.isPremium ? (
                              <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                                <Crown className="w-2.5 h-2.5" /> Premium
                              </span>
                            ) : (
                              <span className="text-[10px] text-teal-600 font-semibold">
                                Free
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

export default function VideoDetailPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <VideoDetailContent />
    </Suspense>
  );
}
