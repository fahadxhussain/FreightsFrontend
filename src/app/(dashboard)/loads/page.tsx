"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  DotsThreeVertical,
  Funnel,
  MagnifyingGlass,
  ArrowLeft,
  ArrowRight,
  ArrowClockwise,
  Package,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Load {
  _id: string;
  origin: {
    city: string;
    state: string;
  };
  destination: {
    city: string;
    state: string;
  };
  truckType: string;
  rate: number;
  pickupDate: string;
  status: string;
}

interface LoadsApiResponse {
  data?: {
    loads?: Load[];
    hasMore?: boolean;
    nextCursor?: string;
    total?: number;
  };
}

export default function LoadListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const cursorStackRef = useRef<string[]>([]);

  const fetchLoads = useCallback(
    async (page?: number, pageCursor?: string | null) => {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = {};

        // Status tab filter — map display labels to API status values
        if (activeTab !== "All") {
          const statusMap: Record<string, string> = {
            Draft: "draft",
            Posted: "posted",
            Booked: "booked",
            "In Transit": "in_transit",
            Delivered: "delivered",
            Completed: "completed",
            Cancelled: "cancelled",
          };
          params.status =
            statusMap[activeTab] || activeTab.toLowerCase().replace(" ", "_");
        }

        // Search
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // Equipment filter
        if (equipmentFilter) {
          params.truckType = equipmentFilter;
        }

        // Date filter
        if (dateFilter) {
          params.pickupDate = dateFilter;
        }

        // Pagination
        params.limit = 10;
        if (pageCursor) {
          params.cursor = pageCursor;
        }

        const response = await api.get<LoadsApiResponse>("/loads", { params });
        const data = response.data?.data;
        const fetchedLoads: Load[] = Array.isArray(data?.loads)
          ? data.loads
          : Array.isArray(data)
            ? data
            : [];
        setLoads(fetchedLoads);
        setHasMore(data?.hasMore ?? false);
        setCursor(data?.nextCursor ?? null);
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message || "Failed to fetch loads";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, searchQuery, equipmentFilter, dateFilter],
  );

  // Fetch when filters change (debounced via ref)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchLoads(1, null);
      return;
    }
    // Subsequent filter changes — reset to page 1
    setCurrentPage(1);
    cursorStackRef.current = [];
    fetchLoads(1, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchQuery, equipmentFilter, dateFilter]);

  const handleNextPage = () => {
    if (!hasMore || !cursor) return;
    cursorStackRef.current.push(cursor);
    setCurrentPage((prev) => prev + 1);
    fetchLoads(currentPage + 1, cursor);
  };

  const handlePrevPage = () => {
    if (currentPage <= 1) return;
    // Pop the last cursor to go back
    cursorStackRef.current.pop();
    const prevCursor =
      cursorStackRef.current.length > 0
        ? cursorStackRef.current[cursorStackRef.current.length - 1]
        : null;
    setCurrentPage((prev) => prev - 1);
    fetchLoads(currentPage - 1, prevCursor);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    cursorStackRef.current = [];
    fetchLoads(1, null);
  };

  const filteredLoads = loads;

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Loads
          </h1>
          <p className="text-sm font-bold text-muted  mt-1">
            Manage your posted and active loads
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRefresh}
            className="btn btn-secondary h-12 w-12 shadow-sm"
          >
            <ArrowClockwise
              size={20}
              weight="bold"
              className={isLoading ? "animate-spin" : ""}
            />
          </button>
          <button
            onClick={() => router.push("/loads/create")}
            className="btn btn-primary btn-lg shadow-sm"
          >
            <Plus size={20} weight="bold" />
            Post New Load
          </button>
        </div>
      </div>

      {/* Tabs — spec: Draft | Posted | Booked | In-Transit | Delivered | Completed | Cancelled */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          "All",
          "Draft",
          "Posted",
          "Booked",
          "In Transit",
          "Delivered",
          "Completed",
          "Cancelled",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "whitespace-nowrap px-5 py-2.5 text-[11px] font-semibold  rounded-md border transition-all",
              activeTab === tab
                ? "bg-primary border-primary text-white shadow-sm"
                : "bg-card border-hairline text-muted hover:border-muted hover:text-ink",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            className="w-full rounded-md border border-hairline bg-card px-11 py-3 text-[13px] font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-ink"
            placeholder="Search by Load ID, Origin, or Destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-12 w-48 rounded-md border border-hairline bg-card px-4 text-[13px] font-bold text-ink outline-none appearance-none cursor-pointer hover:border-muted transition-colors"
          value={equipmentFilter}
          onChange={(e) => setEquipmentFilter(e.target.value)}
        >
          <option value="">Equipment Type</option>
          <option value="Flatbed">Flatbed</option>
          <option value="Dry Van">Dry Van</option>
          <option value="Reefer">Reefer</option>
          <option value="Step Deck">Step Deck</option>
        </select>
        <input
          type="date"
          className="h-12 w-48 rounded-md border border-hairline bg-card px-4 text-[13px] font-bold text-ink outline-none cursor-pointer hover:border-muted transition-colors"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <button className="flex h-12 w-12 items-center justify-center rounded-md border border-hairline bg-card text-muted hover:text-ink hover:border-primary transition-all">
          <Funnel size={20} weight="bold" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-hairline bg-card shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-muted/30">
                <th className="px-6 py-4  font-semibold  text-muted">
                  Load ID
                </th>
                <th className="px-6 py-4  font-semibold  text-muted">
                  Origin
                </th>
                <th className="px-6 py-4  font-semibold  text-muted">
                  Destination
                </th>
                <th className="px-6 py-4  font-semibold  text-muted">
                  Equipment
                </th>
                <th className="px-6 py-4  font-semibold  text-muted">
                  Rate
                </th>
                <th className="px-6 py-4  font-semibold  text-muted">
                  Pickup
                </th>
                <th className="px-6 py-4  font-semibold  text-muted">
                  Status
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="px-6 py-8 bg-card/50" />
                    </tr>
                  ))
              ) : filteredLoads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-muted">
                    <Package
                      size={48}
                      weight="thin"
                      className="mx-auto mb-4 opacity-20"
                    />
                    <p className="font-bold  text-xs">
                      No loads found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLoads.map((load) => (
                  <tr
                    key={load._id}
                    className="group hover:bg-surface-soft transition-colors cursor-pointer"
                    onClick={() => router.push(`/loads/${load._id}`)}
                  >
                    <td className="px-6 py-5 text-[13px] font-semibold text-ink">
                      {load._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-5 text-[13px] font-bold text-muted">
                      {load.origin.city}, {load.origin.state}
                    </td>
                    <td className="px-6 py-5 text-[13px] font-bold text-muted">
                      {load.destination.city}, {load.destination.state}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          "badge",
                          load.truckType === "Flatbed"
                            ? "badge-pill badge-pill-blue"
                            : load.truckType === "Reefer"
                              ? "badge-pill badge-pill-indigo"
                              : load.truckType === "Dry Van"
                                ? "badge-pill badge-pill-amber"
                                : "badge-pill badge-pill-gray",
                        )}
                      >
                        {load.truckType}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[13px] font-semibold text-ink">
                      ${load.rate.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-[13px] font-bold text-muted">
                      {new Date(load.pickupDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={cn(
                          "badge",
                          load.status === "draft"
                            ? "badge-pill badge-pill-gray"
                            : load.status === "posted"
                              ? "badge-pill badge-pill-green"
                              : load.status === "in_transit"
                                ? "badge-pill badge-pill-amber"
                                : load.status === "booked"
                                  ? "badge-pill badge-pill-indigo"
                                  : load.status === "delivered"
                                    ? "badge-pill badge-pill-green"
                                    : load.status === "completed"
                                      ? "badge-pill badge-pill-green"
                                      : load.status === "cancelled"
                                        ? "badge-pill badge-pill-red"
                                        : "badge-pill badge-pill-gray",
                        )}
                      >
                        {load.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted hover:bg-muted/50 hover:text-ink transition-all">
                        <DotsThreeVertical size={20} weight="bold" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-hairline bg-muted/10 px-8 py-5">
          <span className="text-xs font-bold text-muted ">
            Page {currentPage} — {filteredLoads.length} loads
          </span>
          <div className="flex gap-2">
            <button
              className="btn btn-secondary h-9 px-4  font-semibold  disabled:opacity-30"
              disabled={currentPage <= 1}
              onClick={handlePrevPage}
            >
              <ArrowLeft size={14} weight="bold" />
              Prev
            </button>
            <button className="h-9 w-9 rounded-lg border text-xs font-semibold bg-primary border-primary text-white">
              {currentPage}
            </button>
            <button
              className="btn btn-secondary h-9 px-4  font-semibold  disabled:opacity-30"
              disabled={!hasMore}
              onClick={handleNextPage}
            >
              Next
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
