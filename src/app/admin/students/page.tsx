'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/ui/DataTable';
import {
  getUsers, updateUser, deleteUser, getCourses, getPrograms
} from '@/lib/db';
import { formatDate, daysRemaining } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import type { User, Course, Program } from '@/types';
import {
  Users, Crown, ShieldAlert, ShieldCheck, Eye, Trash2,
  Calendar, CheckCircle, Ban, Sparkles, AlertTriangle, GraduationCap
} from 'lucide-react';

export default function AdminStudentsPage() {
  const { addToast } = useToast();
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  // View Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  // Grant Premium Modal
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [studentForPremium, setStudentForPremium] = useState<User | null>(null);
  const [grantDays, setGrantDays] = useState('30');

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);

  const loadData = async () => {
    const [allUsers, allCourses, allPrograms] = await Promise.all([
      getUsers(), getCourses(), getPrograms()
    ]);
    setStudents(allUsers.filter(u => u.role === 'student'));
    setCourses(allCourses);
    setPrograms(allPrograms);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleBlock = async (student: User) => {
    const updatedBlocked = !student.isBlocked;
    await updateUser(student.id, { isBlocked: updatedBlocked });
    addToast({
      type: updatedBlocked ? 'warning' : 'success',
      title: updatedBlocked ? 'Student Blocked' : 'Student Unblocked',
      message: `${student.name} ${updatedBlocked ? 'is now barred from logging in.' : 'can now log in freely.'}`,
    });
    loadData();
  };

  const handleGrantPremium = async () => {
    if (!studentForPremium) return;
    const days = parseInt(grantDays);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);

    await updateUser(studentForPremium.id, {
      isPremium: true,
      premiumExpiry: expiry.toISOString(),
    });

    addToast({
      type: 'success',
      title: 'Premium Access Granted',
      message: `Granted ${days} days of premium to ${studentForPremium.name}.`,
    });
    setPremiumModalOpen(false);
    loadData();
  };

  const handleRevokePremium = async (student: User) => {
    await updateUser(student.id, {
      isPremium: false,
      premiumExpiry: null,
    });

    addToast({
      type: 'info',
      title: 'Premium Revoked',
      message: `Revoked premium membership from ${student.name}.`,
    });
    loadData();
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    await deleteUser(studentToDelete.id);
    addToast({ type: 'success', title: 'Student Removed', message: 'User record deleted.' });
    setDeleteModalOpen(false);
    loadData();
  };

  const columns = [
    {
      key: 'name',
      label: 'Student',
      sortable: true,
      render: (st: User) => (
        <div>
          <p className="font-bold text-navy text-sm">{st.name}</p>
          <p className="text-xs text-slate-500">{st.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (st: User) => (
        <span className="text-xs text-slate-600 font-mono">{st.phone || 'N/A'}</span>
      ),
    },
    {
      key: 'course',
      label: 'Degree & Year',
      render: (st: User) => {
        const course = courses.find(c => c.id === st.courseId);
        const prog = programs.find(p => p.id === (st.programId || course?.programId));
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-navy px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                {course ? course.code : 'BCA'}
              </span>
              <span className="text-xs text-slate-700 font-medium">
                {st.year ? `Year ${st.year}` : 'Year 1'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{prog ? prog.name : 'UG'}</p>
          </div>
        );
      },
    },
    {
      key: 'semester',
      label: 'Semester',
      sortable: true,
      render: (st: User) => (
        <Badge variant="neutral" size="sm">
          Sem {st.semester}
        </Badge>
      ),
    },
    {
      key: 'isPremium',
      label: 'Tier & Expiry',
      sortable: true,
      render: (st: User) => {
        if (!st.isPremium) {
          return <Badge variant="neutral" size="sm">Free Student</Badge>;
        }
        const daysLeft = st.premiumExpiry ? daysRemaining(st.premiumExpiry) : 0;
        return (
          <div>
            <Badge variant="warning" size="sm">
              <Crown className="w-3 h-3 mr-1" /> Premium
            </Badge>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {st.premiumExpiry ? `${formatDate(st.premiumExpiry)} (${daysLeft}d left)` : 'Permanent'}
            </p>
          </div>
        );
      },
    },
    {
      key: 'isBlocked',
      label: 'Account Status',
      sortable: true,
      render: (st: User) => (
        st.isBlocked ? (
          <Badge variant="danger" size="sm">Blocked</Badge>
        ) : (
          <Badge variant="success" size="sm">Active</Badge>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (st: User) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* View Details */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStudent(st);
              setDetailsModalOpen(true);
            }}
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
          </Button>

          {/* Premium Grant / Revoke */}
          {st.isPremium ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRevokePremium(st)}
              className="text-amber-600 hover:text-amber-700"
              title="Revoke Premium"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStudentForPremium(st);
                setPremiumModalOpen(true);
              }}
              className="text-teal-600 hover:text-teal-700"
              title="Grant Premium"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </Button>
          )}

          {/* Block / Unblock */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleBlock(st)}
            className={st.isBlocked ? 'text-emerald-600' : 'text-slate-400 hover:text-amber-600'}
            title={st.isBlocked ? 'Unblock Student' : 'Block Student'}
          >
            <Ban className="w-3.5 h-3.5" />
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStudentToDelete(st);
              setDeleteModalOpen(true);
            }}
            className="text-slate-400 hover:text-red-600"
            title="Delete Student"
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
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            Student Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse registered students, control account access, and grant or revoke premium memberships.
          </p>
        </div>

        <Card className="bg-white border border-slate-200">
          <DataTable
            columns={columns}
            data={students}
            searchable
            searchKeys={['name', 'email', 'phone']}
            pageSize={10}
            emptyTitle="No students found"
            emptyDescription="Registered student records will appear here."
          />
        </Card>

        {/* View Details Modal */}
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title="Student Profile Details"
        >
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-navy">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400">Academic Course</span>
                  {(() => {
                    const course = courses.find(c => c.id === selectedStudent.courseId);
                    const prog = programs.find(p => p.id === (selectedStudent.programId || course?.programId));
                    return (
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {course ? `${course.code} - ${course.name}` : 'BCA'}
                        <span className="block text-[11px] text-teal-600 font-normal">{prog?.name || 'Undergraduate'}</span>
                      </p>
                    );
                  })()}
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400">Academic Progress</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    Year {selectedStudent.year || 1} • Semester {selectedStudent.semester}
                  </p>
                  <span className="block text-[11px] text-slate-400 mt-0.5">Active Term</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400">Phone Number</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedStudent.phone || 'None'}</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-slate-400">Membership Tier</span>
                  <p className="font-semibold text-navy mt-0.5">
                    {selectedStudent.isPremium ? 'Premium Plan' : 'Free Member'}
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl col-span-2">
                  <span className="text-slate-400">Account Standing</span>
                  <p className={`font-semibold mt-0.5 ${selectedStudent.isBlocked ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedStudent.isBlocked ? 'Blocked from logging in' : 'Active and Verified'}
                  </p>
                </div>
              </div>

              {selectedStudent.isPremium && selectedStudent.premiumExpiry && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <span className="font-bold">Subscription Expiry:</span> {formatDate(selectedStudent.premiumExpiry)} ({daysRemaining(selectedStudent.premiumExpiry)} days left)
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="ghost" onClick={() => setDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Grant Premium Modal */}
        <Modal
          isOpen={premiumModalOpen}
          onClose={() => setPremiumModalOpen(false)}
          title="Grant Premium Access"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Grant manual premium access to <strong className="text-navy">{studentForPremium?.name}</strong> without requiring mock payment.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Validity Duration
              </label>
              <select
                value={grantDays}
                onChange={e => setGrantDays(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="30">30 Days (1 Month)</option>
                <option value="90">90 Days (Quarterly)</option>
                <option value="180">180 Days (1 Full Semester)</option>
                <option value="365">365 Days (1 Full Year)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" onClick={() => setPremiumModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="warning" onClick={handleGrantPremium}>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Grant Access
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Student"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Permanently delete {studentToDelete?.name}?</p>
                <p className="text-xs text-red-700 mt-1">
                  This action cannot be undone. Their account and access logs will be permanently deleted.
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
