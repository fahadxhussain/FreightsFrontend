"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { toast } from "sonner";

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("notificationCount");

    // Clear cookie
    document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";

    // Clear Redux state
    dispatch(logout());

    toast.success("Signed out successfully");

    // Redirect to login
    window.location.href = "/login";
  }, [dispatch, router]);

  return handleLogout;
}
