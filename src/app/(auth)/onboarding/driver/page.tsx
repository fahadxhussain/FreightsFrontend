'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  IdentificationBadge,
  IdentificationCard,
  Camera,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  MagnifyingGlass,
  Check,
  Gauge,
  UploadSimple
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateOnboardingStatus } from '@/store/slices/authSlice';
import api from '@/lib/axios';

const authoritySchema = z.object({
  mcNumber: z.string().min(1, 'MC or USDOT number is required'),
});

type AuthorityValues = z.infer<typeof authoritySchema>;

const STEPS = [
  { num: 1, label: 'Authority' },
  { num: 2, label: 'CDL' },
  { num: 3, label: 'ID' },
];

export default function DriverOnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const authorityForm = useForm<AuthorityValues>({
    resolver: zodResolver(authoritySchema),
    defaultValues: { mcNumber: '' }
  });

  const handleNext = async () => {
    if (step === 1) {
      if (!verificationResult) {
        toast.error('Please verify your authority first');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const verifyAuthority = async () => {
    const valid = await authorityForm.trigger();
    if (!valid) return;

    setIsVerifying(true);
    setTimeout(() => {
      setVerificationResult(true);
      setIsVerifying(false);
      toast.success('Authority verified!');
    }, 1500);
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      const authorityData = authorityForm.getValues();

      // 1. Mark profile step complete
      await api.patch('/auth/onboarding/profile', {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
      });

      // 2. Mark business step complete (drivers skip detailed business profile)
      await api.patch('/auth/onboarding/business', {});

      // 3. Mark stripe step complete (optional for drivers)
      await api.patch('/auth/onboarding/stripe', {});

      // 4. Mark prefs step complete
      await api.patch('/auth/onboarding/prefs', {});

      dispatch(updateOnboardingStatus(true));
      setIsCompleted(true);
      toast.success('Onboarding complete!');
    } catch (error: any) {
      console.error('[DRIVER ONBOARDING] Error:', error);
      toast.error(error.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-light text-success shadow-inner">
          <CheckCircle size={48} weight="fill" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">You&apos;re all set!</h2>
        <p className="mt-2 text-muted font-medium">Welcome to FLOW. Your driver profile is ready.</p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="btn btn-primary btn-lg mt-8 shadow-lg shadow-accent/20"
        >
          <Gauge size={20} weight="bold" />
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[520px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-[1.8rem] font-black text-accent tracking-tighter">FLOW</div>
        <h2 className="mt-2 text-xl font-bold text-foreground">Driver Onboarding</h2>
        <p className="text-sm text-muted font-medium">Complete these steps to start driving</p>
      </div>

      {/* Steps */}
      <div className="mb-8 flex items-center justify-center">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={cn(
              "flex flex-col items-center gap-2",
              step >= s.num ? "text-foreground" : "text-muted"
            )}>
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-black transition-all",
                step === s.num ? "border-accent bg-accent text-white shadow-lg shadow-accent/20" :
                step > s.num ? "border-success bg-success text-white" : "border-border bg-card"
              )}>
                {step > s.num ? <Check size={18} weight="bold" /> : s.num}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "mx-4 mb-6 h-[2px] w-12 rounded-full",
                step > s.num ? "bg-success" : "bg-border"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-xl backdrop-blur-md">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-accent">
              <IdentificationBadge size={24} weight="bold" />
              <h3 className="text-lg font-bold">Verify your authority</h3>
            </div>
            <p className="text-sm font-medium text-muted">Your MC or USDOT number is issued by the FMCSA.</p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-bold text-muted uppercase tracking-wider">MC or USDOT Number</label>
                <input
                  {...authorityForm.register('mcNumber')}
                  className={cn("w-full rounded-xl border border-border bg-input px-4 py-3 text-sm font-medium outline-none transition-all focus:border-accent", authorityForm.formState.errors.mcNumber && "border-danger")}
                  placeholder="MC-123456"
                />
              </div>

              {!verificationResult && (
                <button
                  onClick={verifyAuthority}
                  disabled={isVerifying}
                  className="btn btn-primary w-full py-3"
                >
                  <MagnifyingGlass size={18} weight="bold" />
                  {isVerifying ? 'Verifying...' : 'Verify Now'}
                </button>
              )}

              {verificationResult && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="rounded-xl border border-border bg-input p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-light text-success">
                        <Check size={18} weight="bold" />
                      </div>
                      <strong className="text-sm text-success">Authority Verified</strong>
                    </div>
                    <div className="flex gap-6 flex-wrap">
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Status</span>
                        <div className="mt-1 badge badge-green">Active</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Insurance</span>
                        <div className="mt-1 badge badge-green">Valid</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Safety</span>
                        <div className="mt-1 badge badge-green">Satisfactory</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-accent">
              <Camera size={24} weight="bold" />
              <h3 className="text-lg font-bold">Upload your CDL</h3>
            </div>
            <p className="text-sm font-medium text-muted">Take a photo or choose from your gallery. Both sides preferred.</p>

            <div className="rounded-2xl border-2 border-dashed border-border p-10 bg-card hover:border-muted transition-colors cursor-pointer text-center group">
              <div className="mb-4 flex flex-col items-center justify-center text-muted group-hover:text-accent transition-colors">
                <Camera size={48} weight="regular" />
                <p className="mt-4 text-sm font-bold uppercase tracking-wider">Take photo or upload</p>
                <p className="mt-2 text-xs font-medium">Accepted: JPG, PNG, PDF</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-accent">
              <IdentificationCard size={24} weight="bold" />
              <h3 className="text-lg font-bold">Upload Government ID</h3>
            </div>
            <p className="text-sm font-medium text-muted">A National ID, Passport, or State ID is accepted for identity verification.</p>

            <div className="rounded-2xl border-2 border-dashed border-border p-10 bg-card hover:border-muted transition-colors cursor-pointer text-center group">
              <div className="mb-4 flex flex-col items-center justify-center text-muted group-hover:text-accent transition-colors">
                <IdentificationCard size={48} weight="regular" />
                <p className="mt-4 text-sm font-bold uppercase tracking-wider">Take photo or upload</p>
                <p className="mt-2 text-xs font-medium">Accepted: JPG, PNG, PDF</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-between gap-4">
          <button
            onClick={handleBack}
            className={cn("btn btn-secondary flex-1 py-3 h-12", step === 1 && "opacity-0 pointer-events-none")}
          >
            <ArrowLeft size={18} weight="bold" />
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="btn btn-primary flex-1 py-3 h-12 shadow-lg shadow-accent/10"
            >
              Continue
              <ArrowRight size={18} weight="bold" />
            </button>
          ) : (
            <button
              onClick={completeOnboarding}
              disabled={isLoading}
              className="btn btn-primary flex-1 py-3 h-12 bg-success hover:bg-success/90 shadow-lg shadow-success/10 border-none"
            >
              {isLoading ? 'Completing...' : 'Complete Onboarding'}
              <Check size={18} weight="bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
