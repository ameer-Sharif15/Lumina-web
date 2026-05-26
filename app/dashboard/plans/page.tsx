'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Calendar, 
  ArrowUpDown, 
  ChevronRight, 
  Sparkles, 
  BookMarked,
  Filter,
  X,
  FileText,
  Clock,
  Check
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useDashboardData } from '@/context/DashboardDataContext';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PlansPage() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const { classes, plans, loadingPlans: loading } = useDashboardData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTimeline, setSelectedTimeline] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [sessions, setSessions] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    // Fetch academic sessions
    apiClient.get('/classes/sessions')
      .then((res) => {
        if (res.data && res.data.success) {
          setSessions(res.data.data || []);
        }
      })
      .catch((err) => console.error('Error fetching sessions:', err));
  }, []);

  // Collect all unique subjects across all classes for subjects filter
  const allSubjects = Array.from(
    new Set(
      classes.flatMap((c: any) => c.subjects || [])
    )
  );

  // Filter & sort logic
  const filteredPlans = plans
    .filter((plan) => {
      const matchesSearch = plan.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.subjectName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClass = selectedClassId === 'all' || plan.classroomId === selectedClassId || plan.class === selectedClassId;
      
      const matchesSubject = selectedSubject === 'all' || plan.subjectName === selectedSubject;

      // Timeline filter
      let matchesTimeline = true;
      if (selectedTimeline !== 'all') {
        const now = new Date();
        const planDate = new Date(plan.createdAt || plan.date);
        
        if (selectedTimeline === 'this_week') {
          const startOfWeek = new Date();
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          matchesTimeline = planDate >= startOfWeek;
        } else if (selectedTimeline === 'this_month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesTimeline = planDate >= startOfMonth;
        } else if (selectedTimeline === 'this_term') {
          if (selectedClassId !== 'all') {
            const activeClass = classes.find((c: any) => c._id === selectedClassId);
            if (activeClass) {
              matchesTimeline = plan.term === activeClass.term;
            }
          }
        } else if (['1st Term', '2nd Term', '3rd Term'].includes(selectedTimeline)) {
          matchesTimeline = plan.term === selectedTimeline;
        }
      }

      // Academic Session filter
      const matchesSession = selectedSession === 'all' || plan.session === selectedSession;

      return matchesSearch && matchesClass && matchesSubject && matchesTimeline && matchesSession;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date).getTime();
      const dateB = new Date(b.createdAt || b.date).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedClassId('all');
    setSelectedSubject('all');
    setSelectedTimeline('all');
    setSelectedSession('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedClassId !== 'all' || selectedSubject !== 'all' || selectedTimeline !== 'all' || selectedSession !== 'all' || sortBy !== 'newest';

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>
            {t('plans') || 'Lesson Plans'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('copilot_instruction') || 'Generate and manage all your lesson plans.'}
          </p>
        </div>
        {/* Hide on mobile viewport */}
        <Link 
          href="/dashboard/plans/create" 
          className="hidden md:flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-3 rounded-full transition-all shadow-md hover:shadow-emerald-100 shadow-emerald-50 cursor-pointer"
        >
          <Sparkles size={16} className="text-emerald-100 animate-bounce" />
          <span>{t('generate_lesson_plan') || 'Generate Lesson Plan'}</span>
        </Link>
      </div>

      {/* Mobile Filter Button (visible only on mobile) */}
      <div className="flex lg:hidden items-center justify-between gap-3 mb-6 bg-white p-4 border border-slate-100 rounded-3xl shadow-sm">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 text-slate-700 font-extrabold text-sm py-2.5 px-4 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
        >
          <Filter size={16} className="text-emerald-600" />
          <span>{t('filters') || 'Filters'}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>
        <Link 
          href="/dashboard/plans/create" 
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-sm shadow-emerald-150 cursor-pointer"
        >
          <Plus size={14} />
          <span>{t('generate') || 'Create'}</span>
        </Link>
      </div>

      {/* Main Grid: Sidebar + List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters (hidden on mobile, visible on desktop) */}
        <div className="hidden lg:block lg:col-span-1 space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-50">
            <span className="font-extrabold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Filter className="w-4 h-4 text-emerald-600" />
              {t('filters') || 'Filters'}
            </span>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X size={12} />
                <span>{t('clear_all') || 'Clear'}</span>
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('search_topics') || 'Search topics...'}</label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('search_topics') || 'Search topics...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-4 outline-none transition-all font-semibold"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Class filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('select_class') || 'Select Class'}</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-3 outline-none transition-all cursor-pointer font-bold text-slate-700"
            >
              <option value="all">{t('all_classes') || 'All Classes'}</option>
              {classes.map((cls: any) => (
                <option key={cls._id} value={cls._id || cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('subject') || 'Subject'}</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-3 outline-none transition-all cursor-pointer font-bold text-slate-700"
            >
              <option value="all">{t('all_subjects') || 'All Subjects'}</option>
              {allSubjects.map((sub: any) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('timeline') || 'Timeline'}</label>
            <select
              value={selectedTimeline}
              onChange={(e) => setSelectedTimeline(e.target.value)}
              className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-3 outline-none transition-all cursor-pointer font-bold text-slate-700"
            >
              <option value="all">{t('all_time') || 'All Time'}</option>
              <option value="this_week">{t('this_week') || 'This Week'}</option>
              <option value="this_month">{t('this_month') || 'This Month'}</option>
              <option value="this_term">{t('this_term') || 'This Term'}</option>
              <option value="1st Term">{t('1st_term') || '1st Term'}</option>
              <option value="2nd Term">{t('2nd_term') || '2nd Term'}</option>
              <option value="3rd Term">{t('3rd_term') || '3rd Term'}</option>
            </select>
          </div>

          {/* Academic Session Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('academic_session_label') || 'Academic Session'}</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-3 outline-none transition-all cursor-pointer font-bold text-slate-700"
            >
              <option value="all">{t('all_sessions') || 'All Sessions'}</option>
              {sessions.map((sess: string) => (
                <option key={sess} value={sess}>
                  {sess}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('sort_by') || 'Sort By'}</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-3 outline-none transition-all cursor-pointer font-bold text-slate-700"
              >
                <option value="newest">{t('newest') || 'Newest'}</option>
                <option value="oldest">{t('oldest') || 'Oldest'}</option>
              </select>
              <ArrowUpDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Plans List Panel */}
        <div className="col-span-1 lg:col-span-3">
          
          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-20 bg-slate-100 rounded-full" />
                    <div className="h-6 w-16 bg-slate-100 rounded-full" />
                  </div>
                  <div className="h-5 w-3/4 bg-slate-100 rounded-lg" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 w-8 bg-slate-100 rounded-full" />
                    <div className="h-8 w-8 bg-slate-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPlans.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center bg-white border border-slate-100 rounded-3xl py-24 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mb-2">
                {t('no_plans_found') || 'No lesson plans found'}
              </h2>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed px-4">
                {t('no_plans_subtitle') || "We couldn't find any plans matching your current selections."}
              </p>
              <div className="flex gap-3 mt-6">
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer"
                  >
                    {t('cancel') || 'Clear Filters'}
                  </button>
                )}
                <Link 
                  href="/dashboard/plans/create" 
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>{t('generate_lesson_plan') || 'Generate Lesson Plan'}</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Plans Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPlans.map((plan) => {
                const classLabel = classes.find((c: any) => c._id === plan.classroomId)?.name || plan.class || 'Class';
                
                return (
                  <div 
                    key={plan._id}
                    onClick={() => router.push(`/dashboard/plans/${plan._id}`)}
                    className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-50/10 transition-all duration-300 flex flex-col justify-between h-56 cursor-pointer relative overflow-hidden"
                  >
                    {/* Glowing highlight */}
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div>
                      {/* Top labels */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                          {classLabel}
                        </span>
                        {plan.weekNumber && (
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            {t('week_label', { count: plan.weekNumber }) || `Week ${plan.weekNumber}`}
                          </span>
                        )}
                      </div>

                      {/* Topic title */}
                      <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors text-base line-clamp-2 leading-snug">
                        {plan.topic}
                      </h3>
                      
                      {/* Subject Name */}
                      <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-1">
                        <BookMarked className="w-3 h-3 text-slate-300" />
                        {plan.subjectName}
                      </p>
                    </div>

                    {/* Bottom date and navigation icon */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-300" />
                        {plan.date}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center transition-all">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Mobile Filters Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto space-y-6 animate-in slide-in-from-bottom duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-extrabold text-slate-900 flex items-center gap-2 text-base">
                <Filter className="w-5 h-5 text-emerald-600" />
                {t('filters') || 'Filters'}
              </span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form list fields */}
            <div className="space-y-4">
              
              {/* Search topics */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('search_topics') || 'Search topics...'}</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('search_topics') || 'Search topics...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-4 outline-none transition-all font-semibold"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Class */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('select_class') || 'Select Class'}</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-3 outline-none transition-all cursor-pointer font-bold text-slate-700"
                >
                  <option value="all">{t('all_classes') || 'All Classes'}</option>
                  {classes.map((cls: any) => (
                    <option key={cls._id} value={cls._id || cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('subject') || 'Subject'}</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-3 outline-none transition-all cursor-pointer font-bold text-slate-700"
                >
                  <option value="all">{t('all_subjects') || 'All Subjects'}</option>
                  {allSubjects.map((sub: any) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('timeline') || 'Timeline'}</label>
                <select
                  value={selectedTimeline}
                  onChange={(e) => setSelectedTimeline(e.target.value)}
                  className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-3 outline-none transition-all cursor-pointer font-bold text-slate-700"
                >
                  <option value="all">{t('all_time') || 'All Time'}</option>
                  <option value="this_week">{t('this_week') || 'This Week'}</option>
                  <option value="this_month">{t('this_month') || 'This Month'}</option>
                  <option value="this_term">{t('this_term') || 'This Term'}</option>
                  <option value="1st Term">{t('1st_term') || '1st Term'}</option>
                  <option value="2nd Term">{t('2nd_term') || '2nd Term'}</option>
                  <option value="3rd Term">{t('3rd_term') || '3rd Term'}</option>
                </select>
              </div>

              {/* Session */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('academic_session_label') || 'Academic Session'}</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-3 outline-none transition-all cursor-pointer font-bold text-slate-700"
                >
                  <option value="all">{t('all_sessions') || 'All Sessions'}</option>
                  {sessions.map((sess: string) => (
                    <option key={sess} value={sess}>
                      {sess}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('sort_by') || 'Sort By'}</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3 px-3 outline-none transition-all cursor-pointer font-bold text-slate-700"
                  >
                    <option value="newest">{t('newest') || 'Newest'}</option>
                    <option value="oldest">{t('oldest') || 'Oldest'}</option>
                  </select>
                  <ArrowUpDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  clearFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer"
              >
                {t('clear_all') || 'Clear All'}
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md cursor-pointer"
              >
                {t('apply_filters') || 'Apply Filters'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
