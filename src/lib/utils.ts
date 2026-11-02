/**
 * Utility functions for formatting, access control, etc.
 */
import type { User, Material, Video } from '@/types';

/** Format a number as Indian Rupees (₹) with Indian number grouping */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format an ISO date string as DD MMM YYYY */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Format an ISO date string as DD MMM YYYY, HH:MM */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export type AccessReason =
  | 'granted'
  | 'requires_premium'
  | 'other_subject_locked'
  | 'other_semester_locked';

/**
 * Access-control helper:
 * - Admin users have full access to everything.
 * - Premium plan applies to the student's chosen academic subject and semester.
 * - Other subjects or other semesters require extra payment to unlock even if the student has Premium.
 * - Free students can only access free items in their chosen academic subjects and semester.
 */
export function getAccessReason(user: User | null, item: Material | Video): AccessReason {
  if (!user) return 'requires_premium';
  if (user.role === 'admin') return 'granted';

  // Check semester access: enrolled semester or extra unlocked semester
  const userSemId = `sem${user.semester}`;
  const isEnrolledSemester = item.semesterId === userSemId || item.semesterId === String(user.semester);
  const isUnlockedSemester = Boolean(user.unlockedSemesterIds?.includes(item.semesterId));

  if (!isEnrolledSemester && !isUnlockedSemester) {
    return 'other_semester_locked';
  }

  // Check subject access: enrolled subjects from signup or extra unlocked subject
  const isEnrolledSubject = user.selectedSubjectIds && user.selectedSubjectIds.length > 0
    ? user.selectedSubjectIds.includes(item.subjectId)
    : isEnrolledSemester;
  const isUnlockedSubject = Boolean(user.unlockedSubjectIds?.includes(item.subjectId));

  if (!isEnrolledSubject && !isUnlockedSubject) {
    return 'other_subject_locked';
  }

  // Check premium status for enrolled / unlocked content
  const isUserPremium = Boolean(
    user.isPremium && (!user.premiumExpiry || new Date(user.premiumExpiry) > new Date())
  );

  if (item.isPremium) {
    return isUserPremium ? 'granted' : 'requires_premium';
  }

  return 'granted';
}

export function canAccess(user: User | null, item: Material | Video): boolean {
  return getAccessReason(user, item) === 'granted';
}

/** Generate a short unique ID */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/** Clamp a string to N characters */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.substring(0, n) + '…' : str;
}

/** Days remaining from an expiry date */
export function daysRemaining(expiryIso: string): number {
  const diff = new Date(expiryIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** Check if a link is embeddable (YouTube or Google Drive) */
export function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  
  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  
  return null;
}

/** Export data as CSV */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = String(row[h] ?? '');
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    ),
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** cn utility for classnames */
export function cn(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ');
}
