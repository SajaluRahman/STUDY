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
  getMaterials, getSemesters, getSubjects, getCourses, getPrograms,
  createMaterial, updateMaterial, deleteMaterial
} from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import type { Material, Semester, Subject, Course, Program } from '@/types';
import {
  BookOpen, Plus, Edit2, Trash2, ExternalLink, Crown, AlertCircle
} from 'lucide-react';

export default function AdminMaterialsPage() {
  const { addToast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formProgramId, setFormProgramId] = useState('');
  const [formSemesterId, setFormSemesterId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formIsPremium, setFormIsPremium] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

  const loadData = async () => {
    const [mats, sems, subs, crses, progs] = await Promise.all([
      getMaterials(), getSemesters(), getSubjects(), getCourses(), getPrograms()
    ]);
    setMaterials(mats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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
    setEditingMaterial(null);
    setFormTitle('');
    setFormDescription('');
    const defaultCourse = courses[0];
    setFormCourseId(defaultCourse?.id || 'course-bpharm-regular');
    setFormProgramId(defaultCourse?.programId || 'prog-bpharm');
    const defaultSem = semesters[0]?.id || '';
    setFormSemesterId(defaultSem);
    const relatedSubs = subjects.filter(s => s.semesterId === defaultSem);
    setFormSubjectId(relatedSubs[0]?.id || '');
    setFormLink('https://drive.google.com/file/d/demo-notes-pdf/view');
    setFormIsPremium(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (mat: Material) => {
    setEditingMaterial(mat);
    setFormTitle(mat.title);
    setFormDescription(mat.description);
    setFormCourseId(mat.courseId || courses[0]?.id || 'course-bpharm-regular');
    setFormProgramId(mat.programId || courses[0]?.programId || 'prog-bpharm');
    setFormSemesterId(mat.semesterId);
    setFormSubjectId(mat.subjectId);
    setFormLink(mat.link);
    setFormIsPremium(mat.isPremium);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSemesterId || !formSubjectId || !formLink.trim()) {
      addToast({ type: 'error', title: 'Missing Information', message: 'Please complete all required fields.' });
      return;
    }

    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, {
          title: formTitle,
          description: formDescription,
          semesterId: formSemesterId,
          subjectId: formSubjectId,
          link: formLink,
          isPremium: formIsPremium,
          courseId: formCourseId,
          programId: formProgramId,
        });
        addToast({ type: 'success', title: 'Material Updated' });
      } else {
        await createMaterial({
          title: formTitle,
          description: formDescription,
          semesterId: formSemesterId,
          subjectId: formSubjectId,
          link: formLink,
          isPremium: formIsPremium,
          courseId: formCourseId,
          programId: formProgramId,
        });
        addToast({ type: 'success', title: 'Material Added' });
      }
      setModalOpen(false);
      loadData();
    } catch {
      addToast({ type: 'error', title: 'Action Failed' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!materialToDelete) return;
    await deleteMaterial(materialToDelete.id);
    addToast({ type: 'success', title: 'Material Deleted' });
    setDeleteModalOpen(false);
    loadData();
  };

  const getSemesterName = (semId: string) => semesters.find(s => s.id === semId)?.name || 'Unknown';
  const getSubjectName = (subId: string) => subjects.find(s => s.id === subId)?.name || 'Unknown';

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (mat: Material) => (
        <div>
          <p className="font-semibold text-navy text-sm">{mat.title}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{mat.description}</p>
        </div>
      ),
    },
    {
      key: 'course',
      label: 'Course & Program',
      render: (mat: Material) => {
        const course = courses.find(c => c.id === mat.courseId);
        const prog = programs.find(p => p.id === (mat.programId || course?.programId));
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
      label: 'Subject & Semester',
      render: (mat: Material) => (
        <div>
          <p className="font-medium text-slate-800 text-xs">{getSubjectName(mat.subjectId)}</p>
          <p className="text-[11px] text-slate-400">{getSemesterName(mat.semesterId)}</p>
        </div>
      ),
    },
    {
      key: 'isPremium',
      label: 'Tier',
      sortable: true,
      render: (mat: Material) => (
        mat.isPremium ? (
          <Badge variant="warning" size="sm">
            <Crown className="w-3 h-3 mr-1" /> Premium
          </Badge>
        ) : (
          <Badge variant="success" size="sm">Free</Badge>
        )
      ),
    },
    {
      key: 'link',
      label: 'Resource Link',
      render: (mat: Material) => (
        <a
          href={mat.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:text-teal-800 text-xs inline-flex items-center gap-1 font-mono"
        >
          <span>Open PDF</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date Added',
      render: (mat: Material) => (
        <span className="text-xs text-slate-500">{formatDate(mat.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (mat: Material) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(mat)}
            className="text-slate-600 hover:text-teal-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMaterialToDelete(mat);
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
              <BookOpen className="w-6 h-6 text-teal-600" />
              Manage Study Materials (PDFs)
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Publish and catalog downloadable PDF notes, solved papers, and syllabus guides.
            </p>
          </div>

          <Button variant="primary" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Material
          </Button>
        </div>

        <Card className="bg-white border border-slate-200">
          <DataTable
            columns={columns}
            data={materials}
            searchable
            searchKeys={['title', 'description']}
            pageSize={10}
            emptyTitle="No materials uploaded"
            emptyDescription="Upload your first study document using the button above."
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingMaterial ? 'Edit Study Material' : 'Add Study Material'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Document Title"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="e.g. Unit 3 Complete Handwritten Notes"
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

            <Input
              label="Resource PDF Link (Google Drive, Cloud Storage URL)"
              value={formLink}
              onChange={e => setFormLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              required
            />

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description / Syllabus Topics
              </label>
              <textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Key concepts covered in this document..."
              />
            </div>

            {/* Premium Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-navy flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Premium Content Lock
                </p>
                <p className="text-xs text-slate-500">
                  When enabled, only students with active premium plans can open and download this PDF.
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
                {editingMaterial ? 'Save Changes' : 'Publish Material'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Material"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Delete &quot;{materialToDelete?.title}&quot;?</p>
                <p className="text-xs text-red-700 mt-1">
                  Students will no longer be able to access or download this resource.
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
