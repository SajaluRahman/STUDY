'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import {
  getStats, getPayments, getUsers, getMaterials, getVideos
} from '@/lib/db';
import { formatINR, formatDate, formatDateTime } from '@/lib/utils';
import type { Payment, User } from '@/types';
import {
  Users, Crown, BookOpen, Video, IndianRupee, TrendingUp,
  ArrowRight, ShieldCheck, CheckCircle2, XCircle, Clock,
  PlusCircle, Download
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    premiumStudents: 0,
    totalMaterials: 0,
    totalVideos: 0,
    totalRevenue: 0,
    totalPayments: 0,
  });

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    Promise.all([getStats(), getPayments()]).then(([st, pms]) => {
      setStats({
        totalStudents: st.totalStudents,
        premiumStudents: st.premiumStudents,
        totalMaterials: st.totalMaterials,
        totalVideos: st.totalVideos,
        totalRevenue: st.totalRevenue,
        totalPayments: st.totalPayments,
      });
      setPayments(pms.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    });
  }, []);

  // Demo monthly revenue data for chart
  const revenueChartData = [
    { month: 'May', revenue: 1400 },
    { month: 'Jun', revenue: 2100 },
    { month: 'Jul', revenue: 3800 },
    { month: 'Aug', revenue: 5200 },
    { month: 'Sep', revenue: 4700 },
    { month: 'Oct', revenue: stats.totalRevenue || 6800 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
              Executive Admin Overview
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Live statistics, student enrollment, academic catalog, and demo revenue insights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/materials">
              <Button variant="primary" size="sm">
                <PlusCircle className="w-4 h-4 mr-1.5" /> Add Material
              </Button>
            </Link>
            <Link href="/admin/students">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-1.5" /> Manage Students
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <CardSkeleton count={5} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Students */}
            <Card className="p-5 border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Students
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-navy">{stats.totalStudents}</p>
              <p className="text-[11px] text-teal-600 font-medium mt-1">Active registrations</p>
            </Card>

            {/* Premium Students */}
            <Card className="p-5 border border-amber-200/80 bg-amber-50/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Premium Tier
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-navy">{stats.premiumStudents}</p>
              <p className="text-[11px] text-amber-700 font-medium mt-1">
                {stats.totalStudents > 0 ? Math.round((stats.premiumStudents / stats.totalStudents) * 100) : 0}% conversion rate
              </p>
            </Card>

            {/* Total Materials */}
            <Card className="p-5 border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Materials (PDFs)
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-navy">{stats.totalMaterials}</p>
              <p className="text-[11px] text-slate-500 mt-1">Organized in semesters</p>
            </Card>

            {/* Total Videos */}
            <Card className="p-5 border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Video Lectures
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-navy">{stats.totalVideos}</p>
              <p className="text-[11px] text-slate-500 mt-1">Recorded sessions</p>
            </Card>

            {/* Total Revenue */}
            <Card className="p-5 border border-teal-200 bg-teal-50/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                  Total Volume
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-teal-800">{formatINR(stats.totalRevenue)}</p>
              <p className="text-[11px] text-teal-700 font-medium mt-1">Demo sandbox collection</p>
            </Card>
          </div>
        )}

        {/* Charts & Graphs Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="p-6 bg-white border border-slate-200 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-navy text-lg">Revenue Growth Trend</h3>
                <p className="text-xs text-slate-500">Monthly subscription volume progression (INR)</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +28.4%
              </span>
            </div>

            <div className="h-64 w-full">
              {isClient ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0E8F8A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0E8F8A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      formatter={(val) => [`₹${val ?? 0}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#12284C', borderRadius: '8px', color: '#fff', border: 'none' }}
                      itemStyle={{ color: '#5EEAD4' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#0E8F8A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">Loading Chart...</div>
              )}
            </div>
          </Card>

          {/* Quick Shortcuts & Management */}
          <Card className="p-6 bg-white border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-navy text-lg mb-1">Administrative Actions</h3>
              <p className="text-xs text-slate-500 mb-6">Direct access to core management features</p>

              <div className="space-y-3">
                <Link
                  href="/admin/semesters"
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 flex items-center justify-between text-sm font-medium text-slate-700 transition-all"
                >
                  <span>Manage Semesters & Subjects</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/admin/materials"
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 flex items-center justify-between text-sm font-medium text-slate-700 transition-all"
                >
                  <span>Upload & Review Materials</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/admin/plans"
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 flex items-center justify-between text-sm font-medium text-slate-700 transition-all"
                >
                  <span>Modify Premium Pricing Plans</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/admin/payments"
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 flex items-center justify-between text-sm font-medium text-slate-700 transition-all"
                >
                  <span>View All Payments & Export CSV</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>StudyHub Engine v1.0</span>
              <Link href="/admin/settings" className="text-teal-600 font-semibold hover:underline">
                Reset Demo Data &rarr;
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Transactions Table */}
        <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-navy text-lg">Recent Payment Transactions</h3>
              <p className="text-xs text-slate-500">Latest student payment activities</p>
            </div>
            <Link href="/admin/payments">
              <Button variant="outline" size="sm">
                View All Payments
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Txn ID</th>
                  <th className="py-3 px-4 font-semibold">Student</th>
                  <th className="py-3 px-4 font-semibold">Plan</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.slice(0, 5).map(pm => (
                  <tr key={pm.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{pm.transactionId}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-navy text-xs">{pm.studentName}</p>
                      <p className="text-[11px] text-slate-400">{pm.studentEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700">{pm.planName}</td>
                    <td className="py-3 px-4 font-bold text-navy text-xs">{formatINR(pm.amount)}</td>
                    <td className="py-3 px-4 text-xs uppercase text-slate-500">{pm.method}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{formatDate(pm.date)}</td>
                    <td className="py-3 px-4 text-right">
                      {pm.status === 'success' ? (
                        <Badge variant="success" size="sm">Success</Badge>
                      ) : (
                        <Badge variant="danger" size="sm">Failed</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
