'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { getPlanById, purchasePlan } from '@/lib/db';
import { formatINR, formatDate, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { Plan, Payment, PaymentMethod } from '@/types';
import {
  ShieldCheck, CheckCircle2, XCircle, ArrowLeft,
  CreditCard, Smartphone, Building, RefreshCw,
  Crown, Sparkles, Receipt, Download, AlertTriangle, ArrowRight
} from 'lucide-react';

function CheckoutContent() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const planId = params.planId as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  // Checkout states: 'checkout' | 'processing' | 'success' | 'failed'
  const [checkoutState, setCheckoutState] = useState<'checkout' | 'processing' | 'success' | 'failed'>('checkout');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  // Mock Form inputs
  const [upiId, setUpiId] = useState('student@oksbi');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  useEffect(() => {
    if (!planId) return;
    getPlanById(planId).then(p => {
      setPlan(p);
      setLoading(false);
    });
  }, [planId]);

  if (loading) {
    return (
      <StudentLayout>
        <PageSkeleton />
      </StudentLayout>
    );
  }

  if (!plan) {
    return (
      <StudentLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-navy">Plan Not Found</h2>
          <p className="text-sm text-slate-600 mt-2">The selected plan could not be retrieved.</p>
          <Link href="/plans" className="mt-4 inline-block">
            <Button variant="primary">Return to Plans</Button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const handleSimulatePayment = async (simulateSuccess: boolean) => {
    if (!user) {
      addToast({ type: 'error', title: 'Authentication Required', message: 'Please log in to continue.' });
      router.push('/login');
      return;
    }

    setCheckoutState('processing');

    // Realistic mock processing delay (1.2 seconds)
    setTimeout(async () => {
      try {
        const paymentRecord = await purchasePlan(user.id, plan.id, selectedMethod, simulateSuccess);
        setCompletedPayment(paymentRecord);
        await refreshUser();

        if (simulateSuccess) {
          setCheckoutState('success');
          addToast({
            type: 'success',
            title: 'Payment Successful!',
            message: `StudyHub ${plan.name} has been activated.`,
          });
        } else {
          setCheckoutState('failed');
          addToast({
            type: 'error',
            title: 'Payment Failed',
            message: 'Simulated payment was declined by the bank gateway.',
          });
        }
      } catch (err) {
        console.error('Payment error:', err);
        setCheckoutState('failed');
      }
    }, 1200);
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        {checkoutState === 'checkout' && (
          <div>
            <Link
              href="/plans"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Plans
            </Link>
          </div>
        )}

        {/* ─── State 1: Checkout Form ────────────────────────────────────── */}
        {checkoutState === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Order Summary */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-navy pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-teal-600" />
                  Order Summary
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-navy">{plan.name} Plan</h3>
                      <p className="text-xs text-slate-500">{plan.validityDays} days complete access</p>
                    </div>
                    <span className="font-extrabold text-navy text-lg">
                      {formatINR(plan.price)}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between text-xs">
                      <span>Base Plan Price</span>
                      <span>{formatINR(plan.price)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>GST (18% Included)</span>
                      <span>₹0 (Inclusive)</span>
                    </div>
                    <div className="flex justify-between text-xs text-teal-700 font-medium">
                      <span>Promo Discount</span>
                      <span>Applied (Demo)</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                    <span className="font-bold text-navy">Total Payable</span>
                    <span className="text-2xl font-black text-teal-700">
                      {formatINR(plan.price)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500 space-y-2">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      100% Mock Sandbox Demo
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      No real payment details or bank accounts are debited. All transactions update your client demo state instantly.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Mock Razorpay Gateway Container */}
            <div className="lg:col-span-7">
              <Card className="border-2 border-slate-300 shadow-lg overflow-hidden bg-white">
                {/* Razorpay-style branded top bar */}
                <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white text-xs">
                      SH
                    </div>
                    <div>
                      <h4 className="text-sm font-bold tracking-tight">StudyHub Gateway</h4>
                      <p className="text-[10px] text-teal-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> 256-Bit SSL Demo Sandbox
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300">Amount</span>
                    <p className="text-sm font-bold text-teal-300">{formatINR(plan.price)}</p>
                  </div>
                </div>

                {/* Demo Notice Banner */}
                <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center gap-2 text-amber-800 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Interactive Payment Demo: choose success or failure below to test the full flow.</span>
                </div>

                {/* Method Navigation Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50/80">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('upi')}
                    className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-all ${
                      selectedMethod === 'upi'
                        ? 'border-teal-600 text-teal-700 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    UPI / QR
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-all ${
                      selectedMethod === 'card'
                        ? 'border-teal-600 text-teal-700 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Debit/Credit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('netbanking')}
                    className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-all ${
                      selectedMethod === 'netbanking'
                        ? 'border-teal-600 text-teal-700 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    Netbanking
                  </button>
                </div>

                {/* Form Body */}
                <div className="p-6">
                  {selectedMethod === 'upi' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-3">
                          {/* Mini QR code illustration */}
                          <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center font-mono text-[8px] text-slate-400">
                            [QR CODE]
                          </div>
                          <div>
                            <p className="text-xs font-bold text-navy">Scan with any UPI App</p>
                            <p className="text-[11px] text-slate-500">GPay, PhonePe, Paytm, BHIM</p>
                          </div>
                        </div>
                        <Badge variant="neutral" size="sm">Auto-Verify</Badge>
                      </div>

                      <div className="relative">
                        <Input
                          label="Or Enter Virtual Payment Address (UPI ID)"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="username@bank"
                        />
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'card' && (
                    <div className="space-y-3">
                      <Input
                        label="Card Number"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• 6789"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Expiry (MM/YY)"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                        />
                        <Input
                          label="CVV"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          placeholder="123"
                          type="password"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'netbanking' && (
                    <div className="space-y-3">
                      <label className="block text-xs font-medium text-slate-700">
                        Select Bank
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map(bank => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                              selectedBank === bank
                                ? 'border-teal-500 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Simulation Buttons */}
                  <div className="mt-8 pt-5 border-t border-slate-100 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
                      Simulate Gateway Action
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        className="w-full justify-center shadow-md bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                        onClick={() => handleSimulatePayment(true)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Simulate Success ({formatINR(plan.price)})
                      </Button>

                      <Button
                        type="button"
                        variant="danger"
                        size="lg"
                        className="w-full justify-center font-semibold"
                        onClick={() => handleSimulatePayment(false)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Simulate Failure
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ─── State 2: Processing Animation ───────────────────────────── */}
        {checkoutState === 'processing' && (
          <Card className="p-12 text-center max-w-lg mx-auto bg-white border border-slate-200 shadow-xl">
            <div className="w-16 h-16 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-bold text-navy">Processing Demo Payment...</h3>
            <p className="text-sm text-slate-500 mt-2">
              Communicating securely with bank simulator. Please do not close or refresh this tab.
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Securing transaction token
            </div>
          </Card>
        )}

        {/* ─── State 3: Payment Success ─────────────────────────────────── */}
        {checkoutState === 'success' && completedPayment && (
          <div className="max-w-xl mx-auto space-y-6">
            <Card className="p-8 bg-white border border-slate-200 shadow-xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-5 ring-8 ring-teal-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <Badge variant="success" size="md" className="mb-2">
                Transaction Completed
              </Badge>
              <h2 className="text-2xl font-black text-navy">Payment Successful!</h2>
              <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                Your account has been upgraded to <strong className="text-navy">{plan.name} Premium</strong> with full access to all semester content.
              </p>

              {/* Receipt Box */}
              <div className="mt-6 text-left bg-slate-50 rounded-2xl p-5 border border-slate-200/90 text-sm space-y-2.5">
                <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-200">
                  <span>Transaction ID</span>
                  <span className="font-mono text-slate-700 font-semibold">{completedPayment.transactionId}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Plan Name</span>
                  <span className="font-bold text-navy">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Validity</span>
                  <span className="font-semibold text-slate-800">{plan.validityDays} Days</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Payment Method</span>
                  <span className="uppercase font-semibold text-slate-800">{completedPayment.method}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Date & Time</span>
                  <span className="text-slate-800">{formatDateTime(completedPayment.date)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold">
                  <span className="text-navy">Amount Paid</span>
                  <span className="text-teal-700 text-base">{formatINR(completedPayment.amount)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/materials" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full justify-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Explore Materials Now
                  </Button>
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full justify-center">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* ─── State 4: Payment Failed ─────────────────────────────────── */}
        {checkoutState === 'failed' && (
          <div className="max-w-xl mx-auto space-y-6">
            <Card className="p-8 bg-white border border-red-200 shadow-xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5 ring-8 ring-red-50">
                <XCircle className="w-9 h-9" />
              </div>

              <Badge variant="danger" size="md" className="mb-2">
                Transaction Declined
              </Badge>
              <h2 className="text-2xl font-black text-navy">Payment Failed</h2>
              <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
                The simulated transaction could not be processed. This test simulation failed as requested.
              </p>

              {completedPayment && (
                <div className="mt-4 p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs text-red-700 font-mono">
                  Failed Txn Ref: {completedPayment.transactionId}
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto justify-center bg-teal-600 hover:bg-teal-700"
                  onClick={() => setCheckoutState('checkout')}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/plans" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full justify-center">
                    Choose Another Plan
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}
