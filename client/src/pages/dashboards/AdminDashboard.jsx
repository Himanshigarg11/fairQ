import React, { useEffect, useState } from "react";
import {
  fetchStats,
  fetchDaily,
  fetchAvgTime,
} from "../../services/adminService";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#ec4899"];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    statusStats: [],
    priorityStats: [],
    orgStats: [],
  });
  const [daily, setDaily] = useState([]);
  const [avgTime, setAvgTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const statsRes = await fetchStats();
        const dailyRes = await fetchDaily();
        const avgRes = await fetchAvgTime();

        setStats(statsRes.data.data);
        setDaily(dailyRes.data.data);
        setAvgTime(avgRes.data.avgTimeInMinutes);
      } catch (err) {
        console.error("Failed to load analytics", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-4 border-orange-400 border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 h-14 w-14 rounded-full border-4 border-orange-500 border-b-transparent animate-[spin_2s_linear_infinite] opacity-60"></div>
        </div>
        <p className="mt-4 text-sm text-slate-200 tracking-wide">
          Loading admin analytics…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="bg-red-500/10 border border-red-400/60 rounded-2xl px-6 py-4 shadow-lg backdrop-blur">
          <p className="text-red-200 font-semibold text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // 🔹 Convert priority object → readable labels
  const priorityMap = {};

  stats.priorityStats.forEach((p) => {
    let key = "";

    if (typeof p._id === "string") {
      key = p._id.toLowerCase();
    } else if (typeof p._id === "object") {
      key = Object.keys(p._id).find((k) => p._id[k]);
    }

    if (!key) return;

    if (!priorityMap[key]) {
      priorityMap[key] = 0;
    }

    priorityMap[key] += p.count;
  });

  const priorityData = Object.entries(priorityMap).map(
    ([key, value], index) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      color: COLORS[index % COLORS.length],
    })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Glow background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-10 h-72 w-72 bg-orange-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute top-40 -right-16 h-80 w-80 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 bg-emerald-500/10 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-200">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Real-time overview
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Admin Analytics Dashboard
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Track ticket status, priority distribution, and organization
              performance at a glance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-200">
                System Online
              </span>
            </div>
            <div className="rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2 text-xs text-slate-300">
              Last updated:{" "}
              <span className="font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </header>

        {/* KPI CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          {stats.statusStats.map((s) => (
            <article
              key={s._id}
              className="group relative overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900 to-slate-800/90 p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-400">
                {s._id} Tickets
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-50">{s.count}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300 transition-all duration-700"
                  style={{ width: `${Math.min(s.count * 8, 100)}%` }}
                />
              </div>
            </article>
          ))}

          <article className="relative overflow-hidden rounded-2xl border border-purple-500/60 bg-gradient-to-br from-purple-900 via-slate-900 to-slate-900 p-5 shadow-md">
            <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-purple-500/30 blur-2xl" />
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-purple-200/80">
              Avg Processing Time
            </p>
            <p className="mt-3 text-3xl font-extrabold text-purple-100">
              {avgTime}
              <span className="ml-1 text-base font-medium text-purple-200/80">
                min
              </span>
            </p>
            <p className="mt-1 text-[11px] text-purple-100/70">
              Time from pending to completed.
            </p>
          </article>
        </section>

        {/* CHARTS GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* STATUS BAR CHART */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-50 text-lg">
                  Ticket Status Distribution
                </h2>
                <p className="text-xs text-slate-400">
                  How tickets are distributed across statuses.
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
                Bar Chart
              </span>
            </div>
            <div className="h-72 px-3 pb-4 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.statusStats}>
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 11, fill: "#cbd5f5" }}
                    axisLine={{ stroke: "#475569" }}
                    tickLine={{ stroke: "#475569" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#cbd5f5" }}
                    axisLine={{ stroke: "#475569" }}
                    tickLine={{ stroke: "#475569" }}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 12,
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      color: "#e5e7eb",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#statusGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient
                      id="statusGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PRIORITY PIE CHART */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-50 text-lg">
                  Priority-wise Tickets
                </h2>
                <p className="text-xs text-slate-400">
                  Ticket volume by priority level.
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
                Pie Chart
              </span>
            </div>
            <div className="h-72 px-3 pb-4 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={45}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color}
                        className="transition-transform duration-200 hover:scale-105"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} tickets`, name]}
                    labelFormatter={(label) => `Priority: ${label}`}
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                      borderRadius: 12,
                      color: "#e5e7eb",
                      fontSize: 12,
                    }}
                    itemStyle={{
                      color: "#e5e7eb",
                    }}
                    labelStyle={{
                      color: "#f97316",
                      fontWeight: 600,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* DAILY TREND LINE CHART */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md backdrop-blur mb-10">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-50 text-lg">
                Daily Ticket Trend
              </h2>
              <p className="text-xs text-slate-400">Tickets created per day.</p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
              Line Chart
            </span>
          </div>
          <div className="h-72 px-3 pb-4 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11, fill: "#cbd5f5" }}
                  axisLine={{ stroke: "#475569" }}
                  tickLine={{ stroke: "#475569" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#cbd5f5" }}
                  axisLine={{ stroke: "#475569" }}
                  tickLine={{ stroke: "#475569" }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 12,
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    color: "#e5e7eb",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 3, stroke: "#22c55e", strokeWidth: 1 }}
                  activeDot={{ r: 6, fill: "#22c55e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ORGANIZATION STATS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md backdrop-blur mb-6">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-50 text-lg">
                Organization-wise Tickets
              </h2>
              <p className="text-xs text-slate-400">
                Load distribution across organizations.
              </p>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
              Overview
            </span>
          </div>

          <div className="p-5">
            {stats.orgStats.length === 0 ? (
              <p className="text-sm text-slate-400">
                No organization data available.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {stats.orgStats.map((org) => (
                  <div
                    key={org._id}
                    className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/60"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="font-semibold text-slate-50 text-sm">
                      {org._id}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-orange-300">
                      {org.count}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Total tickets
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
