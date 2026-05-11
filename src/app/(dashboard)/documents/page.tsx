'use client';

import { useState } from 'react';
import { 
  FilePdf, 
  Image, 
  FileText, 
  DownloadSimple, 
  TrashSimple, 
  Plus, 
  MagnifyingGlass, 
  Funnel,
  UploadSimple,
  X,
  File
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const DOCS = [
  { id: 1, name: 'rate_con_FL20042.pdf', type: 'Rate Con', loadId: 'FL-20042', user: 'John Smith', date: 'Apr 1, 2025', size: '245 KB', ext: 'pdf' },
  { id: 2, name: 'BOL_FL20042.pdf', type: 'BOL', loadId: 'FL-20042', user: 'Mike Thompson', date: 'Apr 2, 2025', size: '312 KB', ext: 'pdf' },
  { id: 3, name: 'POD_FL20041.jpg', type: 'POD', loadId: 'FL-20041', user: 'Sarah Johnson', date: 'Mar 31, 2025', size: '1.2 MB', ext: 'jpg' },
  { id: 4, name: 'insurance_cert.pdf', type: 'Insurance', loadId: '—', user: "Mike's Carriers", date: 'Mar 15, 2025', size: '890 KB', ext: 'pdf' },
];

export default function DocumentVaultPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Document Vault</h1>
          <p className="text-sm font-bold text-muted uppercase tracking-widest mt-1">Secure centralized storage for all shipment records</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="btn btn-primary btn-lg shadow-xl shadow-accent/20"
        >
          <Plus size={20} weight="bold" />
          Upload Document
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <MagnifyingGlass size={18} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            className="w-full rounded-xl border border-border bg-card px-11 py-3 text-[13px] font-medium outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/5" 
            placeholder="Search by filename, load ID, or user..." 
          />
        </div>
        <select className="h-12 w-48 rounded-xl border border-border bg-card px-4 text-[13px] font-bold text-foreground outline-none appearance-none cursor-pointer hover:border-muted transition-colors">
          <option>All Types</option>
          <option>BOL</option>
          <option>POD</option>
          <option>Rate Con</option>
          <option>Insurance</option>
        </select>
        <input 
          type="date" 
          className="h-12 w-48 rounded-xl border border-border bg-card px-4 text-[13px] font-bold text-foreground outline-none cursor-pointer hover:border-muted transition-colors" 
        />
        <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card text-muted hover:text-accent hover:border-accent transition-all">
          <Funnel size={20} weight="bold" />
        </button>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Filename</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Type</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Load ID</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Uploaded By</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Size</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DOCS.map((doc) => (
                <tr key={doc.id} className="group hover:bg-card-hover transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        doc.ext === 'pdf' ? "bg-danger-light text-danger" : "bg-accent-light text-accent"
                      )}>
                        {doc.ext === 'pdf' ? <FilePdf size={24} weight="bold" /> : <Image size={24} weight="bold" />}
                      </div>
                      <span className="text-sm font-black text-foreground">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "badge px-3 h-6",
                      doc.type === 'Rate Con' ? "badge-indigo" :
                      doc.type === 'BOL' ? "badge-blue" :
                      doc.type === 'POD' ? "badge-green" : "badge-amber"
                    )}>
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[13px] font-black text-foreground">{doc.loadId}</td>
                  <td className="px-8 py-5 text-[13px] font-bold text-muted-foreground">{doc.user}</td>
                  <td className="px-8 py-5 text-[13px] font-bold text-muted">{doc.date}</td>
                  <td className="px-8 py-5 text-[13px] font-bold text-muted">{doc.size}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-muted hover:bg-muted/10 hover:text-accent transition-all">
                        <DownloadSimple size={20} weight="bold" />
                      </button>
                      <button className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-muted hover:bg-danger-light hover:text-danger transition-all">
                        <TrashSimple size={20} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-black tracking-tight text-foreground">Upload Document</h3>
               <button onClick={() => setIsUploadModalOpen(false)} className="text-muted hover:text-foreground">
                  <X size={24} weight="bold" />
               </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Load ID</label>
                <select className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-black outline-none focus:border-accent transition-all">
                   <option>FL-20042 · Chicago → Dallas</option>
                   <option>FL-20041 · Miami → Atlanta</option>
                   <option>General Document (No Load ID)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Document Type</label>
                <select className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-black outline-none focus:border-accent transition-all">
                   <option>BOL (Bill of Lading)</option>
                   <option>POD (Proof of Delivery)</option>
                   <option>Rate Confirmation</option>
                   <option>Insurance Certificate</option>
                   <option>Scale Ticket</option>
                   <option>Lumper Receipt</option>
                   <option>Other</option>
                </select>
              </div>

              <div className="rounded-[2rem] border-2 border-dashed border-border p-12 bg-input/50 hover:border-accent/30 transition-all cursor-pointer text-center group">
                <UploadSimple size={48} weight="duotone" className="mx-auto mb-4 text-muted group-hover:text-accent group-hover:scale-110 transition-all" />
                <p className="text-sm font-black text-foreground uppercase tracking-widest">Drag file here or click to browse</p>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-2">PDF, JPG, PNG · Max 25MB</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="btn btn-secondary flex-1 h-14 text-[11px] font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button className="btn btn-primary flex-1 h-14 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20">
                  Upload & Secure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
