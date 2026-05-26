'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight,
  Users, 
  BookOpen, 
  Calendar, 
  Layers, 
  Edit3, 
  Loader2,
  Clock
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { apiClient } from '@/lib/api';

export default function ClassDetailsPage() {
  const { t, isRTL } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [classInfo, setClassInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClassDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/classes/${id}`);
      if (res.data.success) {
        setClassInfo(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching class details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

  // Group schedules by subject to display summaries
  const getSubjectSummary = () => {
    if (!classInfo || !classInfo.schedule) return [];
    const summaryMap: Record<string, any> = {};

    classInfo.schedule.forEach((p: any) => {
      if (!summaryMap[p.subject]) {
        summaryMap[p.subject] = {
          id: p.subject,
          name: p.subject,
          periods: 0,
          schedule: [],
          color: classInfo.color || '#006D4E',
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

  const subjectsData = getSubjectSummary();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 text-sm mt-3">{t('loading')}...</p>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Class not found</h2>
        <button
          onClick={() => router.push('/dashboard/classes')}
          className="mt-4 bg-emerald-600 text-white font-bold px-4 py-2 rounded-full"
        >
          Back to Classes List
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen text-slate-800">
      
      {/* Back button and Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/classes')}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {classInfo.name}
            </h1>
            <p className="text-xs text-slate-400 font-bold block mt-0.5">
              {classInfo.academicYear} &bull; {classInfo.term || t('no_section')}
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push(`/dashboard/classes/${id}/edit`)}
          className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer"
        >
          <Edit3 className="w-4 h-4 text-emerald-700" />
          <span>{t('edit_class_title')}</span>
        </button>
      </div>

      {/* Class Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Enrolled Students Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase block">{t('total_enrolled')}</span>
            <span className="text-2xl font-black text-slate-900">
              {t('students_count', { count: classInfo.studentCount || 0 })}
            </span>
          </div>
        </div>

        {/* Assigned Subjects Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase block">{t('assigned')}</span>
            <span className="text-2xl font-black text-slate-900">
              {t('subjects_count_simple', { count: classInfo.subjects?.length || 0 })}
            </span>
          </div>
        </div>

      </div>

      {/* Subjects timetable cards listing */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">
        Assigned Subjects & Periods
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjectsData.map((subject) => {
          const cardColor = subject.color || '#006D4E';
          
          return (
            <div 
              key={subject.id} 
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                
                {/* Header card info */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-black text-slate-950">{subject.name}</h4>
                    
                    {/* Lessons count placeholder or display badge */}
                    <div className="flex items-center gap-1 mt-2 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs font-bold w-fit">
                      <Layers className="w-3 h-3" />
                      <span>{t('lessons_count', { count: subject.lessons || 0 })}</span>
                    </div>
                  </div>

                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${cardColor}15` }}
                  >
                    <BookOpen className="w-6 h-6" style={{ color: cardColor }} />
                  </div>
                </div>

                {/* Timetable schedule grid list */}
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('weekly_schedule_periods', { count: subject.periods })}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {subject.schedule.map((slot: any, idx: number) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl px-2.5 py-1 text-xs text-slate-700 font-extrabold shadow-sm"
                      >
                        <span>{slot.day}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[11px] text-slate-500 font-medium">{slot.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => router.push(`/dashboard/classes/subjects?classId=${id}&name=${encodeURIComponent(subject.name)}&class=${encodeURIComponent(classInfo.name)}`)}
                  className="w-full h-11 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                  style={{ 
                    color: cardColor,
                    borderColor: cardColor
                  }}
                >
                  <Layers size={16} />
                  <span>{t('open_subject')}</span>
                </button>
              </div>

            </div>
          );
        })}

        {subjectsData.length === 0 && (
          <div className="md:col-span-2 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <span className="font-bold text-sm">No subjects schedule defined for this class yet.</span>
            <button
              onClick={() => router.push(`/dashboard/classes/${id}/edit`)}
              className="mt-4 block mx-auto text-xs bg-emerald-600 text-white font-bold px-4 py-2 rounded-full cursor-pointer"
            >
              Add Schedule Period
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
