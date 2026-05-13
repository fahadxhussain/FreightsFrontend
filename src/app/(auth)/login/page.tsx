"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { EnvelopeSimple, Lock, Eye, EyeSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import { decodeJwt } from "jose";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    formState: { errors },
  } = form;

  async function onSubmit(data: LoginValues) {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", data);
      const { accessToken, user } = response.data.data;
      const isOnboardingComplete = user?.isOnboardingComplete ?? false;

      localStorage.setItem("token", accessToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=604800; SameSite=Lax`;

      // Extract permissions from JWT
      let permissions: string[] = [];
      try {
        const claims = decodeJwt(accessToken) as Record<string, unknown>;
        if (Array.isArray(claims.permissions)) {
          permissions = claims.permissions as string[];
        }
      } catch {
        /* ignore decode errors */
      }

      dispatch(
        setCredentials({
          user,
          accessToken,
          isOnboardingComplete,
          permissions,
        }),
      );
      toast.success("Welcome back!");

      // Determine destination
      let destination = "/dashboard";
      if (!isOnboardingComplete) {
        const role = user?.role || "broker";
        if (
          role === "independent_driver" ||
          role === "company_driver" ||
          role === "driver"
        ) {
          destination = "/onboarding/driver";
        } else if (role === "carrier") {
          destination = "/onboarding/carrier";
        } else {
          destination = "/onboarding/broker";
        }
      }

      // Use window.location for guaranteed navigation (router.push can be flaky in some Next.js builds)
      window.location.href = destination;
    } catch (error: any) {
      console.error("[LOGIN] Error:", error);
      const message =
        error?.response?.data?.error?.message || "Invalid email or password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-center text-[2.2rem] font-black text-accent tracking-tighter">
        FLOW
      </h1>
      <h2 className="mt-1 text-center text-[1.4rem] font-bold text-foreground">
        Welcome back
      </h2>
      <p className="mb-8 text-center text-sm text-muted font-medium">
        Sign in to your logistics dashboard
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-muted uppercase tracking-wider">
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
                "w-full rounded-xl border border-border bg-input px-11 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/5 placeholder:text-muted-foreground/60 font-medium",
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

        <div className="space-y-1.5">
          <label className="ml-1 text-xs font-bold text-muted uppercase tracking-wider">
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
              placeholder="Your password"
              className={cn(
                "w-full rounded-xl border border-border bg-input px-11 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/5 pr-12 placeholder:text-muted-foreground/60 font-medium",
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
          <div className="flex justify-end mt-1.5">
            <Link
              href="/forgot-password"
              className="text-[11px] font-bold text-accent hover:underline uppercase tracking-wider"
            >
              Forgot Password?
            </Link>
          </div>
          {errors.password && (
            <p className="ml-1 text-[11px] font-bold text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-lg mt-2 w-full shadow-lg shadow-accent/20"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted font-medium">
        Don&apos;t have an account?{" "}
        <Link
          href="/role-selection"
          className="font-bold text-accent hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
