'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(form.email, form.password, 'student');
    setLoading(false);
    if ('error' in result) {
      addToast({ type: 'error', title: 'Login Failed', message: result.error });
      return;
    }
    await refreshUser();
    addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${result.user.name}` });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 mb-4 shadow-lg shadow-teal-200">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy">Welcome Back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to continue your learning journey</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                error={errors.email}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon={<Lock className="w-4 h-4" />}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                error={errors.password}
              />
              <Button type="submit" loading={loading} className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                  Sign up free
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center mb-3">Demo credentials</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ email: 'student@studyhub.com', password: 'Student@123' })}
                  className="px-3 py-2 text-xs rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer font-medium"
                >
                  Free B.Pharm
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ email: 'premium@studyhub.com', password: 'Premium@123' })}
                  className="px-3 py-2 text-xs rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all cursor-pointer font-medium"
                >
                  Premium B.Pharm
                </button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Admin?{' '}
            <Link href="/admin/login" className="text-teal-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
