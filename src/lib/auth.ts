/**
 * Authentication helper functions for the frontend demo.
 * In production, replace with real JWT-based auth + API calls.
 */

import {
  getUserByEmail, getUserById, setSession, clearSession, getSession,
  createUser as dbCreateUser, checkPremiumExpiry
} from './db';
import type { User, AuthSession, UserRole } from '@/types';

export async function login(email: string, password: string, expectedRole?: UserRole): Promise<{ user: User } | { error: string }> {
  const user = await getUserByEmail(email);
  if (!user) return { error: 'No account found with this email address.' };
  if (user.password !== password) return { error: 'Incorrect password. Please try again.' };
  if (user.isBlocked) return { error: 'Your account has been blocked. Please contact support.' };
  if (expectedRole && user.role !== expectedRole) {
    return { error: expectedRole === 'admin' ? 'This is not an admin account.' : 'Please use the admin login page.' };
  }

  // Check premium expiry
  const updatedUser = await checkPremiumExpiry(user.id);

  const session: AuthSession = {
    userId: user.id,
    role: user.role,
    token: 'demo_token_' + Date.now(), // In production, this would be a JWT from the server
  };
  await setSession(session);
  return { user: updatedUser || user };
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  semester: number;
  programId?: string;
  courseId?: string;
  year?: number;
  selectedSubjectIds?: string[];
}): Promise<{ user: User } | { error: string }> {
  const existing = await getUserByEmail(data.email);
  if (existing) return { error: 'An account with this email already exists.' };

  const user = await dbCreateUser({
    ...data,
    role: 'student',
  });

  const session: AuthSession = {
    userId: user.id,
    role: user.role,
    token: 'demo_token_' + Date.now(),
  };
  await setSession(session);
  return { user };
}

export async function logout(): Promise<void> {
  await clearSession();
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await getUserById(session.userId);
  if (!user) {
    await clearSession();
    return null;
  }
  // Always check premium expiry on load
  return await checkPremiumExpiry(user.id);
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  return getSession();
}
