'use client';

import { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/DataTable';
import { getPayments } from '@/lib/db';
import { formatINR, formatDateTime, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import type { Payment, PaymentStatus } from '@/types';
import {
  Receipt, Download, Search, CheckCircle2, XCircle, Clock,
  Filter, Calendar, FileSpreadsheet, IndianRupee
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const { addToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    const list = await getPayments();
    setPayments(list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.studentName.toLowerCase().includes(q);
        const matchesEmail = p.studentEmail.toLowerCase().includes(q);
        const matchesTxn = p.transactionId.toLowerCase().includes(q);
        const matchesPlan = p.planName.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesTxn && !matchesPlan) return false;
      }
      return true;
    });
  }, [payments, statusFilter, searchQuery]);

  // Total Metrics
  const totalVolume = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  const successCount = payments.filter(p => p.status === 'success').length;
  const failedCount = payments.filter(p => p.status === 'failed').length;

  // Export to CSV Function
  const handleExportCSV = () => {
    if (payments.length === 0) {
      addToast({ type: 'warning', title: 'No Data', message: 'No payment records to export.' });
      return;
    }

    const headers = ['Transaction ID', 'Student Name', 'Student Email', 'Plan Name', 'Amount (INR)', 'Payment Method', 'Status', 'Date Time'];
    const rows = payments.map(p => [
      `"${p.transactionId}"`,
      `"${p.studentName.replace(/"/g, '""')}"`,
      `"${p.studentEmail.replace(/"/g, '""')}"`,
      `"${p.planName.replace(/"/g, '""')}"`,
      p.amount,
      p.method.toUpperCase(),
      p.status.toUpperCase(),
      `"${new Date(p.date).toLocaleString('en-IN')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `studyhub_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Export Generated',
      message: 'Payment report CSV downloaded successfully.',
    });
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="success" size="sm" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="danger" size="sm" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" size="sm" className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
    }
  };

  const columns = [
    {
      key: 'transactionId',
      label: 'Txn ID',
      render: (p: Payment) => (
        <span className="font-mono text-xs text-slate-600 font-semibold">{p.transactionId}</span>
      ),
    },
    {
      key: 'studentName',
      label: 'Student',
      sortable: true,
      render: (p: Payment) => (
        <div>
          <p className="font-bold text-navy text-xs">{p.studentName}</p>
          <p className="text-[11px] text-slate-400">{p.studentEmail}</p>
        </div>
      ),
    },
    {
      key: 'planName',
      label: 'Plan',
      sortable: true,
      render: (p: Payment) => (
        <span className="text-xs font-semibold text-slate-700">{p.planName}</span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      render: (p: Payment) => (
        <span className="text-xs uppercase font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {p.method}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (p: Payment) => (
        <span className="font-bold text-navy text-xs">{formatINR(p.amount)}</span>
      ),
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (p: Payment) => (
        <span className="text-xs text-slate-500">{formatDateTime(p.date)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      className: 'text-right',
      render: (p: Payment) => (
        <div className="flex justify-end">
          {getStatusBadge(p.status)}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <Receipt className="w-6 h-6 text-teal-600" />
              Transactions & Revenue Logs
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Audit log of all student payment simulations, gateway timestamps, and CSV export.
            </p>
          </div>

          <Button variant="primary" onClick={handleExportCSV} className="bg-teal-600 hover:bg-teal-700 shadow-sm">
            <Download className="w-4 h-4 mr-1.5" />
            Export to CSV
          </Button>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Successful Volume</span>
            <p className="text-2xl font-bold text-teal-700 mt-1">{formatINR(totalVolume)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{successCount} settled transactions</p>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold uppercase text-slate-400">Successful Payments</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{successCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Active subscriptions activated</p>
          </Card>

          <Card className="p-4 bg-white border border-slate-200">
            <span className="text-xs font-semibold uppercase text-slate-400">Declined / Failed</span>
            <p className="text-2xl font-bold text-rose-600 mt-1">{failedCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Simulated test failures</p>
          </Card>
        </div>

        {/* Filter controls */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search by student, email, or txn ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto">
              {(['all', 'success', 'failed', 'pending'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Payments Table */}
        <Card className="bg-white border border-slate-200">
          <DataTable
            columns={columns}
            data={filteredPayments}
            searchable={false}
            pageSize={10}
            emptyTitle="No transactions found"
            emptyDescription="Transactions will appear here when students complete mock checkout."
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
