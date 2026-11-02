'use client';

import Link from 'next/link';
import { GraduationCap, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">StudyHub</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your complete platform for academic excellence. Access study materials, video lectures, and exam preparation resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link href="/materials" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Study Materials</Link></li>
              <li><Link href="/videos" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Video Lectures</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Premium Plans</Link></li>
              <li><Link href="/register" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">Register</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Support</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-slate-400">help@studyhub.com</span></li>
              <li><span className="text-sm text-slate-400">+91 98765 43210</span></li>
              <li><span className="text-sm text-slate-400">Mon–Sat: 9am–6pm IST</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-slate-200">Legal</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-slate-400 cursor-default">Privacy Policy</span></li>
              <li><span className="text-sm text-slate-400 cursor-default">Terms of Service</span></li>
              <li><span className="text-sm text-slate-400 cursor-default">Refund Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2026 StudyHub. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for students
          </p>
        </div>
      </div>
    </footer>
  );
}
