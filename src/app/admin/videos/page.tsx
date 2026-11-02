'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import {
  getVideos, getSemesters, getSubjects, getCourses, getPrograms,
  createVideo, updateVideo, deleteVideo
} from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import type { Video, Semester, Subject, Course, Program } from '@/types';
import {
  Video as VideoIcon, Plus, Edit2, Trash2, ExternalLink,
  Crown, Play, Clock, AlertCircle
} from 'lucide-react';

export default function AdminVideosPage() {
  const { addToast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formProgramId, setFormProgramId] = useState('');
  const [formSemesterId, setFormSemesterId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formDuration, setFormDuration] = useState('45 mins');
  const [formIsPremium, setFormIsPremium] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

  const loadData = async () => {
    const [vids, sems, subs, crses, progs] = await Promise.all([
      getVideos(), getSemesters(), getSubjects(), getCourses(), getPrograms()
    ]);
    setVideos(vids.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setSemesters(sems.sort((a, b) => a.number - b.number));
    setSubjects(subs);
    setCourses(crses);
    setPrograms(progs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCourseChange = (newCourseId: string) => {
    setFormCourseId(newCourseId);
    const selectedCourse = courses.find(c => c.id === newCourseId);
    if (selectedCourse) {
      setFormProgramId(selectedCourse.programId);
    }
  };

  const handleSemesterChange = (newSemId: string) => {
    setFormSemesterId(newSemId);
    const relatedSubs = subjects.filter(s => s.semesterId === newSemId);
    if (relatedSubs.length > 0) {
      setFormSubjectId(relatedSubs[0].id);
    } else {
      setFormSubjectId('');
    }
  };

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setFormTitle('');
    setFormDescription('');
    const defaultCourse = courses[0];
    setFormCourseId(defaultCourse?.id || 'course-bpharm-regular');
    setFormProgramId(defaultCourse?.programId || 'prog-bpharm');
    const defaultSem = semesters[0]?.id || '';
    setFormSemesterId(defaultSem);
    const relatedSubs = subjects.filter(s => s.semesterId === defaultSem);
    setFormSubjectId(relatedSubs[0]?.id || '');
    setFormLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setFormThumbnail('');
    setFormDuration('45 mins');
    setFormIsPremium(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (vid: Video) => {
    setEditingVideo(vid);
    setFormTitle(vid.title);
    setFormDescription(vid.description);
    setFormCourseId(vid.courseId || courses[0]?.id || 'course-bpharm-regular');
    setFormProgramId(vid.programId || courses[0]?.programId || 'prog-bpharm');
    setFormSemesterId(vid.semesterId);
    setFormSubjectId(vid.subjectId);
    setFormLink(vid.link);
    setFormThumbnail(vid.thumbnail);
    setFormDuration(vid.duration);
    setFormIsPremium(vid.isPremium);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSemesterId || !formSubjectId || !formLink.trim()) {
      addToast({ type: 'error', title: 'Missing Information', message: 'Please complete all required fields.' });
      return;
    }

    try {
      if (editingVideo) {
        await updateVideo(editingVideo.id, {
          title: formTitle,
          description: formDescription,
          semesterId: formSemesterId,
          subjectId: formSubjectId,
          link: formLink,
          thumbnail: formThumbnail,
          duration: formDuration,
          isPremium: formIsPremium,
          courseId: formCourseId,
          programId: formProgramId,
        });
        addToast({ type: 'success', title: 'Video Lecture Updated' });
      } else {
        await createVideo({
          title: formTitle,
          description: formDescription,
          semesterId: formSemesterId,
          subjectId: formSubjectId,
          link: formLink,
          thumbnail: formThumbnail,
          duration: formDuration,
          isPremium: formIsPremium,
          courseId: formCourseId,
          programId: formProgramId,
        });
        addToast({ type: 'success', title: 'Video Lecture Added' });
      }
      setModalOpen(false);
      loadData();
    } catch {
      addToast({ type: 'error', title: 'Action Failed' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;
    await deleteVideo(videoToDelete.id);
    addToast({ type: 'success', title: 'Video Deleted' });
    setDeleteModalOpen(false);
    loadData();
  };

  const getSemesterName = (semId: string) => semesters.find(s => s.id === semId)?.name || 'Unknown';
  const getSubjectName = (subId: string) => subjects.find(s => s.id === subId)?.name || 'Unknown';

  const columns = [
    {
      key: 'title',
      label: 'Lecture',
      sortable: true,
      render: (vid: Video) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-8 rounded bg-navy flex items-center justify-center shrink-0 text-white">
            <Play className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-semibold text-navy text-sm line-clamp-1">{vid.title}</p>
            <p className="text-xs text-slate-500 line-clamp-1">{vid.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Course & Program',
      render: (vid: Video) => {
        const course = courses.find(c => c.id === vid.courseId);
        const prog = programs.find(p => p.id === (vid.programId || course?.programId));
        return (
          <div>
            <span className="inline-block font-semibold text-xs text-navy px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
              {course ? course.code : 'BCA'}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">{prog ? prog.name : 'UG'}</p>
          </div>
        );
      },
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (vid: Video) => (
        <div>
          <p className="font-medium text-slate-800 text-xs">{getSubjectName(vid.subjectId)}</p>
          <p className="text-[11px] text-slate-400">{getSemesterName(vid.semesterId)}</p>
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (vid: Video) => (
        <span className="text-xs text-slate-600 font-mono flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {vid.duration}
        </span>
      ),
    },
    {
      key: 'isPremium',
      label: 'Access',
      sortable: true,
      render: (vid: Video) => (
        vid.isPremium ? (
          <Badge variant="warning" size="sm">
            <Crown className="w-3 h-3 mr-1" /> Premium
          </Badge>
        ) : (
          <Badge variant="success" size="sm">Free</Badge>
        )
      ),
    },
    {
      key: 'createdAt',
      label: 'Date Added',
      render: (vid: Video) => (
        <span className="text-xs text-slate-500">{formatDate(vid.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (vid: Video) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(vid)}
            className="text-slate-600 hover:text-teal-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setVideoToDelete(vid);
              setDeleteModalOpen(true);
            }}
            className="text-slate-400 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <VideoIcon className="w-6 h-6 text-teal-600" />
              Manage Video Lectures
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Add video stream URLs (YouTube / Drive) and organize lectures by course.
            </p>
          </div>

          <Button variant="primary" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Video
          </Button>
        </div>

        <Card className="bg-white border border-slate-200">
          <DataTable
            columns={columns}
            data={videos}
            searchable
            searchKeys={['title', 'description']}
            pageSize={10}
            emptyTitle="No video lectures added"
            emptyDescription="Create your first video lecture using the button above."
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingVideo ? 'Edit Video Lecture' : 'Add Video Lecture'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Lecture Title"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="e.g. Masterclass: Dynamic Programming & Recursion"
              required
            />

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Academic Course (Degree / Diploma)
              </label>
              <select
                value={formCourseId}
                onChange={e => handleCourseChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                {courses.map(c => {
                  const p = programs.find(prog => prog.id === c.programId);
                  return (
                    <option key={c.id} value={c.id}>
                      [{p?.code || 'UG'}] {c.code} - {c.name} ({c.durationYears} Years, {c.totalSemesters} Semesters)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Semester
                </label>
                <select
                  value={formSemesterId}
                  onChange={e => handleSemesterChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <select
                  value={formSubjectId}
                  onChange={e => setFormSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  {subjects.filter(sub => sub.semesterId === formSemesterId).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Video Stream URL (YouTube / Google Drive URL)"
                  value={formLink}
                  onChange={e => setFormLink(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
              <div>
                <Input
                  label="Duration"
                  value={formDuration}
                  onChange={e => setFormDuration(e.target.value)}
                  placeholder="45 mins"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description & Agenda
              </label>
              <textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Key lecture points..."
              />
            </div>

            {/* Premium Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-navy flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Premium Video Lock
                </p>
                <p className="text-xs text-slate-500">
                  When enabled, only active premium students can watch this video.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formIsPremium}
                onChange={e => setFormIsPremium(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingVideo ? 'Save Changes' : 'Publish Video'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Video"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Delete &quot;{videoToDelete?.title}&quot;?</p>
                <p className="text-xs text-red-700 mt-1">
                  Students will no longer have access to this lecture recording.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
