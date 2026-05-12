'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import LandingPage from '@/components/landing/LandingPage';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Give AuthInitializer a moment to hydrate auth state from localStorage
    const timer = setTimeout(() => setIsAuthReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthReady, isAuthenticated, router]);

  // While checking auth, show nothing (or a very subtle loader)
  if (!isAuthReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  // Authenticated users are redirected above; unauthenticated see the landing page
  if (isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  return <LandingPage />;
}
