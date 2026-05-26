"use client";

import useActionHandler from "@/hooks/useActionHandler";
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  Download,
  FileText,
  Gift,
  Send,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardOverview() {
  const {
    handleAction,
    data: statsData,
    isLoading: statsLoading,
  } = useActionHandler();
  const { handleAction: fetchEngagement, data: engagementData } =
    useActionHandler();
  const { handleAction: fetchActivity, data: activityData } =
    useActionHandler();

  useEffect(() => {
    handleAction({ route: "/admin/stats", type: "get", showToast: false });
    fetchEngagement({
      route: "/admin/engagement",
      type: "get",
      showToast: false,
    });
    fetchActivity({ route: "/admin/activity", type: "get", showToast: false });
  }, []);

  const stats = statsData?.stats || {};
  const logs = activityData?.logs || [];
  const chartData = engagementData?.data || [];
  const planStats = stats.planDistribution || { Free: 0, Pro: 0, Ultimate: 0 };

  const statCards = [
    {
      label: "Total Teachers",
      value: stats.totalTeachers || "0",
      change: "+12%",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Monthly Revenue",
      value: `₦${(stats.monthlyRevenue || 0).toLocaleString()}`,
      change: "+15%",
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Active Plans",
      value: stats.activePlanTeachers || "0",
      change: "+8%",
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Lesson Plans",
      value: stats.totalLessonPlans?.toLocaleString() || "0",
      tag: "AI Gen",
      icon: FileText,
      color: "bg-green-50 text-green-600",
    },
  ];

  const planSegments = [
    {
      name: "Free Tier",
      value: planStats.Free,
      color: "bg-[#94A3B8]",
      textColor: "text-slate-600",
      icon: Users,
    },
    {
      name: "Pro Plan",
      value: planStats.Pro,
      color: "bg-[#006c51]",
      textColor: "text-[#006c51]",
      icon: TrendingUp,
    },
    {
      name: "Ultimate",
      value: planStats.Ultimate,
      color: "bg-[#7C3AED]",
      textColor: "text-purple-600",
      icon: Gift,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface mb-1">
            System Overview
          </h1>
          <p className="text-body-sm text-outline">
            Real-time performance and user growth metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-[12px] font-bold text-outline shadow-sm">
            UTC: {new Date().toISOString().split("T")[0]}
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="glass-card ambient-shadow p-5 rounded-xl group hover:translate-y-[-2px] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2.5 rounded-lg", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.change && (
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-[12px] font-medium text-outline mb-0.5">
              {stat.label}
            </p>
            <h3 className="text-title-lg font-bold text-on-surface tracking-tight">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Chart */}
        <div className="lg:col-span-2 glass-card ambient-shadow p-6 rounded-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-body-base font-bold text-on-surface">
                Growth Analytics
              </h3>
              <p className="text-[12px] text-outline">
                Daily active teacher interactions
              </p>
            </div>
            <button className="flex items-center gap-2 text-[12px] font-bold text-outline hover:text-on-surface transition-colors px-3 py-1.5 border border-outline-variant rounded-lg">
              Weekly
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0, 108, 81, 0.02)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="users" radius={[4, 4, 0, 0]} barSize={32}>
                  {chartData.map((entry: any, index: any) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === chartData.length - 1 ? "#006c51" : "#E2E8F0"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="glass-card ambient-shadow p-6 rounded-xl flex flex-col">
          <h3 className="text-body-base font-bold text-on-surface mb-6">
            Plan Distribution
          </h3>

          <div className="flex-1 space-y-5">
            {planSegments.map((seg, i) => {
              const total =
                planStats.Free + planStats.Pro + planStats.Ultimate || 1;
              const percent = Math.round((seg.value / total) * 100);

              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", seg.color)} />
                      <span className="text-[12px] font-bold text-on-surface-variant">
                        {seg.name}
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-on-surface">
                      {seg.value} Teachers
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        seg.color,
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-[#F8F9FF] rounded-xl border border-outline-variant/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-outline-variant flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-on-surface">
                  Conversion Rate
                </p>
                <p className="text-[14px] font-bold text-primary">
                  {Math.round(
                    ((planStats.Pro + planStats.Ultimate) /
                      (planStats.Free + planStats.Pro + planStats.Ultimate ||
                        1)) *
                      100,
                  )}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card ambient-shadow p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-body-base font-bold text-on-surface">
              Real-time Activity
            </h3>
            <button className="text-[11px] font-bold text-primary hover:underline">
              View Stream
            </button>
          </div>

          <div className="space-y-4">
            {logs.map((log: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0 group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      log.type === "plan"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-green-50 text-green-600",
                    )}
                  >
                    {log.type === "plan" ? (
                      <FileText className="w-4.5 h-4.5" />
                    ) : (
                      <Users className="w-4.5 h-4.5" />
                    )}
                  </div>
                  <div>
                    <p className="text-[13px] text-on-surface-variant font-medium">
                      <span className="font-bold text-on-surface">
                        {log.user}
                      </span>{" "}
                      {log.action}
                    </p>
                    <p className="text-[11px] text-outline">
                      {new Date(log.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card ambient-shadow p-6 rounded-xl">
          <h3 className="text-body-base font-bold text-on-surface mb-6">
            Administrative Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center gap-3 p-4 bg-[#F8F9FF] border border-outline-variant hover:border-primary hover:bg-primary/5 rounded-xl transition-all group">
              <div className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-outline group-hover:text-primary">
                Broadcast
              </span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 bg-[#F8F9FF] border border-outline-variant hover:border-primary hover:bg-primary/5 rounded-xl transition-all group">
              <div className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                <Gift className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-outline group-hover:text-primary">
                Rewards
              </span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 bg-[#F8F9FF] border border-outline-variant hover:border-primary hover:bg-primary/5 rounded-xl transition-all group">
              <div className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-outline group-hover:text-primary">
                Configs
              </span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 bg-[#F8F9FF] border border-outline-variant hover:border-primary hover:bg-primary/5 rounded-xl transition-all group">
              <div className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-outline group-hover:text-primary">
                Logs
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
