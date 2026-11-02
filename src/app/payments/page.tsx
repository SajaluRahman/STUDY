'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { getPaymentsByStudent } from '@/lib/db';
import { formatINR, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { Payment } from '@/types';
import {
  Receipt, CreditCard, CheckCircle2, XCircle, Clock,
  Crown, ExternalLink, ArrowRight
} from 'lucide-react';

export default function StudentPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getPaymentsByStudent(user.id).then(list => {
      // Sort newest first
      setPayments(list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    });
  }, [user]);

  const getStatusBadge = (status: Payment['status']) => {
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

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <Receipt className="w-6 h-6 text-teal-600" />
              My Payment History
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              View all your mock subscription transactions, receipts, and membership invoices.
            </p>
          </div>

          <Link href="/plans">
            <Button variant="outline" size="sm">
              <Crown className="w-4 h-4 mr-1.5 text-amber-500" />
              View Subscription Plans
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <CardSkeleton count={3} />
          </div>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No Transactions Yet"
            description="You haven't made any subscription payments yet. Explore our premium plans to upgrade your account."
            action={{
              label: 'Explore Premium Plans',
              onClick: () => {
                window.location.href = '/plans';
              },
            }}
          />
        ) : (
          <Card className="bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Transaction ID</th>
                    <th className="py-3.5 px-4 font-semibold">Plan</th>
                    <th className="py-3.5 px-4 font-semibold">Method</th>
                    <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                    <th className="py-3.5 px-4 font-semibold">Amount</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-medium">
                        {payment.transactionId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-navy">{payment.planName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs uppercase font-medium text-slate-600">
                        {payment.method}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDateTime(payment.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-navy">
                        {formatINR(payment.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {getStatusBadge(payment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
