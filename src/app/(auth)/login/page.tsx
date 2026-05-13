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
      const { accessToken, refreshToken, user } = response.data.data;
      const isOnboardingComplete = user?.isOnboardingComplete ?? false;

      localStorage.setItem("token", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=604800; SameSite=Lax`;

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
      <h1 className="text-center text-2xl font-semibold text-ink tracking-tight">
        FLOW
      </h1>
      <h2 className="mt-2 text-center text-lg font-semibold text-ink">
        Welcome back
      </h2>
      <p className="mb-8 text-center text-sm text-body-text">
        Sign in to your logistics dashboard
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">
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
                "h-10 w-full rounded-md border border-hairline bg-canvas px-11 py-2 text-sm text-ink outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink placeholder:text-muted-foreground",
                errors.email && "border-error",
              )}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted">
            Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              className={cn(
                "h-10 w-full rounded-md border border-hairline bg-canvas px-11 py-2 text-sm text-ink outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink pr-12 placeholder:text-muted-foreground",
                errors.password && "border-error",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex justify-end mt-1">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-muted hover:text-ink transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          {errors.password && (
            <p className="text-xs text-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-active transition-colors disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/role-selection"
          className="font-medium text-ink hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
