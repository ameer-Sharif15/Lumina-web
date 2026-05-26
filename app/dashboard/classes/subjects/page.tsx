'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight,
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  FileText,
  Loader2,
  Calendar,
  ExternalLink,
  ChevronDown,
  Check
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { apiClient } from '@/lib/api';

const TERM_OPTIONS = ['all', '1st Term', '2nd Term', '3rd Term'];

export default function SubjectOverviewPage() {
  const { t, isRTL } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const classId = searchParams.get('classId');
  const name = searchParams.get('name'); // Subject name (e.g. Mathematics)
  const className = searchParams.get('class'); // Class name (e.g. JSS 2)

  const [classroom, setClassroom] = useState<any>(null);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [syllabusId, setSyllabusId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTerm, setActiveTerm] = useState('all');
  const [isTermDropdownOpen, setIsTermDropdownOpen] = useState(false);

  // Fetch Class details
  const fetchClassroom = useCallback(async () => {
    if (!classId) return;
    try {
      const res = await apiClient.get(`/classes/${classId}`);
      if (res.data.success) {
        setClassroom(res.data.data);
        if (res.data.data?.term) {
          setActiveTerm(res.data.data.term);
        }
      }
    } catch (err) {
      console.error('Error fetching classroom:', err);
    }
  }, [classId]);

  // Fetch Syllabus weeks
  const fetchSyllabus = useCallback(async () => {
    if (!classId || !name) return;
    try {
      const res = await apiClient.get(`/syllabus/${classId}/subjects/${encodeURIComponent(name)}`);
      if (res.data.success) {
        setWeeks(res.data.data.weeks || []);
        setSyllabusId(res.data.data._id);
      }
    } catch (err) {
      console.error('Error fetching syllabus:', err);
    }
  }, [classId, name]);

  // Fetch Lesson Plans
  const fetchPlans = useCallback(async (termToFetch = activeTerm) => {
    if (!classId || !name) return;
    try {
      const paramsPayload = {
        classroomId: classId,
        subjectName: name,
        term: termToFetch === 'all' ? undefined : termToFetch,
      };
      const res = await apiClient.get('/plans', { params: paramsPayload });
      if (res.data.success) {
        setAllPlans(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching lesson plans:', err);
    }
  }, [classId, name, activeTerm]);

  // Initial loader
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await Promise.all([
        fetchClassroom(),
        fetchSyllabus(),
        fetchPlans()
      ]);
      setIsLoading(false);
    }
    if (classId && name) {
      loadData();
    }
  }, [classId, name, fetchClassroom, fetchSyllabus, fetchPlans]);

  // Refetch plans on term changes
  useEffect(() => {
    if (classId && name) {
      fetchPlans(activeTerm);
    }
  }, [activeTerm, classId, name, fetchPlans]);

  // Helper for Status styling coordinate
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-700',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          label: t('completed'),
        };
      case 'In Progress':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-700',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: t('status_in_progress'),
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-700',
          icon: <HelpCircle className="w-3.5 h-3.5" />,
          label: t('status_not_started'),
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 text-sm mt-3">{t('loading')}...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen text-slate-800">
      
      {/* Header info bar */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/classes/${classId}`)}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {name || t('mathematics')}
            </h1>
            <p className="text-xs text-slate-400 font-bold block mt-0.5">
              {className || t('jss_2')} &bull; Syllabus Details
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push(`/dashboard/plans/create?class=${className}&subject=${name}`)}
          className="flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-bold px-4 py-2.5 rounded-full transition-all shadow-sm cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Plan</span>
        </button>
      </div>

      {/* Term Switcher bar */}
      <div className="relative mb-8">
        <button
          onClick={() => setIsTermDropdownOpen(!isTermDropdownOpen)}
          className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-100 rounded-xl shadow-sm text-sm font-bold text-slate-800 hover:text-emerald-700 cursor-pointer"
        >
          <span>
            {activeTerm === 'all' 
              ? t('all_terms') 
              : t(activeTerm.toLowerCase().replace(' ', '_'), { defaultValue: activeTerm })}
          </span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${isTermDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isTermDropdownOpen && (
          <div className="absolute left-0 mt-1.5 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-20">
            {TERM_OPTIONS.map((termOption) => (
              <button
                key={termOption}
                onClick={() => {
                  setActiveTerm(termOption);
                  setIsTermDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                  activeTerm === termOption 
                    ? 'bg-emerald-50 text-emerald-800' 
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>
                  {termOption === 'all' 
                    ? t('all_terms') 
                    : t(termOption.toLowerCase().replace(' ', '_'), { defaultValue: termOption })}
                </span>
                {activeTerm === termOption && <Check size={14} className="text-emerald-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid content split desktop / stack mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Weekly syllabus lists */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            {t('syllabus_overview_title', { defaultValue: 'Syllabus Overview & Lesson Plans' })}
          </h3>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {weeks.map((item) => {
              const statusStyle = getStatusStyle(item.status);
              const hasPlan = item.lessonPlanId !== undefined && item.lessonPlanId !== null;

              return (
                <div 
                  key={item.weekNumber} 
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:border-slate-200 transition-colors"
                >
                  <div>
                    {/* Header Week & status pill */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black text-emerald-700 tracking-wider">
                        {t('week_number', { number: item.weekNumber, defaultValue: `WEEK ${item.weekNumber}` })}
                      </span>
                      
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.icon}
                        <span>{statusStyle.label}</span>
                      </div>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">{item.topic}</h4>
                    {item.description && (
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{item.description}</p>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-4 border-t border-slate-50 flex justify-start">
                    {hasPlan ? (
                      <button
                        onClick={() => router.push(`/dashboard/plans/${item.lessonPlanId}`)}
                        className="flex items-center gap-1.5 border border-emerald-600 hover:bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        <FileText size={13} />
                        <span>{t('view_plan')}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/dashboard/plans/create?classId=${classId}&class=${className}&subject=${name}&weekNumber=${item.weekNumber}&topic=${encodeURIComponent(item.topic)}`)}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        <Sparkles size={13} />
                        <span>{t('generate_lesson_plan')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {weeks.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h4 className="font-extrabold text-slate-800 mb-1">{t('no_syllabus_found')}</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">{t('no_syllabus_desc')}</p>
                <button
                  onClick={() => router.push(`/dashboard/plans/create?classId=${classId}&class=${className}&subject=${name}&weekNumber=1`)}
                  className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  {t('start_planning_week_1')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic History logs split feed */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            {t('plan_history', { defaultValue: 'Plan History' })}
          </h3>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {allPlans.map((plan) => (
              <div 
                key={plan._id}
                onClick={() => router.push(`/dashboard/plans/${plan._id}`)}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 hover:shadow-md cursor-pointer transition-all flex justify-between items-center"
              >
                <div>
                  <span className="text-[10px] font-black text-slate-400 tracking-widest block uppercase">
                    {plan.term} &bull; Week {plan.weekNumber}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-1 mb-2 line-clamp-1">{plan.topic || plan.subject}</h4>
                  
                  <span className="text-[10px] font-medium text-slate-400">
                    Created: {new Date(plan.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ExternalLink size={14} />
                </div>
              </div>
            ))}

            {allPlans.length === 0 && (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span className="font-bold text-xs block">No plan history found for this term selection</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
