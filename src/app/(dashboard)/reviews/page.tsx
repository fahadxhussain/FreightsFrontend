'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  ArrowBendDownRight, 
  MagnifyingGlass, 
  Funnel,
  ArrowRight,
  Clock,
  User,
  CaretDown
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const REVIEWS = [
  {
    id: 1,
    name: 'Alpha Logistics',
    avatar: 'AL',
    role: 'Carrier',
    time: '14 days ago',
    rating: 5,
    content: 'Excellent broker to work with! Payment was released within 24 hours of delivery confirmation. Great communication throughout the entire load. Would definitely work with again.',
    loadId: 'FL-20039',
    reply: 'Thank you! Great working with Alpha Logistics — always reliable and professional. Looking forward to more loads together.'
  },
  {
    id: 2,
    name: "Mike's Carriers",
    avatar: 'MC',
    role: 'Carrier',
    time: '28 days ago',
    rating: 4,
    content: 'Good communication but the pickup was delayed by 2 hours without notice. Otherwise fair rates and quick payment.',
    loadId: 'FL-20035'
  }
];

export default function ReviewsPage() {
  const router = useRouter();

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground">My Reviews</h1>
        <p className="text-sm font-bold text-muted uppercase tracking-widest mt-1">Manage your reputation and professional feedback</p>
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl border border-border bg-card p-10 shadow-2xl mb-12">
        <div className="flex items-center gap-16 flex-wrap lg:flex-nowrap">
          <div className="text-center p-6 rounded-[2rem] bg-input border border-border shadow-inner min-w-[200px]">
            <div className="text-6xl font-black text-warning tracking-tighter mb-2">4.7</div>
            <div className="flex justify-center gap-1 text-warning mb-4">
              <Star size={24} weight="fill" />
              <Star size={24} weight="fill" />
              <Star size={24} weight="fill" />
              <Star size={24} weight="fill" />
              <Star size={24} weight="bold" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Based on 38 reviews</p>
          </div>
          
          <div className="flex-1 space-y-6">
            {[
              { label: 'Payment Speed', value: 94, score: '4.7' },
              { label: 'Communication', value: 88, score: '4.4' },
              { label: 'Professionalism', value: 92, score: '4.6' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-black uppercase tracking-widest text-foreground">{stat.label}</span>
                   <strong className="text-sm font-black text-accent">{stat.score}</strong>
                </div>
                <div className="h-3 w-full bg-input rounded-full overflow-hidden border border-border shadow-inner">
                   <div 
                     className="h-full bg-gradient-to-r from-accent to-indigo-500 rounded-full transition-all duration-1000" 
                     style={{ width: `${stat.value}%` }} 
                   />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <select className="h-11 w-44 rounded-xl border border-border bg-card px-4 text-[11px] font-black uppercase tracking-widest text-foreground outline-none shadow-sm">
           <option>Newest First</option>
           <option>Highest Rated</option>
           <option>Lowest Rated</option>
        </select>
        <div className="flex bg-card border border-border rounded-xl p-1 shadow-sm">
           {['All', '5★', '4★', '3★', '2★', '1★'].map((filter) => (
             <button key={filter} className={cn(
               "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
               filter === 'All' ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-muted hover:text-foreground"
             )}>
                {filter}
             </button>
           ))}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {REVIEWS.map((review) => (
          <div key={review.id} className="rounded-[2rem] border border-border bg-card p-6 shadow-xl hover:border-accent/30 transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-[1rem] bg-input border border-border text-accent font-black">
                   {review.avatar}
                </div>
                <div>
                   <div className="flex items-center gap-3">
                      <strong className="text-sm font-black text-foreground">{review.name}</strong>
                      <span className="badge badge-gray h-5 px-2 text-[8px] font-black">{review.role}</span>
                   </div>
                   <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">{review.time}</div>
                </div>
              </div>
              <div className="flex gap-0.5 text-warning">
                 {Array.from({ length: 5 }).map((_, i) => (
                   <Star key={i} size={18} weight={i < review.rating ? "fill" : "regular"} className={i >= review.rating ? "text-muted/30" : ""} />
                 ))}
              </div>
            </div>

            <p className="text-sm font-bold text-muted-foreground leading-relaxed mb-6">
               &ldquo;{review.content}&rdquo;
            </p>

            <div className="flex items-center gap-2 mb-6">
               <span className="text-[10px] font-black uppercase tracking-widest text-muted">Connected Load:</span>
               <button 
                 onClick={() => router.push(`/loads/${review.loadId}`)}
                 className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
               >
                  {review.loadId}
               </button>
            </div>

            {review.reply ? (
              <div className="p-6 rounded-2xl bg-input border-l-4 border-accent shadow-inner animate-in slide-in-from-left-2 duration-500">
                 <div className="flex items-center gap-3 mb-3">
                    <ArrowBendDownRight size={18} weight="bold" className="text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Your Reply</span>
                 </div>
                 <p className="text-sm font-bold text-muted-foreground">{review.reply}</p>
              </div>
            ) : (
              <button className="btn btn-secondary h-10 px-6 text-[10px] font-black uppercase tracking-widest">
                 <ArrowBendDownRight size={18} weight="bold" />
                 Reply to Review
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
         <button className="text-[11px] font-black text-muted uppercase tracking-[0.3em] hover:text-accent transition-all flex items-center gap-3 mx-auto group">
            Load More Reviews
            <CaretDown size={18} weight="bold" className="group-hover:translate-y-1 transition-transform" />
         </button>
      </div>
    </div>
  );
}
