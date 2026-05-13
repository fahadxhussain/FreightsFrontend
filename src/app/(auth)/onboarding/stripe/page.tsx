'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import api from '@/lib/axios';

export default function StripeStep() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onConnect() {
    setIsLoading(true);
    try {
      await api.patch('/auth/onboarding/stripe', { stripeConnected: true });
      toast.success('Stripe connected successfully!');
      router.push('/onboarding/prefs');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to connect Stripe');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Payment Setup</h2>
        <p className="text-sm text-muted">Connect your Stripe account to send or receive payments.</p>
      </div>
      <div className="bg-card p-6 rounded-xl border border-hairline space-y-4">
        <div className="flex items-center space-x-3 text-primary">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.911 10.32c0-.62-.51-1.01-1.391-1.01-.84 0-1.48.241-2.02.56l-.37-2.152c.57-.28 1.48-.52 2.62-.52 2.21 0 3.731 1.121 3.731 3.122 0 3.031-4.141 3.471-4.141 5.251 0 .231.02.431.06.601l-2.451.01a4.27 4.27 0 0 1-.09-1.011c0-2.311 4.081-3.031 4.081-4.861zm-1.631 7.642c.791 0 1.42.63 1.42 1.42 0 .79-.63 1.42-1.42 1.42a1.42 1.42 0 0 1-1.421-1.42c0-.79.631-1.42 1.421-1.42z" />
          </svg>
          <span className="font-semibold text-lg text-ink">Stripe Connect</span>
        </div>
        <p className="text-sm text-body-text leading-relaxed">
          Flow uses Stripe to ensure secure and fast financial transactions. By connecting your account, you can automate payments and settlements directly within the platform.
        </p>
        <Button onClick={onConnect} disabled={isLoading} className="w-full h-11 rounded-md bg-primary text-primary-foreground hover:bg-primary-active transition-colors text-sm font-semibold">
          {isLoading ? 'Connecting...' : 'Connect with Stripe'}
        </Button>
      </div>
      <div className="flex justify-between pt-4">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Back
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/onboarding/prefs')}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
