'use client';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex items-center justify-center p-4">
      {children}
    </div>
  );
}
