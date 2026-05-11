"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { ReactNode, useEffect } from "react";
import { setCredentials, updateUser } from "@/store/slices/authSlice";
import { decodeJwt } from "jose";
import api from "@/lib/axios";

function AuthInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        const raw = decodeJwt(token);
        const claims = raw as Record<string, unknown>;
        if (claims) {
          // 1. Instantly set minimal state to unblock rendering
          store.dispatch(
            setCredentials({
              user: {
                id: String(claims.userId || claims.sub || claims.id || ""),
                email: "", // Will fetch below
                role: String(claims.role || "broker"),
                firstName: "",
                lastName: "",
                permissions: Array.isArray(claims.permissions)
                  ? (claims.permissions as string[])
                  : [],
              },
              accessToken: token,
              isOnboardingComplete: Boolean(
                claims.isOnboardingComplete || false,
              ),
              permissions: Array.isArray(claims.permissions)
                ? (claims.permissions as string[])
                : [],
            }),
          );

          // 2. Fetch full user data in the background
          api
            .get("/auth/me")
            .then(({ data }) => {
              if (data?.data) {
                store.dispatch(updateUser(data.data));
              }
            })
            .catch(console.error);
        }
      } catch (e: unknown) {
        console.error("Failed to sync auth state", e);
      }
    }
  }, []);

  return <>{children}</>;
}

export default function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
