import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/role-selection",
  "/forgot-password",
  "/reset-password",
  "/otp-verification",
];

const ONBOARDING_PATHS = ["/onboarding"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isOnboardingPath = ONBOARDING_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (!accessToken) {
    if (isPublicPath || pathname === "/") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // New: If logged in and hitting root, go to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  try {
    const claims = decodeJwt(accessToken) as Record<string, unknown>;

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    const exp = claims?.exp as number | undefined;
    if (exp && exp < now) {
      // Token expired — treat as unauthenticated, clear stale cookie
      if (isPublicPath || pathname === "/") {
        const response = NextResponse.next();
        response.cookies.delete("accessToken");
        return response;
      }
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("accessToken");
      return response;
    }

    const isOnboardingComplete = claims?.isOnboardingComplete as boolean;

    if (isPublicPath) {
      // Redirect logged-in users away from public paths
      const role = (claims?.role as string) || "broker";
      if (isOnboardingComplete) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      // Route to role-specific onboarding
      if (
        role === "independent_driver" ||
        role === "company_driver" ||
        role === "driver"
      ) {
        return NextResponse.redirect(
          new URL("/onboarding/driver", request.url),
        );
      } else if (role === "carrier") {
        return NextResponse.redirect(
          new URL("/onboarding/carrier", request.url),
        );
      }
      return NextResponse.redirect(new URL("/onboarding/broker", request.url));
    }

    if (!isOnboardingComplete && !isOnboardingPath && pathname !== "/") {
      const role = (claims?.role as string) || "broker";
      if (
        role === "independent_driver" ||
        role === "company_driver" ||
        role === "driver"
      ) {
        return NextResponse.redirect(
          new URL("/onboarding/driver", request.url),
        );
      } else if (role === "carrier") {
        return NextResponse.redirect(
          new URL("/onboarding/carrier", request.url),
        );
      }
      return NextResponse.redirect(new URL("/onboarding/broker", request.url));
    }

    if (isOnboardingComplete && isOnboardingPath) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    if (!isPublicPath) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("accessToken");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
