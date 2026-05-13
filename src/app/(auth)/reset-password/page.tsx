"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Lock, Eye, EyeSlash, Warning, ArrowLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import Link from "next/link";

const resetSchema = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(8, "At least 8 characters").regex(/[A-Z]/, "Must have uppercase").regex(/[a-z]/, "Must have lowercase").regex(/\d/, "Must have a digit"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email, otp: "", newPassword: "", confirmPassword: "" },
  });

  const { errors } = form.formState;

  async function onSubmit(data: ResetValues) {
    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      toast.success("Password reset successful! Sign in with your new password.");
      router.push("/login");
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || "Failed to reset password";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <Warning size={40} className="text-warning" />
        <p className="text-sm text-muted font-medium">No email provided.</p>
        <Link href="/forgot-password" className="h-10 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-active transition-colors px-4 inline-flex items-center justify-center">
          Request Password Reset
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Link href="/forgot-password" className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors">
        <ArrowLeft size={14} weight="bold" />
        Back
      </Link>

      <h1 className="text-center text-[2rem] font-semibold text-ink tracking-tight">
        New Password
      </h1>
      <h2 className="mt-1 text-center text-[1.1rem] font-semibold text-ink">
        Create your new password
      </h2>
      <p className="mb-8 text-center text-sm text-body-text font-medium">
        Enter the code we sent to your email and choose a new password
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-medium text-muted">Email</label>
          <input {...form.register("email")} type="email" value={form.watch("email")} readOnly className="h-10 w-full rounded-md border border-hairline bg-surface-soft px-4 py-2 text-sm text-muted font-medium cursor-not-allowed" />
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-medium text-muted">Reset Code</label>
          <input {...form.register("otp")} type="text" inputMode="numeric" maxLength={6} placeholder="000000" className={cn("h-10 w-full rounded-md border border-hairline bg-canvas px-4 py-2 text-center text-xl font-semibold tracking-[8px] outline-none transition-all focus:border-ink focus:ring-1 focus:ring-ink placeholder:text-muted-foreground", errors.otp && "border-danger focus:ring-danger")} />
          {errors.otp && <p className="ml-1 text-xs font-medium text-danger">{errors.otp.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-medium text-muted">New Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input {...form.register("newPassword")} type={showPassword ? "text" : "password"} placeholder="Min. 8 chars with upper, lower, digit" className={cn("h-10 w-full rounded-md border border-hairline bg-canvas px-11 py-2 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-1 focus:ring-ink pr-12 placeholder:text-muted-foreground font-medium", errors.newPassword && "border-danger focus:ring-danger")} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink">
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && <p className="ml-1 text-xs font-medium text-danger">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-medium text-muted">Confirm Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input {...form.register("confirmPassword")} type={showConfirm ? "text" : "password"} placeholder="Repeat new password" className={cn("h-10 w-full rounded-md border border-hairline bg-canvas px-11 py-2 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-1 focus:ring-ink pr-12 placeholder:text-muted-foreground font-medium", errors.confirmPassword && "border-danger focus:ring-danger")} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink">
              {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="ml-1 text-xs font-medium text-danger">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isLoading} className="mt-2 w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-active transition-colors disabled:opacity-50">
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
