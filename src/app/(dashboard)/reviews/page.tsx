'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  ArrowBendDownRight,
  MagnifyingGlass,
  Funnel,
  ArrowRight,
  Clock,
  User,
  Package,
  CircleNotch,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';

interface Review {
  _id: string;
  reviewerId: string;
  revieweeId: string;
  loadId: string;
  rating: number;
  communication: number;
  punctuality: number;
  professionalism: number;
  comment: string | null;
  createdAt: string;
}

export default function ReviewsPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/reviews/user/${user.id}`);
      const data = res.data?.data;
      setReviews(data?.reviews ?? []);
      setAvgRating(data?.avgRating ?? 0);
      setTotalReviews(data?.total ?? 0);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || 'Failed to load reviews';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter && r.rating !== ratingFilter) return false;
    if (searchQuery && !r.comment?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: totalReviews > 0 ? (reviews.filter((r) => r.rating === star).length / totalReviews) * 100 : 0,
  }));

  const timeAgo = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Reviews</h1>
        <p className="text-sm font-bold text-muted uppercase tracking-widest mt-1">
          Your reputation and professional feedback
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <CircleNotch size={36} weight="bold" className="animate-spin text-accent" />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-8">
            <div className="grid grid-cols-[1fr_1fr] gap-8">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-black text-foreground">{avgRating.toFixed(1)}</div>
                  <div className="flex items-center gap-1 mt-1 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        weight={i < Math.round(avgRating) ? 'fill' : 'regular'}
                        className={i < Math.round(avgRating) ? 'text-amber-500' : 'text-muted'}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] font-bold text-muted mt-1">{totalReviews} reviews</div>
                </div>
              </div>

              <div className="space-y-1.5">
                {ratingBreakdown.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2 text-[10px]">
                    <span className="w-3 font-bold text-muted">{star}</span>
                    <Star size={12} weight="fill" className="text-amber-500" />
                    <div className="flex-1 h-2 rounded-full bg-input overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right font-bold text-muted">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5 text-xs font-medium outline-none focus:border-accent"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground outline-none cursor-pointer"
              value={ratingFilter ?? ''}
              onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>{s} Star{s > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted">
                <Package size={48} weight="thin" className="mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No reviews yet</p>
                <p className="text-[10px] text-muted mt-1">Complete more loads to receive feedback</p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div key={review._id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
                        {review.reviewerId.slice(-2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-black text-foreground">
                          User {review.reviewerId.slice(-6).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted">
                          <Clock size={12} weight="bold" />
                          {timeAgo(review.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          weight={i < review.rating ? 'fill' : 'regular'}
                          className={i < review.rating ? 'text-amber-500' : 'text-muted'}
                        />
                      ))}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-xs text-foreground leading-relaxed mb-3">{review.comment}</p>
                  )}

                  <div className="flex items-center gap-4 text-[10px] text-muted">
                    <span>Communication: {review.communication}/5</span>
                    <span>Punctuality: {review.punctuality}/5</span>
                    <span>Professionalism: {review.professionalism}/5</span>
                  </div>

                  <button
                    className="flex items-center gap-1.5 text-[10px] font-bold text-accent mt-3 hover:underline"
                    onClick={() => router.push(`/loads/${review.loadId}`)}
                  >
                    View Load <ArrowRight size={12} weight="bold" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
