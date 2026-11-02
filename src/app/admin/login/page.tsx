'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(form.email, form.password, 'admin');
    setLoading(false);
    if ('error' in result) {
      addToast({ type: 'error', title: 'Login Failed', message: result.error });
      return;
    }
    await refreshUser();
    addToast({ type: 'success', title: 'Admin Access Granted' });
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 mb-4 shadow-lg shadow-teal-900/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Admin Panel</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to manage StudyHub</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="admin@studyhub.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>
            <Button type="submit" loading={loading} className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center mb-3">Demo credentials</p>
            <button
              type="button"
              onClick={() => setForm({ email: 'admin@studyhub.com', password: 'Admin@123' })}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
            >
              Fill Admin Credentials
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/login" className="text-teal-400 hover:underline">
            ← Back to student login
          </Link>
        </p>
      </div>
    </div>
  );
}
