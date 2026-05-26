"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Download, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Info,
  MoreVertical,
  Mail,
  ExternalLink
} from "lucide-react";
import useActionHandler from "@/hooks/useActionHandler";

export default function TeacherDirectory() {
  const { handleAction, data: teachersData, isLoading } = useActionHandler();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    handleAction({ route: "/admin/teachers", type: "get", showToast: false });
  }, []);

  const teachers = teachersData?.teachers || [];
  const filteredTeachers = teachers.filter((t: any) => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface mb-1">Teacher Directory</h1>
          <p className="text-body-sm text-outline">Manage educator profiles and platform access.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-[13px] font-bold text-outline rounded-lg hover:bg-surface-container transition-all">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[13px] font-bold rounded-lg hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Main Card Container */}
          <div className="glass-card ambient-shadow rounded-2xl overflow-hidden flex flex-col border border-outline-variant/50 bg-white">
            {/* Search and Filters */}
            <div className="p-4 border-b border-outline-variant/30 flex flex-wrap items-center gap-3 bg-[#F8F9FF]/30">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input 
                  type="text" 
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-white border border-outline-variant rounded-xl outline-none focus:border-primary transition-all text-body-sm"
                />
              </div>
              <select className="h-10 px-4 bg-white border border-outline-variant rounded-xl text-[12px] font-bold text-on-surface outline-none focus:border-primary transition-all">
                <option>All Schools</option>
              </select>
              <button className="h-10 px-3 flex items-center justify-center bg-white border border-outline-variant rounded-xl text-outline hover:text-primary transition-all">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F9FF]/50 border-b border-outline-variant/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-outline uppercase tracking-wider">Teacher</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-outline uppercase tracking-wider">School / Subject</th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold text-outline uppercase tracking-wider">Engagement</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-outline uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {isLoading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-outline animate-pulse font-bold">Loading teachers...</td></tr>
                  ) : filteredTeachers.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-outline font-bold">No teachers found.</td></tr>
                  ) : filteredTeachers.map((teacher: any) => (
                    <tr key={teacher.id} className="hover:bg-[#F8F9FF]/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant flex-shrink-0 bg-secondary-container flex items-center justify-center font-bold text-primary shadow-sm">
                            {teacher.profilePhoto ? (
                              <img src={teacher.profilePhoto} alt="" className="w-full h-full object-cover" />
                            ) : teacher.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-on-surface">{teacher.name}</p>
                            <div className="flex items-center gap-1 text-[11px] text-outline">
                              <Mail className="w-3 h-3" />
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[12px] font-bold text-on-surface-variant leading-none mb-1">{teacher.school}</p>
                        <p className="text-[11px] text-outline">{teacher.subject}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[13px] font-bold text-primary">{teacher.plansCreated}</span>
                          <span className="text-[9px] font-bold text-outline uppercase tracking-tighter">Plans</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                          teacher.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", teacher.status === "Active" ? "bg-emerald-600" : "bg-red-600")} />
                          {teacher.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 bg-white border border-outline-variant rounded-lg text-outline hover:text-primary hover:border-primary transition-all shadow-sm">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between bg-[#F8F9FF]/20">
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider">
                Page <span className="text-on-surface">1</span> of 12
              </p>
              <div className="flex items-center gap-2">
                <button className="h-9 px-3 border border-outline-variant rounded-lg text-outline hover:bg-white transition-all disabled:opacity-30" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="h-9 px-3 border border-outline-variant rounded-lg text-outline hover:bg-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <div className="glass-card ambient-shadow p-6 rounded-2xl border border-outline-variant/50 bg-white">
            <h3 className="text-[12px] font-bold text-outline uppercase tracking-widest mb-6">Directory Pulse</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-[#F8F9FF] rounded-xl border border-outline-variant/30">
                <p className="text-[10px] font-bold text-outline uppercase mb-1">Total</p>
                <p className="text-title-lg font-bold text-on-surface">{teachers.length}</p>
              </div>
              <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Active</p>
                <p className="text-title-lg font-bold text-emerald-600">{teachers.filter((t: any) => t.status === "Active").length}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px] font-bold uppercase">
                <span className="text-outline">Health Score</span>
                <span className="text-primary">92%</span>
              </div>
              <div className="w-full h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
          </div>

          <div className="glass-card ambient-shadow p-6 rounded-2xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-primary rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-[13px] font-bold text-on-surface">Growth Tips</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[12px] text-on-surface-variant leading-relaxed">
                  <span className="font-bold text-primary">High Churn Warning:</span> 3 teachers haven't logged in recently. 
                  <button className="text-primary font-bold underline decoration-primary/30 ml-1">Notify them</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
