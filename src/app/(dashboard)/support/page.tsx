'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Lifebuoy, 
  Plus, 
  Tag, 
  Warning, 
  CheckCircle, 
  Clock, 
  X, 
  UploadSimple,
  MagnifyingGlass,
  ArrowRight,
  CircleNotch,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface Ticket {
  _id: string;
  userId: string;
  orgId: string;
  loadId: string | null;
  subject: string;
  description: string;
  category: 'payment' | 'booking' | 'load' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_MAP: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const CATEGORY_MAP: Record<string, string> = {
  payment: 'Payment',
  booking: 'Booking',
  load: 'Load Issue',
  technical: 'Technical',
  other: 'Other',
};

const CATEGORY_BADGE: Record<string, string> = {
  payment: 'badge-pill badge-pill-red',
  booking: 'badge-pill badge-pill-amber',
  load: 'badge-pill badge-pill-amber',
  technical: 'badge-pill badge-pill-blue',
  other: 'badge-pill badge-pill-gray',
};

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('Open');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formCategory, setFormCategory] = useState('payment');
  const [formLoadId, setFormLoadId] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFreezeEscrow, setFormFreezeEscrow] = useState(false);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusKey = activeTab.toLowerCase().replace(' ', '_');
      const res = await api.get('/tickets', { params: { status: statusKey, limit: 50 } });
      setTickets(res.data?.data?.docs ?? res.data?.data ?? []);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSubmit = async () => {
    if (!formSubject.trim() || !formDescription.trim()) {
      toast.error('Subject and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/tickets', {
        category: formCategory,
        loadId: formLoadId || null,
        subject: formSubject.trim(),
        description: formDescription.trim(),
        priority: 'medium',
        freezeEscrow: formFreezeEscrow,
      });

      toast.success('Ticket created successfully');
      setIsModalOpen(false);
      setFormSubject('');
      setFormDescription('');
      setFormLoadId('');
      setFormFreezeEscrow(false);
      fetchTickets();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || 'Failed to create ticket';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Support & Disputes</h1>
          <p className="text-sm font-bold text-muted  mt-1">Get help or resolve disputes with our specialist team</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-lg shadow-sm"
        >
          <Plus size={20} weight="bold" />
          Open New Ticket
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Open', 'In Progress', 'Resolved', 'Closed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "whitespace-nowrap px-6 py-3 text-[11px] font-semibold  rounded-md border transition-all",
              activeTab === tab 
                ? "bg-primary border-primary text-white shadow-sm" 
                : "bg-card border-hairline text-muted hover:border-muted hover:text-ink"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <CircleNotch size={32} weight="bold" className="animate-spin text-ink" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted">
          <Lifebuoy size={48} weight="thin" className="mb-4 opacity-20" />
          <p className="text-sm font-bold ">No {activeTab.toLowerCase()} tickets</p>
          <p className="text-xs mt-2">Open a new ticket to get help</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div 
              key={ticket._id} 
              className={cn(
                "rounded-xl border border-hairline bg-card p-6 shadow-xl hover:border-ink transition-all group cursor-pointer",
                ticket.status === 'resolved' && "opacity-60 grayscale-[0.3]"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="badge badge-pill badge-pill-gray h-5 px-2 text-[9px] font-semibold">{ticket._id.slice(-6).toUpperCase()}</span>
                  {ticket.loadId && (
                    <span className="badge badge-pill badge-pill-blue h-5 px-2 text-[9px] font-semibold">{ticket.loadId}</span>
                  )}
                  <span className={cn(
                    "badge h-5 px-2 text-[9px] font-semibold",
                    CATEGORY_BADGE[ticket.category] || "badge-pill badge-pill-gray"
                  )}>{CATEGORY_MAP[ticket.category] || ticket.category}</span>
                </div>
                <span className={cn(
                  "badge px-3 h-6",
                  ticket.status === 'open' ? "badge-pill badge-pill-amber" :
                  ticket.status === 'in_progress' ? "badge-pill badge-pill-blue" :
                  ticket.status === 'resolved' ? "badge-pill badge-pill-green" : "badge-pill badge-pill-gray"
                )}>
                  {STATUS_MAP[ticket.status] || ticket.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-ink mb-4 group-hover:text-ink transition-colors">
                 {ticket.subject}
              </h3>

              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="h-6 w-6 flex items-center justify-center rounded-lg bg-primary text-white font-semibold text-[8px]">
                       {ticket.userId.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-semibold text-muted ">
                       Opened {formatTime(ticket.createdAt)}
                    </span>
                 </div>
                 <ArrowRight size={18} weight="bold" className="text-muted opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div className="w-full max-w-xl rounded-xl border border-hairline bg-card p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-semibold tracking-tight text-ink">Open Support Ticket</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-ink">
                  <X size={24} weight="bold" />
               </button>
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="ml-1  font-semibold  text-muted">Category</label>
                    <select 
                      className="w-full rounded-md border border-hairline bg-surface-soft px-5 py-4 text-sm font-semibold outline-none focus:border-primary transition-all"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                       <option value="payment">Payment Issue</option>
                       <option value="booking">Driver No-Show</option>
                       <option value="load">Cargo Damage</option>
                       <option value="technical">Technical Issue</option>
                       <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1  font-semibold  text-muted">Associated Load</label>
                    <input 
                      className="w-full rounded-md border border-hairline bg-surface-soft px-5 py-4 text-sm font-semibold outline-none focus:border-primary transition-all" 
                      placeholder="Load ID (optional)"
                      value={formLoadId}
                      onChange={(e) => setFormLoadId(e.target.value)}
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="ml-1  font-semibold  text-muted">Subject</label>
                  <input 
                    className="w-full rounded-md border border-hairline bg-surface-soft px-5 py-4 text-sm font-semibold outline-none focus:border-primary transition-all" 
                    placeholder="Brief description of the issue"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                  />
               </div>

               <div className="space-y-2">
                  <label className="ml-1  font-semibold  text-muted">Description</label>
                  <textarea 
                    rows={4} 
                    className="w-full rounded-md border border-hairline bg-surface-soft px-5 py-4 text-sm font-semibold outline-none focus:border-primary transition-all resize-none" 
                    placeholder="Provide detailed context about the issue..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
               </div>

               <div className="p-4 rounded-md bg-danger-light border border-danger/30 flex items-start gap-4">
                  <Warning size={20} weight="fill" className="text-danger mt-1 flex-shrink-0" />
                  <div>
                     <p className="text-xs font-semibold text-danger/80 leading-relaxed ">
                        Submitting this ticket will freeze the escrow of $1,455.00 until resolved.
                     </p>
                     <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-danger text-danger focus:ring-danger"
                          checked={formFreezeEscrow}
                          onChange={(e) => setFormFreezeEscrow(e.target.checked)}
                        />
                        <span className=" font-semibold  text-danger">I understand and want to freeze the escrow.</span>
                     </label>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="btn btn-secondary flex-1 h-14 text-[11px] font-semibold "
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn btn-primary flex-1 h-14 text-[11px] font-semibold  shadow-sm disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <CircleNotch size={18} weight="bold" className="animate-spin" />
                    ) : (
                      'Submit Ticket'
                    )}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
