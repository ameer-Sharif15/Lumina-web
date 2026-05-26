"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

const data = [
  { name: "Jan", users: 400, plans: 240, revenue: 2400 },
  { name: "Feb", users: 300, plans: 139, revenue: 2210 },
  { name: "Mar", users: 200, plans: 980, revenue: 2290 },
  { name: "Apr", users: 278, plans: 390, revenue: 2000 },
  { name: "May", users: 189, plans: 480, revenue: 2181 },
  { name: "Jun", users: 239, plans: 380, revenue: 2500 },
  { name: "Jul", users: 349, plans: 430, revenue: 2100 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-display-sm font-bold text-on-surface mb-1">Deep Analytics</h1>
        <p className="text-body-sm text-outline">Comprehensive breakdown of platform growth and engagement.</p>
      </header>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Retention", value: "84.2%", trend: "+2.4%", up: true, icon: Activity },
          { label: "Plan Creation Rate", value: "12.5/day", trend: "+1.2%", up: true, icon: FileText },
          { label: "Churn Rate", value: "2.1%", trend: "-0.4%", up: true, icon: Users },
          { label: "Avg. Session Time", value: "18m 42s", trend: "+45s", up: true, icon: TrendingUp },
        ].map((item, i) => (
          <div key={i} className="glass-card ambient-shadow p-6 rounded-2xl flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider">{item.label}</span>
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline justify-between mt-auto">
              <h3 className="text-title-lg font-bold text-on-surface">{item.value}</h3>
              <div className={cn("flex items-center text-[11px] font-bold", item.up ? "text-emerald-600" : "text-error")}>
                {item.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {item.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Trend */}
        <div className="glass-card ambient-shadow p-8 rounded-2xl">
          <h3 className="text-body-base font-bold text-on-surface mb-8">User Growth Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006c51" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#006c51" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#006c51" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Projection */}
        <div className="glass-card ambient-shadow p-8 rounded-2xl">
          <h3 className="text-body-base font-bold text-on-surface mb-8">Revenue Stream (₦)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: "#7C3AED", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
