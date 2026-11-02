'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { resetAllData } from '@/lib/db';
import { seedDemoData } from '@/lib/seed';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  Settings, RotateCcw, AlertTriangle, ShieldCheck, Database,
  CheckCircle, Server, Info, Terminal
} from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    setResetting(true);
    try {
      await resetAllData();
      seedDemoData();
      addToast({
        type: 'success',
        title: 'Demo Data Restored',
        message: 'Database has been reset to default demo curriculum and users.',
      });
      setResetModalOpen(false);
      // Brief delay then refresh
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      addToast({ type: 'error', title: 'Reset Failed', message: 'Could not reset localStorage data.' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Settings className="w-6 h-6 text-teal-600" />
            System & Platform Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Demo data management, client-side persistence configuration, and system architecture.
          </p>
        </div>

        {/* Demo Data Reset Card */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-navy text-base">Reset Demo Environment</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-lg">
                  Restore default semesters, courses, study notes, video lectures, and sample accounts (student, premium, admin). All user modifications will be reset.
                </p>
              </div>
            </div>

            <Button
              variant="danger"
              onClick={() => setResetModalOpen(true)}
              className="shrink-0"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Reset Demo Data
            </Button>
          </div>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-navy block mb-1">Curriculum Seed</span>
              3 Programs, 8 Degree Courses (UG/PG), 6 Semesters, 16 Subjects, 24 Materials, 12 Lectures
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-navy block mb-1">Demo Accounts</span>
              admin@studyhub.com, student@studyhub.com, premium@studyhub.com
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-navy block mb-1">Pricing Tiers</span>
              Monthly (₹199), Semester (₹499), Yearly (₹799)
            </div>
          </div>
        </Card>

        {/* Architecture & API Replacement Notice */}
        <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-base">Architecture: Decoupled Data Layer</h3>
              <p className="text-xs text-slate-500">How to transition this application to a real backend</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            All data access in StudyHub is isolated strictly inside <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded font-mono">src/lib/db.ts</code>. Components never access <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">localStorage</code> directly.
          </p>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto space-y-1">
            <p className="text-slate-400">// Example: Replacing localStorage with real REST API in src/lib/db.ts</p>
            <p><span className="text-teal-400">export async function</span> <span className="text-yellow-300">getMaterials</span>(): Promise&lt;Material[]&gt; &#123;</p>
            <p className="pl-4 text-slate-400">// CURRENT: return getStore&lt;Material&gt;(KEYS.MATERIALS);</p>
            <p className="pl-4 text-emerald-400">const res = await fetch(&apos;/api/materials&apos;);</p>
            <p className="pl-4 text-emerald-400">return res.json();</p>
            <p>&#125;</p>
          </div>
        </Card>

        {/* Reset Confirmation Modal */}
        <Modal
          isOpen={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          title="Confirm Database Reset"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Reset all data to default demo state?</p>
                <p className="text-xs text-red-700 mt-1">
                  This will erase all custom added materials, newly registered students, simulated payments, and restore original demo contents.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" onClick={() => setResetModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleResetData}
                loading={resetting}
              >
                Yes, Reset All Data
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
