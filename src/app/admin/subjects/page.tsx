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
  getSemesters, getSubjects, getMaterials, getVideos,
  createSubject, updateSubject, deleteSubject,
  getCourses, getPrograms
} from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import type { Semester, Subject, Material, Video, Course, Program } from '@/types';
import {
  Tag, Plus, Edit2, Trash2, AlertCircle, BookOpen, Layers, GraduationCap
} from 'lucide-react';

export default function AdminSubjectsPage() {
  const { addToast } = useToast();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formSemesterId, setFormSemesterId] = useState('');

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const loadData = async () => {
    const [sems, subs, mats, vids, crss, progs] = await Promise.all([
      getSemesters(), getSubjects(), getMaterials(), getVideos(),
      getCourses(), getPrograms(),
    ]);
    setSemesters(sems.sort((a, b) => a.number - b.number));
    setSubjects(subs);
    setMaterials(mats);
    setVideos(vids);
    setCourses(crss);
    setPrograms(progs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormName('');
    setFormCode('');
    setFormCourseId(courses[0]?.id || '');
    setFormSemesterId(semesters[0]?.id || '');
    setModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setFormName(sub.name);
    setFormCode(sub.code);
    setFormCourseId(sub.courseId || courses[0]?.id || '');
    setFormSemesterId(sub.semesterId);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim() || !formSemesterId) {
      addToast({ type: 'error', title: 'Fields Required', message: 'Please fill in all subject details.' });
      return;
    }

    const course = courses.find(c => c.id === formCourseId);
    const progId = course?.programId;

    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, {
          name: formName,
          code: formCode.toUpperCase(),
          courseId: formCourseId,
          programId: progId,
          semesterId: formSemesterId,
        });
        addToast({ type: 'success', title: 'Subject Updated' });
      } else {
        await createSubject({
          name: formName,
          code: formCode.toUpperCase(),
          courseId: formCourseId,
          programId: progId,
          semesterId: formSemesterId,
        });
        addToast({ type: 'success', title: 'Subject Created' });
      }
      setModalOpen(false);
      loadData();
    } catch {
      addToast({ type: 'error', title: 'Action Failed' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    await deleteSubject(subjectToDelete.id);
    addToast({ type: 'success', title: 'Subject Removed' });
    setDeleteModalOpen(false);
    loadData();
  };

  const getSemesterName = (semId: string) => semesters.find(s => s.id === semId)?.name || 'Unknown';
  const getCourseCode = (courseId?: string) => courses.find(c => c.id === courseId)?.code || 'General';

  const columns = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (sub: Subject) => (
        <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded text-xs">
          {sub.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Subject Name',
      sortable: true,
      render: (sub: Subject) => (
        <span className="font-semibold text-navy">{sub.name}</span>
      ),
    },
    {
      key: 'course',
      label: 'Sub-Course',
      sortable: true,
      render: (sub: Subject) => (
        <Badge variant="primary" size="sm">
          {getCourseCode(sub.courseId)}
        </Badge>
      ),
    },
    {
      key: 'semester',
      label: 'Semester',
      sortable: true,
      render: (sub: Subject) => (
        <span className="text-xs text-slate-600 font-medium">
          {getSemesterName(sub.semesterId)}
        </span>
      ),
    },
    {
      key: 'contentCount',
      label: 'Assets',
      render: (sub: Subject) => {
        const matCount = materials.filter(m => m.subjectId === sub.id).length;
        const vidCount = videos.filter(v => v.subjectId === sub.id).length;
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-medium">{matCount} PDFs</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">{vidCount} Videos</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (sub: Subject) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(sub)}
            className="text-slate-600 hover:text-teal-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSubjectToDelete(sub);
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
              <Tag className="w-6 h-6 text-teal-600" />
              Manage Course Subjects
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Organize course papers, assign course codes (e.g. BCA, MCA, B.Com), and link to semesters.
            </p>
          </div>

          <Button variant="primary" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Subject
          </Button>
        </div>

        <Card className="bg-white border border-slate-200">
          <DataTable
            columns={columns}
            data={subjects}
            searchable
            searchKeys={['name', 'code']}
            pageSize={10}
            emptyTitle="No subjects found"
            emptyDescription="Create your first course subject using the button above."
          />
        </Card>

        {/* Add / Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingSubject ? 'Edit Subject' : 'Add Course Subject'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Course Code"
                value={formCode}
                onChange={e => setFormCode(e.target.value)}
                placeholder="e.g. BCA101, MCA201"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sub-Course Branch
                </label>
                <select
                  value={formCourseId}
                  onChange={e => setFormCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Subject Name"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. Data Structures with C++"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={formSemesterId}
                onChange={e => setFormSemesterId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                {semesters.map(sem => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name} (Year {sem.year || Math.ceil(sem.number / 2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingSubject ? 'Save Changes' : 'Create Subject'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Subject"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Are you sure you want to delete {subjectToDelete?.name} ({subjectToDelete?.code})?</p>
                <p className="text-xs text-red-700 mt-1">
                  This action will also remove associated study materials and videos.
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
