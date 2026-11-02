'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-sm shadow-teal-200 group-hover:shadow-md group-hover:shadow-teal-200 transition-all">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-navy tracking-tight">StudyHub</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
                Pharmacy
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all">
              Home
            </Link>
            <Link href="/pricing" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all">
              Pricing
            </Link>
            {user && user.role === 'student' && (
              <>
                <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all">
                  Dashboard
                </Link>
                <Link href="/materials" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all">
                  Materials
                </Link>
                <Link href="/videos" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all">
                  Videos
                </Link>
              </>
            )}
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={user.role === 'admin' ? '/admin/dashboard' : '/profile'}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  {user.name}
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut className="w-4 h-4" />}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up Free</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all">
              Home
            </Link>
            <Link href="/pricing" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all">
              Pricing
            </Link>
            {user && user.role === 'student' && (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all">
                  Dashboard
                </Link>
                <Link href="/materials" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all">
                  Materials
                </Link>
                <Link href="/videos" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all">
                  Videos
                </Link>
              </>
            )}
            <div className="pt-3 border-t border-slate-100">
              {user ? (
                <div className="space-y-1">
                  <Link href={user.role === 'admin' ? '/admin/dashboard' : '/profile'} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-all">
                    Profile
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Log In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1">
                    <Button size="sm" className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
