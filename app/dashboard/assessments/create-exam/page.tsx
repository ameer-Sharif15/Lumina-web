'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Check,
  Search,
  BookMarked
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/context/DashboardDataContext';
import useActionHandler from '@/hooks/useActionHandler';
import toast from 'react-hot-toast';
import UpgradeModal from '@/components/UpgradeModal';
import { apiClient } from '@/lib/api';

export default function CreateExamPage() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const { classes } = useDashboardData();
  const { handleAction: handleAIAction, isLoading: isAILoading } = useActionHandler();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const TERM_TYPES = [
    { key: "term_1st", label: t("term_1st") || "1st Term" },
    { key: "term_2nd", label: t("term_2nd") || "2nd Term" },
    { key: "term_3rd", label: t("term_3rd") || "3rd Term" },
  ];

  // Selection States
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState(TERM_TYPES[0]);

  // Assessment Parameters
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [fetchingTopics, setFetchingTopics] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [format, setFormat] = useState("theory"); // mixed, mcq, theory
  const [difficulty, setDifficulty] = useState("medium"); // simple, medium, hard
  const [questionCount, setQuestionCount] = useState(40);
  const [topicSearch, setTopicSearch] = useState("");

  // Initialize selected values from classes
  useEffect(() => {
    if (classes && classes.length > 0) {
      setSelectedClass(classes[0]);
      if (classes[0].subjects && classes[0].subjects.length > 0) {
        setSelectedSubject(classes[0].subjects[0]);
      }
    }
  }, [classes]);

  // Fetch topics when class, subject, or term changes
  useEffect(() => {
    if (selectedClass?._id && selectedSubject && selectedTerm) {
      const fetchTopics = async () => {
        setFetchingTopics(true);
        try {
          const res = await apiClient.get("/assessments/topics", {
            params: {
              classroomId: selectedClass._id,
              subjectName: selectedSubject,
              term: selectedTerm.label,
            }
          });
          if (res.data && res.data.success !== false) {
            const topics = res.data.data || res.data || [];
            setAvailableModules(topics);
            // Select first 3 topics by default
            setSelectedModules(topics.slice(0, 3));
          } else {
            setAvailableModules([]);
            setSelectedModules([]);
          }
        } catch (err) {
          console.error("Error fetching topics:", err);
          setAvailableModules([]);
          setSelectedModules([]);
        } finally {
          setFetchingTopics(false);
        }
      };
      fetchTopics();
    }
  }, [selectedClass, selectedSubject, selectedTerm]);

  const handleClassChange = (classId: string) => {
    const found = classes.find((c: any) => c._id === classId);
    if (found) {
      setSelectedClass(found);
      if (found.subjects && found.subjects.length > 0) {
        setSelectedSubject(found.subjects[0]);
      } else {
        setSelectedSubject("");
      }
    }
  };

  const toggleModule = (module: string) => {
    setSelectedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    );
  };

  const handleSelectAllModules = () => {
    setSelectedModules(availableModules);
  };

  const handleClearAllModules = () => {
    setSelectedModules([]);
  };

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || selectedModules.length === 0) {
      toast.error(t('select_topics') || 'Please select syllabus topics to cover');
      return;
    }

    const now = new Date();
    const expiry = user?.settings?.subscriptionExpiresAt
      ? new Date(user.settings.subscriptionExpiresAt)
      : null;
    const hasActiveTrial = expiry && expiry > now;

    if (user?.settings?.subscriptionPlan === "Free") {
      if (!hasActiveTrial) {
        if (user?.settings?.hasUsedTrial && !expiry) {
          toast.error("You cannot use the same device to have multiple free trials. 😜");
        }
        setShowUpgradeModal(true);
        return;
      }
    }

    handleAIAction({
      route: "/assessments/generate",
      type: "post",
      body: {
        classroomId: selectedClass._id,
        subjectName: selectedSubject,
        title: `${selectedSubject} Exam - ${selectedClass.name}`,
        type: "Exam",
        term: selectedTerm.label,
        format,
        intensity: difficulty,
        questionCount,
        topics: selectedModules,
      },
      onSuccess: (data) => {
        router.push(`/dashboard/assessments/${data.data?._id || data.data?.[0]?._id || data._id}`);
      },
      successMessage: t('assessment_preview') || 'Exam generated successfully!',
    });
  };

  // Filter topics in list
  const filteredModules = availableModules.filter((module) =>
    module.toLowerCase().includes(topicSearch.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Back button & Title */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/assessments" 
          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={18} className={isRTL ? "transform rotate-180" : ""} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
            {t("exam_prep") || "Create Exam Prep"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t("exam_intro") || "Prepare fully comprehensive, custom AI exam papers based on term syllabus content coverage."}
          </p>
        </div>
      </div>

      {/* Main Parameters Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Term Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-600" />
              {t("exam_term") || "Exam Term"}
            </label>
            <select
              value={selectedTerm.key}
              onChange={(e) => {
                const found = TERM_TYPES.find(t => t.key === e.target.value);
                if (found) setSelectedTerm(found);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            >
              {TERM_TYPES.map((term) => (
                <option key={term.key} value={term.key}>{term.label}</option>
              ))}
            </select>
          </div>

          {/* Class Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <School size={14} className="text-emerald-600" />
              {t("target_class") || "Target Class"}
            </label>
            <select
              value={selectedClass?._id || ""}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            >
              {classes?.map((c: any) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <BookOpen size={14} className="text-emerald-600" />
              {t("subject_authority") || "Subject Authority"}
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all"
            >
              {selectedClass?.subjects?.map((subj: string) => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Topics Syllabus Checklist */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <ListTodo size={14} className="text-emerald-600" />
                {t("syllabus_coverage") || "Syllabus Coverage (Topics)"}
              </label>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                {fetchingTopics ? "Fetching topics from classroom database..." : `${selectedModules.length} selected`}
              </p>
            </div>
            
            {/* Quick selections */}
            {!fetchingTopics && availableModules.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-extrabold">
                <button 
                  onClick={handleSelectAllModules}
                  className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-200">|</span>
                <button 
                  onClick={handleClearAllModules}
                  className="text-rose-500 hover:text-rose-600 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {fetchingTopics ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
              <span className="text-xs text-slate-400 font-bold mt-3">Loading syllabus topics...</span>
            </div>
          ) : availableModules.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl py-8 px-4 text-center">
              <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-bounce" />
              <h4 className="text-sm font-extrabold text-slate-700">{t("no_syllabus_data") || "No syllabus coverage data found"}</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Make sure you have created lesson plans for this classroom and term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Search topics input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("search_topics") || "Search syllabus topics..."}
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 pl-10 text-xs outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                />
                <Search className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Topics chips container */}
              <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-1.5">
                {filteredModules.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No matching topics found.</p>
                ) : (
                  filteredModules.map((module) => {
                    const isSelected = selectedModules.includes(module);
                    return (
                      <button
                        key={module}
                        onClick={() => toggleModule(module)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-200/50 text-emerald-800' 
                            : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="truncate pr-4">{module}</span>
                        {isSelected && <Check size={14} className="text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Exam Format */}
        <div className="border-t border-slate-100 pt-6 space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
            {t("exam_format") || "Exam Format"}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "mixed", label: t("standard_mix") || "Standard Mix", desc: "MCQ + Theory" },
              { id: "mcq", label: t("mcq_only") || "MCQ Only", desc: "Single option choices" },
              { id: "theory", label: t("advanced_theory") || "Advanced Theory", desc: "Subjective questions" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFormat(item.id)}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  format === item.id 
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-black shadow-sm' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-sm font-extrabold">{item.label}</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="border-t border-slate-100 pt-6 space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
            {t("difficulty_level") || "Difficulty Level"}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "simple", label: t("difficulty_simple") || "Simple", color: "text-green-600" },
              { id: "medium", label: t("difficulty_medium") || "Medium", color: "text-amber-600" },
              { id: "hard", label: t("difficulty_hard") || "Hard", color: "text-rose-600" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setDifficulty(item.id)}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  difficulty === item.id 
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-black shadow-sm' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className={`text-sm font-extrabold ${item.color}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Question Intensity Count */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
              {t("question_intensity") || "Question Intensity"}
            </label>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Adjust Exam paper question counts</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <button
              onClick={() => setQuestionCount(Math.max(20, questionCount - 10))}
              className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-100 text-slate-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="w-12 text-center text-base font-extrabold text-slate-900">{questionCount}</span>
            <button
              onClick={() => setQuestionCount(Math.min(100, questionCount + 10))}
              className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 border border-slate-100 text-slate-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Action button */}
        <div className="border-t border-slate-100 pt-6">
          <button
            onClick={handleGenerate}
            disabled={isAILoading || selectedModules.length === 0}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              (isAILoading || selectedModules.length === 0) ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isAILoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <Sparkles size={16} className="text-emerald-100 animate-bounce" />
                <span>{t("prepare_exam_paper") || "Prepare Exam Paper"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
