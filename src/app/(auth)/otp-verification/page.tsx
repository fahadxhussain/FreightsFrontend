"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, EnvelopeOpen, Warning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // ms

/** Retry wrapper for transient failures (network errors / 5xx) */
async function withRetry<T>(
  fn: () => Promise<T>,
  operationName: string,
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error.response?.status;
      const isNetworkError = !error.response;
      const isServerError = status >= 500 && status < 600;
      const isRateLimited = status === 429;

      const shouldRetry = isNetworkError || isServerError || isRateLimited;
      if (!shouldRetry || attempt === MAX_RETRIES) {
        throw error;
      }

      const delay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      toast.info(`${operationName} failed. Retrying in ${delay / 1000}s…`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "broker";
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sendError, setSendError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mask email: show first 3 chars and domain
  const maskedEmail = email.replace(
    /^(.{1,3})[^@]*(@.*)$/,
    (_, start: string, domain: string) => start + "••••" + domain,
  );

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d?$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-advance to next field
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    // Focus the next empty or last
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  }, []);

  const isComplete = otp.every((digit) => digit !== "");

  async function handleVerify() {
    if (!isComplete) return;
    setIsLoading(true);
    try {
      await withRetry(
        () => api.post("/auth/verify-otp", { email, code: otp.join("") }),
        "Verification",
      );
      toast.success("Email verified successfully!");
      // Redirect to role-specific onboarding per spec
      if (role === "independent_driver" || role === "driver") {
        router.push("/onboarding/driver");
      } else if (role === "carrier") {
        router.push("/onboarding/carrier");
      } else {
        router.push("/onboarding/broker");
      }
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || "Invalid or expired code";
      toast.error(msg);
      // Clear inputs on bad code so user can retype
      if (error.response?.status === 400) {
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function doSendOTP(showToast = true) {
    setSendError(null);
    try {
      await withRetry(
        () => api.post("/auth/send-verification-otp", { email }),
        "Send code",
      );
      if (showToast) toast.success("Verification code sent!");
      setCooldown(60);
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || "Failed to send code";
      setSendError(msg);
      if (showToast) toast.error(msg);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    await doSendOTP(true);
  }

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Backend auto-sends OTP during registration; user can resend if needed

  if (!email) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Warning size={40} className="text-warning" />
        <p className="text-sm text-muted font-medium">No email provided.</p>
        <Link href="/register" className="btn btn-primary text-sm">
          Go to Registration
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Link
        href="/register"
        className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft size={14} weight="bold" />
        Back
      </Link>

      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-light shadow-inner">
          <EnvelopeOpen size={40} weight="regular" className="text-accent" />
        </div>
      </div>

      <h2 className="text-center text-[1.4rem] font-bold text-foreground tracking-tight">
        Verify your email
      </h2>
      <p className="mb-8 mt-1 text-center text-sm text-muted font-medium">
        We&apos;ve sent a 6-digit code to{" "}
        <span className="text-foreground font-bold">{maskedEmail}</span>. It
        expires in 10 minutes.
      </p>

      {sendError && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 p-3 text-center">
          <p className="text-xs font-bold text-danger">{sendError}</p>
          <button
            onClick={() => doSendOTP(true)}
            className="mt-1 text-xs font-bold text-accent hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* OTP Inputs */}
      <div className="mb-8 flex justify-center gap-2.5">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={cn(
              "h-14 w-12 rounded-xl border border-border bg-input text-center text-xl font-bold text-foreground outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/5 disabled:opacity-50",
              digit && "border-accent bg-accent-light",
            )}
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={!isComplete || isLoading}
        className="btn btn-primary btn-lg w-full shadow-lg shadow-accent/20"
      >
        {isLoading ? "Verifying…" : "Verify"}
      </button>

      <p className="mt-8 text-center text-sm text-muted font-medium">
        {cooldown > 0 ? (
          <>
            Resend code in{" "}
            <span className="text-accent font-bold">
              {Math.floor(cooldown / 60)}:{(cooldown % 60).toString().padStart(2, "0")}
            </span>
          </>
        ) : (
          <>
            Didn&apos;t receive a code?{" "}
            <button
              onClick={handleResend}
              className="font-bold text-accent hover:underline"
            >
              Resend
            </button>
          </>
        )}
      </p>
    </div>
  );
}

export default function OtpVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <OtpVerificationForm />
    </Suspense>
  );
}
