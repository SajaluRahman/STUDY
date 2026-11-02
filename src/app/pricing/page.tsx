'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { getActivePlans, getPaymentsByStudent } from '@/lib/db';
import { formatINR, formatDate, daysRemaining } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { Plan, Payment } from '@/types';
import {
  Crown, CheckCircle, Sparkles, Shield, Zap, HelpCircle,
  ArrowRight, BookOpen, Video, Award, Clock, CheckCircle2
} from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getActivePlans(),
      user ? getPaymentsByStudent(user.id) : Promise.resolve([]),
    ]).then(([plansData, paymentsData]) => {
      setPlans(plansData);
      setUserPayments(paymentsData);
      setLoading(false);
    });
  }, [user]);

  // Determine current active plan from user's payments or fallback
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

  const daysLeft = user?.premiumExpiry ? daysRemaining(user.premiumExpiry) : 0;

  const handleChoosePlan = (planId: string) => {
    if (!user) {
      router.push(`/login?redirect=/checkout/${planId}`);
    } else {
      router.push(`/checkout/${planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header Section */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-16 pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50/50 via-white to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <Badge variant="warning" size="md" className="mb-4">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Transparent & Affordable Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-navy tracking-tight max-w-3xl mx-auto">
              Invest in Your Semester Success with <span className="text-teal-600">StudyHub Premium</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Get unlimited access to high-yield semester notes, expert video lectures, previous exam solutions, and personalized revision guides.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
          {/* If user logged in: Current Plan Banner */}
          {user && (
            <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-amber-50/60 border border-teal-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  user.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Your Current Plan:
                    </span>
                    <span className="font-bold text-navy text-sm sm:text-base">
                      {user.isPremium ? (currentPlan ? currentPlan.name : 'StudyHub Premium Pass') : 'Free Student Plan'}
                    </span>
                    <Badge variant={user.isPremium ? 'warning' : 'neutral'} size="sm">
                      {user.isPremium ? 'Active' : 'Free Tier'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {user.isPremium && user.premiumExpiry ? (
                      <>Valid until <span className="font-semibold text-navy">{formatDate(user.premiumExpiry)}</span> ({daysLeft} days remaining) for your enrolled semester.</>
                    ) : (
                      'You are currently on the limited Free Tier. Subscribe below to unlock all lectures & notes for your semester.'
                    )}
                  </p>
                </div>
              </div>
              <Link href="/plans">
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  Manage Subscription
                </Button>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
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
                          / {plan.validityDays >= 365 ? 'year' : plan.validityDays >= 180 ? 'semester' : 'month'}
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
                        Everything included:
                      </p>
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
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
                      onClick={() => handleChoosePlan(plan.id)}
                    >
                      <span>
                        {isCurrentPlan
                          ? 'Extend Current Plan'
                          : user?.isPremium
                          ? 'Switch to this Plan'
                          : 'Get Started'}
                      </span>
                      <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Value Props Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 text-teal-600">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-navy text-base mb-1">Instant Activation</h4>
                <p className="text-sm text-slate-600">
                  Instant activation upon mock payment simulation. Start studying immediately without waiting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-navy text-base mb-1">Zero Hidden Costs</h4>
                <p className="text-sm text-slate-600">
                  All notes, solved question banks, and lecture series are included in your active plan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-navy text-base mb-1">Guaranteed Exam Relevance</h4>
                <p className="text-sm text-slate-600">
                  Curated strictly adhering to the university syllabus and latest exam blueprints.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-navy">Frequently Asked Questions</h3>
              <p className="text-slate-600 text-sm mt-1">Have questions about plans and access?</p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-white border border-slate-200/80">
                <h5 className="font-semibold text-navy text-sm mb-1.5">How does the demo payment work?</h5>
                <p className="text-slate-600 text-sm">
                  Our payment gateway is an authentic Razorpay mock simulation. You can test both successful and failed payment flows without entering real credit card or bank details.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200/80">
                <h5 className="font-semibold text-navy text-sm mb-1.5">Can I access study material offline?</h5>
                <p className="text-slate-600 text-sm">
                  Yes, study material links open high-quality Google Drive PDFs that can be saved directly to your device for offline reading.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200/80">
                <h5 className="font-semibold text-navy text-sm mb-1.5">What happens when my plan expires?</h5>
                <p className="text-slate-600 text-sm">
                  You retain access to all free materials and videos. Premium items will show an unlock prompt which you can renew at any time from your profile or plans page.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
