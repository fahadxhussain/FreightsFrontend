'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ShareNetwork, 
  BellSimple, 
  MapTrifold, 
  Circle,
  ChatText,
  Crosshair,
  CheckCircle,
  Clock,
  MapPin,
  ArrowClockwise,
  ArrowRight,
  User
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function TrackingPage() {
  const router = useRouter();
  const params = useParams();
  const [load, setLoad] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const fetchLoad = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/loads/${params.id}`);
      setLoad(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch tracking data');
    } finally {
      setIsLoading(false);
    }
  };

  useState(() => {
    if (params.id) {
      fetchLoad();
    }
  });

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden animate-in fade-in duration-500">
      {/* Left Panel */}
      <div className="w-[380px] flex flex-col border-r border-border bg-background flex-shrink-0">
        <div className="p-6 overflow-y-auto scrollbar-hide">
          <div className="mb-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted mb-6">Shipment Details</h3>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white font-black text-lg shadow-lg shadow-accent/20">
                {load?.commodity?.[0] || 'L'}
              </div>
              <div>
                <div className="text-sm font-black text-foreground">{load?.commodity || 'General Freight'}</div>
                <div className="text-[10px] font-bold text-muted uppercase tracking-widest">{load?.truckType} · {load?.weight} lbs</div>
              </div>
            </div>
          </div>

          {/* ETA Card */}
          <div className="mb-8 rounded-[2rem] border-2 border-accent/20 bg-accent-light p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 bg-accent opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">Next Stop ETA</div>
            <div className="text-4xl font-black text-foreground tracking-tighter my-2">1h 24m</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Arriving Stop 1 · Springfield, MO</div>
            <div className="mt-4 pt-4 border-t border-accent/10">
               <div className="text-[10px] font-black uppercase tracking-widest text-muted">Projected Delivery</div>
               <div className="text-xs font-black text-foreground mt-1">Apr 4, 1:45 PM</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted mb-8">Shipment Timeline</h3>
            <div className="space-y-8 ml-3 border-l-2 border-border pl-8">
              <div className="relative">
                <div className="absolute left-[-37px] top-0 h-4 w-4 rounded-full bg-success ring-4 ring-success/10 flex items-center justify-center">
                   <CheckCircle size={10} weight="fill" className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-foreground">Load Booked</div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">Mar 28, 9:00 AM</div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-[-37px] top-0 h-4 w-4 rounded-full bg-success ring-4 ring-success/10 flex items-center justify-center">
                   <CheckCircle size={10} weight="fill" className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-foreground">Driver Departed</div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">Apr 2, 8:15 AM</div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-[-37px] top-0 h-4 w-4 rounded-full bg-accent ring-4 ring-accent/10 animate-pulse" />
                <div>
                  <div className="text-xs font-black text-foreground">Approaching Stop 1</div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">Geofence entry detected · 2:15 PM</div>
                </div>
              </div>
              <div className="relative opacity-30">
                <div className="absolute left-[-37px] top-0 h-4 w-4 rounded-full bg-border" />
                <div>
                  <div className="text-xs font-black text-muted">Awaiting Delivery</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stops */}
          <div className="mb-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted mb-6">Route Stops</h3>
            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-card border border-border hover:border-accent/30 transition-all cursor-pointer">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[11px] font-black text-foreground uppercase tracking-widest">Pickup</div>
                  <span className="badge badge-green px-2 h-5">Completed</span>
                </div>
                <div className="flex items-start gap-2 mb-2">
                  <MapPin size={16} className="text-muted mt-0.5" />
                  <span className="text-xs font-bold text-muted-foreground leading-relaxed">{load?.origin?.city}, {load?.origin?.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted" />
                  <span className="text-[10px] font-black text-muted uppercase tracking-widest">Scheduled: {new Date(load?.pickupDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border hover:opacity-100 transition-all cursor-pointer">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[11px] font-black text-foreground uppercase tracking-widest">Delivery</div>
                  <span className={cn("badge px-2 h-5", load?.status === 'delivered' ? "badge-green" : "badge-gray")}>
                    {load?.status === 'delivered' ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-start gap-2 mb-2">
                  <MapPin size={16} className="text-muted mt-0.5" />
                  <span className="text-xs font-bold text-muted-foreground leading-relaxed">{load?.destination?.city}, {load?.destination?.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted" />
                  <span className="text-[10px] font-black text-muted uppercase tracking-widest">Scheduled: {new Date(load?.deliveryDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-card overflow-hidden">
        {/* Header Overlay */}
        <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
           <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/80 backdrop-blur-md border border-border shadow-2xl">
              <div className="badge badge-blue h-7 px-3">{load?._id?.slice(-6).toUpperCase()}</div>
              <div className="flex items-center gap-3">
                 <span className="text-sm font-black text-foreground tracking-tight">{load?.origin?.city}, {load?.origin?.state}</span>
                 <ArrowRight size={14} weight="bold" className="text-muted" />
                 <span className="text-sm font-black text-foreground tracking-tight">{load?.destination?.city}, {load?.destination?.state}</span>
              </div>
              <span className="badge badge-amber h-7 px-3 uppercase">{load?.status}</span>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="btn btn-secondary h-12 px-6 text-[11px] font-black uppercase tracking-widest bg-card/80 backdrop-blur-md shadow-xl"
              >
                <ShareNetwork size={20} weight="bold" />
                Share Link
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/80 backdrop-blur-md border border-border text-muted hover:text-foreground shadow-xl">
                 <BellSimple size={22} weight="bold" />
              </button>
           </div>
        </div>

        {/* Map Visualization */}
        <div className="h-full w-full flex items-center justify-center bg-[#f0f2f5] dark:bg-[#0b0e14]">
           <div className="text-center animate-in zoom-in-95 duration-700">
              <div className="relative mb-6">
                 <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
                 <MapTrifold size={80} weight="duotone" className="mx-auto text-accent relative z-10 drop-shadow-2xl" />
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight mb-2">Live Map View</h2>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-6">
                {load?.origin?.city} → {load?.destination?.city}
              </p>
              
              <div className="flex gap-4 items-center justify-center">
                 <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-widest">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Live GPS Active
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                    <ArrowClockwise size={14} weight="bold" />
                    Last update: 30s ago
                 </div>
              </div>
           </div>

           {/* Vehicle Marker Simulation */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              {/* Path line would go here */}
           </div>
        </div>

        {/* Bottom Panel Overlay */}
        <div className="absolute bottom-8 left-8 right-8 z-10 p-6 rounded-[2rem] bg-card/90 backdrop-blur-md border border-border shadow-2xl flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="h-3 w-3 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                 <span className="text-xs font-black text-foreground uppercase tracking-widest">Live Signal</span>
              </div>
              <div className="h-10 w-[1px] bg-border" />
              <div>
                 <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Estimated Arrival</div>
                 <div className="text-lg font-black text-foreground tracking-tight">ETA to {load?.destination?.city}: 14h 20m</div>
              </div>
           </div>
           
           <div className="flex gap-3">
              <button className="btn btn-secondary h-12 px-6 text-[11px] font-black uppercase tracking-widest">
                 <ChatText size={18} weight="bold" />
                 Message Driver
              </button>
              <button className="btn btn-secondary h-12 px-6 text-[11px] font-black uppercase tracking-widest">
                 <Crosshair size={18} weight="bold" />
                 Geofences
              </button>
              <button className="btn btn-primary h-12 px-8 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20">
                 Full Screen
              </button>
           </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black tracking-tight text-foreground mb-4">Share Live Tracking</h3>
            <p className="text-sm font-medium text-muted leading-relaxed mb-8">
              Anyone with this link can view the live truck location on their device. No login required.
            </p>
            <div className="flex gap-2 mb-8">
              <input 
                readOnly
                value={`https://flow.app/track/${load?._id}`}
                className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-[13px] font-bold text-foreground outline-none shadow-inner" 
              />
              <button className="btn btn-primary px-6 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-accent/20">
                Copy
              </button>
            </div>
            <div className="mb-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
               <Clock size={18} className="text-amber-500 mt-0.5" />
               <p className="text-[11px] font-bold text-amber-500/80 uppercase tracking-widest leading-relaxed">
                  This tracking link will automatically expire 48 hours after delivery.
               </p>
            </div>
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="btn btn-secondary w-full h-12 text-[11px] font-black uppercase tracking-widest"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
