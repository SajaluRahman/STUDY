'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getSemesters, getSubjects, createSemester, updateSemester, deleteSemester
} from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import type { Semester, Subject } from '@/types';
import {
  Layers, Plus, Edit2, Trash2, AlertCircle, BookOpen
} from 'lucide-react';

export default function AdminSemestersPage() {
  const { addToast } = useToast();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [formNumber, setFormNumber] = useState('');
  const [formName, setFormName] = useState('');

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);

  const loadData = async () => {
    const [sems, subs] = await Promise.all([getSemesters(), getSubjects()]);
    setSemesters(sems.sort((a, b) => a.number - b.number));
    setSubjects(subs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingSemester(null);
    setFormNumber(String((semesters.length > 0 ? Math.max(...semesters.map(s => s.number)) : 0) + 1));
    setFormName(`Semester ${semesters.length + 1}`);
    setModalOpen(true);
  };

  const handleOpenEdit = (sem: Semester) => {
    setEditingSemester(sem);
    setFormNumber(String(sem.number));
    setFormName(sem.name);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(formNumber);
    if (isNaN(num) || num < 1) {
      addToast({ type: 'error', title: 'Invalid Number', message: 'Enter a valid semester number.' });
      return;
    }
    if (!formName.trim()) {
      addToast({ type: 'error', title: 'Name Required', message: 'Enter semester name.' });
      return;
    }

    try {
      if (editingSemester) {
        await updateSemester(editingSemester.id, { number: num, name: formName });
        addToast({ type: 'success', title: 'Semester Updated' });
      } else {
        await createSemester({ number: num, name: formName });
        addToast({ type: 'success', title: 'Semester Created' });
      }
      setModalOpen(false);
      loadData();
    } catch {
      addToast({ type: 'error', title: 'Action Failed' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!semesterToDelete) return;
    const hasSubjects = subjects.some(s => s.semesterId === semesterToDelete.id);
    if (hasSubjects) {
      addToast({
        type: 'error',
        title: 'Cannot Delete Semester',
        message: 'This semester still contains subjects. Remove or reassign them first.',
      });
      setDeleteModalOpen(false);
      return;
    }

    await deleteSemester(semesterToDelete.id);
    addToast({ type: 'success', title: 'Semester Deleted' });
    setDeleteModalOpen(false);
    loadData();
  };

  const columns = [
    {
      key: 'number',
      label: 'Semester No.',
      sortable: true,
      render: (sem: Semester) => (
        <span className="font-bold text-navy">#{sem.number}</span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (sem: Semester) => (
        <span className="font-medium text-slate-800">{sem.name}</span>
      ),
    },
    {
      key: 'subjectsCount',
      label: 'Associated Subjects',
      render: (sem: Semester) => {
        const count = subjects.filter(s => s.semesterId === sem.id).length;
        return (
          <Badge variant={count > 0 ? 'primary' : 'neutral'} size="sm">
            {count} {count === 1 ? 'Subject' : 'Subjects'}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      render: (sem: Semester) => (
        <span className="text-xs text-slate-500">{formatDate(sem.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (sem: Semester) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(sem)}
            className="text-slate-600 hover:text-teal-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSemesterToDelete(sem);
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
              <Layers className="w-6 h-6 text-teal-600" />
              Manage Semesters
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Add or modify academic semesters for organizing curriculum and content.
            </p>
          </div>

          <Button variant="primary" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Semester
          </Button>
        </div>

        <Card className="bg-white border border-slate-200">
          <DataTable
            columns={columns}
            data={semesters}
            searchable
            searchKeys={['name', 'number']}
            pageSize={10}
            emptyTitle="No semesters configured"
            emptyDescription="Create your first semester using the button above."
          />
        </Card>

        {/* Add / Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingSemester ? 'Edit Semester' : 'Add New Semester'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Semester Number"
              type="number"
              min={1}
              value={formNumber}
              onChange={e => setFormNumber(e.target.value)}
              placeholder="1"
              required
            />
            <Input
              label="Semester Name"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. Semester 1 (Autumn)"
              required
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingSemester ? 'Save Changes' : 'Create Semester'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Semester"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Are you sure you want to delete {semesterToDelete?.name}?</p>
                <p className="text-xs text-red-700 mt-1">
                  Semesters that contain subjects cannot be deleted to prevent orphan records.
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
