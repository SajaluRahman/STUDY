'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { getActivePlans, getPrograms, getCourses } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import type { Plan, Program, Course } from '@/types';
import {
  BookOpen, Video, Crown, Shield, Download, Clock, Users, Star,
  CheckCircle, ChevronDown, ChevronUp, ArrowRight, Sparkles,
  GraduationCap, FileText, Play, Zap, Award, Target, TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getActivePlans(), getPrograms(), getCourses()]).then(([p, progs, crses]) => {
      setPlans(p);
      setPrograms(progs);
      setCourses(crses);
    });
  }, []);

  const features = [
    { icon: BookOpen, title: 'Study Materials', description: 'Curated PDFs, notes, and reference materials organized by semester and subject.', color: 'bg-blue-50 text-blue-600' },
    { icon: Video, title: 'Video Lectures', description: 'High-quality video lectures from expert educators covering every topic.', color: 'bg-purple-50 text-purple-600' },
    { icon: Target, title: 'Exam Preparation', description: 'Previous year papers, practice tests, and revision guides for exam success.', color: 'bg-amber-50 text-amber-600' },
    { icon: Download, title: 'Download & Learn', description: 'Download materials for offline access. Study anytime, anywhere.', color: 'bg-emerald-50 text-emerald-600' },
    { icon: Zap, title: 'Instant Access', description: 'Get instant access to all free resources. No waiting, no hassle.', color: 'bg-rose-50 text-rose-600' },
    { icon: Shield, title: 'Trusted Content', description: 'All materials are vetted by subject experts for accuracy and quality.', color: 'bg-teal-50 text-teal-600' },
  ];

  const steps = [
    { step: '01', title: 'Create Account', description: 'Sign up for free in seconds with just your email.', icon: Users },
    { step: '02', title: 'Browse Materials', description: 'Explore materials organized by semester and subject.', icon: BookOpen },
    { step: '03', title: 'Unlock Premium', description: 'Upgrade to access exclusive content and features.', icon: Crown },
    { step: '04', title: 'Ace Your Exams', description: 'Study smarter and achieve academic excellence.', icon: Award },
  ];

  const stats = [
    { value: '10,000+', label: 'Active Students', icon: Users },
    { value: '500+', label: 'Study Materials', icon: FileText },
    { value: '200+', label: 'Video Lectures', icon: Play },
    { value: '95%', label: 'Success Rate', icon: TrendingUp },
  ];

  const faqs = [
    { q: 'What is StudyHub Pharmacy Portal?', a: 'StudyHub is a dedicated pharmacy education portal providing curated notes, video lectures, and GPAT resources for B.Pharm, M.Pharm, Pharm.D, and D.Pharm students following standard PCI guidelines.' },
    { q: 'Is StudyHub free to use?', a: 'Yes! StudyHub offers a generous collection of free study materials and videos. You can upgrade to Premium for access to our complete library of exclusive content.' },
    { q: 'What does Premium include?', a: 'Premium members get complete access to all pharmacy study materials, GPAT test series, clinical case reviews, previous year solved university papers, and HD pharmacology video lectures.' },
    { q: 'Can I cancel my Premium subscription?', a: 'Premium plans are valid for their duration (Monthly, Semester, or Yearly). There are no recurring charges — you simply purchase the plan that works best for you.' },
    { q: 'How do I access study materials?', a: 'After creating an account, browse materials by semester and subject. Free materials open instantly, while Premium materials require an active subscription.' },
    { q: 'Is my payment secure?', a: 'Absolutely. We use industry-standard encryption and trusted payment gateways to ensure your transactions are completely secure.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl" />
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-blue-100/30 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-amber-100/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 mb-6">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">Dedicated Pharmacy Learning & GPAT Portal</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy leading-tight tracking-tight">
                Master Pharmacy,{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                    Ace GPAT & Exams
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="#0E8F8A" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                  </svg>
                </span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Your specialized destination for B.Pharm, M.Pharm, Pharm.D & D.Pharm. Access PCI-aligned study materials, pharmacology lectures, medicinal chemistry SAR notes, and high-yield GPAT prep.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" icon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto text-base px-8">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                    View Plans
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-500" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-500" />
                  <span>PCI Syllabus aligned</span>
                </div>
              </div>
            </div>

            {/* Hero Illustration (CSS/SVG) */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Main card */}
                <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-200/80 p-6 z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy">Pharmacy Dashboard</h3>
                      <p className="text-xs text-slate-500">All your pharmacy notes & videos in one place</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: 'Human Anatomy & Physiology Notes', sem: 'Sem 1', course: 'B.Pharm', isPrem: false },
                      { title: 'Medicinal Chemistry SAR & Synthesis', sem: 'Sem 5', course: 'B.Pharm', isPrem: true },
                      { title: 'Pharmacology ANS & CVS Mechanism', sem: 'Sem 4', course: 'B.Pharm', isPrem: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-blue-100 text-blue-600' : i === 1 ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                          <p className="text-xs text-slate-400">{item.course} &bull; {item.sem}</p>
                        </div>
                        <Badge variant={item.isPrem ? 'premium' : 'free'}>{item.isPrem ? 'Premium' : 'Free'}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-teal-600 font-medium">Study Streak</p>
                        <p className="text-lg font-bold text-teal-700">12 Days 🔥</p>
                      </div>
                      <div className="flex -space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-teal-200 border-2 border-white flex items-center justify-center">
                            <Star className="w-3 h-3 text-teal-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-slate-200/80 p-3 animate-float z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Premium</p>
                      <p className="text-[10px] text-slate-500">Unlock all</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-slate-200/80 p-3 animate-float" style={{ animationDelay: '1.5s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">A+ Grade</p>
                      <p className="text-[10px] text-slate-500">Top scorer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 mb-3">
                  <stat.icon className="w-6 h-6 text-teal-600" />
                </div>
                <p className="text-3xl font-extrabold text-navy">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Programs & Degrees Showcase */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="teal" className="mb-4">
              <GraduationCap className="w-3.5 h-3.5 mr-1" /> Academic Curriculum
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Select Your Academic Program & Degree
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Structured study resources, year-wise syllabus topics, and lecture series for Undergraduate, Postgraduate, and Diploma courses.
            </p>

            {/* Program Filter Pills */}
            <div className="mt-8 inline-flex p-1.5 bg-slate-200/70 rounded-2xl gap-1 flex-wrap justify-center">
              <button
                onClick={() => setSelectedProgramId('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedProgramId === 'all'
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                All Programs ({courses.length})
              </button>
              {programs.map(prog => (
                <button
                  key={prog.id}
                  onClick={() => setSelectedProgramId(prog.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    selectedProgramId === prog.id
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-slate-600 hover:text-navy'
                  }`}
                >
                  {prog.code} &bull; {prog.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(selectedProgramId === 'all'
              ? courses
              : courses.filter(c => c.programId === selectedProgramId)
            ).map(course => {
              const prog = programs.find(p => p.id === course.programId);
              return (
                <Card key={course.id} hover className="p-6 flex flex-col justify-between border-slate-200 bg-white shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                        {prog?.code || 'DEGREE'}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {course.durationYears} Years &bull; {course.totalSemesters} Sems
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-navy mb-0.5">{course.code}</h3>
                    <p className="text-xs font-semibold text-slate-700 mb-2">{course.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <Link
                      href={`/materials?program=${course.programId}&course=${course.id}`}
                      className="w-full"
                    >
                      <Button variant="outline" size="sm" className="w-full text-xs" icon={<BookOpen className="w-3.5 h-3.5" />}>
                        Study Notes & PDFs
                      </Button>
                    </Link>
                    <Link
                      href={`/videos?program=${course.programId}&course=${course.id}`}
                      className="w-full"
                    >
                      <Button variant="ghost" size="sm" className="w-full text-xs text-teal-700 hover:bg-teal-50" icon={<Video className="w-3.5 h-3.5" />}>
                        Video Lectures
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="info" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Everything You Need to Excel
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              A comprehensive suite of tools and resources designed to help you succeed in your academic journey.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} hover padding="lg">
                <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="info" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Get Started in Minutes
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Four simple steps to unlock your academic potential.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-teal-200 shadow-sm mb-5">
                  <step.icon className="w-7 h-7 text-teal-600" />
                </div>
                <div className="absolute -top-2 -right-2 sm:right-auto sm:left-1/2 sm:ml-6 w-8 h-8 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] border-t-2 border-dashed border-teal-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="premium" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Choose the plan that fits your academic schedule. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.isMostPopular
                    ? 'border-teal-500 bg-white shadow-xl shadow-teal-100/50'
                    : 'border-slate-200 bg-white shadow-sm hover:shadow-md'
                }`}
              >
                {plan.isMostPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge variant="premium" className="px-4 py-1 text-xs shadow-sm">⭐ Most Popular</Badge>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-navy">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-navy">{formatINR(plan.price)}</span>
                    <span className="text-slate-500 ml-1">/ {plan.validityDays} days</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle className="w-4.5 h-4.5 text-teal-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <Button
                    variant={plan.isMostPopular ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="info" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-navy pr-4">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 animate-slide-down">
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-br from-navy via-[#1a3a6b] to-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Join thousands of students who are already studying smarter with StudyHub.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 bg-teal-500 hover:bg-teal-600">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
