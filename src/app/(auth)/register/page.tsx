"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  User,
  EnvelopeSimple,
  Phone,
  Lock,
  Eye,
  EyeSlash,
  ArrowLeft,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string): {
  label: string;
  level: 0 | 1 | 2 | 3 | 4;
} {
  if (!password) return { label: "", level: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score === 0) return { label: "", level: 0 };
  if (score === 1) return { label: "Weak", level: 1 };
  if (score === 2) return { label: "Fair", level: 2 };
  if (score === 3) return { label: "Good", level: 3 };
  return { label: "Strong", level: 4 };
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    mode: "onChange",
  });

  const password = form.watch("password");
  const strength = getPasswordStrength(password);

  const { isValid } = form.formState;
  const {
    formState: { errors },
  } = form;

  async function onSubmit(data: RegisterValues) {
    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        firstName: data.fullName.split(" ")[0] || data.fullName,
        lastName: data.fullName.split(" ").slice(1).join(" ") || data.fullName,
        phone: data.phone,
        role: role || "broker",
      });
      toast.success("Account created! Please verify your email.");
      router.push(
        `/otp-verification?email=${encodeURIComponent(data.email)}&role=${encodeURIComponent(role || "broker")}`,
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Link
        href="/role-selection"
        className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft size={14} weight="bold" />
        Back
      </Link>

      <h1 className="text-center text-[2.2rem] font-black text-accent tracking-tighter">
        FLOW
      </h1>
      <h2 className="mt-1 text-center text-[1.4rem] font-bold text-foreground tracking-tight">
        Create your account
      </h2>
      <p className="mb-8 text-center text-sm text-muted font-medium">
        Join thousands of freight professionals
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold text-muted uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <User
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              {...form.register("fullName")}
              type="text"
              placeholder="John Smith"
              className={cn(
                "w-full rounded-xl border border-border bg-input px-11 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/5 font-medium",
                errors.fullName && "border-danger focus:ring-danger/5",
              )}
            />
          </div>
          {errors.fullName && (
            <p className="ml-1 text-[11px] font-bold text-danger">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold text-muted uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <EnvelopeSimple
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              {...form.register("email")}
              type="email"
              placeholder="john@company.com"
              className={cn(
                "w-full rounded-xl border border-border bg-input px-11 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/5 font-medium",
                errors.email && "border-danger focus:ring-danger/5",
              )}
            />
          </div>
          {errors.email && (
            <p className="ml-1 text-[11px] font-bold text-danger">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold text-muted uppercase tracking-wider">
            Phone Number
          </label>
          <div className="relative">
            <Phone
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              {...form.register("phone")}
              type="tel"
              placeholder="+1 (555) 000-0000"
              className={cn(
                "w-full rounded-xl border border-border bg-input px-11 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/5 font-medium",
                errors.phone && "border-danger focus:ring-danger/5",
              )}
            />
          </div>
          {errors.phone && (
            <p className="ml-1 text-[11px] font-bold text-danger">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold text-muted uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              className={cn(
                "w-full rounded-xl border border-border bg-input px-11 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/5 pr-12 font-medium",
                errors.password && "border-danger focus:ring-danger/5",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Strength bar */}
          {password && (
            <div className="mt-2 flex gap-1 px-1">
              {[1, 2, 3, 4].map((seg) => (
                <div
                  key={seg}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-500",
                    strength.level >= seg
                      ? strength.level === 1
                        ? "bg-danger"
                        : strength.level === 2
                          ? "bg-warning"
                          : strength.level === 3
                            ? "bg-indigo"
                            : "bg-success"
                      : "bg-border/40",
                  )}
                />
              ))}
            </div>
          )}
          {errors.password && (
            <p className="ml-1 text-[11px] font-bold text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="ml-1 text-[10px] font-bold text-muted uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              {...form.register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              className={cn(
                "w-full rounded-xl border border-border bg-input px-11 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/5 pr-12 font-medium",
                errors.confirmPassword && "border-danger focus:ring-danger/5",
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
            >
              {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="ml-1 text-[11px] font-bold text-danger">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="py-1">
          <label className="flex items-start gap-3 text-xs text-muted font-medium cursor-pointer">
            <input
              type="checkbox"
              {...form.register("agreeToTerms")}
              className="mt-0.5 h-4 w-4 rounded-md border-border bg-input accent-accent cursor-pointer"
            />
            <span className="leading-relaxed">
              I agree to the{" "}
              <a href="#" className="font-bold text-accent hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-bold text-accent hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1.5 ml-7 text-[11px] font-bold text-danger">
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="btn btn-primary btn-lg mt-4 w-full shadow-lg shadow-accent/20"
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted font-medium">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-accent hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
