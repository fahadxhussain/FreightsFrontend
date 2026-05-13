'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle, Gauge, Bell, MapPin, Truck } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateOnboardingStatus } from '@/store/slices/authSlice';
import api from '@/lib/axios';

const NOTIFICATION_PREFS = [
  { id: 'load_alerts', label: 'New Load Alerts', desc: 'Get notified when new loads match your lanes', default: true },
  { id: 'booking_updates', label: 'Booking Updates', desc: 'Notifications about your booking requests', default: true },
  { id: 'messages', label: 'Messages', desc: 'Direct message notifications', default: true },
  { id: 'payments', label: 'Payment Updates', desc: 'Invoices, payouts, and payment confirmations', default: true },
];

const EQUIPMENT_TYPES = [
  'Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Power Only',
  'Box Truck', 'Sprinter Van', 'Hotshot', 'RGN', 'Conestoga',
];

export default function PrefsOnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.id, p.default]))
  );
  const [equipment, setEquipment] = useState<string[]>([]);
  const [homeState, setHomeState] = useState('');

  const togglePref = (id: string) => {
    setPrefs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEquipment = (type: string) => {
    setEquipment((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      await api.patch('/auth/onboarding/prefs', {
        notificationPreferences: prefs,
        equipmentTypes: equipment,
        homeState,
      });

      dispatch(updateOnboardingStatus(true));
      setIsCompleted(true);
      toast.success('Preferences saved!');
    } catch (error: any) {
      console.error('[PREFS ONBOARDING] Error:', error);
      toast.error(error.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle size={48} weight="fill" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">All done!</h2>
        <p className="mt-2 text-body-text font-medium">Your preferences have been saved.</p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="mt-8 inline-flex items-center justify-center gap-2 h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-active transition-colors px-6"
        >
          <Gauge size={20} weight="bold" />
          Go to Dashboard
        </button>
      </div>
    );
  }

  const isCarrierOrDriver =
    user?.role === 'carrier' ||
    user?.role === 'independent_driver' ||
    user?.role === 'company_driver';

  return (
    <div className="w-full max-w-[560px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <div className="text-[1.8rem] font-semibold text-ink tracking-tight">FLOW</div>
        <h2 className="mt-2 text-xl font-semibold text-ink">Preferences</h2>
        <p className="text-sm text-body-text font-medium">Customize your experience</p>
      </div>

      <div className="rounded-xl border border-hairline bg-card p-8 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Bell size={22} weight="bold" />
            <h3 className="text-base font-semibold">Notifications</h3>
          </div>
          <div className="space-y-3">
            {NOTIFICATION_PREFS.map((pref) => (
              <label
                key={pref.id}
                className="flex items-start gap-3 rounded-xl border border-hairline bg-canvas p-4 cursor-pointer hover:border-muted transition-colors"
              >
                <input
                  type="checkbox"
                  checked={prefs[pref.id]}
                  onChange={() => togglePref(pref.id)}
                  className="mt-0.5 h-4 w-4 rounded border-hairline bg-canvas accent-primary"
                />
                <div>
                  <p className="text-sm font-semibold text-ink">{pref.label}</p>
                  <p className="text-xs text-body-text font-medium">{pref.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {isCarrierOrDriver && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Truck size={22} weight="bold" />
              <h3 className="text-base font-semibold">Equipment Types</h3>
            </div>
            <p className="text-xs text-body-text font-medium">Select the equipment you operate. This helps match you with relevant loads.</p>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleEquipment(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-semibold border transition-all',
                    equipment.includes(type)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted border-hairline hover:border-muted'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <MapPin size={22} weight="bold" />
            <h3 className="text-base font-semibold">Home State</h3>
          </div>
          <select
            value={homeState}
            onChange={(e) => setHomeState(e.target.value)}
            className="h-10 w-full rounded-md border border-hairline bg-canvas px-3.5 py-2 text-sm text-ink outline-none font-medium"
          >
            <option value="">Select your home state</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="AR">Arkansas</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="CT">Connecticut</option>
            <option value="DE">Delaware</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="IA">Iowa</option>
            <option value="KS">Kansas</option>
            <option value="KY">Kentucky</option>
            <option value="LA">Louisiana</option>
            <option value="MD">Maryland</option>
            <option value="MA">Massachusetts</option>
            <option value="MI">Michigan</option>
            <option value="MN">Minnesota</option>
            <option value="MS">Mississippi</option>
            <option value="MO">Missouri</option>
            <option value="NE">Nebraska</option>
            <option value="NV">Nevada</option>
            <option value="NJ">New Jersey</option>
            <option value="NM">New Mexico</option>
            <option value="NY">New York</option>
            <option value="NC">North Carolina</option>
            <option value="OH">Ohio</option>
            <option value="OK">Oklahoma</option>
            <option value="OR">Oregon</option>
            <option value="PA">Pennsylvania</option>
            <option value="SC">South Carolina</option>
            <option value="TN">Tennessee</option>
            <option value="TX">Texas</option>
            <option value="UT">Utah</option>
            <option value="VA">Virginia</option>
            <option value="WA">Washington</option>
            <option value="WI">Wisconsin</option>
          </select>
        </div>

        <button
          onClick={completeOnboarding}
          disabled={isLoading}
          className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-active transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {isLoading ? 'Saving...' : 'Complete Setup'}
          <CheckCircle size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}
