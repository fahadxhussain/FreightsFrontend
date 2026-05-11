'use client';

import { useState, useEffect, useCallback } from 'react';
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
  User,
  CircleNotch,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface TrackedLoad {
  _id: string;
  referenceNumber: string | null;
  origin: { city: string; state: string; address: string; contactName: string };
  destination: { city: string; state: string; address: string; contactName: string };
  pickupDate: string;
  deliveryDate: string;
  status: string;
  assignedTruckId: string | null;
  assignedDriverId: string | null;
  weight: number;
  commodity: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function TrackingPage() {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [loads, setLoads] = useState<TrackedLoad[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<TrackedLoad | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveLoads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/loads', { params: { status: 'in_transit', limit: 50 } });
      const data = res.data?.data?.docs ?? res.data?.data ?? [];
      setLoads(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !selectedLoad) {
        setSelectedLoad(data[0]);
      }
    } catch {
      toast.error('Failed to load tracked shipments');
    } finally {
      setIsLoading(false);
    }
  }, [selectedLoad]);

  useEffect(() => {
    fetchActiveLoads();
  }, [fetchActiveLoads]);

  const getLoadId = (load: TrackedLoad) => {
    return load.referenceNumber || `FL-${load._id.slice(-6).toUpperCase()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_transit': return { label: 'In Transit', cls: 'badge-amber' };
      case 'booked': return { label: 'Booked', cls: 'badge-blue' };
      case 'delivered': return { label: 'Delivered', cls: 'badge-green' };
      default: return { label: status, cls: 'badge-gray' };
    }
  };

  const formatETA = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return 'Arrived';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours < 1) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  };

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden animate-in fade-in duration-500">
      {/* Left Panel */}
      <div className="w-[380px] flex flex-col border-r border-border bg-background flex-shrink-0">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted">Active Shipments</h3>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <CircleNotch size={24} weight="bold" className="animate-spin text-accent" />
          </div>
        ) : loads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted p-6 text-center">
            <MapTrifold size={40} weight="thin" className="mb-3 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">No active shipments</p>
            <p className="text-[10px] mt-1">Loads in transit will appear here</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {loads.map((load) => {
              const badge = getStatusBadge(load.status);
              return (
                <button
                  key={load._id}
                  onClick={() => setSelectedLoad(load)}
                  className={cn(
                    "w-full px-4 py-3 border-b border-border hover:bg-card-hover transition-colors text-left",
                    selectedLoad?._id === load._id && "bg-accent/5 border-accent/20",
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-black text-foreground">{getLoadId(load)}</span>
                    <span className={cn("badge h-5 px-2 text-[9px] font-black", badge.cls)}>{badge.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <span>{load.origin.city}, {load.origin.state}</span>
                    <ArrowRight size={10} weight="bold" />
                    <span>{load.destination.city}, {load.destination.state}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedLoad && (
          <div className="p-6 border-t border-border overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted mb-4">Shipment Details</h3>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white font-black text-lg shadow-lg shadow-accent/20">
                  {selectedLoad.origin.city.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">{getLoadId(selectedLoad)}</div>
                  <div className="text-[10px] font-bold text-muted uppercase tracking-widest">
                    {selectedLoad.commodity || 'General Freight'} · {selectedLoad.weight.toLocaleString()} lbs
                  </div>
                </div>
              </div>
            </div>

            {/* ETA Card */}
            <div className="mb-6 rounded-[2rem] border-2 border-accent/20 bg-accent-light p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-24 w-24 bg-accent opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">Next Stop ETA</div>
              <div className="text-4xl font-black text-foreground tracking-tighter my-2">
                {formatETA(selectedLoad.deliveryDate)}
              </div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                {selectedLoad.destination.city}, {selectedLoad.destination.state}
              </div>
              <div className="mt-4 pt-4 border-t border-accent/10">
                 <div className="text-[10px] font-black uppercase tracking-widest text-muted">Projected Delivery</div>
                 <div className="text-xs font-black text-foreground mt-1">{formatDate(selectedLoad.deliveryDate)}</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted mb-6">Shipment Timeline</h3>
              <div className="space-y-6 ml-3 border-l-2 border-border pl-6">
                <div className="relative">
                  <div className="absolute left-[-31px] top-0 h-4 w-4 rounded-full bg-success ring-4 ring-success/10 flex items-center justify-center">
                     <CheckCircle size={10} weight="fill" className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-foreground">Load Booked</div>
                    <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">{formatDate(selectedLoad.createdAt)}</div>
                  </div>
                </div>
                {selectedLoad.status === 'in_transit' && (
                  <div className="relative">
                    <div className="absolute left-[-31px] top-0 h-4 w-4 rounded-full bg-accent ring-4 ring-accent/10 animate-pulse" />
                    <div>
                      <div className="text-xs font-black text-foreground">In Transit</div>
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">Last updated {formatDate(selectedLoad.updatedAt)}</div>
                    </div>
                  </div>
                )}
                <div className={cn("relative", selectedLoad.status === 'delivered' ? "" : "opacity-30")}>
                  <div className={cn("absolute left-[-31px] top-0 h-4 w-4 rounded-full flex items-center justify-center",
                    selectedLoad.status === 'delivered' ? "bg-success ring-4 ring-success/10" : "bg-border"
                  )}>
                     {selectedLoad.status === 'delivered' && <CheckCircle size={10} weight="fill" className="text-white" />}
                  </div>
                  <div>
                    <div className={cn("text-xs font-black", selectedLoad.status === 'delivered' ? "text-foreground" : "text-muted")}>Delivered</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stops */}
            <div className="mb-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted mb-4">Route Stops</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[11px] font-black text-foreground uppercase tracking-widest">Pickup</div>
                    <span className="badge badge-green px-2 h-5 text-[9px]">Completed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-muted mt-0.5 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                      {selectedLoad.origin.address}, {selectedLoad.origin.city}, {selectedLoad.origin.state}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[11px] font-black text-foreground uppercase tracking-widest">Delivery</div>
                    <span className={cn("badge px-2 h-5 text-[9px]",
                      selectedLoad.status === 'delivered' ? "badge-green" : "badge-amber"
                    )}>
                      {selectedLoad.status === 'delivered' ? 'Delivered' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-muted mt-0.5 flex-shrink-0" />
                    <span className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                      {selectedLoad.destination.address}, {selectedLoad.destination.city}, {selectedLoad.destination.state}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-card overflow-hidden">
        {/* Header Overlay */}
        {selectedLoad && (
          <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/80 backdrop-blur-md border border-border shadow-2xl">
              <div className="badge badge-blue h-7 px-3">{getLoadId(selectedLoad)}</div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-foreground tracking-tight">{selectedLoad.origin.city}, {selectedLoad.origin.state}</span>
                <ArrowRight size={14} weight="bold" className="text-muted" />
                <span className="text-sm font-black text-foreground tracking-tight">{selectedLoad.destination.city}, {selectedLoad.destination.state}</span>
              </div>
              <span className={cn("badge h-7 px-3", getStatusBadge(selectedLoad.status).cls)}>
                {getStatusBadge(selectedLoad.status).label}
              </span>
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
        )}

        {/* Map Visualization */}
        <div className="h-full w-full flex items-center justify-center bg-[#f0f2f5] dark:bg-[#0b0e14]">
          {selectedLoad ? (
            <div className="text-center animate-in zoom-in-95 duration-700">
              <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
                <MapTrifold size={80} weight="duotone" className="mx-auto text-accent relative z-10 drop-shadow-2xl" />
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight mb-2">Live Map View</h2>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mb-6">
                {selectedLoad.origin.city} → {selectedLoad.destination.city}
              </p>
              
              <div className="flex gap-4 items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-widest">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Live GPS Active
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                  <ArrowClockwise size={14} weight="bold" />
                  Last update: {formatDate(selectedLoad.updatedAt)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted">
              <MapTrifold size={64} weight="thin" className="mx-auto mb-4 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">Select a shipment to view</p>
            </div>
          )}
        </div>

        {/* Bottom Panel Overlay */}
        {selectedLoad && (
          <div className="absolute bottom-8 left-8 right-8 z-10 p-6 rounded-[2rem] bg-card/90 backdrop-blur-md border border-border shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="text-xs font-black text-foreground uppercase tracking-widest">Live Signal</span>
              </div>
              <div className="h-10 w-[1px] bg-border" />
              <div>
                <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Estimated Arrival</div>
                <div className="text-lg font-black text-foreground tracking-tight">
                  ETA to {selectedLoad.destination.city}: {formatETA(selectedLoad.deliveryDate)}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => router.push(`/messaging`)}
                className="btn btn-secondary h-12 px-6 text-[11px] font-black uppercase tracking-widest"
              >
                <ChatText size={18} weight="bold" />
                Message
              </button>
              <button className="btn btn-secondary h-12 px-6 text-[11px] font-black uppercase tracking-widest">
                <Crosshair size={18} weight="bold" />
                Geofences
              </button>
              <button 
                onClick={() => router.push(`/tracking/${selectedLoad._id}`)}
                className="btn btn-primary h-12 px-8 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20"
              >
                Details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {isShareModalOpen && selectedLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black tracking-tight text-foreground mb-4">Share Live Tracking</h3>
            <p className="text-sm font-medium text-muted leading-relaxed mb-8">
              Anyone with this link can view the live truck location on their device. No login required.
            </p>
            <div className="flex gap-2 mb-8">
              <input 
                readOnly
                value={`https://flow.app/track/${getLoadId(selectedLoad)}`}
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
