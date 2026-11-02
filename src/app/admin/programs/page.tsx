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
  getPrograms, createProgram, updateProgram, deleteProgram,
  getCourses, createCourse, updateCourse, deleteCourse,
  getSubjects
} from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import type { Program, Course, Subject } from '@/types';
import {
  GraduationCap, Plus, Edit2, Trash2, AlertCircle, BookOpen,
  Layers, FolderTree, Award, Clock
} from 'lucide-react';

export default function AdminProgramsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'programs' | 'courses'>('courses');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Program Modal
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programName, setProgramName] = useState('');
  const [programCode, setProgramCode] = useState('');
  const [programDesc, setProgramDesc] = useState('');

  // Course Modal
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseProgramId, setCourseProgramId] = useState('');
  const [courseDuration, setCourseDuration] = useState('3');
  const [courseTotalSems, setCourseTotalSems] = useState('6');
  const [courseDesc, setCourseDesc] = useState('');

  // Delete Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'program' | 'course'; id: string; name: string } | null>(null);

  const loadData = async () => {
    const [progs, crss, subs] = await Promise.all([
      getPrograms(),
      getCourses(),
      getSubjects(),
    ]);
    setPrograms(progs);
    setCourses(crss);
    setSubjects(subs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Program Handlers
  const handleOpenAddProgram = () => {
    setEditingProgram(null);
    setProgramName('');
    setProgramCode('');
    setProgramDesc('');
    setProgramModalOpen(true);
  };

  const handleOpenEditProgram = (prog: Program) => {
    setEditingProgram(prog);
    setProgramName(prog.name);
    setProgramCode(prog.code);
    setProgramDesc(prog.description || '');
    setProgramModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programName.trim() || !programCode.trim()) {
      addToast({ type: 'error', title: 'Fields Required', message: 'Enter program name and code.' });
      return;
    }

    try {
      if (editingProgram) {
        await updateProgram(editingProgram.id, {
          name: programName,
          code: programCode.toUpperCase(),
          description: programDesc,
        });
        addToast({ type: 'success', title: 'Program Updated' });
      } else {
        await createProgram({
          name: programName,
          code: programCode.toUpperCase(),
          description: programDesc,
        });
        addToast({ type: 'success', title: 'Program Created' });
      }
      setProgramModalOpen(false);
      loadData();
    } catch {
      addToast({ type: 'error', title: 'Action Failed' });
    }
  };

  // Course Handlers
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseName('');
    setCourseCode('');
    setCourseProgramId(programs[0]?.id || '');
    setCourseDuration('3');
    setCourseTotalSems('6');
    setCourseDesc('');
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseName(course.name);
    setCourseCode(course.code);
    setCourseProgramId(course.programId);
    setCourseDuration(String(course.durationYears));
    setCourseTotalSems(String(course.totalSemesters));
    setCourseDesc(course.description || '');
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(courseDuration);
    const sems = parseInt(courseTotalSems);

    if (!courseName.trim() || !courseCode.trim() || !courseProgramId || isNaN(duration) || isNaN(sems)) {
      addToast({ type: 'error', title: 'Fields Required', message: 'Complete all course details.' });
      return;
    }

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, {
          name: courseName,
          code: courseCode.toUpperCase(),
          programId: courseProgramId,
          durationYears: duration,
          totalSemesters: sems,
          description: courseDesc,
        });
        addToast({ type: 'success', title: 'Course Updated' });
      } else {
        await createCourse({
          name: courseName,
          code: courseCode.toUpperCase(),
          programId: courseProgramId,
          durationYears: duration,
          totalSemesters: sems,
          description: courseDesc,
        });
        addToast({ type: 'success', title: 'Course Created' });
      }
      setCourseModalOpen(false);
      loadData();
    } catch {
      addToast({ type: 'error', title: 'Action Failed' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'program') {
      const relatedCourses = courses.filter(c => c.programId === itemToDelete.id);
      if (relatedCourses.length > 0) {
        addToast({
          type: 'error',
          title: 'Cannot Delete Program',
          message: 'This program has sub-courses. Reassign or delete them first.',
        });
        setDeleteModalOpen(false);
        return;
      }
      await deleteProgram(itemToDelete.id);
      addToast({ type: 'success', title: 'Program Deleted' });
    } else {
      await deleteCourse(itemToDelete.id);
      addToast({ type: 'success', title: 'Course Deleted' });
    }
    setDeleteModalOpen(false);
    loadData();
  };

  const getProgramName = (id: string) => programs.find(p => p.id === id)?.name || 'Unknown Program';

  // Columns for Programs
  const programColumns = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (prog: Program) => (
        <Badge variant="primary" size="sm">
          {prog.code}
        </Badge>
      ),
    },
    {
      key: 'name',
      label: 'Program Name',
      sortable: true,
      render: (prog: Program) => (
        <div>
          <p className="font-bold text-navy text-sm">{prog.name}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{prog.description}</p>
        </div>
      ),
    },
    {
      key: 'coursesCount',
      label: 'Sub-Courses',
      render: (prog: Program) => {
        const count = courses.filter(c => c.programId === prog.id).length;
        return (
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
            {count} {count === 1 ? 'Course' : 'Courses'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Added On',
      render: (prog: Program) => (
        <span className="text-xs text-slate-500">{formatDate(prog.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (prog: Program) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEditProgram(prog)}
            className="text-slate-600 hover:text-teal-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setItemToDelete({ type: 'program', id: prog.id, name: prog.name });
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

  // Columns for Courses
  const courseColumns = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (course: Course) => (
        <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded text-xs">
          {course.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Course Name',
      sortable: true,
      render: (course: Course) => (
        <div>
          <p className="font-bold text-navy text-sm">{course.name}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{course.description}</p>
        </div>
      ),
    },
    {
      key: 'program',
      label: 'Degree Program',
      sortable: true,
      render: (course: Course) => (
        <span className="text-xs font-medium text-slate-700">
          {getProgramName(course.programId)}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Years & Semesters',
      render: (course: Course) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{course.durationYears} Years</span>
          <span className="text-slate-300">•</span>
          <span>{course.totalSemesters} Semesters</span>
        </div>
      ),
    },
    {
      key: 'subjectsCount',
      label: 'Subjects Count',
      render: (course: Course) => {
        const count = subjects.filter(s => s.courseId === course.id).length;
        return (
          <span className="text-xs font-semibold text-slate-600">
            {count} {count === 1 ? 'Subject' : 'Subjects'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (course: Course) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEditCourse(course)}
            className="text-slate-600 hover:text-teal-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setItemToDelete({ type: 'course', id: course.id, name: course.name });
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
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-teal-600" />
              Programs & Sub-Courses Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Configure academic tiers (UG, PG, Diploma) and their respective degree branches (BCA, MCA, B.Com, M.Com, B.Tech, MBA).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'programs' ? (
              <Button variant="primary" onClick={handleOpenAddProgram}>
                <Plus className="w-4 h-4 mr-1.5" /> Add Program (UG/PG)
              </Button>
            ) : (
              <Button variant="primary" onClick={handleOpenAddCourse}>
                <Plus className="w-4 h-4 mr-1.5" /> Add Sub-Course (BCA/MCA...)
              </Button>
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'courses'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Sub-Courses & Degrees ({courses.length})
          </button>

          <button
            onClick={() => setActiveTab('programs')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'programs'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Programs Hierarchy ({programs.length})
          </button>
        </div>

        {/* Main Table */}
        <Card className="bg-white border border-slate-200">
          {activeTab === 'courses' ? (
            <DataTable
              columns={courseColumns}
              data={courses}
              searchable
              searchKeys={['name', 'code']}
              pageSize={10}
              emptyTitle="No courses created yet"
              emptyDescription="Add degree courses like BCA, MCA, B.Com, B.Tech using the button above."
            />
          ) : (
            <DataTable
              columns={programColumns}
              data={programs}
              searchable
              searchKeys={['name', 'code']}
              pageSize={10}
              emptyTitle="No programs created yet"
              emptyDescription="Add degree categories like UG, PG, or Diploma using the button above."
            />
          )}
        </Card>

        {/* Add/Edit Program Modal */}
        <Modal
          isOpen={programModalOpen}
          onClose={() => setProgramModalOpen(false)}
          title={editingProgram ? 'Edit Program' : 'Add Degree Program'}
        >
          <form onSubmit={handleSaveProgram} className="space-y-4">
            <Input
              label="Program Code"
              value={programCode}
              onChange={e => setProgramCode(e.target.value)}
              placeholder="e.g. UG, PG, DIPLOMA"
              required
            />
            <Input
              label="Program Name"
              value={programName}
              onChange={e => setProgramName(e.target.value)}
              placeholder="e.g. Undergraduate (UG)"
              required
            />
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={programDesc}
                onChange={e => setProgramDesc(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Scope and eligibility of this program level..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setProgramModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingProgram ? 'Save Changes' : 'Create Program'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add/Edit Course Modal */}
        <Modal
          isOpen={courseModalOpen}
          onClose={() => setCourseModalOpen(false)}
          title={editingCourse ? 'Edit Course' : 'Add Sub-Course'}
          size="lg"
        >
          <form onSubmit={handleSaveCourse} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Course Short Code"
                value={courseCode}
                onChange={e => setCourseCode(e.target.value)}
                placeholder="e.g. BCA, MCA, B.COM, M.COM"
                required
              />

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Parent Program
                </label>
                <select
                  value={courseProgramId}
                  onChange={e => setCourseProgramId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Full Course Title"
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              placeholder="e.g. Bachelor of Computer Applications (BCA)"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration in Years"
                type="number"
                min={1}
                max={6}
                value={courseDuration}
                onChange={e => setCourseDuration(e.target.value)}
                required
              />
              <Input
                label="Total Semesters"
                type="number"
                min={1}
                max={12}
                value={courseTotalSems}
                onChange={e => setCourseTotalSems(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Course Description
              </label>
              <textarea
                value={courseDesc}
                onChange={e => setCourseDesc(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Overview of syllabus focus areas and core topics..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCourseModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingCourse ? 'Save Changes' : 'Create Course'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title={`Delete ${itemToDelete?.type === 'program' ? 'Program' : 'Course'}`}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Are you sure you want to delete {itemToDelete?.name}?</p>
                <p className="text-xs text-red-700 mt-1">
                  {itemToDelete?.type === 'program'
                    ? 'Programs containing sub-courses cannot be removed.'
                    : 'All subjects, materials, and lectures under this course will be affected.'}
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
