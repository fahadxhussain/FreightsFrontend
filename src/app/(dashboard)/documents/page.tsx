'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  FilePdf,
  Image,
  DownloadSimple,
  TrashSimple,
  Plus,
  MagnifyingGlass,
  Funnel,
  UploadSimple,
  X,
  File,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

interface DocumentRecord {
  _id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  loadId: string | null;
  status: string;
  createdAt: string;
  notes: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  rate_confirmation: 'Rate Con',
  bol: 'BOL',
  pod: 'POD',
  invoice: 'Invoice',
  insurance: 'Insurance',
  other: 'Other',
};

const TYPE_COLORS: Record<string, string> = {
  rate_confirmation: 'badge-pill badge-pill-indigo',
  bol: 'badge-pill badge-pill-blue',
  pod: 'badge-pill badge-pill-green',
  invoice: 'badge-pill badge-pill-amber',
  insurance: 'badge-pill badge-pill-purple',
  other: 'badge-pill badge-pill-gray',
};

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState('bol');
  const [uploadLoadId, setUploadLoadId] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocuments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      const res = await api.get(`/documents?${params.toString()}`);
      setDocuments(res.data.data || []);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('type', uploadType);
    if (uploadLoadId) formData.append('loadId', uploadLoadId);
    if (uploadNotes) formData.append('notes', uploadNotes);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadType('bol');
      setUploadLoadId('');
      setUploadNotes('');
      fetchDocuments();
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Document deleted');
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function getFileExtension(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'img';
    return 'file';
  }

  const filteredDocs = documents.filter((doc) =>
    searchQuery
      ? doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.loadId && doc.loadId.toLowerCase().includes(searchQuery.toLowerCase()))
      : true,
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Document Vault</h1>
          <p className="text-sm text-muted">Manage shipment documents and records</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-active"
        >
          <Plus size={18} /> Upload Document
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="w-full rounded-lg border border-hairline bg-card px-10 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="Search by filename or load ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-lg border border-hairline bg-card px-3 text-sm outline-none"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="rate_confirmation">Rate Con</option>
          <option value="bol">BOL</option>
          <option value="pod">POD</option>
          <option value="invoice">Invoice</option>
          <option value="insurance">Insurance</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-hairline bg-muted/30 text-xs font-semibold uppercase text-muted">
                <th className="px-5 py-3">Filename</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Load ID</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc._id} className="group hover:bg-surface-soft">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg',
                            getFileExtension(doc.fileType) === 'pdf'
                              ? 'bg-danger-light text-danger'
                              : 'bg-surface-soft text-ink',
                          )}
                        >
                          {getFileExtension(doc.fileType) === 'pdf' ? (
                            <FilePdf size={20} />
                          ) : getFileExtension(doc.fileType) === 'img' ? (
                            <Image size={20} />
                          ) : (
                            <File size={20} />
                          )}
                        </div>
                        <span className="text-sm font-medium text-ink">{doc.fileName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('badge px-2 py-0.5 text-xs', TYPE_COLORS[doc.type] || 'badge-pill badge-pill-gray')}>
                        {TYPE_LABELS[doc.type] || doc.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-ink">{doc.loadId || '—'}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          doc.status === 'approved'
                            ? 'bg-success-light text-success'
                            : doc.status === 'rejected'
                              ? 'bg-danger-light text-danger'
                              : 'bg-warning-light text-warning',
                        )}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted">{formatFileSize(doc.fileSize)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-primary-light hover:text-ink"
                        >
                          <DownloadSimple size={18} />
                        </a>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-danger-light hover:text-danger"
                        >
                          <TrashSimple size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-md rounded-xl border border-hairline bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">Upload Document</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-muted hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Document Type</label>
                <select
                  className="w-full rounded-lg border border-hairline bg-surface-soft px-3 py-2.5 text-sm outline-none"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  required
                >
                  <option value="bol">BOL (Bill of Lading)</option>
                  <option value="pod">POD (Proof of Delivery)</option>
                  <option value="rate_confirmation">Rate Confirmation</option>
                  <option value="invoice">Invoice</option>
                  <option value="insurance">Insurance Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Load ID (optional)</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-hairline bg-surface-soft px-3 py-2.5 text-sm outline-none"
                  placeholder="e.g. 661f..."
                  value={uploadLoadId}
                  onChange={(e) => setUploadLoadId(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">File</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                  required
                />
                <p className="mt-1 text-xs text-muted">Max 50MB. PDF, JPG, PNG, DOC</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Notes (optional)</label>
                <textarea
                  className="w-full rounded-lg border border-hairline bg-surface-soft px-3 py-2.5 text-sm outline-none"
                  rows={2}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 rounded-lg border border-hairline py-2.5 text-sm font-medium text-ink hover:bg-surface-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-active disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}