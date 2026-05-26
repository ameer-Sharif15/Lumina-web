'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight,
  School, 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  Clock, 
  BookOpen, 
  Calendar,
  CheckCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useDashboardData } from '@/context/DashboardDataContext';
import { apiClient } from '@/lib/api';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

export default function CreateClassPage() {
  const { t, isRTL } = useTranslation();
  const router = useRouter();
  const { refreshAll } = useDashboardData();

  const TERMS = [t('term_1st'), t('term_2nd'), t('term_3rd')];
  const AM_PM_OPTIONS = [t('am'), t('pm')];

  // Common initial subject list pool
  const [initialSubjects, setInitialSubjects] = useState<any[]>([
    { id: '1', name: 'Mathematics' },
    { id: '2', name: 'English Language' },
    { id: '3', name: 'Basic Science' },
    { id: '4', name: 'Social Studies' },
    { id: '5', name: 'Civic Education' },
  ]);

  const [className, setClassName] = useState('');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [studentCount, setStudentCount] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(TERMS[0]);

  // Subjects pool selection
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(['1', '2']);
  const [customSubjects, setCustomSubjects] = useState<any[]>([]);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Weekly periods state
  const [schedule, setSchedule] = useState<Record<string, any[]>>({
    MON: [], TUE: [], WED: [], THU: [], FRI: [], SAT: [], SUN: [],
  });

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState('');
  const [periodSubject, setPeriodSubject] = useState('');
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);

  // Custom Time picker select options state
  const [startHour, setStartHour] = useState('08');
  const [startMin, setStartMin] = useState('00');
  const [startAmPm, setStartAmPm] = useState('AM');

  const [endHour, setEndHour] = useState('09');
  const [endMin, setEndMin] = useState('00');
  const [endAmPm, setEndAmPm] = useState('AM');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const allSubjects = [...initialSubjects, ...customSubjects];
  const selectedSubjects = allSubjects.filter(s => selectedSubjectIds.includes(s.id));

  const isFormComplete = 
    className.trim() !== '' && 
    academicYear.trim() !== '' && 
    studentCount.trim() !== '' && 
    selectedSubjectIds.length > 0;

  // Toggle subject selection
  const toggleSubject = (id: string) => {
    setSelectedSubjectIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  // Add custom subject
  const addCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubjectName.trim()) {
      const newSub = { id: Date.now().toString(), name: newSubjectName.trim() };
      setCustomSubjects(prev => [...prev, newSub]);
      setSelectedSubjectIds(prev => [...prev, newSub.id]);
      setNewSubjectName('');
      setIsSubjectModalOpen(false);
    }
  };

  // Open Period Drawer/Modal
  const openPeriodModal = (day: string, period?: any) => {
    setActiveDay(day);
    if (period) {
      setEditingPeriodId(period.id);
      setPeriodSubject(period.subject);
      
      try {
        const [start, end] = period.time.split(' - ');
        const [sTime, sAp] = start.split(' ');
        const [sH, sM] = sTime.split(':');
        const [eTime, eAp] = end.split(' ');
        const [eH, eM] = eTime.split(':');

        setStartHour(sH);
        setStartMin(sM);
        setStartAmPm(sAp);
        setEndHour(eH);
        setEndMin(eM);
        setEndAmPm(eAp);
      } catch (err) {
        setStartHour('08');
        setStartMin('00');
        setStartAmPm('AM');
        setEndHour('09');
        setEndMin('00');
        setEndAmPm('AM');
      }
    } else {
      setEditingPeriodId(null);
      if (selectedSubjects.length > 0) {
        setPeriodSubject(selectedSubjects[0].name);
      }
      setStartHour('08');
      setStartMin('00');
      setStartAmPm('AM');
      setEndHour('09');
      setEndMin('00');
      setEndAmPm('AM');
    }
    setIsPeriodModalOpen(true);
  };

  // Save period modifications
  const savePeriod = () => {
    if (activeDay && periodSubject) {
      const timeStr = `${startHour}:${startMin} ${startAmPm} - ${endHour}:${endMin} ${endAmPm}`;

      if (editingPeriodId) {
        setSchedule(prev => ({
          ...prev,
          [activeDay]: prev[activeDay].map(p => 
            p.id === editingPeriodId ? { ...p, time: timeStr, subject: periodSubject } : p
          ),
        }));
      } else {
        const newPeriod = {
          id: Date.now().toString(),
          time: timeStr,
          subject: periodSubject,
        };
        setSchedule(prev => ({
          ...prev,
          [activeDay]: [...prev[activeDay], newPeriod],
        }));
      }
      setIsPeriodModalOpen(false);
    }
  };

  // Remove defined period
  const removePeriod = (day: string, periodId: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter(p => p.id !== periodId),
    }));
    setIsPeriodModalOpen(false);
  };

  // Submit new class details payload to backend
  const handleCreateClass = async () => {
    if (!className || !academicYear || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Flatten schedule for the backend
      const flattenedSchedule: any[] = [];
      Object.keys(schedule).forEach(day => {
        schedule[day].forEach(p => {
          const [start, end] = p.time.split(' - ');
          flattenedSchedule.push({
            day,
            startTime: start,
            endTime: end,
            subject: p.subject,
          });
        });
      });

      const payload = {
        name: className,
        academicYear,
        term: selectedTerm,
        studentCount: parseInt(studentCount) || 0,
        subjects: selectedSubjects.map(s => s.name),
        schedule: flattenedSchedule,
        color: '#006D4E',
      };

      const response = await apiClient.post('/classes', payload);
      if (response.data.success) {
        await refreshAll();
        router.push('/dashboard/classes');
      }
    } catch (err: any) {
      console.error('Error creating class:', err?.response?.data || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen text-slate-800">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/classes')}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <School className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {t('create_class_title')}
            </h1>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard/classes')}
          className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Class Info card Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{t('class_info')}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Class Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t('class_name_hint')}
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder={t('enter_class_name')}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm font-semibold transition-all"
              />
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t('academic_year')}
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder={t('academic_year_placeholder')}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm font-semibold transition-all"
              />
            </div>

            {/* Students Count */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {t('num_students')}
              </label>
              <input
                type="number"
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)}
                placeholder={t('num_students_placeholder')}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm font-semibold transition-all"
              />
            </div>

          </div>

          {/* Select Term */}
          <div className="mt-6">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {t('select_term')}
            </span>
            <div className="flex flex-wrap gap-2.5">
              {TERMS.map((term) => {
                const isSelected = selectedTerm === term;
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setSelectedTerm(term)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {term}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Subjects Pool selection section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>{t('assign_subjects')}</span>
            </h2>
            
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(true)}
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-extrabold cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>{t('new_subject')}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {allSubjects.map((subject) => {
              const isSelected = selectedSubjectIds.includes(subject.id);
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span>{subject.name}</span>
                  {isSelected && <X size={13} className="text-emerald-600 hover:text-red-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timetable schedule grid scheduler */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
              <Sparkles size={16} />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">{t('smart_schedule')}</h2>
          </div>
          <p className="text-xs text-slate-400 font-semibold mb-6">
            {t('smart_schedule_create_desc')}
          </p>

          <div className="space-y-4">
            {DAYS.map((day) => {
              const periods = schedule[day] || [];
              const isWeekend = day === 'SAT' || day === 'SUN';

              return (
                <div key={day} className="flex flex-col md:flex-row md:items-start border-b border-slate-100 pb-4 gap-4">
                  <div className="md:w-28 pt-2">
                    <span className={`text-sm font-black ${isWeekend ? 'text-slate-400' : 'text-slate-900'}`}>
                      {t(`day_${day.toLowerCase()}`, { defaultValue: day })}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {periods.map((period) => (
                      <div 
                        key={period.id}
                        onClick={() => openPeriodModal(day, period)}
                        className="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-colors bg-slate-50 hover:bg-white"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{period.subject}</span>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{period.time}</span>
                        </div>
                        <X 
                          size={14} 
                          onClick={(e) => {
                            e.stopPropagation();
                            removePeriod(day, period.id);
                          }}
                          className="text-slate-400 hover:text-red-500 cursor-pointer" 
                        />
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => openPeriodModal(day)}
                      className="flex items-center gap-1.5 border border-dashed border-emerald-500 hover:border-emerald-700 text-emerald-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer hover:bg-emerald-50 bg-white"
                    >
                      <Plus size={14} />
                      <span>{t('add_period')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Sticky Save Footer */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 mt-8 flex justify-end z-10">
        <button
          type="button"
          onClick={handleCreateClass}
          disabled={!isFormComplete || isSubmitting}
          className={`flex items-center gap-2 font-black text-sm px-8 py-3 rounded-full transition-all shadow-sm ${
            isFormComplete && !isSubmitting
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md cursor-pointer'
              : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <span>{t('create_class_title')}</span>
          )}
        </button>
      </div>

      {/* Custom Add New Subject Modal Popup */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={addCustomSubject} className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">{t('add_new_subject')}</h3>
            <input
              type="text"
              autoFocus
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder={t('subject_name_placeholder')}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 text-sm font-semibold transition-all mb-6"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSubjectModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold hover:bg-slate-50 text-slate-500 border border-slate-200 cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={!newSubjectName.trim()}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  newSubjectName.trim()
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {t('add_subject')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timetable Period Add/Edit Modal Popup */}
      {isPeriodModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 border border-slate-100 animate-in slide-in-from-bottom-8 duration-200">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-50">
              <h3 className="text-lg font-black text-slate-950">
                {editingPeriodId 
                  ? t('edit_period_for', { day: t(`day_${activeDay.toLowerCase()}`, { defaultValue: activeDay }) })
                  : t('add_period_for', { day: t(`day_${activeDay.toLowerCase()}`, { defaultValue: activeDay }) })}
              </h3>
              {editingPeriodId && (
                <button
                  type="button"
                  onClick={() => removePeriod(activeDay, editingPeriodId)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all cursor-pointer"
                  title="Delete period"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {/* Select Subject chip lists */}
            <div className="mb-6">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {t('select_subject')}
              </span>
              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
                {selectedSubjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPeriodSubject(s.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      periodSubject === s.name
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
                {selectedSubjects.length === 0 && (
                  <span className="text-xs text-red-500 font-semibold">Please select subjects above first!</span>
                )}
              </div>
            </div>

            {/* Time Picker Inputs row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              
              {/* Start Time Select */}
              <div className="bg-slate-50 rounded-2xl p-3 md:p-4 border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {t('start_time')}
                </span>
                
                <div className="flex items-center gap-1 justify-center sm:justify-start">
                  <select 
                    value={startHour} 
                    onChange={(e) => setStartHour(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white font-bold text-xs md:text-sm px-1 md:px-1.5 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  
                  <span className="font-bold text-slate-400">:</span>
                  
                  <select 
                    value={startMin} 
                    onChange={(e) => setStartMin(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white font-bold text-xs md:text-sm px-1 md:px-1.5 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  
                  <select 
                    value={startAmPm} 
                    onChange={(e) => setStartAmPm(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white font-bold text-xs md:text-sm px-1 md:px-1.5 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              {/* End Time Select */}
              <div className="bg-slate-50 rounded-2xl p-3 md:p-4 border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {t('end_time')}
                </span>
                
                <div className="flex items-center gap-1 justify-center sm:justify-start">
                  <select 
                    value={endHour} 
                    onChange={(e) => setEndHour(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white font-bold text-xs md:text-sm px-1 md:px-1.5 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  
                  <span className="font-bold text-slate-400">:</span>
                  
                  <select 
                    value={endMin} 
                    onChange={(e) => setEndMin(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white font-bold text-xs md:text-sm px-1 md:px-1.5 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  
                  <select 
                    value={endAmPm} 
                    onChange={(e) => setEndAmPm(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 bg-white font-bold text-xs md:text-sm px-1 md:px-1.5 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

            </div>


            {/* Modal actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setIsPeriodModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold hover:bg-slate-50 text-slate-500 border border-slate-200 cursor-pointer"
              >
                {t('cancel')}
              </button>
              
              <button
                type="button"
                onClick={savePeriod}
                disabled={!periodSubject}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  periodSubject
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {editingPeriodId ? t('save') : t('add_period')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
