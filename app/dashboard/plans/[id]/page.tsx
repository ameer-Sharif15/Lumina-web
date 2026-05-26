"use client";

import UpgradeModal from "@/components/UpgradeModal";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/LanguageContext";
import useActionHandler from "@/hooks/useActionHandler";
import { apiClient } from "@/lib/api";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Edit3,
  FileCheck2,
  FileText,
  Flag,
  GraduationCap,
  Layers,
  Lightbulb,
  Plus,
  Printer,
  RotateCw,
  Save,
  Sparkles,
  Trash,
  Trash2,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

// Normalize a plan from old AI structure to new structure (backward compatibility)
const normalizePlan = (p: any) => {
  if (!p) return p;
  return {
    ...p,
    behavioralObjectives: p.behavioralObjectives?.length
      ? p.behavioralObjectives
      : p.objectives || [],
    presentation: p.presentation?.length
      ? p.presentation
      : (p.steps || []).map((s: any, i: number) => ({
          step: s.number ?? i + 1,
          title: s.title || "",
          teacherActivity: "",
          studentActivity: "",
          content: s.description || "",
        })),
    evaluation:
      p.evaluation && typeof p.evaluation === "object"
        ? p.evaluation
        : { method: p.evaluation || "", criteria: [] },
    assessment: p.assessment
      ? {
          ...p.assessment,
          questions: p.assessment.questions?.length
            ? p.assessment.questions
            : p.assessment.tasks || [],
        }
      : null,
    instructionalMaterials: p.instructionalMaterials || [],
    previousKnowledge: p.previousKnowledge || "",
    classActivity: p.classActivity || "",
    assignment: p.assignment || "",
    introduction: p.introduction || "",
  };
};

export default function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();

  // Unwrap the params promise using React.use()
  const resolvedParams = use(params);
  const planId = resolvedParams.id;

  const [plan, setPlan] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { handleAction, isLoading } = useActionHandler();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // States for loaders
  const [isNoteGenerating, setIsNoteGenerating] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Fetch plan on mount
  const fetchPlan = async () => {
    handleAction({
      route: `/plans/${planId}`,
      type: "get",
      onSuccess: (data) => {
        setPlan(normalizePlan(data.data));
      },
      showToast: false,
    });
  };

  useEffect(() => {
    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  // Handle plan saving
  const handleSave = async () => {
    handleAction({
      route: `/plans/${planId}`,
      type: "put",
      body: plan,
      onSuccess: () => {
        setIsEditing(false);
      },
      successMessage:
        t("plan_updated_successfully") || "Plan updated successfully!",
    });
  };

  // Handle AI Regeneration
  const handleRegenerate = async () => {
    const now = new Date();
    const expiry = user?.settings?.subscriptionExpiresAt
      ? new Date(user.settings.subscriptionExpiresAt)
      : null;
    const hasActiveTrial = expiry && expiry > now;

    if (user?.settings?.subscriptionPlan === "Free") {
      if (!hasActiveTrial) {
        if (user?.settings?.hasUsedTrial && !expiry) {
          toast.error(
            "You cannot use the same device to have multiple free trials. 😜",
          );
        }
        setShowUpgradeModal(true);
        return;
      }
    } else if (!hasActiveTrial) {
      if (
        user?.settings?.subscriptionPlan === "Pro" &&
        plan?.generationCount >= 3
      ) {
        setShowUpgradeModal(true);
        return;
      }
    }

    handleAction({
      route: `/plans/${planId}/regenerate`,
      type: "post",
      body: plan,
      onSuccess: (data) => {
        setPlan(normalizePlan(data.data));
      },
      successMessage:
        t("plan_regenerated_successfully") || "Plan regenerated successfully!",
    });
  };

  // Generate HTML for export (perfect mirror of mobile implementation)
  const generatePlanHTML = (data: any) => {
    const dir = isRTL ? "rtl" : "ltr";
    const norm = normalizePlan(data);
    const evalObj = norm.evaluation || {};
    const questions = norm.assessment?.questions || [];

    return `
      <!DOCTYPE html>
      <html dir="${dir}">
        <head>
          <meta charset="utf-8">
          <title>${norm.topic}</title>
          <style>
            @page { margin: 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #006D4E; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #006D4E; font-size: 28px; }
            .header p { margin: 5px 0; color: #666; font-weight: 600; }
            .section { margin-bottom: 28px; }
            .section-title { font-size: 18px; color: #006D4E; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 14px; font-weight: bold; }
            .list-item { margin-bottom: 8px; padding-left: 20px; position: relative; }
            .list-item:before { content: "\\2022"; position: absolute; left: 0; color: #10B981; font-weight: bold; }
            .step { margin-bottom: 18px; border-left: 3px solid #006D4E; padding-left: 15px; }
            .step-title { font-weight: bold; margin-bottom: 4px; color: #1E293B; }
            .step-sub { font-size: 13px; color: #475569; margin-bottom: 4px; }
            .footer { text-align: center; font-size: 10px; color: #94A3B8; margin-top: 40px; border-t: 1px solid #F1F5F9; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${t("lesson_plan") || "Lesson Plan"}: ${norm.topic}</h1>
            <p>${norm.subjectName} &bull; ${norm.class || ""} &bull; ${norm.duration || "40 mins"}</p>
            <p>${norm.date}</p>
          </div>

          ${
            norm.behavioralObjectives?.length
              ? `
            <div class="section">
              <div class="section-title">${t("behavioral_objectives") || "Behavioral Objectives"}</div>
              ${norm.behavioralObjectives.map((obj: string) => `<div class="list-item">${obj}</div>`).join("")}
            </div>`
              : ""
          }

          ${
            norm.instructionalMaterials?.length
              ? `
            <div class="section">
              <div class="section-title">${t("instructional_materials") || "Instructional Materials"}</div>
              ${norm.instructionalMaterials.map((m: string) => `<div class="list-item">${m}</div>`).join("")}
            </div>`
              : ""
          }

          ${
            norm.previousKnowledge
              ? `
            <div class="section">
              <div class="section-title">${t("previous_knowledge") || "Previous Knowledge"}</div>
              <p>${norm.previousKnowledge}</p>
            </div>`
              : ""
          }

          ${
            norm.introduction
              ? `
            <div class="section">
              <div class="section-title">${t("introduction") || "Introduction"}</div>
              <p>${norm.introduction}</p>
            </div>`
              : ""
          }

          ${
            norm.presentation?.length
              ? `
            <div class="section">
              <div class="section-title">${t("presentation") || "Presentation"}</div>
              ${norm.presentation
                .map(
                  (step: any) => `
                <div class="step">
                  <div class="step-title">${step.step}. ${step.title}</div>
                  ${step.teacherActivity ? `<div class="step-sub"><b>${t("teacher_activity") || "Teacher Activity"}: </b>${step.teacherActivity}</div>` : ""}
                  ${step.studentActivity ? `<div class="step-sub"><b>${t("student_activity") || "Student Activity"}: </b>${step.studentActivity}</div>` : ""}
                  ${step.content ? `<div>${step.content}</div>` : ""}
                </div>
              `,
                )
                .join("")}
            </div>`
              : ""
          }

          ${
            evalObj.method
              ? `
            <div class="section">
              <div class="section-title">${t("evaluation") || "Evaluation"}</div>
              <p>${evalObj.method}</p>
              ${evalObj.criteria?.length ? evalObj.criteria.map((c: string) => `<div class="list-item">${c}</div>`).join("") : ""}
            </div>`
              : ""
          }

          ${
            norm.assignment
              ? `
            <div class="section">
              <div class="section-title">${t("assignment") || "Assignment"}</div>
              <p>${norm.assignment}</p>
            </div>`
              : ""
          }

          ${
            norm.assessment && questions.length
              ? `
            <div class="section" style="background-color: #F8FAFC; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0;">
              <div class="section-title" style="color: #6366F1; border-bottom: 2px solid #EEF2F6;">${t("assessment") || "Assessment"} (${norm.assessment.type})</div>
              ${questions.map((q: string) => `<div class="list-item">${q}</div>`).join("")}
            </div>`
              : ""
          }

          <div class="footer">Generated by Lumina AI</div>
        </body>
      </html>
    `;
  };

  // Hidden Browser Printing Helper
  const handleExportPDF = () => {
    const html = generatePlanHTML(plan);
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        // Remove iframe after print prompt closes
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
    setIsExportMenuOpen(false);
  };

  // Word DOCX download generator
  const handleExportWord = () => {
    const html = generatePlanHTML(plan);
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${plan.topic?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_") || "LessonPlan"}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
    toast.success("Word document downloaded successfully!");
  };

  // Note generation pathway
  const handleGenerateNote = async () => {
    const now = new Date();
    const expiry = user?.settings?.subscriptionExpiresAt
      ? new Date(user.settings.subscriptionExpiresAt)
      : null;
    const hasActiveTrial = expiry && expiry > now;

    if (user?.settings?.subscriptionPlan === "Free") {
      if (!hasActiveTrial) {
        if (user?.settings?.hasUsedTrial && !expiry) {
          toast.error(
            "You cannot use the same device to have multiple free trials. 😜",
          );
        }
        setShowUpgradeModal(true);
        return;
      }
    }

    setIsNoteGenerating(true);
    try {
      const res = await apiClient.post(
        `/plans/${planId}/regenerate-note`,
        plan,
      );
      if (res.data.success) {
        toast.success(
          t("note_generated_successfully") || "Lesson note generated!",
        );
        router.push(`/dashboard/plans/${planId}/note`);
      }
    } catch (err) {
      console.error("Error generating lesson note:", err);
      toast.error("Failed to generate lesson note.");
    } finally {
      setIsNoteGenerating(false);
    }
  };

  // Inline inputs array modifiers
  const handleUpdateStep = (index: number, field: string, text: string) => {
    const newSteps = [...(plan.presentation || [])];
    newSteps[index] = { ...newSteps[index], [field]: text };
    setPlan({ ...plan, presentation: newSteps });
  };

  const handleAddObjective = () => {
    setPlan({
      ...plan,
      behavioralObjectives: [...(plan.behavioralObjectives || []), ""],
    });
  };

  const handleDeleteObjective = (index: number) => {
    const newObjectives = (plan.behavioralObjectives || []).filter(
      (_: any, i: number) => i !== index,
    );
    setPlan({ ...plan, behavioralObjectives: newObjectives });
  };

  const handleAddStep = () => {
    const nextStep = (plan.presentation || []).length + 1;
    setPlan({
      ...plan,
      presentation: [
        ...(plan.presentation || []),
        {
          step: nextStep,
          title: t("new_step") || "New Step",
          content: "",
          teacherActivity: "",
          studentActivity: "",
        },
      ],
    });
  };

  const handleDeleteStep = (index: number) => {
    const newSteps = (plan.presentation || []).filter(
      (_: any, i: number) => i !== index,
    );
    // Re-index steps
    const reindexedSteps = newSteps.map((step: any, i: number) => ({
      ...step,
      step: i + 1,
    }));
    setPlan({ ...plan, presentation: reindexedSteps });
  };

  const handleAddMaterial = () => {
    setPlan({
      ...plan,
      instructionalMaterials: [...(plan.instructionalMaterials || []), ""],
    });
  };

  const handleDeleteMaterial = (index: number) => {
    const newMaterials = (plan.instructionalMaterials || []).filter(
      (_: any, i: number) => i !== index,
    );
    setPlan({ ...plan, instructionalMaterials: newMaterials });
  };

  const handleUpdateAssessmentQuestion = (index: number, text: string) => {
    if (!plan.assessment) return;
    const newQ = [...(plan.assessment.questions || [])];
    newQ[index] = text;
    setPlan({ ...plan, assessment: { ...plan.assessment, questions: newQ } });
  };

  const handleAddAssessmentQuestion = () => {
    if (!plan.assessment) return;
    setPlan({
      ...plan,
      assessment: {
        ...plan.assessment,
        questions: [...(plan.assessment.questions || []), ""],
      },
    });
  };

  const handleDeleteAssessmentQuestion = (index: number) => {
    if (!plan.assessment) return;
    const newQ = (plan.assessment.questions || []).filter(
      (_: any, i: number) => i !== index,
    );
    setPlan({ ...plan, assessment: { ...plan.assessment, questions: newQ } });
  };

  if (isLoading && !plan) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold text-sm animate-pulse">
          {t("loading") || "Loading..."}
        </p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <p className="text-rose-500 font-black">
          {t("plan_not_found") || "Plan not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
        <div>
          {/* Back button */}
          <Link
            href="/dashboard/plans"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 transition-colors font-bold text-xs mb-3"
          >
            <ArrowLeft size={14} className={isRTL ? "rotate-180" : ""} />
            <span>{t("back_to_plans") || "Back to Plans"}</span>
          </Link>

          {/* Topic */}
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block" />
            {plan.topic}
          </h1>

          {/* Meta specs */}
          <p className="text-slate-400 text-xs font-semibold mt-1 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={13} /> {plan.date}
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="flex items-center gap-1">
              <Layers size={13} /> {plan.class}
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
              {plan.subjectName}
            </span>
          </p>
        </div>

        {/* Action Panel */}
        <div className="flex flex-wrap items-center gap-1 md:gap-3 relative z-30">
          {/* Edit/Save toggle */}
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-full transition-all shadow-md cursor-pointer ${
              isEditing
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
            }`}
          >
            {isEditing ? <Save size={15} /> : <Edit3 size={15} />}
            <span>{isEditing ? t("save") : t("edit")}</span>
          </button>

          {/* AI Regenerate */}
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold px-4 py-2.5 rounded-full transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RotateCw size={15} className={isLoading ? "animate-spin" : ""} />
            <span>{t("regenerate")}</span>
          </button>

          {/* Export Menu button */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-full transition-all shadow-md cursor-pointer"
            >
              <span>{t("export") || "Export"}</span>
              <ChevronDown size={14} />
            </button>

            {/* Dropdown Options */}
            {isExportMenuOpen && (
              <div
                className={`absolute mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 space-y-1 ${
                  isRTL ? "left-0" : "right-0"
                }`}
              >
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2.5 px-3 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <Printer size={15} className="text-emerald-600" />
                  <span>{t("export_pdf") || "Export as PDF"}</span>
                </button>
                <button
                  onClick={handleExportWord}
                  className="w-full flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2.5 px-3 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <FileText size={15} className="text-blue-600" />
                  <span>{t("export_docx") || "Export as DOCX"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Note Floating Prompt Card */}
      <div className="mb-8">
        {plan.lessonNote?.summary ? (
          <div className="p-6 bg-indigo-50/50 border border-indigo-100/50 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm">
                  {t("lesson_note_title") || "Lesson Note Available"}
                </span>
                <p className="text-slate-400 text-xs mt-0.5">
                  A complete summary note and outline has been generated for
                  this plan.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/plans/${planId}/note`}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-md shadow-indigo-100 cursor-pointer"
            >
              <span>{t("view_lesson_note") || "View Lesson Note"}</span>
              <ChevronRight size={14} className={isRTL ? "rotate-180" : ""} />
            </Link>
          </div>
        ) : (
          <div className="p-6 bg-emerald-50/40 border border-emerald-100/40 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm">
                  {t("generate_lesson_note") || "Generate Lesson Note"}
                </span>
                <p className="text-slate-400 text-xs mt-0.5">
                  Let AI build a detailed reading summary note for this
                  classroom plan.
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateNote}
              disabled={isNoteGenerating}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-md shadow-emerald-100 cursor-pointer disabled:opacity-50"
            >
              {isNoteGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>
                    {t("generate_lesson_note") || "Generate Lesson Note"}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6 md:p-10 space-y-10">
        {/* Behavioral Objectives */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2">
              <Flag size={18} />
              {t("behavioral_objectives") || "Behavioral Objectives"}
            </h2>
            {isEditing && (
              <button
                onClick={handleAddObjective}
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>{t("add") || "Add"}</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {(plan.behavioralObjectives || []).map(
              (obj: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/40"
                >
                  <Check className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  {isEditing ? (
                    <div className="flex-1 flex gap-2">
                      <textarea
                        value={obj}
                        onChange={(e) => {
                          const newObj = [...(plan.behavioralObjectives || [])];
                          newObj[idx] = e.target.value;
                          setPlan({ ...plan, behavioralObjectives: newObj });
                        }}
                        className="flex-1 text-sm bg-white border border-slate-100 rounded-xl p-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 resize-none h-14"
                      />
                      <button
                        onClick={() => handleDeleteObjective(idx)}
                        className="text-rose-500 hover:text-rose-600 p-1 flex-shrink-0 cursor-pointer self-center"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                      {obj}
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Instructional Materials */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2">
              <Wrench size={18} />
              {t("instructional_materials") || "Instructional Materials"}
            </h2>
            {isEditing && (
              <button
                onClick={handleAddMaterial}
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>{t("add") || "Add"}</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {(plan.instructionalMaterials || []).map(
              (mat: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/40"
                >
                  <Check className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  {isEditing ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={mat}
                        onChange={(e) => {
                          const newMat = [
                            ...(plan.instructionalMaterials || []),
                          ];
                          newMat[idx] = e.target.value;
                          setPlan({ ...plan, instructionalMaterials: newMat });
                        }}
                        className="flex-1 text-sm bg-white border border-slate-100 rounded-xl p-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
                      />
                      <button
                        onClick={() => handleDeleteMaterial(idx)}
                        className="text-rose-500 hover:text-rose-600 p-1 flex-shrink-0 cursor-pointer self-center"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                      {mat}
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Previous Knowledge */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap size={18} />
            {t("previous_knowledge") || "Previous Knowledge"}
          </h2>
          <div className="bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
            {isEditing ? (
              <textarea
                value={plan.previousKnowledge}
                onChange={(e) =>
                  setPlan({ ...plan, previousKnowledge: e.target.value })
                }
                className="w-full text-sm bg-white border border-slate-100 rounded-2xl p-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 h-28"
              />
            ) : (
              <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                {plan.previousKnowledge}
              </p>
            )}
          </div>
        </div>

        {/* Introduction */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lightbulb size={18} />
            {t("introduction") || "Introduction"}
          </h2>
          <div className="bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
            {isEditing ? (
              <textarea
                value={plan.introduction}
                onChange={(e) =>
                  setPlan({ ...plan, introduction: e.target.value })
                }
                className="w-full text-sm bg-white border border-slate-100 rounded-2xl p-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 h-28"
              />
            ) : (
              <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                {plan.introduction}
              </p>
            )}
          </div>
        </div>

        {/* Presentation Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2">
              <Layers size={18} />
              {t("presentation") || "Presentation Steps"}
            </h2>
            {isEditing && (
              <button
                onClick={handleAddStep}
                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>{t("add_step") || "Add Step"}</span>
              </button>
            )}
          </div>

          <div className="space-y-6">
            {(plan.presentation || []).map((step: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/60 flex items-start gap-4 relative group"
              >
                {/* Step indicator */}
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                  {step.step ?? idx + 1}
                </div>

                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      {/* Step Header Title */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={step.title}
                          placeholder="Step title..."
                          onChange={(e) =>
                            handleUpdateStep(idx, "title", e.target.value)
                          }
                          className="flex-1 text-sm bg-white border border-slate-100 rounded-xl p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 font-bold"
                        />
                        <button
                          onClick={() => handleDeleteStep(idx)}
                          className="text-rose-500 hover:text-rose-600 p-1 flex-shrink-0 cursor-pointer self-center"
                        >
                          <Trash size={16} />
                        </button>
                      </div>

                      {/* Step Content */}
                      <textarea
                        value={step.content}
                        placeholder="Content/Description..."
                        onChange={(e) =>
                          handleUpdateStep(idx, "content", e.target.value)
                        }
                        className="w-full text-sm bg-white border border-slate-100 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 h-20 resize-none"
                      />

                      {/* Sub actions details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <textarea
                          value={step.teacherActivity}
                          placeholder={
                            t("teacher_activity") || "Teacher Activity..."
                          }
                          onChange={(e) =>
                            handleUpdateStep(
                              idx,
                              "teacherActivity",
                              e.target.value,
                            )
                          }
                          className="w-full text-xs bg-white border border-slate-100 rounded-xl p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 h-16 resize-none"
                        />
                        <textarea
                          value={step.studentActivity}
                          placeholder={
                            t("student_activity") || "Student Activity..."
                          }
                          onChange={(e) =>
                            handleUpdateStep(
                              idx,
                              "studentActivity",
                              e.target.value,
                            )
                          }
                          className="w-full text-xs bg-white border border-slate-100 rounded-xl p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 h-16 resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Step title */}
                      <h4 className="font-extrabold text-slate-800 text-sm leading-snug">
                        {step.title}
                      </h4>

                      {/* Main text content */}
                      {step.content && (
                        <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                          {step.content}
                        </p>
                      )}

                      {/* Sub-activities grids */}
                      {(step.teacherActivity || step.studentActivity) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          {step.teacherActivity && (
                            <div className="bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100/30 text-xs">
                              <span className="font-bold text-emerald-800 uppercase block mb-1">
                                {t("teacher_activity") || "Teacher Activity"}
                              </span>
                              <p className="text-slate-600 leading-normal">
                                {step.teacherActivity}
                              </p>
                            </div>
                          )}
                          {step.studentActivity && (
                            <div className="bg-sky-50/40 p-3 rounded-2xl border border-sky-100/30 text-xs">
                              <span className="font-bold text-sky-800 uppercase block mb-1">
                                {t("student_activity") || "Student Activity"}
                              </span>
                              <p className="text-slate-600 leading-normal">
                                {step.studentActivity}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Method & Criteria */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <ClipboardCheck size={18} />
            {t("evaluation") || "Evaluation"}
          </h2>
          <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4">
            {/* Method statement */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">
                Evaluation Method
              </label>
              {isEditing ? (
                <textarea
                  value={plan.evaluation?.method || ""}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      evaluation: {
                        ...(plan.evaluation || {}),
                        method: e.target.value,
                      },
                    })
                  }
                  className="w-full text-sm bg-white border border-slate-100 rounded-xl p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 h-20 resize-none"
                />
              ) : (
                <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                  {plan.evaluation?.method || "No method statement provided."}
                </p>
              )}
            </div>

            {/* Criteria */}
            {((plan.evaluation?.criteria || []).length > 0 || isEditing) && (
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">
                  Success Criteria
                </label>
                <div className="space-y-2">
                  {(plan.evaluation?.criteria || []).map(
                    (c: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full flex-shrink-0" />
                        {isEditing ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={c}
                              onChange={(e) => {
                                const newCriteria = [
                                  ...(plan.evaluation?.criteria || []),
                                ];
                                newCriteria[idx] = e.target.value;
                                setPlan({
                                  ...plan,
                                  evaluation: {
                                    ...(plan.evaluation || {}),
                                    criteria: newCriteria,
                                  },
                                });
                              }}
                              className="flex-1 text-xs bg-white border border-slate-100 rounded-xl p-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
                            />
                            <button
                              onClick={() => {
                                const newCriteria = (
                                  plan.evaluation?.criteria || []
                                ).filter((_: any, i: number) => i !== idx);
                                setPlan({
                                  ...plan,
                                  evaluation: {
                                    ...(plan.evaluation || {}),
                                    criteria: newCriteria,
                                  },
                                });
                              }}
                              className="text-rose-500 hover:text-rose-600 p-1 flex-shrink-0 cursor-pointer"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        ) : (
                          <p className="text-slate-600 text-xs font-semibold">
                            {c}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                  {isEditing && (
                    <button
                      onClick={() => {
                        setPlan({
                          ...plan,
                          evaluation: {
                            ...(plan.evaluation || {}),
                            criteria: [
                              ...(plan.evaluation?.criteria || []),
                              "",
                            ],
                          },
                        });
                      }}
                      className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-[10px] cursor-pointer mt-1"
                    >
                      <Plus size={12} />
                      <span>Add Criteria</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assignment */}
        {(plan.assignment || isEditing) && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-emerald-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <BookOpen size={18} />
              {t("assignment") || "Assignment"}
            </h2>
            <div className="bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
              {isEditing ? (
                <textarea
                  value={plan.assignment}
                  onChange={(e) =>
                    setPlan({ ...plan, assignment: e.target.value })
                  }
                  className="w-full text-sm bg-white border border-slate-100 rounded-2xl p-4 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 h-20 resize-none"
                />
              ) : (
                <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                  {plan.assignment}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Assessment Questions (Conditional Section) */}
        {plan.assessment && (
          <div className="bg-violet-50/30 border border-violet-100/50 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-violet-100/60">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-violet-600 animate-pulse" />
                {isEditing ? (
                  <input
                    type="text"
                    value={plan.assessment.type}
                    placeholder="Assessment Type..."
                    onChange={(e) =>
                      setPlan({
                        ...plan,
                        assessment: {
                          ...plan.assessment!,
                          type: e.target.value,
                        },
                      })
                    }
                    className="text-sm font-extrabold text-violet-700 bg-white border border-slate-100 rounded-xl px-3 py-1.5 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 w-48"
                  />
                ) : (
                  <h3 className="font-extrabold text-violet-800 text-base">
                    {t("assessment") || "Assessment"} ({plan.assessment.type})
                  </h3>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={handleAddAssessmentQuestion}
                  className="flex items-center gap-1 text-violet-600 hover:text-violet-700 font-bold text-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{t("add_task") || "Add Question"}</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(plan.assessment.questions || []).map(
                (q: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-violet-100/30"
                  >
                    <div className="w-2 h-2 bg-violet-500 rounded-full mt-1.5 flex-shrink-0" />
                    {isEditing ? (
                      <div className="flex-1 flex gap-2">
                        <textarea
                          value={q}
                          onChange={(e) =>
                            handleUpdateAssessmentQuestion(idx, e.target.value)
                          }
                          className="flex-1 text-xs bg-slate-50 border border-slate-100 rounded-xl p-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 h-14 resize-none"
                        />
                        <button
                          onClick={() => handleDeleteAssessmentQuestion(idx)}
                          className="text-rose-500 hover:text-rose-600 p-1 flex-shrink-0 cursor-pointer self-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-slate-700 text-xs font-semibold leading-relaxed">
                        {q}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
