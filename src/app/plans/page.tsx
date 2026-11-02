'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { getActivePlans, getPaymentsByStudent, getCourses, getSemesters } from '@/lib/db';
import { formatINR, formatDate, daysRemaining } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { Plan, Payment, Course, Semester } from '@/types';
import {
  Crown, CheckCircle, Sparkles, Shield, Clock,
  ArrowRight, Zap, Check, HelpCircle, GraduationCap, CheckCircle2
} from 'lucide-react';

export default function PlansPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getActivePlans(),
      user ? getPaymentsByStudent(user.id) : Promise.resolve([]),
      getCourses(),
      getSemesters(),
    ]).then(([plansData, paymentsData, coursesData, semsData]) => {
      setPlans(plansData);
      setUserPayments(paymentsData);
      setCourses(coursesData);
      setSemesters(semsData);
      setLoading(false);
    });
  }, [user]);

  const daysLeft = user?.premiumExpiry ? daysRemaining(user.premiumExpiry) : 0;

  // Determine current active plan from user's payment records or fallback
  const currentPlan = useMemo(() => {
    if (!user || !user.isPremium) return null;
    const successfulPayments = userPayments
      .filter(p => p.status === 'success' && p.planId && !p.planId.startsWith('extra-'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (successfulPayments.length > 0) {
      const match = plans.find(p => p.id === successfulPayments[0].planId);
      if (match) return match;
    }

    return plans.find(p => p.validityDays >= 180) || plans[0] || null;
  }, [user, userPayments, plans]);

  const enrolledCourse = useMemo(() => {
    return courses.find(c => c.id === user?.courseId);
  }, [courses, user?.courseId]);

  return (
    <StudentLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy flex items-center gap-2.5">
            <Crown className="w-7 h-7 text-amber-500" />
            StudyHub Premium Plans
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Choose the subscription plan tailored to your exam schedule and academic semester milestones.
          </p>
        </div>

        {/* Current Plan Banner */}
        <Card className="p-6 bg-gradient-to-r from-teal-50/90 via-white to-amber-50/60 border border-teal-200/90 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                user?.isPremium
                  ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <Crown className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Your Current Plan:
                  </span>
                  <h3 className="font-extrabold text-navy text-xl">
                    {user?.isPremium
                      ? currentPlan ? currentPlan.name : 'StudyHub Premium Pass'
                      : 'Free Student Plan'}
                  </h3>
                  <Badge variant={user?.isPremium ? 'warning' : 'neutral'} size="md">
                    {user?.isPremium ? '✓ Premium Active' : 'Free Tier'}
                  </Badge>
                  {user?.isPremium && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
                  <span className="font-bold text-teal-800 bg-teal-50 border border-teal-200/70 px-2 py-0.5 rounded">
                    {enrolledCourse ? `${enrolledCourse.code}` : 'B.PHARM'}
                  </span>
                  <span>&bull;</span>
                  <span className="font-medium text-slate-700">Semester {user?.semester || 1}</span>
                  <span>&bull;</span>
                  <span className="font-medium text-slate-700">Academic Year {user?.year || (user?.semester ? Math.ceil(user.semester / 2) : 1)}</span>
                </div>

                <p className="text-xs text-slate-600 pt-0.5">
                  {user?.isPremium && user.premiumExpiry ? (
                    <>
                      Active for your enrolled academic semester & subjects until <span className="font-bold text-navy">{formatDate(user.premiumExpiry)}</span> ({daysLeft} days remaining). Extra subjects/semesters can be unlocked separately.
                    </>
                  ) : (
                    'Free access covers your chosen subjects. Premium unlocks all lecture masterclasses, notes, and solved exam papers for your semester.'
                  )}
                </p>

                {/* Extra Unlocks summary */}
                {user && ((user.unlockedSubjectIds && user.unlockedSubjectIds.length > 0) || (user.unlockedSemesterIds && user.unlockedSemesterIds.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {user.unlockedSubjectIds && user.unlockedSubjectIds.length > 0 && (
                      <span className="text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                        + {user.unlockedSubjectIds.length} Extra Subject{user.unlockedSubjectIds.length > 1 ? 's' : ''} Unlocked
                      </span>
                    )}
                    {user.unlockedSemesterIds && user.unlockedSemesterIds.length > 0 && (
                      <span className="text-[11px] font-semibold bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-md">
                        + {user.unlockedSemesterIds.length} Extra Semester{user.unlockedSemesterIds.length > 1 ? 's' : ''} Unlocked
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
              {user?.isPremium ? (
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium block">Subscription Status</span>
                  <span className="text-sm font-bold text-emerald-700 flex items-center gap-1 sm:justify-end">
                    <CheckCircle className="w-4 h-4" /> Active ({daysLeft} days left)
                  </span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium block">Account Tier</span>
                  <span className="text-sm font-bold text-slate-700">Limited Free Access</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Plans Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton count={3} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map(plan => {
              const isCurrentPlan = user?.isPremium && currentPlan?.id === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${
                    isCurrentPlan
                      ? 'border-2 border-emerald-500 shadow-emerald-500/10 shadow-lg ring-4 ring-emerald-500/15'
                      : plan.isMostPopular
                      ? 'border-2 border-teal-500 shadow-teal-500/10 shadow-lg ring-4 ring-teal-500/10'
                      : 'border border-slate-200'
                  }`}
                >
                  {isCurrentPlan ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Your Current Plan
                      </span>
                    </div>
                  ) : plan.isMostPopular ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-teal-600 to-teal-500 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Most Popular
                      </span>
                    </div>
                  ) : null}

                  <div className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-navy">{plan.name}</h3>
                        {isCurrentPlan && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                            Currently Active
                          </span>
                        )}
                      </div>
                      <Badge variant={isCurrentPlan ? 'success' : plan.isMostPopular ? 'primary' : 'neutral'}>
                        {plan.validityDays} Days
                      </Badge>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-extrabold text-navy">
                          {formatINR(plan.price)}
                        </span>
                        <span className="text-slate-500 text-sm">
                          / {plan.validityDays >= 365 ? 'yr' : plan.validityDays >= 180 ? 'sem' : 'mo'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {isCurrentPlan
                          ? `Expires on ${formatDate(user?.premiumExpiry || '')}`
                          : 'One-time demo payment. Instant access.'}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-6 mb-8 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                        Features Included:
                      </p>
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                            <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isCurrentPlan ? 'text-emerald-600' : 'text-teal-600'}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      variant={isCurrentPlan ? 'primary' : plan.isMostPopular ? 'primary' : 'outline'}
                      size="lg"
                      className={`w-full justify-center group ${isCurrentPlan ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                      onClick={() => router.push(`/checkout/${plan.id}`)}
                    >
                      <span>
                        {isCurrentPlan
                          ? 'Extend Current Plan'
                          : user?.isPremium
                          ? 'Switch to this Plan'
                          : 'Select Plan'}
                      </span>
                      <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Feature Comparison */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200">
          <h3 className="text-xl font-bold text-navy mb-6">Plan Comparison Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Features</th>
                  <th className="pb-3 font-semibold text-center">Free Plan</th>
                  <th className="pb-3 font-semibold text-center text-teal-600">Premium Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3.5 font-medium">Standard Study Materials</td>
                  <td className="py-3.5 text-center text-teal-600">✓ Free</td>
                  <td className="py-3.5 text-center text-teal-600 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-medium">Premium High-Yield Notes & Formula Sheets</td>
                  <td className="py-3.5 text-center text-slate-400">✗ Locked</td>
                  <td className="py-3.5 text-center text-teal-600 font-bold">✓ Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-medium">Recorded Video Masterclasses</td>
                  <td className="py-3.5 text-center text-slate-400">Limited (360p)</td>
                  <td className="py-3.5 text-center text-teal-600 font-bold">✓ Full HD 1080p</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-medium">Solved Previous Exam Papers</td>
                  <td className="py-3.5 text-center text-slate-400">✗ Locked</td>
                  <td className="py-3.5 text-center text-teal-600 font-bold">✓ All Semesters</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-medium">Support & Updates</td>
                  <td className="py-3.5 text-center text-slate-500">Community</td>
                  <td className="py-3.5 text-center text-teal-600 font-bold">Priority Academic Support</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
