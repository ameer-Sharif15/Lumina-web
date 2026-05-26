"use client";

import { useDashboardData } from "@/context/DashboardDataContext";
import { useTranslation } from "@/context/LanguageContext";
import { apiClient } from "@/lib/api";
import {
  ArrowUpDown,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Filter,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AssessmentsPage() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const { classes, assessments, loadingAssessments: loading, refreshAll } = useDashboardData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSequence, setSelectedSequence] = useState("all");
  const [selectedTimeline, setSelectedTimeline] = useState("all");
  const [selectedSession, setSelectedSession] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
  const [sessions, setSessions] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(
    null,
  );

  // Collapsible Filters State
  const [searchCollapsed, setSearchCollapsed] = useState(false);
  const [sortCollapsed, setSortCollapsed] = useState(false);
  const [typeCollapsed, setTypeCollapsed] = useState(false);
  const [classCollapsed, setClassCollapsed] = useState(false);
  const [subjectCollapsed, setSubjectCollapsed] = useState(false);
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);
  const [sessionCollapsed, setSessionCollapsed] = useState(false);

  useEffect(() => {
    // Fetch academic sessions
    apiClient
      .get("/classes/sessions")
      .then((res) => {
        if (res.data && res.data.success) {
          setSessions(res.data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching sessions:", err));
  }, []);

  // Collect unique subjects
  const allSubjects = Array.from(
    new Set(classes?.flatMap((c: any) => c.subjects || []) || []),
  );

  // Filter & sort logic
  const filteredAssessments = assessments
    .filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subject || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass =
        selectedClassId === "all" ||
        item.classroom === selectedClassId ||
        item.classroom?._id === selectedClassId ||
        item.classroomId === selectedClassId ||
        item.class === selectedClassId;

      const matchesSubject =
        selectedSubject === "all" ||
        item.subjectName === selectedSubject ||
        item.subject === selectedSubject;

      const matchesSequence =
        selectedSequence === "all" ||
        item.type === selectedSequence ||
        (selectedSequence === "Exam" &&
          item.type?.toLowerCase().includes("exam")) ||
        (selectedSequence === "CA" &&
          !item.type?.toLowerCase().includes("exam"));

      // Timeline filter
      let matchesTimeline = true;
      if (selectedTimeline !== "all") {
        const now = new Date();
        const itemDate = new Date(item.createdAt || item.date);

        if (selectedTimeline === "recent_assessments") {
          const startOfWeek = new Date();
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          matchesTimeline = itemDate >= startOfWeek;
        } else if (selectedTimeline === "term_1") {
          matchesTimeline =
            item.term === "1st Term" || item.term === "term_1st";
        } else if (selectedTimeline === "term_2") {
          matchesTimeline =
            item.term === "2nd Term" || item.term === "term_2nd";
        } else if (selectedTimeline === "term_3") {
          matchesTimeline =
            item.term === "3rd Term" || item.term === "term_3rd";
        }
      }

      // Academic Session filter
      const matchesSession =
        selectedSession === "all" || item.session === selectedSession;

      return (
        matchesSearch &&
        matchesClass &&
        matchesSubject &&
        matchesSequence &&
        matchesTimeline &&
        matchesSession
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date).getTime();
      const dateB = new Date(b.createdAt || b.date).getTime();
      return sortBy === "recent" ? dateB - dateA : dateA - dateB;
    });

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setAssessmentToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!assessmentToDelete) return;
    try {
      const res = await apiClient.delete(`/assessments/${assessmentToDelete}`);
      if (res.data && res.data.success !== false) {
        toast.success(
          t("note_deleted_successfully") || "Deleted successfully!",
        );
        refreshAll();
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete assessment");
    } finally {
      setDeleteModalOpen(false);
      setAssessmentToDelete(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedClassId("all");
    setSelectedSubject("all");
    setSelectedSequence("all");
    setSelectedTimeline("all");
    setSelectedSession("all");
    setSortBy("recent");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedClassId !== "all" ||
    selectedSubject !== "all" ||
    selectedSequence !== "all" ||
    selectedTimeline !== "all" ||
    selectedSession !== "all" ||
    sortBy !== "recent";

  const formatHumanDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>
            {t("Assessments") || "Assessments"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t("manage_tests_exams") ||
              "Create and manage classroom CA tests and Exams."}
          </p>
        </div>

        {/* Action Triggers (Hidden on Mobile Viewport, replaced by drawer buttons) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard/assessments/create-ca"
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold px-5 py-3 rounded-full transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} className="text-slate-400" />
            <span>{t("create_ca_test") || "Create CA Test"}</span>
          </Link>
          <Link
            href="/dashboard/assessments/create-exam"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-3 rounded-full transition-all shadow-md hover:shadow-emerald-100 shadow-emerald-50 cursor-pointer"
          >
            <Sparkles size={16} className="text-emerald-100 animate-bounce" />
            <span>{t("exam_prep") || "Create Exam Prep"}</span>
          </Link>
        </div>
      </div>

      {/* Mobile Filter Button (visible only on mobile viewports) */}
      <div className="flex md:hidden items-center justify-between gap-3 mb-6 bg-white p-4 border border-slate-100 rounded-3xl shadow-sm">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 text-slate-700 font-extrabold text-sm py-2.5 px-4 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
        >
          <Filter size={16} className="text-emerald-600" />
          <span>{t("filters") || "Filters"}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <div className="flex gap-2">
          <Link
            href="/dashboard/assessments/create-ca"
            className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus size={13} />
            <span>CA</span>
          </Link>
          <Link
            href="/dashboard/assessments/create-exam"
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Exam</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Sidebar + List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters (hidden on mobile, visible on desktop) */}
        <div className="hidden lg:block lg:col-span-1 space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-50">
            <span className="font-extrabold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Filter className="w-4 h-4 text-emerald-600" />
              {t("filters") || "Filters"}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X size={12} />
                <span>{t("clear_all") || "Clear"}</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="space-y-2 border-b border-slate-50 pb-4">
            <button
              onClick={() => setSearchCollapsed(!searchCollapsed)}
              className="w-full flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wide cursor-pointer focus:outline-none select-none"
            >
              <span>{t("search") || "Search Topic"}</span>
              {searchCollapsed ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronUp size={14} className="text-slate-400" />
              )}
            </button>
            {!searchCollapsed && (
              <div className="relative pt-1 animate-in fade-in duration-250">
                <input
                  type="text"
                  placeholder={t("search_topics") || "Search topics..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 pl-10 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                />
                <Search className="absolute left-3.5 top-4.5 w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>

          {/* Sort selection */}
          <div className="space-y-2 border-b border-slate-50 pb-4">
            <button
              onClick={() => setSortCollapsed(!sortCollapsed)}
              className="w-full flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wide cursor-pointer focus:outline-none select-none"
            >
              <span>{t("sort_by") || "Sort Order"}</span>
              {sortCollapsed ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronUp size={14} className="text-slate-400" />
              )}
            </button>
            {!sortCollapsed && (
              <div className="relative pt-1 animate-in fade-in duration-250">
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-emerald-500 transition-all"
                >
                  <option value="recent">{t("recent") || "Most Recent"}</option>
                  <option value="oldest">{t("oldest") || "Oldest"}</option>
                </select>
                <ArrowUpDown className="absolute right-3.5 top-4.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Sequence filter */}
          <div className="space-y-2 border-b border-slate-50 pb-4">
            <button
              onClick={() => setTypeCollapsed(!typeCollapsed)}
              className="w-full flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wide cursor-pointer focus:outline-none select-none"
            >
              <span>{t("assessment_sequence") || "Type"}</span>
              {typeCollapsed ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronUp size={14} className="text-slate-400" />
              )}
            </button>
            {!typeCollapsed && (
              <div className="flex flex-wrap gap-1.5 pt-1 animate-in fade-in duration-250">
                {[
                  { key: "all", label: t("all") || "All Types" },
                  { key: "CA", label: "CA Tests" },
                  { key: "Exam", label: "Exams" },
                ].map((seq) => (
                  <button
                    key={seq.key}
                    onClick={() => setSelectedSequence(seq.key)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                      selectedSequence === seq.key
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {seq.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Classroom filter */}
          <div className="space-y-2 border-b border-slate-50 pb-4">
            <button
              onClick={() => setClassCollapsed(!classCollapsed)}
              className="w-full flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wide cursor-pointer focus:outline-none select-none"
            >
              <span>{t("select_class") || "Classroom"}</span>
              {classCollapsed ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronUp size={14} className="text-slate-400" />
              )}
            </button>
            {!classCollapsed && (
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1 pt-1 animate-in fade-in duration-250">
                <button
                  onClick={() => setSelectedClassId("all")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    selectedClassId === "all"
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{t("all") || "All Classrooms"}</span>
                  {selectedClassId === "all" && <Check size={14} />}
                </button>
                {classes?.map((c: any) => (
                  <button
                    key={c._id}
                    onClick={() => setSelectedClassId(c._id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      selectedClassId === c._id
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {selectedClassId === c._id && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subjects filter */}
          {allSubjects.length > 0 && (
            <div className="space-y-2 border-b border-slate-50 pb-4">
              <button
                onClick={() => setSubjectCollapsed(!subjectCollapsed)}
                className="w-full flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wide cursor-pointer focus:outline-none select-none"
              >
                <span>{t("subject") || "Subject"}</span>
                {subjectCollapsed ? (
                  <ChevronDown size={14} className="text-slate-400" />
                ) : (
                  <ChevronUp size={14} className="text-slate-400" />
                )}
              </button>
              {!subjectCollapsed && (
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1 pt-1 animate-in fade-in duration-250">
                  <button
                    onClick={() => setSelectedSubject("all")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      selectedSubject === "all"
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{t("all") || "All Subjects"}</span>
                    {selectedSubject === "all" && <Check size={14} />}
                  </button>
                  {allSubjects.map((subject: any) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        selectedSubject === subject
                          ? "bg-emerald-50 text-emerald-800"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{subject}</span>
                      {selectedSubject === subject && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Timeline Filter */}
          <div className="space-y-2 border-b border-slate-50 pb-4">
            <button
              onClick={() => setTimelineCollapsed(!timelineCollapsed)}
              className="w-full flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wide cursor-pointer focus:outline-none select-none"
            >
              <span>{t("target_term") || "Timeline"}</span>
              {timelineCollapsed ? (
                <ChevronDown size={14} className="text-slate-400" />
              ) : (
                <ChevronUp size={14} className="text-slate-400" />
              )}
            </button>
            {!timelineCollapsed && (
              <div className="space-y-1 pr-1 pt-1 animate-in fade-in duration-250">
                {[
                  { key: "all", label: t("all") || "All Terms" },
                  {
                    key: "recent_assessments",
                    label: t("recent_assessments") || "Recent Assessments",
                  },
                  { key: "term_1", label: t("term_1st") || "First Term" },
                  { key: "term_2", label: t("term_2nd") || "Second Term" },
                  { key: "term_3", label: t("term_3rd") || "Third Term" },
                ].map((term) => (
                  <button
                    key={term.key}
                    onClick={() => setSelectedTimeline(term.key)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      selectedTimeline === term.key
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{term.label}</span>
                    {selectedTimeline === term.key && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sessions Filter */}
          {sessions.length > 0 && (
            <div className="space-y-2 pb-2">
              <button
                onClick={() => setSessionCollapsed(!sessionCollapsed)}
                className="w-full flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wide cursor-pointer focus:outline-none select-none"
              >
                <span>{t("session") || "Academic Session"}</span>
                {sessionCollapsed ? (
                  <ChevronDown size={14} className="text-slate-400" />
                ) : (
                  <ChevronUp size={14} className="text-slate-400" />
                )}
              </button>
              {!sessionCollapsed && (
                <div className="space-y-1 pt-1 animate-in fade-in duration-250">
                  <button
                    onClick={() => setSelectedSession("all")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      selectedSession === "all"
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{t("all") || "All Sessions"}</span>
                    {selectedSession === "all" && <Check size={14} />}
                  </button>
                  {sessions.map((session) => (
                    <button
                      key={session}
                      onClick={() => setSelectedSession(session)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        selectedSession === session
                          ? "bg-emerald-50 text-emerald-800"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>{session}</span>
                      {selectedSession === session && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assessment Card Deck Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            // Skeleton display
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 animate-pulse"
                >
                  <div className="flex justify-between">
                    <div className="w-1/3 h-4 bg-slate-100 rounded" />
                    <div className="w-8 h-8 bg-slate-100 rounded-full" />
                  </div>
                  <div className="w-3/4 h-6 bg-slate-100 rounded" />
                  <div className="flex gap-2">
                    <div className="w-16 h-5 bg-slate-100 rounded-full" />
                    <div className="w-20 h-5 bg-slate-100 rounded-full" />
                  </div>
                  <div className="w-full h-10 bg-slate-100 rounded-full mt-4" />
                </div>
              ))}
            </div>
          ) : filteredAssessments.length === 0 ? (
            // Custom Empty State
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6">
                <ClipboardCheck className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">
                {t("no_assessments_found") || "No Assessments Found"}
              </h2>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
                {hasActiveFilters
                  ? t("no_assessments_subtitle") ||
                    "Try refining your selected filters or search terms."
                  : "Let Lumina AI instantly generate exam sheets or CA tests aligned to your syllabus."}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm px-6 py-3 rounded-full transition-colors cursor-pointer"
                >
                  {t("clear_all") || "Reset Filters"}
                </button>
              ) : (
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/dashboard/assessments/create-ca"
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-sm px-6 py-3 rounded-full transition-all cursor-pointer shadow-sm"
                  >
                    {t("create_ca_test") || "Create CA Test"}
                  </Link>
                  <Link
                    href="/dashboard/assessments/create-exam"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-6 py-3 rounded-full transition-all shadow-md hover:shadow-emerald-100 cursor-pointer"
                  >
                    {t("exam_prep") || "Create Exam Prep"}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            // Cards Grid
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAssessments.map((item) => {
                const isExam = item.type?.toLowerCase().includes("exam");
                return (
                  <Link
                    key={item._id}
                    href={`/dashboard/assessments/${item._id}`}
                    className="group bg-white border border-slate-100 hover:border-emerald-500/30 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-100/50 flex flex-col justify-between h-64 cursor-pointer relative"
                  >
                    <div>
                      {/* Top bar info */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                          <Calendar size={11} />
                          {formatHumanDate(item.createdAt || item.date)}
                        </span>

                        {/* Deletion Button */}
                        <button
                          onClick={(e) => handleDeleteClick(item._id, e)}
                          className="w-8 h-8 rounded-full bg-rose-50/50 hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer relative z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      {/* Metadata Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                          {item.classroom?.name || item.class || "Class"}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                            isExam
                              ? "bg-amber-50 text-amber-800"
                              : "bg-indigo-50 text-indigo-800"
                          }`}
                        >
                          {item.type || "CA Test"}
                        </span>
                        {item.term && (
                          <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full">
                            {item.term
                              .replace("term_", "")
                              .replace("st", "")
                              .replace("nd", "")
                              .replace("rd", "")}{" "}
                            Term
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer link trigger */}
                    <div className="border-t border-slate-50 pt-4 mt-4 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-emerald-700 transition-colors">
                      <span className="truncate max-w-[200px] text-slate-400 font-semibold">
                        {item.subjectName || item.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>{t("view") || "View Paper"}</span>
                        <ChevronRight
                          size={14}
                          className={`transform group-hover:translate-x-1 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`}
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal Slider */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-80 bg-white h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-slide-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Filter size={16} className="text-emerald-600" />
                  {t("filters")}
                </span>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {t("search")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t("search_topics")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 pl-10 text-sm outline-none"
                  />
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Mobile Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {t("assessment_sequence")}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: "all", label: t("all") },
                    { key: "CA", label: "CA Tests" },
                    { key: "Exam", label: "Exams" },
                  ].map((seq) => (
                    <button
                      key={seq.key}
                      onClick={() => setSelectedSequence(seq.key)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                        selectedSequence === seq.key
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      {seq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Class */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {t("select_class")}
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="all">{t("all")}</option>
                  {classes?.map((c: any) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Subject */}
              {allSubjects.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {t("subject")}
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none"
                  >
                    <option value="all">{t("all")}</option>
                    {allSubjects.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mobile Timeline */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {t("target_term")}
                </label>
                <select
                  value={selectedTimeline}
                  onChange={(e) => setSelectedTimeline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="all">{t("all")}</option>
                  <option value="recent_assessments">
                    {t("recent_assessments") || "Recent Assessments"}
                  </option>
                  <option value="term_1">
                    {t("term_1st") || "First Term"}
                  </option>
                  <option value="term_2">
                    {t("term_2nd") || "Second Term"}
                  </option>
                  <option value="term_3">
                    {t("term_3rd") || "Third Term"}
                  </option>
                </select>
              </div>

              {/* Mobile Session */}
              {sessions.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {t("session")}
                  </label>
                  <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 outline-none"
                  >
                    <option value="all">{t("all")}</option>
                    {sessions.map((sess) => (
                      <option key={sess} value={sess}>
                        {sess}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm py-3 rounded-2xl transition-colors cursor-pointer"
                >
                  {t("clear_all") || "Reset All"}
                </button>
              )}
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3 rounded-2xl transition-all shadow-md cursor-pointer"
              >
                {t("apply_filters") || "Apply Filters"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-up space-y-5 text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900">
                {t("delete_assessment_title") || "Delete Assessment"}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t("delete_assessment_confirm") ||
                  "Are you sure you want to delete this assessment? This action cannot be undone."}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setAssessmentToDelete(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm py-3 rounded-2xl transition-colors cursor-pointer"
              >
                {t("cancel") || "Cancel"}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm py-3 rounded-2xl transition-colors shadow-md shadow-rose-100 cursor-pointer"
              >
                {t("delete") || "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
