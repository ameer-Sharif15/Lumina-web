"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { DAYS, DAY_LABELS, DayKey, ClassPeriod } from '@/hooks/useClasses';
import { useDashboardData } from '@/context/DashboardDataContext';
import { ChevronRight, ChevronLeft, Calendar, Sparkles, Loader2, RefreshCw } from 'lucide-react';

const TODAY_KEYS: DayKey[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const todayKey = TODAY_KEYS[new Date().getDay()];

export default function TimetablePage() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const { scheduleData, loadingClasses, refreshAll } = useDashboardData();

  // ── Desktop: redirect to dashboard (timetable is mobile-only) ──────
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth >= 768) {
        router.replace('/dashboard');
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50/50 md:hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-100 px-4 pt-5 pb-4">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL
              ? <ChevronRight size={20} className="text-emerald-700" />
              : <ChevronLeft size={20} className="text-emerald-700" />
            }
          </button>

          {/* Title */}
          <h1 className="text-base font-extrabold text-slate-900">
            {t('my_timetable', { defaultValue: 'My Timetable' })}
          </h1>

          {/* Refresh button */}
          <button
            onClick={refreshAll}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
            aria-label="Refresh"
          >
            <RefreshCw size={15} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      {loadingClasses ? (

        <div className="flex items-center justify-center py-24">
          <Loader2 size={36} className="text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="px-5 pt-4 pb-28 space-y-6">
          {DAYS.map((day) => {
            const items: ClassPeriod[] = scheduleData[day] || [];
            const isToday = day === todayKey;

            return (
              <div key={day} className="space-y-3">
                {/* Day header */}
                <div className={`flex items-center gap-2 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-xs font-black tracking-widest uppercase ${
                    isToday ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {t(`day_${day.toLowerCase()}_full`, { defaultValue: DAY_LABELS[day] })}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      TODAY
                    </span>
                  )}
                </div>

                {/* Schedule items */}
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div
                      key={`${item.classId}-${index}`}
                      className={`flex gap-3 cursor-pointer group ${isRTL ? 'flex-row-reverse' : ''}`}
                      onClick={() => router.push(`/dashboard/classes/subjects?classId=${item.classId}&name=${encodeURIComponent(item.subject)}&class=${encodeURIComponent(item.className)}`)}
                    >
                      {/* Time + timeline */}
                      <div className="flex flex-col items-center w-16 shrink-0 pt-1">
                        <span className="text-[11px] font-extrabold text-slate-400 mb-2 whitespace-nowrap">
                          {item.startTime.split(':')[0]}:{item.startTime.split(':')[1]?.split(' ')[0]}
                        </span>
                        <div className="flex-1 w-0.5 bg-slate-100 rounded-full min-h-[24px]" />
                      </div>

                      {/* Card */}
                      <div className="flex-1 bg-white rounded-2xl px-4 py-3.5 border border-slate-100 flex items-center justify-between shadow-sm group-hover:border-emerald-100 transition-colors mb-4">
                        <div className={isRTL ? 'text-right' : ''}>
                          <p className="text-sm font-extrabold text-slate-900">{item.subject}</p>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">{item.className}</p>
                        </div>
                        <ChevronRight
                          size={16}
                          className={`text-slate-300 shrink-0 ${isRTL ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  /* Empty day */
                  <div className={`border border-dashed border-slate-200 rounded-2xl px-4 py-5 flex flex-col items-center gap-1.5 ${isRTL ? 'ml-0 mr-[76px]' : 'ml-[76px]'}`}>
                    <Sparkles size={22} className="text-slate-300" />
                    <p className="text-xs text-slate-400 font-semibold">
                      {t('no_classes_scheduled', { defaultValue: 'No Classes Scheduled' })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
