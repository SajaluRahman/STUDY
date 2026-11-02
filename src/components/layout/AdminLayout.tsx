'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  GraduationCap, LayoutDashboard, BookOpen, Video, Users, Crown,
  Receipt, Layers, Tag, Settings, Menu, X, LogOut, Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageSkeleton } from '@/components/ui/Skeleton';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/programs', label: 'Programs & Courses', icon: GraduationCap },
  { href: '/admin/semesters', label: 'Semesters', icon: Layers },
  { href: '/admin/subjects', label: 'Subjects', icon: Tag },
  { href: '/admin/materials', label: 'Materials', icon: BookOpen },
  { href: '/admin/videos', label: 'Videos', icon: Video },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/plans', label: 'Premium Plans', icon: Crown },
  { href: '/admin/payments', label: 'Payments', icon: Receipt },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return <PageSkeleton />;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex max-w-full overflow-x-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-navy flex flex-col transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">StudyHub</span>
              <span className="ml-1.5 text-[10px] font-medium text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded">Admin</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-white/10 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-teal-600/20 text-teal-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <link.icon className={cn('w-[18px] h-[18px]', isActive ? 'text-teal-400' : 'text-slate-500')} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-teal-600/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-teal-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 max-w-full overflow-x-hidden">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 lg:hidden">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-navy">Admin</span>
            </div>
            <div className="w-9" />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
