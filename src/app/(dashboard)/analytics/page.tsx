"use client";

import { useState, useEffect } from "react";
import {
  DownloadSimple,
  CurrencyDollar,
  TrendUp,
  TrendDown,
  Package,
  Clock,
  RoadHorizon,
  CalendarBlank,
  Export,
  Funnel,
  CheckCircle,
  Truck,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";

const REVENUE_DATA = [
  { name: "Week 1", revenue: 28000, expenses: 2800 },
  { name: "Week 2", revenue: 32000, expenses: 3200 },
  { name: "Week 3", revenue: 35000, expenses: 3500 },
  { name: "Week 4", revenue: 33400, expenses: 3340 },
];

const SHIPPER_DATA = [
  { name: "Acme Corp", revenue: 32000 },
  { name: "Global Foods", revenue: 28000 },
  { name: "Steel Dynamics", revenue: 24000 },
  { name: "AutoNation", revenue: 22000 },
  { name: "QuickShip", revenue: 18000 },
];

const STATUS_DATA = [
  { name: "Week 1", active: 8, booked: 5, delivered: 12, cancelled: 1 },
  { name: "Week 2", active: 6, booked: 8, delivered: 15, cancelled: 0 },
  { name: "Week 3", active: 10, booked: 6, delivered: 18, cancelled: 2 },
  { name: "Week 4", active: 7, booked: 9, delivered: 20, cancelled: 1 },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState("Last 30 Days");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/analytics/summary");
      setData(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const kpis = [
    {
      label: "Total Revenue",
      value: `$${(data?.revenueData?.reduce((acc: number, d: any) => acc + d.revenue, 0) || 0).toLocaleString()}`,
      trend: "+15%",
      color: "success",
      icon: CurrencyDollar,
    },
    {
      label: "Active Loads",
      value:
        data?.statusCounts?.find((c: any) => c._id === "posted")?.count || 0,
      trend: "+12%",
      color: "accent",
      icon: Package,
    },
    {
      label: "Completed",
      value:
        data?.statusCounts?.find((c: any) => c._id === "delivered")?.count || 0,
      trend: "+18%",
      color: "indigo",
      icon: CheckCircle,
    },
    {
      label: "In Transit",
      value:
        data?.statusCounts?.find((c: any) => c._id === "in-transit")?.count ||
        0,
      trend: "+3%",
      color: "amber",
      icon: Truck,
    },
  ];

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Analytics
          </h1>
          <p className="text-sm font-bold text-muted  mt-1">
            Real-time performance metrics and insights
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="h-12 w-48 rounded-md border border-hairline bg-card px-4 text-[13px] font-bold text-ink outline-none appearance-none cursor-pointer hover:border-muted transition-colors shadow-sm"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Year to Date</option>
          </select>
          <button className="btn btn-secondary h-12 px-6 text-[11px] font-semibold  shadow-sm">
            <DownloadSimple size={20} weight="bold" />
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="rounded-md border border-hairline bg-card p-6 shadow-xl relative overflow-hidden group"
          >
            <div
              className={cn(
                "absolute top-0 right-0 h-24 w-24 opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000",
                `bg-${kpi.color}`,
              )}
            />
            <div className="flex items-center gap-4 mb-4">
              <div
                className={cn(
                  "h-12 w-12 flex items-center justify-center rounded-xl shadow-lg",
                  `bg-${kpi.color}-light text-${kpi.color}`,
                )}
              >
                <kpi.icon size={24} weight="bold" />
              </div>
              <div
                className={cn(
                  "badge px-2 h-5",
                  `badge-${kpi.color === "success" ? "green" : kpi.color === "danger" ? "red" : "blue"}`,
                )}
              >
                {kpi.trend}
              </div>
            </div>
            <div className="text-3xl font-semibold text-ink tracking-tighter">
              {kpi.value}
            </div>
            <div className=" font-semibold  text-muted mt-1">
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="rounded-xl border border-hairline bg-card p-10 shadow-2xl mb-8 overflow-hidden group">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-ink">
              Revenue vs Expenses
            </h3>
            <p className="text-xs font-bold text-muted  mt-1">
              Financial performance over the selected period
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className=" font-semibold  text-muted">
                Revenue
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-danger" />
              <span className=" font-semibold  text-muted">
                Expenses
              </span>
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data?.revenueData || []}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--muted)",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--muted)",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  padding: "12px",
                }}
                labelStyle={{
                  fontSize: "10px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                  color: "var(--muted)",
                }}
                itemStyle={{
                  fontSize: "13px",
                  fontWeight: "800",
                  padding: "2px 0",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Shipper Bar Chart */}
        <div className="rounded-xl border border-hairline bg-card p-10 shadow-2xl">
          <h3 className="text-xl font-semibold tracking-tight text-ink mb-8">
            Revenue by Shipper
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.shipperData || []}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--border)"
                  opacity={0.5}
                />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--foreground)",
                    fontSize: 11,
                    fontWeight: "900",
                  }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--accent)"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                >
                  {(data?.shipperData || []).map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#3b82f6",
                            "#6366f1",
                            "#8b5cf6",
                            "#a855f7",
                            "#d946ef",
                          ][index % 5]
                        }
                      />
                    ),
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Load Status Bar Chart */}
        <div className="rounded-xl border border-hairline bg-card p-10 shadow-2xl">
          <h3 className="text-xl font-semibold tracking-tight text-ink mb-8">
            Loads by Status
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STATUS_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--muted)",
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--muted)",
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                />
                <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="booked" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-hairline bg-card p-6 shadow-xl flex items-center gap-6">
          <div className="h-16 w-16 flex items-center justify-center rounded-[1.25rem] bg-surface-soft border border-hairline text-ink">
            <RoadHorizon size={32} weight="bold" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-ink tracking-tighter">
              42,800 mi
            </div>
            <div className=" font-semibold  text-muted mt-1">
              Total Miles Shipped
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-hairline bg-card p-6 shadow-xl flex items-center gap-6">
          <div className="h-16 w-16 flex items-center justify-center rounded-[1.25rem] bg-success-light border border-success/20 text-success">
            <CurrencyDollar size={32} weight="bold" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-ink tracking-tighter">
              $2.12/mi
            </div>
            <div className=" font-semibold  text-muted mt-1">
              Avg Rate per Mile
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-hairline bg-card p-6 shadow-xl flex items-center gap-6">
          <div className="h-16 w-16 flex items-center justify-center rounded-[1.25rem] bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Clock size={32} weight="bold" />
          </div>
          <div>
            <div className="text-2xl font-semibold text-ink tracking-tighter">
              2.4 days
            </div>
            <div className=" font-semibold  text-muted mt-1">
              Avg Load Duration
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
