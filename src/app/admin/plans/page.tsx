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
  getPlans, createPlan, updatePlan, deletePlan
} from '@/lib/db';
import { formatINR, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import type { Plan } from '@/types';
import {
  Crown, Plus, Edit2, Trash2, Sparkles, CheckCircle,
  AlertCircle, Check
} from 'lucide-react';

export default function AdminPlansPage() {
  const { addToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formValidity, setFormValidity] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsMostPopular, setFormIsMostPopular] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const loadData = async () => {
    const data = await getPlans();
    setPlans(data.sort((a, b) => a.price - b.price));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormName('');
    setFormPrice('299');
    setFormValidity('60');
    setFormFeatures('Unlimited PDF Downloads\nHD Video Lectures\nPrevious Year Question Bank\nPriority Academic Support');
    setFormIsActive(true);
    setFormIsMostPopular(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormPrice(String(plan.price));
    setFormValidity(String(plan.validityDays));
    setFormFeatures(plan.features.join('\n'));
    setFormIsActive(plan.isActive);
    setFormIsMostPopular(plan.isMostPopular);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formPrice);
    const validityNum = parseInt(formValidity);

    if (!formName.trim() || isNaN(priceNum) || isNaN(validityNum)) {
      addToast({ type: 'error', title: 'Invalid Input', message: 'Please enter valid plan name, price, and validity.' });
      return;
    }

    const featuresList = formFeatures
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, {
          name: formName,
          price: priceNum,
          validityDays: validityNum,
          features: featuresList,
          isActive: formIsActive,
          isMostPopular: formIsMostPopular,
        });
        addToast({ type: 'success', title: 'Plan Updated' });
      } else {
        await createPlan({
          name: formName,
          price: priceNum,
          validityDays: validityNum,
          features: featuresList,
          isActive: formIsActive,
          isMostPopular: formIsMostPopular,
        });
        addToast({ type: 'success', title: 'Plan Created' });
      }
      setModalOpen(false);
      loadData();
    } catch {
      addToast({ type: 'error', title: 'Action Failed' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    await deletePlan(planToDelete.id);
    addToast({ type: 'success', title: 'Plan Deleted' });
    setDeleteModalOpen(false);
    loadData();
  };

  const columns = [
    {
      key: 'name',
      label: 'Plan Name',
      sortable: true,
      render: (p: Plan) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-navy">{p.name}</span>
          {p.isMostPopular && (
            <Badge variant="warning" size="sm">
              <Sparkles className="w-3 h-3 mr-0.5" /> Popular
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (p: Plan) => (
        <span className="font-extrabold text-navy">{formatINR(p.price)}</span>
      ),
    },
    {
      key: 'validityDays',
      label: 'Validity',
      sortable: true,
      render: (p: Plan) => (
        <span className="text-xs text-slate-600 font-medium">{p.validityDays} Days</span>
      ),
    },
    {
      key: 'features',
      label: 'Features',
      render: (p: Plan) => (
        <span className="text-xs text-slate-500">{p.features.length} features included</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Visibility',
      render: (p: Plan) => (
        p.isActive ? (
          <Badge variant="success" size="sm">Active</Badge>
        ) : (
          <Badge variant="neutral" size="sm">Hidden</Badge>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (p: Plan) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(p)}
            className="text-slate-600 hover:text-teal-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPlanToDelete(p);
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
              <Crown className="w-6 h-6 text-teal-600" />
              Manage Premium Plans
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Create, price, and adjust membership packages offered to students.
            </p>
          </div>

          <Button variant="primary" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Plan
          </Button>
        </div>

        <Card className="bg-white border border-slate-200">
          <DataTable
            columns={columns}
            data={plans}
            searchable
            searchKeys={['name']}
            pageSize={10}
            emptyTitle="No plans found"
            emptyDescription="Create a subscription plan using the button above."
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingPlan ? 'Edit Premium Plan' : 'Create Premium Plan'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Plan Title"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="e.g. Semester Pass"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price in INR (₹)"
                type="number"
                min={0}
                value={formPrice}
                onChange={e => setFormPrice(e.target.value)}
                placeholder="499"
                required
              />
              <Input
                label="Validity in Days"
                type="number"
                min={1}
                value={formValidity}
                onChange={e => setFormValidity(e.target.value)}
                placeholder="180"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Included Features (one per line)
              </label>
              <textarea
                value={formFeatures}
                onChange={e => setFormFeatures(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
                placeholder="High-yield formula cheat sheets&#10;All recorded lecture videos&#10;Previous 5 years question papers"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={e => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span className="text-xs font-semibold text-navy">Plan Active & Published</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsMostPopular}
                  onChange={e => setFormIsMostPopular(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span className="text-xs font-semibold text-navy">Highlight as Most Popular</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingPlan ? 'Save Changes' : 'Publish Plan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Plan"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Delete plan &quot;{planToDelete?.name}&quot;?</p>
                <p className="text-xs text-red-700 mt-1">
                  Students will no longer be able to purchase this tier. Existing subscriptions will remain valid.
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
