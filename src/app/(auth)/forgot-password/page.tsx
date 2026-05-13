"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { EnvelopeSimple, ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import Link from "next/link";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const {
    formState: { errors },
  } = form;

  async function onSubmit(data: ForgotValues) {
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      const masked = data.email.replace(/^(.{1,3})[^@]*(@.*)$/, (_, start, domain) => start + "••••" + domain);
      setMaskedEmail(masked);
      setIsSent(true);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || "Failed to send reset code";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className="flex flex-col gap-1 items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle size={40} weight="regular" className="text-primary" />
        </div>
        <h2 className="text-[1.4rem] font-semibold text-ink tracking-tight">
          Check your email
        </h2>
        <p className="mt-2 mb-8 text-sm text-body-text font-medium max-w-[300px]">
          We sent a password reset code to{" "}
          <span className="text-ink font-semibold">{maskedEmail}</span>.
          Check your inbox and enter the code below.
        </p>
        <button
          onClick={() => router.push(`/reset-password?email=${encodeURIComponent(form.getValues("email"))}`)}
          className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-active transition-colors"
        >
          Enter Reset Code
        </button>
        <button
          onClick={() => { setIsSent(false); form.reset(); }}
          className="mt-4 text-xs font-medium text-muted hover:text-ink transition-colors"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Link
        href="/login"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={14} weight="bold" />
        Back
      </Link>

      <h1 className="text-center text-[2rem] font-semibold text-ink tracking-tight">
        Forgot Password
      </h1>
      <h2 className="mt-1 text-center text-[1.1rem] font-semibold text-ink">
        No worries, we&apos;ve got you
      </h2>
      <p className="mb-8 text-center text-sm text-body-text font-medium">
        Enter your email and we&apos;ll send you a reset code
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-medium text-muted">
            Email Address
          </label>
          <div className="relative">
            <EnvelopeSimple
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              {...form.register("email")}
              type="email"
              placeholder="john@company.com"
              className={cn(
                "h-10 w-full rounded-md border border-hairline bg-canvas px-11 py-2 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-1 focus:ring-ink placeholder:text-muted-foreground font-medium",
                errors.email && "border-danger focus:ring-danger",
              )}
            />
          </div>
          {errors.email && (
            <p className="ml-1 text-xs font-medium text-danger">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-active transition-colors disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send Reset Code"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted font-medium">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
