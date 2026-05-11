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
      // Mocking the Stripe connection for the onboarding flow
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
        <h2 className="text-xl font-bold">Payment Setup</h2>
        <p className="text-sm text-gray-500">Connect your Stripe account to send or receive payments.</p>
      </div>
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 space-y-4">
        <div className="flex items-center space-x-3 text-blue-700">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.911 10.32c0-.62-.51-1.01-1.391-1.01-.84 0-1.48.241-2.02.56l-.37-2.152c.57-.28 1.48-.52 2.62-.52 2.21 0 3.731 1.121 3.731 3.122 0 3.031-4.141 3.471-4.141 5.251 0 .231.02.431.06.601l-2.451.01a4.27 4.27 0 0 1-.09-1.011c0-2.311 4.081-3.031 4.081-4.861zm-1.631 7.642c.791 0 1.42.63 1.42 1.42 0 .79-.63 1.42-1.42 1.42a1.42 1.42 0 0 1-1.421-1.42c0-.79.631-1.42 1.421-1.42z" />
          </svg>
          <span className="font-bold text-lg">Stripe Connect</span>
        </div>
        <p className="text-sm text-blue-600 leading-relaxed">
          Flow uses Stripe to ensure secure and fast financial transactions. By connecting your account, you can automate payments and settlements directly within the platform.
        </p>
        <Button onClick={onConnect} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 h-auto">
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
