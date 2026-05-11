'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, FileText, User, Clock } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import api from '@/lib/axios';

interface VerificationUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  identityStatus: string;
  verificationMethod: string;
  createdAt: string;
  verificationDocuments: { url: string; type: string }[];
}

export default function AdminVerificationsPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [users, setUsers] = useState<VerificationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<VerificationUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (user?.role && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user?.role, router]);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    try {
      const res = await api.get('/admin/verifications?status=submitted');
      setUsers(res.data.data?.data || []);
    } catch {
      toast.error('Failed to load verifications');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(userId: string) {
    setIsProcessing(true);
    try {
      await api.post(`/admin/verifications/${userId}/approve`);
      toast.success('Identity approved');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSelectedUser(null);
    } catch {
      toast.error('Failed to approve');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject(userId: string) {
    setIsProcessing(true);
    try {
      await api.post(`/admin/verifications/${userId}/reject`, { reason: 'Documents insufficient or unclear' });
      toast.success('Identity rejected');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSelectedUser(null);
    } catch {
      toast.error('Failed to reject');
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Identity Verifications</h1>
        <p className="text-sm text-muted">Review and approve user identity documents</p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-success" />
          <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
          <p className="text-sm text-muted">No pending verifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div
              key={u._id}
              className={cn(
                'rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/30',
                selectedUser?._id === u._id && 'ring-2 ring-accent/20',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light">
                    <User size={24} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {u.firstName} {u.lastName}
                    </h3>
                    <p className="text-sm text-muted">{u.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-indigo-light px-2 py-0.5 text-xs font-medium text-indigo">
                        {u.role}
                      </span>
                      <span className="rounded-full bg-warning-light px-2 py-0.5 text-xs font-medium text-warning">
                        {u.verificationMethod || 'fmcsa'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Clock size={12} />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedUser(selectedUser?._id === u._id ? null : u)}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-muted hover:text-accent"
                  >
                    <Eye size={16} />
                    Documents ({u.verificationDocuments.length})
                  </button>
                  <button
                    onClick={() => handleApprove(u._id)}
                    disabled={isProcessing}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-success px-3 text-sm font-medium text-white hover:bg-success/90 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(u._id)}
                    disabled={isProcessing}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-danger px-3 text-sm font-medium text-white hover:bg-danger/90 disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>

              {selectedUser?._id === u._id && (
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
                  {u.verificationDocuments.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-accent/30"
                    >
                      <FileText size={20} className="text-accent" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Document {idx + 1}</p>
                        <p className="text-xs text-muted">{doc.type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}