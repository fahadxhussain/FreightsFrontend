"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, EnvelopeOpen } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "john@company.com";
  const role = searchParams.get("role") || "broker";
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mask email: show first 3 chars and domain
  const maskedEmail = email.replace(
    /^(.{1,3})[^@]*(@.*)$/,
    (_, start, domain) => start + "••••" + domain,
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
      await api.post("/auth/verify-otp", {
        email,
        code: otp.join(""),
      });
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
      toast.error(
        error.response?.data?.error?.message || "Invalid or expired code",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    try {
      await api.post("/auth/resend-otp", { email });
      toast.success("Verification code resent!");
      setCooldown(30);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to resend code",
      );
    }
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
            className={cn(
              "h-14 w-12 rounded-xl border border-border bg-input text-center text-xl font-bold text-foreground outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/5",
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
        {isLoading ? "Verifying..." : "Verify"}
      </button>

      <p className="mt-8 text-center text-sm text-muted font-medium">
        {cooldown > 0 ? (
          <>
            Resend code in{" "}
            <span className="text-accent font-bold">
              0:{cooldown.toString().padStart(2, "0")}
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
