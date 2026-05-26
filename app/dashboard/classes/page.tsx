"use client";

import { useDashboardData } from "@/context/DashboardDataContext";
import { useTranslation } from "@/context/LanguageContext";
import { apiClient } from "@/lib/api";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  Edit3,
  GraduationCap,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClassesPage() {
  const { t, isRTL } = useTranslation();
  const router = useRouter();

  const { classes, loadingClasses: isLoading, refreshAll } = useDashboardData();

  const [sessions, setSessions] = useState<string[]>([]);
  const [currentSession, setCurrentSession] = useState<string>("");
  const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Fetch academic sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await apiClient.get("/classes/sessions");
        if (res.data.success) {
          const sessionsList = res.data.data || [];
          setSessions(sessionsList);
          if (sessionsList.length > 0) {
            setCurrentSession(sessionsList[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching academic sessions:", err);
      }
    }
    fetchSessions();
  }, []);

  // Filter classes by session if a session is selected
  const filteredClasses = classes.filter((cls) => {
    if (!currentSession) return true;
    return cls.academicYear === currentSession;
  });

  // Select first class by default on desktop split view
  useEffect(() => {
    if (filteredClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(filteredClasses[0]._id);
    }
  }, [filteredClasses, selectedClassId]);

  const selectedClass = classes.find((c) => c._id === selectedClassId);

  // Helper for schedule grouping
  const getSubjectSummary = (cls: any) => {
    if (!cls || !cls.schedule) return [];
    const summaryMap: Record<string, any> = {};

    cls.schedule.forEach((p: any) => {
      if (!summaryMap[p.subject]) {
        summaryMap[p.subject] = {
          name: p.subject,
          periods: 0,
          schedule: [],
          color: cls.color || "#006D4E",
        };
      }
      summaryMap[p.subject].periods += 1;
      summaryMap[p.subject].schedule.push({
        day: t(`day_${p.day.toLowerCase()}`, { defaultValue: p.day }),
        time: `${p.startTime} - ${p.endTime}`,
      });
    });

    return Object.values(summaryMap);
  };

  const selectedClassSubjects = selectedClass
    ? getSubjectSummary(selectedClass)
    : [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-emerald-600 animate-pulse" />
            {t("my_classes")}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t("assigned_classes_msg", { count: filteredClasses.length })}
          </p>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <button
            onClick={() => refreshAll()}
            className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => router.push("/dashboard/classes/create")}
            className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-emerald-700 hover:shadow-md transition-all cursor-pointer shadow-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{t("create_class")}</span>
          </button>
        </div>
      </div>

      {/* Session Switcher Dropdown */}
      <div className="relative mb-6">
        <button
          onClick={() => setIsSessionDropdownOpen(!isSessionDropdownOpen)}
          className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 font-bold text-xs md:text-sm transition-colors cursor-pointer bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm"
        >
          <span>
            {t("academic_session", { session: currentSession || "..." })}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${isSessionDropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isSessionDropdownOpen && (
          <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t("academic_session_history")}
            </div>
            {sessions.map((session) => (
              <button
                key={session}
                onClick={() => {
                  setCurrentSession(session);
                  setIsSessionDropdownOpen(false);
                  setSelectedClassId(null);
                }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between text-sm transition-colors cursor-pointer ${
                  currentSession === session
                    ? "bg-emerald-50 text-emerald-800 font-bold"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>{t("academic_session", { session })}</span>
                {currentSession === session && (
                  <Check className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            ))}
            {sessions.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">
                No sessions found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-500 text-sm mt-3">{t("loading")}...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredClasses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            {t("no_classes_found")}
          </h2>
          <p className="text-slate-500 text-sm max-w-sm px-6 leading-relaxed mb-6">
            {t("no_classes_desc")}
          </p>
          <button
            onClick={() => router.push("/dashboard/classes/create")}
            className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{t("create_first_class")}</span>
          </button>
        </div>
      )}

      {/* Content Grid (Split screen on desktop, single column on mobile) */}
      {!isLoading && filteredClasses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Classes List column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
              Classes List
            </h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {filteredClasses.map((cls) => {
                const isSelected = selectedClassId === cls._id;
                const cardColor = cls.color || "#006D4E";

                return (
                  <div
                    key={cls._id}
                    onClick={() => setSelectedClassId(cls._id)}
                    className={`bg-white rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden relative ${
                      isSelected
                        ? "border-emerald-500 shadow-md transform -translate-y-0.5"
                        : "border-slate-100 shadow-sm hover:border-slate-200 hover:shadow"
                    }`}
                  >
                    {/* Left Colored Accent Bar */}
                    <div
                      className="absolute top-0 bottom-0 left-0 w-1.5"
                      style={{ backgroundColor: cardColor }}
                    />

                    <div className="p-5 pl-7">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-black text-slate-900">
                            {cls.name}
                          </h4>
                          <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                            {cls.term || t("no_section")}
                          </span>
                        </div>

                        <div
                          className="px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{
                            backgroundColor: `${cardColor}12`,
                            color: cardColor,
                          }}
                        >
                          {t("students_count", {
                            count: cls.studentCount || 0,
                          })}
                        </div>
                      </div>

                      {/* Subjects tags list */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          {t("subjects_allcaps")}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(cls.subjects || [])
                            .slice(0, 4)
                            .map((sub: string) => (
                              <span
                                key={sub}
                                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg border"
                                style={{
                                  borderColor: `${cardColor}25`,
                                  backgroundColor: `${cardColor}06`,
                                  color: cardColor,
                                }}
                              >
                                {sub}
                              </span>
                            ))}
                          {(cls.subjects || []).length > 4 && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                              +{(cls.subjects || []).length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons responsive */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/classes/${cls._id}`);
                          }}
                          className="flex items-center gap-1.5 text-xs font-extrabold transition-all hover:gap-2.5 cursor-pointer"
                          style={{ color: cardColor }}
                        >
                          <span>{t("view_class")}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/classes/${cls._id}/edit`);
                          }}
                          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
                          title="Edit Class"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Split details Panel */}
          <div className="hidden lg:block lg:col-span-7">
            {selectedClass ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sticky top-6">
                {/* Header detail */}
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">
                      {selectedClass.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-semibold mt-1">
                      {selectedClass.academicYear} &bull;{" "}
                      {selectedClass.term || t("no_section")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/classes/${selectedClass._id}/edit`,
                        )
                      }
                      className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-emerald-600" />
                      <span>{t("edit_class_title")}</span>
                    </button>
                    {/* <button
                      onClick={() => router.push(`/dashboard/classes/${selectedClass._id}`)}
                      className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <span>Open Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button> */}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">
                        {t("total_enrolled")}
                      </span>
                      <span className="text-lg font-black text-slate-800">
                        {t("students_count", {
                          count: selectedClass.studentCount || 0,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">
                        {t("assigned")}
                      </span>
                      <span className="text-lg font-black text-slate-800">
                        {t("subjects_count_simple", {
                          count: selectedClass.subjects?.length || 0,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subjects listing in Detail Panel */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Weekly Subjects & Lessons
                  </h4>
                  <div className="space-y-4 max-h-[52vh] overflow-y-auto pr-1">
                    {selectedClassSubjects.map((subject: any) => (
                      <div
                        key={subject.name}
                        className="p-4 rounded-2xl border border-slate-100 bg-white flex justify-between items-center hover:border-slate-200 transition-colors"
                      >
                        <div>
                          <h5 className="font-extrabold text-slate-900">
                            {subject.name}
                          </h5>

                          {/* Schedule snippets */}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {subject.schedule.map((sch: any, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-medium"
                              >
                                {sch.day} &bull; {sch.time}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/classes/subjects?classId=${selectedClass._id}&name=${encodeURIComponent(subject.name)}&class=${encodeURIComponent(selectedClass.name)}`,
                            )
                          }
                          className="flex items-center gap-2 border border-emerald-600 hover:bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>{t("open_subject")}</span>
                        </button>
                      </div>
                    ))}
                    {selectedClassSubjects.length === 0 && (
                      <div className="text-center py-6 text-sm text-slate-400 font-bold">
                        No subject schedule defined for this class.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl h-[60vh] flex flex-col items-center justify-center text-slate-400">
                <GraduationCap className="w-12 h-12 mb-3 opacity-50" />
                <span className="font-bold text-sm">
                  Select a class from the list to view full details
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
