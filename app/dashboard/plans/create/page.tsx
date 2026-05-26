'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowLeft, 
  School, 
  BookOpen, 
  ListTodo, 
  Calendar, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Pencil,
  FileCheck2,
  Check
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/context/DashboardDataContext';
import useActionHandler from '@/hooks/useActionHandler';
import toast from 'react-hot-toast';
import UpgradeModal from '@/components/UpgradeModal';

export default function CreatePlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL } = useTranslation();
  
  const { user } = useAuth();
  const { classes } = useDashboardData();
  const { handleAction: handleAIAction, isLoading: isAILoading } = useActionHandler();
  const { handleAction: handleEmptyAction, isLoading: isEmptyLoading } = useActionHandler();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Selected parameters
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('1');

  // Advanced settings toggle & choices
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [includeAssessment, setIncludeAssessment] = useState(true);

  const [philosophy, setPhilosophy] = useState(
    user?.classroom?.teachingPhilosophy?.[0] || 'Constructivism'
  );
  const [planType, setPlanType] = useState(
    user?.classroom?.planStyle?.[0] || 'Detailed'
  );
  const [studentType, setStudentType] = useState(
    user?.classroom?.studentLevel || 'Mixed'
  );

  // Initialize from query parameters if loaded
  useEffect(() => {
    const classIdParam = searchParams.get('classId');
    const subjectParam = searchParams.get('subject');
    const topicParam = searchParams.get('topic');
    const weekParam = searchParams.get('weekNumber');

    if (topicParam) setTopic(topicParam);
    if (weekParam) setSelectedWeek(weekParam);

    if (classes.length > 0) {
      if (classIdParam) {
        const found = classes.find((c: any) => c._id === classIdParam);
        if (found) {
          setSelectedClass(found);
          if (subjectParam) {
            setSelectedSubject(subjectParam);
          } else if (found.subjects?.length > 0) {
            setSelectedSubject(found.subjects[0]);
          }
        }
      } else {
        setSelectedClass(classes[0]);
        if (classes[0].subjects?.length > 0) {
          setSelectedSubject(classes[0].subjects[0]);
        }
      }
    }
  }, [classes, searchParams]);

  // Handle class selection change
  const handleClassChange = (classId: string) => {
    const found = classes.find((c: any) => c._id === classId);
    if (found) {
      setSelectedClass(found);
      if (found.subjects?.length > 0) {
        setSelectedSubject(found.subjects[0]);
      } else {
        setSelectedSubject('');
      }
    }
  };

  // Build options
  const userPhilosophies = Array.isArray(user?.classroom?.teachingPhilosophy)
    ? user.classroom.teachingPhilosophy
    : typeof user?.classroom?.teachingPhilosophy === 'string'
    ? [user.classroom.teachingPhilosophy]
    : [];
  const PHILOSOPHIES = [
    { label: t('philosophy_constructivism') || 'Constructivism', value: 'Constructivism' },
    { label: t('philosophy_behaviorism') || 'Behaviorism', value: 'Behaviorism' },
    { label: t('philosophy_cognitivism') || 'Cognitivism', value: 'Cognitivism' },
    { label: t('philosophy_inquiry') || 'Inquiry-based', value: 'Inquiry-based' },
  ];
  userPhilosophies.forEach((up: string) => {
    if (up && !PHILOSOPHIES.find((p) => p.value === up)) {
      PHILOSOPHIES.push({ label: up, value: up });
    }
  });

  const userPlanStyles = Array.isArray(user?.classroom?.planStyle)
    ? user.classroom.planStyle
    : typeof user?.classroom?.planStyle === 'string'
    ? [user.classroom.planStyle]
    : [];
  const PLAN_TYPES = [
    { label: t('plan_detailed') || 'Detailed', value: 'Detailed' },
    { label: t('plan_summarized') || 'Summarized', value: 'Summarized' },
    { label: t('plan_outline') || 'Outline', value: 'Outline' },
  ];
  userPlanStyles.forEach((ups: string) => {
    if (ups && !PLAN_TYPES.find((pt) => pt.value === ups)) {
      PLAN_TYPES.push({ label: ups, value: ups });
    }
  });

  const STUDENT_TYPES = [
    { label: t('slow') || 'Slow Learners', value: 'Slow' },
    { label: t('average') || 'Average', value: 'Average' },
    { label: t('fast') || 'Fast Learners', value: 'Fast' },
    { label: t('mixed') || 'Mixed', value: 'Mixed' },
  ];

  // AI generation pathway
  const handleGeneratePlan = async () => {
    if (!selectedClass || !selectedSubject || !topic.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const now = new Date();
    const expiry = user?.settings?.subscriptionExpiresAt
      ? new Date(user.settings.subscriptionExpiresAt)
      : null;
    const hasActiveTrial = expiry && expiry > now;

    if (user?.settings?.subscriptionPlan === 'Free') {
      if (!hasActiveTrial) {
        if (user?.settings?.hasUsedTrial && !expiry) {
          toast.error("You cannot use the same device to have multiple free trials. 😜");
        }
        setShowUpgradeModal(true);
        return;
      }
    }

    handleAIAction({
      route: '/plans/generate',
      type: 'post',
      body: {
        classroomId: selectedClass._id,
        subjectName: selectedSubject,
        weekNumber: parseInt(selectedWeek) || 1,
        topic: topic.trim(),
        studentLevel: studentType,
        philosophy,
        planStyle: planType,
        includeAssessment,
      },
      onSuccess: (data) => {
        router.push(`/dashboard/plans/${data.data._id}`);
      },
      successMessage: t('plan_generation_started') || 'Plan generation started',
    });
  };

  // Custom empty template pathway
  const handleCreateEmptyPlan = async () => {
    if (!selectedClass || !selectedSubject || !topic.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const now = new Date();
    const expiry = user?.settings?.subscriptionExpiresAt
      ? new Date(user.settings.subscriptionExpiresAt)
      : null;
    const hasActiveTrial = expiry && expiry > now;

    if (user?.settings?.subscriptionPlan === 'Free') {
      if (!hasActiveTrial) {
        if (user?.settings?.hasUsedTrial && !expiry) {
          toast.error("You cannot use the same device to have multiple free trials. 😜");
        }
        setShowUpgradeModal(true);
        return;
      }
    }

    handleEmptyAction({
      route: '/plans/generate',
      type: 'post',
      body: {
        classroomId: selectedClass._id,
        subjectName: selectedSubject,
        weekNumber: parseInt(selectedWeek) || 1,
        topic: topic.trim(),
        studentLevel: studentType,
        philosophy,
        planStyle: planType,
        includeAssessment,
        isEmpty: true,
      },
      onSuccess: (data) => {
        router.push(`/dashboard/plans/${data.data._id}?edit=true`);
      },
      successMessage: t('empty_plan_created') || 'Empty plan created. You can now edit it.',
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header link */}
      <Link 
        href="/dashboard/plans" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm mb-6"
      >
        <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
        <span>{t('back_to_plans') || 'Back to Plans'}</span>
      </Link>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white relative">
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-emerald-500/20 blur-xl" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-teal-400/20 blur-xl" />
          
          <div className="relative z-10">
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Sparkles size={24} className="text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              {t('generate_plan_title') || 'Generate Lesson Plan'}
            </h1>
            <p className="text-emerald-50 text-sm mt-2 opacity-90 max-w-xl">
              {t('copilot_instruction') || 'Let the co-pilot structure your next session using standard methodologies.'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-10 space-y-8">
          
          {/* Main selection grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Select Class */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <School size={14} className="text-slate-400" />
                {t('select_class') || 'Select Class'} <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClass?._id || ''}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full text-sm border border-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3.5 px-4 outline-none transition-all cursor-pointer font-bold text-slate-700"
              >
                {classes.map((cls: any) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Subject */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} className="text-slate-400" />
                {t('subject') || 'Subject'} <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full text-sm border border-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3.5 px-4 outline-none transition-all cursor-pointer font-bold text-slate-700"
                disabled={!selectedClass?.subjects?.length}
              >
                {selectedClass?.subjects?.map((sub: string) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Input */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <ListTodo size={14} className="text-slate-400" />
                {t('topic') || 'Topic'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('topic_placeholder') || 'e.g., Quadratic Equations'}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3.5 px-4 outline-none transition-all font-semibold"
              />
            </div>

            {/* Week Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                {t('week') || 'Week'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('week_placeholder') || 'e.g., Week 3'}
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full text-sm border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 rounded-2xl py-3.5 px-4 outline-none transition-all font-semibold"
              />
            </div>

            {/* Assessment Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-violet-50/50 border border-violet-100/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800">{t('include_assessment') || 'Include Assessment'}</span>
                  <p className="text-slate-400 text-[10px]">{t('ca_intro') || 'Generate tasks for evaluations.'}</p>
                </div>
              </div>
              
              {/* Custom Switch toggle */}
              <button
                type="button"
                onClick={() => setIncludeAssessment(!includeAssessment)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  includeAssessment ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    includeAssessment ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

          {/* Advanced Accordion trigger */}
          <div className="border-t border-slate-50 pt-6">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl transition-colors cursor-pointer text-slate-700"
            >
              <div className="flex items-center gap-2.5 font-bold text-sm">
                <Settings size={16} className="text-slate-500" />
                <span>{t('advanced_settings') || 'Advanced Settings'}</span>
              </div>
              {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Advanced Accordion body */}
            {isAdvancedOpen && (
              <div className="mt-4 p-6 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-6">
                
                {/* Teaching Philosophy */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('teaching_philosophy_label') || 'Teaching Philosophy'}</label>
                  <div className="flex flex-wrap gap-2.5">
                    {PHILOSOPHIES.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPhilosophy(p.value)}
                        className={`text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer border ${
                          philosophy === p.value 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200/60'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan Style */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('plan_style_label') || 'Plan Style'}</label>
                  <div className="flex flex-wrap gap-2.5">
                    {PLAN_TYPES.map((pt) => (
                      <button
                        key={pt.value}
                        onClick={() => setPlanType(pt.value)}
                        className={`text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer border ${
                          planType === pt.value 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200/60'
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Student Capability */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('student_capability_label') || 'Student Capability'}</label>
                  <div className="flex flex-wrap gap-2.5">
                    {STUDENT_TYPES.map((st) => (
                      <button
                        key={st.value}
                        onClick={() => setStudentType(st.value)}
                        className={`text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer border ${
                          studentType === st.value 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200/60'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Creation Actions Footer */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-50">
            {/* Generate AI button */}
            <button
              onClick={handleGeneratePlan}
              disabled={isAILoading || isEmptyLoading || !selectedClass || !selectedSubject || !topic.trim()}
              className="flex-1 flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-emerald-200/50 cursor-pointer"
            >
              {isAILoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} className="text-emerald-100 animate-pulse" />
                  <span>{t('generate_plan') || 'Generate Plan'}</span>
                </>
              )}
            </button>

            {/* Create Empty template button */}
            <button
              onClick={handleCreateEmptyPlan}
              disabled={isAILoading || isEmptyLoading || !selectedClass || !selectedSubject || !topic.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-50 text-slate-700 font-bold py-4 rounded-2xl transition-all cursor-pointer"
            >
              {isEmptyLoading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              ) : (
                <>
                  <Pencil size={18} className="text-slate-400" />
                  <span>{t('create_first_class') ? 'Create Empty Template' : 'Create Empty Plan'}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
}
