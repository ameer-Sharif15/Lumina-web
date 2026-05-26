"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Gift, 
  TrendingUp, 
  Users, 
  ChevronRight,
  Filter,
  Download,
  Copy,
  ExternalLink
} from "lucide-react";
import useActionHandler from "@/hooks/useActionHandler";

export default function ReferralsPage() {
  const { handleAction, data: referralsData, isLoading } = useActionHandler();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    handleAction({ route: "/admin/referrals", type: "get", showToast: false });
  }, []);

  const referrals = referralsData?.referrals || [];
  const filteredReferrals = referrals.filter((r: any) => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Network", value: referrals.reduce((acc: number, r: any) => acc + r.successCount, 0), icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Top Referrers", value: referrals.length, icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
    { label: "Rewards Paid", value: `${referrals.reduce((acc: number, r: any) => acc + r.rewardDays, 0)}d`, icon: Gift, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface mb-1">Referral Network</h1>
          <p className="text-body-sm text-outline">Monitor organic growth and reward distribution.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant text-[13px] font-bold text-outline rounded-lg hover:bg-surface-container transition-all shadow-sm">
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card ambient-shadow p-5 rounded-2xl flex items-center gap-4 border border-outline-variant/30 bg-white group">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-0.5">{stat.label}</p>
              <h3 className="text-title-lg font-bold text-on-surface">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="glass-card ambient-shadow rounded-2xl overflow-hidden flex flex-col border border-outline-variant/50 bg-white">
        <div className="p-4 border-b border-outline-variant/30 flex items-center gap-3 bg-[#F8F9FF]/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input 
              type="text" 
              placeholder="Search referrers or codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-outline-variant rounded-xl outline-none focus:border-primary transition-all text-body-sm"
            />
          </div>
          <button className="h-10 px-3 flex items-center justify-center bg-white border border-outline-variant rounded-xl text-outline hover:text-primary transition-all">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F9FF]/50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-outline uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-outline uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-outline uppercase tracking-wider">Invited</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-outline uppercase tracking-wider">Success</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-outline uppercase tracking-wider">Rewards</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-outline animate-pulse font-bold">Fetching referrals...</td></tr>
              ) : filteredReferrals.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-outline font-bold">No data found.</td></tr>
              ) : filteredReferrals.map((r: any) => (
                <tr key={r.id} className="hover:bg-[#F8F9FF]/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center font-bold text-primary text-[11px] shadow-sm">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-on-surface">{r.name}</p>
                        <p className="text-[10px] text-outline">Joined {new Date(r.dateJoined).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-0.5 bg-[#F8F9FF] border border-outline-variant/50 rounded text-[11px] font-bold text-primary">
                        {r.referralCode}
                      </code>
                      <button className="p-1 text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[13px] font-bold text-on-surface-variant">{r.invitedCount}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                      {r.successCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-[13px] font-bold text-primary">+{r.rewardDays}d</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      <ExternalLink className="w-4 h-4" />
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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
