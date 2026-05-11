'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowRight
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const TICKETS = [
  { id: 'TK-1042', loadId: 'FL-20042', category: 'Payment', status: 'Open', title: 'Carrier claims detention not paid', user: 'Alpha Logistics', time: '2 days ago', avatar: 'AL' },
  { id: 'TK-1039', loadId: 'FL-20039', category: 'Load Issue', status: 'In Progress', title: 'Minor cargo damage at delivery — photos attached', user: "Mike's Carriers", time: '5 days ago', avatar: 'MC' },
  { id: 'TK-1035', loadId: 'FL-20035', category: 'Technical', status: 'Resolved', title: 'GPS not updating for vehicle FB-3012', user: 'System', time: '12 days ago' },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('Open');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Support & Disputes</h1>
          <p className="text-sm font-bold text-muted uppercase tracking-widest mt-1">Get help or resolve disputes with our specialist team</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-lg shadow-xl shadow-accent/20"
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
              "whitespace-nowrap px-6 py-3 text-[11px] font-black uppercase tracking-wider rounded-2xl border transition-all",
              activeTab === tab 
                ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" 
                : "bg-card border-border text-muted hover:border-muted hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {TICKETS.map((ticket) => (
          <div 
            key={ticket.id} 
            className={cn(
              "rounded-[2rem] border border-border bg-card p-6 shadow-xl hover:border-accent/30 transition-all group cursor-pointer",
              ticket.status === 'Resolved' && "opacity-60 grayscale-[0.3]"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="badge badge-gray h-5 px-2 text-[9px] font-black">{ticket.id}</span>
                <span className="badge badge-blue h-5 px-2 text-[9px] font-black">{ticket.loadId}</span>
                <span className={cn(
                  "badge h-5 px-2 text-[9px] font-black",
                  ticket.category === 'Payment' ? "badge-red" : "badge-amber"
                )}>{ticket.category}</span>
              </div>
              <span className={cn(
                "badge px-3 h-6",
                ticket.status === 'Open' ? "badge-amber" :
                ticket.status === 'In Progress' ? "badge-blue" :
                ticket.status === 'Resolved' ? "badge-green" : "badge-gray"
              )}>
                {ticket.status}
              </span>
            </div>

            <h3 className="text-lg font-black tracking-tight text-foreground mb-4 group-hover:text-accent transition-colors">
               {ticket.title}
            </h3>

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  {ticket.avatar && (
                    <div className="h-6 w-6 flex items-center justify-center rounded-lg bg-accent text-white font-black text-[8px]">
                       {ticket.avatar}
                    </div>
                  )}
                  <span className="text-[11px] font-black text-muted uppercase tracking-widest">
                     {ticket.user} · Opened {ticket.time}
                  </span>
               </div>
               <ArrowRight size={18} weight="bold" className="text-muted opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
            </div>
          </div>
        ))}
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black tracking-tight text-foreground">Open Support Ticket</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-foreground">
                  <X size={24} weight="bold" />
               </button>
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Category</label>
                    <select className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-black outline-none focus:border-accent transition-all">
                       <option>Payment Issue</option>
                       <option>Driver No-Show</option>
                       <option>Cargo Damage</option>
                       <option>Delivery Delay</option>
                       <option>Document Issue</option>
                       <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Associated Load</label>
                    <select className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-black outline-none focus:border-accent transition-all">
                       <option>FL-20042 · Chicago → Dallas</option>
                       <option>FL-20041 · Miami → Atlanta</option>
                       <option>None / General Issue</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Subject</label>
                  <input className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-black outline-none focus:border-accent transition-all" placeholder="Brief description of the issue" />
               </div>

               <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Description</label>
                  <textarea rows={4} className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-black outline-none focus:border-accent transition-all resize-none" placeholder="Provide detailed context about the issue..." />
               </div>

               <div className="p-4 rounded-2xl bg-danger-light border border-danger/30 flex items-start gap-4">
                  <Warning size={20} weight="fill" className="text-danger mt-1 flex-shrink-0" />
                  <div>
                     <p className="text-xs font-black text-danger/80 leading-relaxed uppercase tracking-widest">
                        Submitting this ticket will freeze the escrow of $1,455.00 until resolved.
                     </p>
                     <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 rounded border-danger text-danger focus:ring-danger" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-danger">I understand and want to freeze the escrow.</span>
                     </label>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1 h-14 text-[11px] font-black uppercase tracking-widest">Cancel</button>
                  <button className="btn btn-primary flex-1 h-14 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20">Submit Ticket</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
