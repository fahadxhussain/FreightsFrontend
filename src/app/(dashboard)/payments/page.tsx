"use client";

import { useState } from "react";
import {
  CurrencyDollar,
  Vault,
  FileText,
  DownloadSimple,
  MagnifyingGlass,
  Funnel,
  ArrowRight,
  DotsThreeVertical,
  CalendarBlank,
  CreditCard,
  Bank,
  Plus,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const INVOICES = [
  {
    id: "INV-10042",
    loadId: "FL-20042",
    party: "Alpha Logistics",
    amount: 1455.0,
    status: "Sent",
    date: "Apr 2, 2025",
  },
  {
    id: "INV-10041",
    loadId: "FL-20041",
    party: "TransRoute LLC",
    amount: 2037.0,
    status: "Paid",
    date: "Mar 30, 2025",
  },
  {
    id: "INV-10040",
    loadId: "FL-20039",
    party: "Mike's Carriers",
    amount: 1746.0,
    status: "Overdue",
    date: "Mar 25, 2025",
  },
  {
    id: "INV-10039",
    loadId: "FL-20038",
    party: "QuickShip Inc.",
    amount: 921.5,
    status: "Draft",
    date: "Mar 22, 2025",
  },
  {
    id: "INV-10038",
    loadId: "FL-20035",
    party: "Alpha Logistics",
    amount: 1164.0,
    status: "Paid",
    date: "Mar 18, 2025",
  },
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("Invoices");

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Payments & Settlements
          </h1>
          <p className="text-sm font-bold text-muted uppercase tracking-widest mt-1">
            Manage invoices, escrow, and financial history
          </p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary h-12 px-6 text-[11px] font-black uppercase tracking-widest shadow-sm">
            <DownloadSimple size={20} weight="bold" />
            Export CSV
          </button>
          <button className="btn btn-primary h-12 px-6 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20">
            <Plus size={20} weight="bold" />
            Connect Bank
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-32 w-32 bg-success opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
          <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-success-light text-success shadow-lg shadow-success/10 mb-4">
            <CurrencyDollar size={24} weight="bold" />
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            $24,650
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted mt-1">
            Total Paid Out (This Month)
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500 opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
          <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/10 mb-4">
            <Vault size={24} weight="bold" />
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            $4,500
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted mt-1">
            Held in Escrow
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-32 w-32 bg-accent opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
          <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-accent-light text-accent shadow-lg shadow-accent/10 mb-4">
            <FileText size={24} weight="bold" />
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            3
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted mt-1">
            Pending Invoices
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex items-center gap-2">
        {["Invoices", "Escrow", "Payment History"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-3 text-[11px] font-black uppercase tracking-wider rounded-2xl border transition-all",
              activeTab === tab
                ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                : "bg-card border-border text-muted hover:border-muted hover:text-foreground",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex bg-card border border-border rounded-xl p-1 gap-1">
          {["All", "Draft", "Sent", "Paid", "Overdue"].map((chip) => (
            <button
              key={chip}
              className={cn(
                "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                chip === "All"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            className="w-full rounded-xl border border-border bg-card px-11 py-3 text-[13px] font-medium outline-none transition-all focus:border-accent"
            placeholder="Search invoice numbers..."
          />
        </div>
        <input
          type="date"
          className="h-11 w-44 rounded-xl border border-border bg-card px-4 text-[13px] font-bold text-foreground outline-none"
        />
      </div>

      {/* Invoices Table */}
      <div className="rounded-[2rem] border border-border bg-card shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Invoice #
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Load ID
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Party
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Amount
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Date
                </th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {INVOICES.map((inv) => (
                <tr
                  key={inv.id}
                  className="group hover:bg-card-hover transition-colors cursor-pointer"
                >
                  <td className="px-8 py-5 text-[13px] font-black text-foreground">
                    {inv.id}
                  </td>
                  <td className="px-8 py-5 text-[13px] font-bold text-muted-foreground">
                    {inv.loadId}
                  </td>
                  <td className="px-8 py-5 text-[13px] font-bold text-muted-foreground">
                    {inv.party}
                  </td>
                  <td className="px-8 py-5 text-[13px] font-black text-foreground">
                    $
                    {inv.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={cn(
                        "badge px-3 h-6",
                        inv.status === "Paid"
                          ? "badge-green"
                          : inv.status === "Sent"
                            ? "badge-blue"
                            : inv.status === "Overdue"
                              ? "badge-red"
                              : "badge-gray",
                      )}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[13px] font-bold text-muted">
                    {inv.date}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent-light rounded-lg transition-all flex items-center gap-2 ml-auto">
                      View
                      <ArrowRight size={14} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
