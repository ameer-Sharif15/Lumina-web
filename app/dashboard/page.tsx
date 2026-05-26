"use client";
import { useAuth } from "@/context/AuthContext";
import { useDashboardData } from "@/context/DashboardDataContext";
import { useTranslation } from "@/context/LanguageContext";
import { DAYS, DAY_LABELS, DayKey } from "@/hooks/useClasses";
import { ScheduleItem } from "@/hooks/useSchedule";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  School,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Today's day key ─────────────────────────────────────────────────
const TODAY_KEYS: DayKey[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const todayKey = TODAY_KEYS[new Date().getDay()];

// ─── Locale-aware date ───────────────────────────────────────────────
function getFormattedDate(lang: string): string {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat(lang, { weekday: "long" }).format(
    now,
  );
  const month = new Intl.DateTimeFormat(lang, { month: "long" }).format(now);
  const day = now.getDate();
  if (lang === "ar") return `${weekday}، ${day} ${month}`;
  const s = ["th", "st", "nd", "rd"];
  const v = day % 100;
  const ord = s[(v - 20) % 10] || s[v] || s[0];
  return `${weekday}, ${month} ${day}${ord}`;
}

// ─── Avatar fallback ─────────────────────────────────────────────────
function Avatar({ src, name }: { src?: string; name?: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-black shrink-0 shadow-sm">
      {initial}
    </div>
  );
}

// ─── Primary Lesson Card ─────────────────────────────────────────────
function PrimaryLessonCard({
  lesson,
  isOngoing,
  isRTL,
  isTomorrow,
  t,
  router,
}: {
  lesson: ScheduleItem;
  isOngoing: boolean;
  isRTL: boolean;
  isTomorrow: boolean;
  t: (k: string, o?: any) => string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 overflow-hidden cursor-pointer active:scale-[0.99] transition-transform ${
        isOngoing
          ? "bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
          : "bg-white text-slate-900 border border-slate-100 shadow-sm"
      }`}
      onClick={() => router.push(`/dashboard/classes/subjects?classId=${lesson.classId}&name=${encodeURIComponent(lesson.subject)}&class=${encodeURIComponent(lesson.class)}`)}
    >
      {/* Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl ${
            isOngoing
              ? "bg-white/20 text-white"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          <Clock size={12} strokeWidth={2.5} />
          {lesson.time}
        </span>
      </div>

      {/* Subject */}
      <h2
        className={`text-3xl font-black mb-3 ${isRTL ? "text-right" : ""} ${isOngoing ? "text-white" : "text-slate-900"}`}
      >
        {lesson.subject}
      </h2>

      {/* Meta row */}
      <div
        className={`flex items-center gap-3 mb-6 text-sm font-semibold ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <span
          className={`flex items-center gap-1.5 ${isOngoing ? "text-white/80" : "text-slate-500"}`}
        >
          <School size={14} />
          {lesson.class}
        </span>
        <span
          className={`w-1 h-1 rounded-full ${isOngoing ? "bg-white/30" : "bg-slate-300"}`}
        />
        <span
          className={`flex items-center gap-1.5 ${isOngoing ? "text-white/80" : "text-slate-500"}`}
        >
          <Users size={14} />
          {t("students_count", { count: lesson.students })}
        </span>
      </div>

      {/* CTA Button */}
      <div className={`flex ${isRTL ? "flex-row-reverse" : ""}`}>
        <button
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold transition-all ${
            isOngoing
              ? "bg-white text-emerald-700 hover:bg-emerald-50"
              : "bg-emerald-700 text-white hover:bg-emerald-800"
          }`}
        >
          <span>{isOngoing ? t("open_plan") : t("prepare_lesson")}</span>
          <ArrowRight
            size={16}
            strokeWidth={2.5}
            className={isRTL ? "rotate-180" : ""}
          />
        </button>
      </div>

      {/* Decorative bg icon */}
      <div
        className={`absolute bottom-[-20px] ${isRTL ? "left-[-20px]" : "right-[-20px]"} opacity-[0.08] pointer-events-none`}
      >
        {isOngoing ? (
          <Sparkles size={100} className="text-white" />
        ) : (
          <Calendar size={100} className="text-emerald-700" />
        )}
      </div>
    </div>
  );
}

// ─── Timeline item ───────────────────────────────────────────────────
function TimelineItem({
  item,
  isRTL,
  router,
}: {
  item: ScheduleItem;
  isRTL: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const startLabel =
    item.startTime.split(":").slice(0, 2).join(":").split(" ")[0] +
    " " +
    item.startTime.split(" ")[1];
  return (
    <div
      className={`flex gap-3 mb-5 cursor-pointer group ${isRTL ? "flex-row-reverse" : ""}`}
      onClick={() => router.push(`/dashboard/classes/subjects?classId=${item.classId}&name=${encodeURIComponent(item.subject)}&class=${encodeURIComponent(item.class)}`)}
    >
      {/* Time + vertical line */}
      <div className="flex flex-col items-center w-16 shrink-0">
        <span className="text-[11px] font-extrabold text-slate-400 mb-2 whitespace-nowrap">
          {item.startTime.split(":")[0]}:
          {item.startTime.split(":")[1]?.split(" ")[0]}
        </span>
        <div className="flex-1 w-0.5 bg-slate-100 rounded-full" />
      </div>

      {/* Content card */}
      <div className="flex-1 bg-white rounded-2xl px-4 py-3.5 border border-slate-100 flex items-center justify-between shadow-sm group-hover:border-emerald-100 transition-colors">
        <div className={isRTL ? "text-right" : ""}>
          <p className="text-sm font-extrabold text-slate-900">
            {item.subject}
          </p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {item.class}
          </p>
        </div>
        <ChevronRight
          size={16}
          className={`text-slate-300 shrink-0 ${isRTL ? "rotate-180" : ""}`}
        />
      </div>
    </div>
  );
}

// ─── Timetable day section (desktop inline) ──────────────────────────
function TimetableDaySection({
  day,
  isToday,
  isRTL,
  router,
}: {
  day: DayKey;
  isToday: boolean;
  isRTL: boolean;
  router: ReturnType<typeof useRouter>;
  items: any[];
}) {
  return null; // placeholder — see desktop panel below
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function DashboardHomePage() {
  const { user } = useAuth();
  const { t, language, isRTL } = useTranslation();
  const router = useRouter();

  const {
    schedule,
    loadingSchedule,
    isTomorrow,
    scheduleData,
    loadingClasses,
    planCount,
    assessmentCount,
    refreshAll,
  } = useDashboardData();

  const activePeriod = schedule.find((p) => p.status === "ongoing");
  const nextPeriod = schedule.find((p) => p.status === "next");
  const primaryLesson = activePeriod || nextPeriod;
  const isOngoing = !!activePeriod;
  const timelineLessons = schedule.filter(
    (p) =>
      p.status !== "completed" && (!primaryLesson || p.id !== primaryLesson.id),
  );

  const dateStr = getFormattedDate(language);

  const handleRefresh = () => {
    refreshAll();
  };

  return (
    <div className="min-h-screen bg-slate-50/50" dir={isRTL ? "rtl" : "ltr"}>
      {/* ─── HEADER ─────────────────────────────────────────────────── */}
      <header
        className={`bg-slate-50/50 px-5 pt-6 pb-5 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <Avatar src={user?.personal?.profilePhoto} name={user?.fullName} />
          <div className={isRTL ? "text-right" : ""}>
            <h1 className="text-lg font-black text-slate-900 leading-tight">
              {t("hello_user", { name: user?.fullName?.split(" ")[0] ?? "" })}
            </h1>
            <p className="text-[13px] text-slate-500 font-semibold">
              {dateStr}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
            aria-label="Refresh"
          >
            <RefreshCw size={16} className="text-slate-400" />
          </button>
          <button
            onClick={() => router.push("/dashboard/classes")}
            className="w-10 h-10 md:hidden rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
            aria-label="Classes"
          >
            <School size={18} className="text-emerald-600" />
          </button>
        </div>
      </header>

      {/* ─── MAIN LAYOUT ─────────────────────────────────────────────── */}
      <div className="flex gap-6 px-5 pb-10 items-start">
        {/* ── LEFT COLUMN (full width on mobile, 58% on desktop) ─────── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Stats row */}
          <div className="hidden md:grid grid-cols-3 gap-3">
            {[
              {
                icon: Users,
                label: t("classes"),
                value:
                  Object.values(scheduleData).flat().length > 0
                    ? Object.keys(scheduleData).length
                    : 0,
              },
              { icon: BookOpen, label: t("plans"), value: planCount },
              { icon: Award, label: t("tests"), value: assessmentCount },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col gap-1"
              >
                <Icon size={16} className="text-emerald-600" />
                <span className="text-xl font-black text-slate-900">
                  {value}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Primary lesson section */}
          {loadingSchedule ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 flex items-center justify-center">
              <Loader2 size={32} className="text-emerald-600 animate-spin" />
            </div>
          ) : primaryLesson ? (
            <div>
              {/* Section header */}
              <div
                className={`flex items-center justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <span className="text-xs font-black text-slate-400 tracking-widest uppercase">
                  {isOngoing
                    ? t("active_now")
                    : isTomorrow
                      ? t("upcoming_tomorrow")
                      : t("upcoming_next")}
                </span>
                {/* View Timetable — mobile only */}
                <Link
                  href="/dashboard/timetable"
                  className="md:hidden text-xs font-bold text-emerald-600 hover:underline"
                >
                  {t("view_timetable", { defaultValue: "View Timetable" })} →
                </Link>
              </div>
              <PrimaryLessonCard
                lesson={primaryLesson}
                isOngoing={isOngoing}
                isRTL={isRTL}
                isTomorrow={isTomorrow}
                t={t}
                router={router}
              />
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-100 p-10 flex flex-col items-center text-center shadow-sm">
              <Calendar size={56} className="text-slate-200 mb-4" />
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                {t("no_lessons_today")}
              </h3>
              <p className="text-sm text-slate-500 mb-5 max-w-xs">
                {t("no_lessons_desc")}
              </p>
              <Link
                href="/dashboard/timetable"
                className="md:hidden flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold text-sm px-5 py-2.5 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors"
              >
                {t("view_timetable", { defaultValue: "View Timetable" })}
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          {/* Today's Schedule timeline */}
          {schedule.length > 0 && (
            <div>
              <div
                className={`flex items-center justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <span className="text-xs font-black text-slate-400 tracking-widest uppercase">
                  {isTomorrow ? t("tomorrow_schedule") : t("todays_schedule")}
                </span>
              </div>

              {timelineLessons.length > 0 ? (
                timelineLessons.map((item) => (
                  <TimelineItem
                    key={item.id}
                    item={item}
                    isRTL={isRTL}
                    router={router}
                  />
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center gap-2">
                  <Sparkles size={28} className="text-slate-300" />
                  <p className="text-sm text-slate-400 font-semibold">
                    {isTomorrow ? t("no_more_tomorrow") : t("no_more_today")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: Weekly Timetable (desktop only, 42%) ─────── */}
        <aside className="hidden md:block w-80 lg:w-96 shrink-0 sticky top-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Calendar size={17} className="text-emerald-600" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                {t("my_timetable", { defaultValue: "Weekly Timetable" })}
              </h2>
            </div>

            {loadingClasses ? (
              <div className="p-10 flex items-center justify-center">
                <Loader2 size={28} className="text-emerald-600 animate-spin" />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[calc(100vh-180px)] px-4 py-3">
                {DAYS.map((day) => {
                  const items = scheduleData[day] || [];
                  const isToday = day === todayKey;
                  return (
                    <div
                      key={day}
                      className={`mb-5 ${isToday ? "border-l-4 border-emerald-500 pl-3" : "pl-3.5"}`}
                    >
                      {/* Day label */}
                      <p
                        className={`text-[11px] font-black tracking-widest uppercase mb-2 ${
                          isToday ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {DAY_LABELS[day]}
                        {isToday && (
                          <span className="ml-1.5 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                            TODAY
                          </span>
                        )}
                      </p>

                      {items.length > 0 ? (
                        items.map((item, i) => (
                          <div
                            key={`${item.classId}-${i}`}
                            className={`flex items-center gap-2 mb-2 group cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}
                            onClick={() => router.push(`/dashboard/classes/subjects?classId=${item.classId}&name=${encodeURIComponent(item.subject)}&class=${encodeURIComponent(item.className)}`)}
                          >
                            <span className="text-[11px] font-extrabold text-slate-400 w-12 shrink-0 whitespace-nowrap">
                              {item.startTime.split(":")[0]}:
                              {item.startTime.split(":")[1]?.split(" ")[0]}
                            </span>
                            <div className="flex-1 bg-slate-50 group-hover:bg-emerald-50 rounded-xl px-3 py-2 transition-colors">
                              <p className="text-xs font-extrabold text-slate-800 truncate">
                                {item.subject}
                              </p>
                              <p className="text-[11px] text-slate-500 font-semibold truncate">
                                {item.className}
                              </p>
                            </div>
                            <ChevronRight
                              size={13}
                              className={`text-slate-300 shrink-0 ${isRTL ? "rotate-180" : ""}`}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="border border-dashed border-slate-200 rounded-xl px-3 py-2.5 text-center">
                          <p className="text-[11px] text-slate-400 font-semibold">
                            No classes
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
