"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  SortAsc, 
  Calendar, 
  Eye, 
  ChevronRight,
  Plus,
  X,
  BookOpen,
  ArrowRight
} from "lucide-react";
import useActionHandler from "@/hooks/useActionHandler";

export default function LessonRepository() {
  const { handleAction, data: lessonsData, isLoading } = useActionHandler();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    handleAction({ route: "/admin/lessons", type: "get", showToast: false });
  }, []);

  const lessons = lessonsData?.lessons || [];
  const filteredLessons = lessons.filter((l: any) => 
    l.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface mb-1">Lesson Repository</h1>
          <p className="text-body-sm text-outline">Manage and review AI-assisted lesson plans.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant text-[13px] font-bold text-outline rounded-lg hover:bg-surface-container transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[13px] font-bold rounded-lg hover:shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            Create New
          </button>
        </div>
      </header>

      {/* Search and Tags */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-outline" />
          <input 
            type="text" 
            placeholder="Search repository..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white border border-outline-variant rounded-xl shadow-sm outline-none focus:border-primary transition-all text-body-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FF] border border-outline-variant rounded-lg text-[11px] font-bold text-on-surface-variant shrink-0">
            Grade 4
            <X className="w-3.5 h-3.5 cursor-pointer hover:text-error" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FF] border border-outline-variant rounded-lg text-[11px] font-bold text-on-surface-variant shrink-0">
            Mathematics
            <X className="w-3.5 h-3.5 cursor-pointer hover:text-error" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-outline animate-pulse font-bold">Fetching repository...</div>
        ) : filteredLessons.length === 0 ? (
          <div className="col-span-full py-20 text-center text-outline font-bold">No lesson plans found.</div>
        ) : filteredLessons.map((lesson: any, i: number) => (
          <div key={lesson.id} className="glass-card ambient-shadow rounded-2xl overflow-hidden flex flex-col group hover:translate-y-[-4px] transition-all duration-300 border border-outline-variant/50">
            <div className="p-6 flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider">{lesson.grade}</span>
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  <span className="text-[11px] font-bold">{lesson.rating}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-body-base font-bold text-on-surface leading-snug line-clamp-2">
                  {lesson.topic}
                </h3>
                <p className="text-[12px] text-outline font-medium">
                  {lesson.subject} • Week {lesson.week}
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-bold text-outline pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(lesson.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {lesson.views}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F8F9FF]/50 border-t border-outline-variant/30 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center font-bold text-primary text-[10px] shadow-sm">
                  {lesson.teacher.charAt(0)}
                </div>
                <span className="text-[12px] font-bold text-on-surface-variant truncate max-w-[100px]">{lesson.teacher}</span>
              </div>
              <button className="p-2 bg-white border border-outline-variant rounded-lg text-outline group-hover:text-primary group-hover:border-primary transition-all shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
