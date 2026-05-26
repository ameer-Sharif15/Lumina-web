'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  Printer, 
  Save, 
  Edit3, 
  RotateCw, 
  Trash, 
  Plus, 
  Check, 
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  Trash2,
  Image as ImageIcon,
  Camera,
  X,
  Clock,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import useActionHandler from '@/hooks/useActionHandler';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import UpgradeModal from '@/components/UpgradeModal';

export default function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;

  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { handleAction, isLoading } = useActionHandler();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  // Custom export details
  const [exportDuration, setExportDuration] = useState("40");
  const [exportInstructions, setExportInstructions] = useState(
    "1. Answer all questions.\n2. Do not use calculators unless specified.\n3. Show all working clearly."
  );

  // Upload state targeting
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [uploadingTarget, setUploadingTarget] = useState<{ sIdx: number; qIdx: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch assessment details on mount
  const fetchAssessment = async () => {
    handleAction({
      route: `/assessments/${assessmentId}`,
      type: 'get',
      onSuccess: (data) => {
        setAssessmentData(data.data || data);
      },
      showToast: false,
    });
  };

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  // Handle Assessment Save
  const handleSave = async () => {
    handleAction({
      route: `/assessments/${assessmentId}`,
      type: 'put',
      body: {
        title: assessmentData.title,
        sections: assessmentData.sections,
      },
      onSuccess: () => {
        setIsEditing(false);
      },
      successMessage: t('assessment_updated_successfully') || 'Assessment saved successfully!',
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
          toast.error("You cannot use the same device to have multiple free trials. 😜");
        }
        setShowUpgradeModal(true);
        return;
      }
    } else if (!hasActiveTrial) {
      if (
        user?.settings?.subscriptionPlan === "Pro" &&
        assessmentData.generationCount >= 3
      ) {
        setShowUpgradeModal(true);
        return;
      }
    }

    setIsRegenerating(true);
    try {
      const res = await apiClient.post(`/assessments/${assessmentId}/regenerate`, assessmentData);
      if (res.data) {
        setAssessmentData(res.data.data || res.data);
        toast.success(t('assessment_regenerated_successfully') || 'Assessment regenerated successfully!');
      }
    } catch (err) {
      console.error('Regeneration error:', err);
      toast.error('Failed to regenerate assessment.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Compile premium HTML print format
  const generateAssessmentHTML = () => {
    if (!assessmentData) return "";
    const dir = isRTL ? 'rtl' : 'ltr';

    let sectionsHtml = assessmentData.sections
      .map(
        (section: any) => `
      <div class="section" style="margin-bottom: 30px; break-inside: avoid;">
        <h2 style="font-size: 18px; color: #006D4E; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; margin-top: 24px; font-weight: bold;">${section.title}</h2>
        ${section.description ? `<p style="font-style: italic; color: #64748B; margin-bottom: 16px; font-size: 13px;">${section.description}</p>` : ""}
        ${section.questions
          .filter(
            (q: any) =>
              (q.text && q.text.trim() !== "") ||
              (q.image && q.image !== "DIAGRAM_PLACEHOLDER" && q.image.trim() !== "")
          )
          .map(
            (q: any, idx: number) => `
          <div style="margin-bottom: 20px; break-inside: avoid;">
            ${q.text && q.text.trim() !== "" ? `<p style="font-weight: bold; margin-bottom: 8px; font-size: 14px; color: #1E293B;">${idx + 1}. ${q.text}</p>` : ""}
            ${q.image && q.image !== "DIAGRAM_PLACEHOLDER" && q.image.trim() !== "" ? `<img src="${q.image}" style="max-width: 100%; max-height: 220px; display: block; margin: 12px 0; border-radius: 8px; border: 1px solid #E2E8F0;" />` : ""}
            ${
              q.options && q.options.length > 0
                ? `
              <div style="margin-left: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">
                ${q.options
                  .map(
                    (opt: any) => `
                  <div style="font-size: 13px; color: #334155;"><strong>${opt.label}.</strong> ${opt.text}</div>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }
            ${
              q.subQuestions && q.subQuestions.length > 0
                ? `
              <div style="margin-left: 20px; margin-top: 8px;">
                ${q.subQuestions.map((sub: any) => `<p style="font-size: 13px; color: #334155; margin-bottom: 6px;">- ${sub}</p>`).join("")}
              </div>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
    `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html dir="${dir}">
        <head>
          <meta charset="utf-8">
          <title>${assessmentData.title}</title>
          <style>
            @page { margin: 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1E293B; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #006D4E; padding-bottom: 20px; position: relative; }
            .header h1 { margin: 0; color: #006D4E; font-size: 26px; font-weight: 800; }
            .header p { margin: 6px 0; color: #475569; font-weight: 600; font-size: 14px; }
            .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #94A3B8; }
            .instructions-box { margin-bottom: 24px; padding: 16px; background-color: #F8FAFC; border-left: 4px solid #006D4E; border-radius: 8px; border-top: 1px solid #F1F5F9; border-right: 1px solid #F1F5F9; border-bottom: 1px solid #F1F5F9; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${assessmentData.title}</h1>
            <p>${assessmentData.subjectName || ""} &bull; ${assessmentData.className || assessmentData.classroom?.name || ""} &bull; ${exportDuration} mins</p>
            <p>${assessmentData.createdAt ? new Date(assessmentData.createdAt).toLocaleDateString() : ""}</p>
          </div>
          ${
            exportInstructions
              ? `
            <div class="instructions-box">
              <h3 style="margin-top: 0; color: #006D4E; font-size: 14px; font-weight: bold; margin-bottom: 8px;">Instructions</h3>
              <p style="margin-bottom: 0; white-space: pre-wrap; font-size: 12px; color: #475569; font-family: inherit;">${exportInstructions}</p>
            </div>
          `
              : ""
          }
          ${sectionsHtml}
          <div class="footer">Generated by Lumina AI</div>
        </body>
      </html>
    `;
  };

  // Hidden Iframe Printer
  const handleExportPDF = () => {
    const html = generateAssessmentHTML();
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
    setIsExportModalOpen(false);
  };

  // Word Document Downloader
  const handleExportWord = () => {
    const html = generateAssessmentHTML();
    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${assessmentData.title?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'Assessment'}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
    toast.success('Word document downloaded successfully!');
  };

  // File picker upload handlers
  const triggerImageUpload = (sIdx: number, qIdx: number) => {
    setUploadingTarget({ sIdx, qIdx });
    const targetKey = `${sIdx}-${qIdx}`;
    fileInputRefs.current[targetKey]?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, sIdx: number, qIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiClient.post('/auth/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.url) {
        const newData = { ...assessmentData };
        newData.sections[sIdx].questions[qIdx].image = response.data.url;
        setAssessmentData(newData);
        toast.success(t('upload_success') || 'Image uploaded successfully!');
      } else {
        toast.error('Upload failed. Try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Network error uploading diagram.');
    } finally {
      setIsUploading(false);
      setUploadingTarget(null);
    }
  };

  // Inline array modifiers
  const addSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      title: t("new_section") || "New Section",
      description: t("section_instr_placeholder") || "Enter section guidelines...",
      questions: [],
    };
    setAssessmentData({
      ...assessmentData,
      sections: [...assessmentData.sections, newSection],
    });
  };

  const addQuestion = (sIdx: number) => {
    const newData = { ...assessmentData };
    const titleLower = (newData.sections[sIdx].title || "").toLowerCase();
    const isTheory = titleLower.includes("theory") || titleLower.includes("نظري");

    const newQuestion = {
      id: Date.now(),
      text: t("enter_question_placeholder") || "Enter question text...",
      options: isTheory
        ? undefined
        : [
            { label: "A", text: "" },
            { label: "B", text: "" },
            { label: "C", text: "" },
            { label: "D", text: "" },
          ],
      subQuestions: isTheory ? [t("sub_q_placeholder") || "Sub-question details"] : undefined,
      hasWorkspace: isTheory,
    };

    newData.sections[sIdx].questions.push(newQuestion);
    setAssessmentData(newData);
  };

  const deleteSection = (sIdx: number) => {
    const newData = { ...assessmentData };
    newData.sections.splice(sIdx, 1);
    setAssessmentData(newData);
  };

  const deleteQuestion = (sIdx: number, qIdx: number) => {
    const newData = { ...assessmentData };
    newData.sections[sIdx].questions.splice(qIdx, 1);
    setAssessmentData(newData);
  };

  const addSubQuestion = (sIdx: number, qIdx: number) => {
    const newData = { ...assessmentData };
    const q = newData.sections[sIdx].questions[qIdx];
    if (!q.subQuestions) q.subQuestions = [];
    q.subQuestions.push("");
    setAssessmentData(newData);
  };

  const deleteSubQuestion = (sIdx: number, qIdx: number, subIdx: number) => {
    const newData = { ...assessmentData };
    newData.sections[sIdx].questions[qIdx].subQuestions.splice(subIdx, 1);
    setAssessmentData(newData);
  };

  if (!assessmentData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
        <span className="text-sm text-slate-400 font-bold">Loading assessment details...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Back button & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/assessments" 
            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft size={18} className={isRTL ? "transform rotate-180" : ""} />
          </Link>
          <div>
            <span className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase">
              {isEditing ? t("editing_mode") || "Editing Mode" : t("assessment_preview") || "Assessment Preview"}
            </span>
            {isEditing ? (
              <input
                type="text"
                value={assessmentData.title || ""}
                onChange={(e) => setAssessmentData({ ...assessmentData, title: e.target.value })}
                className="block text-xl md:text-2xl font-black text-slate-900 bg-indigo-50/50 border-b border-indigo-400 outline-none px-2 py-0.5 rounded mt-0.5 w-full md:w-96"
              />
            ) : (
              <h1 className="text-xl md:text-2xl font-black text-slate-900">
                {assessmentData.title}
              </h1>
            )}
          </div>
        </div>

        {/* Action Toggle buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Save size={15} />
              <span>{t("save") || "Save Paper"}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Edit3 size={15} />
              <span>{t("edit") || "Edit Inline"}</span>
            </button>
          )}

          {!isEditing && (
            <>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-emerald-800 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                <RotateCw size={15} className={isRegenerating ? "animate-spin" : ""} />
                <span>{isRegenerating ? t("regenerating") || "Regenerating..." : t("regenerate") || "Regenerate AI"}</span>
              </button>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer size={15} />
                <span>{t("export_paper") || "Print/Export"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Structured Widescreen Printed Paper Sheet */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-12 shadow-sm min-h-[700px] relative overflow-hidden">
        {/* Paper Top Header Banner */}
        <div className="text-center border-b-2 border-emerald-600 pb-6 mb-8">
          <h2 className="text-2xl font-black text-emerald-800 tracking-wide">{assessmentData.title}</h2>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-500 mt-2">
            <span>{assessmentData.subjectName || assessmentData.subject}</span>
            <span>&bull;</span>
            <span>{assessmentData.className || assessmentData.classroom?.name}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-slate-400" />
              {exportDuration} {t("mins") || "mins"}
            </span>
          </div>
          {assessmentData.createdAt && (
            <p className="text-[10px] text-slate-400 font-bold mt-1.5">
              {new Date(assessmentData.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Paper Custom Instructions box */}
        {!isEditing && exportInstructions && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8">
            <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider mb-1.5">Instructions</h3>
            <p className="text-xs text-slate-600 font-bold whitespace-pre-wrap leading-relaxed">{exportInstructions}</p>
          </div>
        )}

        {/* Assessment Sections List */}
        <div className="space-y-10">
          {assessmentData.sections?.map((section: any, sIdx: number) => (
            <div key={section.id || sIdx} className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={section.title || ""}
                      onChange={(e) => {
                        const newData = { ...assessmentData };
                        newData.sections[sIdx].title = e.target.value;
                        setAssessmentData(newData);
                      }}
                      className="text-base font-black text-emerald-800 bg-indigo-50/50 border-b border-indigo-400 outline-none px-2 py-0.5 rounded w-full max-w-md"
                    />
                  ) : (
                    <h3 className="text-base font-black text-emerald-800">{section.title}</h3>
                  )}
                  {isEditing ? (
                    <textarea
                      value={section.description || ""}
                      onChange={(e) => {
                        const newData = { ...assessmentData };
                        newData.sections[sIdx].description = e.target.value;
                        setAssessmentData(newData);
                      }}
                      className="block text-xs text-slate-400 italic bg-indigo-50/50 border-b border-indigo-400 outline-none px-2 py-1 rounded mt-1.5 w-full"
                    />
                  ) : (
                    section.description && (
                      <p className="text-xs text-slate-400 italic font-medium mt-1">{section.description}</p>
                    )
                  )}
                </div>

                {isEditing && (
                  <button
                    onClick={() => deleteSection(sIdx)}
                    className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Section Questions */}
              <div className="space-y-6 pl-2">
                {section.questions?.map((q: any, qIdx: number) => {
                  const targetKey = `${sIdx}-${qIdx}`;
                  return (
                    <div key={q.id || qIdx} className="flex gap-3">
                      <span className="text-sm font-black text-slate-800 shrink-0 mt-0.5">{qIdx + 1}.</span>
                      <div className="flex-1 space-y-4">
                        {/* Question content editing */}
                        <div className="flex items-start justify-between gap-4">
                          {isEditing ? (
                            <textarea
                              value={q.text || ""}
                              onChange={(e) => {
                                const newData = { ...assessmentData };
                                newData.sections[sIdx].questions[qIdx].text = e.target.value;
                                setAssessmentData(newData);
                              }}
                              className="text-sm font-bold text-slate-700 bg-indigo-50/50 border-b border-indigo-400 outline-none px-2 py-1.5 rounded w-full"
                            />
                          ) : (
                            <p className="text-sm font-extrabold text-slate-700 leading-relaxed">{q.text}</p>
                          )}

                          {isEditing && (
                            <button
                              onClick={() => deleteQuestion(sIdx, qIdx)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>

                        {/* Image Diagram Display / Upload */}
                        {(q.image || isEditing) && (
                          <div className="relative group max-w-sm rounded-2xl overflow-hidden border border-slate-100/80 bg-slate-50/50">
                            {/* Hidden file input */}
                            <input
                              type="file"
                              accept="image/*"
                              ref={(el) => { fileInputRefs.current[targetKey] = el; }}
                              onChange={(e) => handleFileUpload(e, sIdx, qIdx)}
                              className="hidden"
                            />

                            {isUploading && uploadingTarget?.sIdx === sIdx && uploadingTarget?.qIdx === qIdx ? (
                              <div className="h-40 flex flex-col items-center justify-center space-y-2">
                                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] text-slate-400 font-bold">Uploading diagram...</span>
                              </div>
                            ) : q.image && q.image !== "DIAGRAM_PLACEHOLDER" ? (
                              <div className="relative">
                                <img
                                  src={q.image}
                                  alt="Diagram content"
                                  onClick={() => !isEditing && setFullScreenImage(q.image)}
                                  className={`w-full max-h-52 object-cover ${!isEditing ? "cursor-zoom-in" : ""}`}
                                />
                                {isEditing && (
                                  <button
                                    onClick={() => triggerImageUpload(sIdx, qIdx)}
                                    className="absolute bottom-2 right-2 bg-black/75 hover:bg-black text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                                  >
                                    <Camera size={12} />
                                    <span>{t("change") || "Change"}</span>
                                  </button>
                                )}
                              </div>
                            ) : isEditing ? (
                              <button
                                onClick={() => triggerImageUpload(sIdx, qIdx)}
                                className="w-full h-24 border border-dashed border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                              >
                                <ImageIcon size={20} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-500">{t("add_diagram") || "Add Diagram"}</span>
                              </button>
                            ) : null}
                          </div>
                        )}

                        {/* MCQ Options Choices */}
                        {q.options && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-3">
                            {q.options.map((opt: any, oIdx: number) => (
                              <div key={oIdx} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <span className="text-slate-800">{opt.label}.</span>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={opt.text || ""}
                                    onChange={(e) => {
                                      const newData = { ...assessmentData };
                                      newData.sections[sIdx].questions[qIdx].options[oIdx].text = e.target.value;
                                      setAssessmentData(newData);
                                    }}
                                    className="text-xs font-bold text-slate-600 bg-indigo-50/50 border-b border-indigo-400 outline-none px-2 py-0.5 rounded w-full"
                                  />
                                ) : (
                                  <span>{opt.text}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Subjective Sub-questions */}
                        {q.subQuestions && (
                          <div className="space-y-2 pl-3">
                            {q.subQuestions.map((sub: string, subIdx: number) => (
                              <div key={subIdx} className="flex items-start gap-2 text-xs font-semibold text-slate-600">
                                <span className="text-slate-400 mt-0.5">-</span>
                                <div className="flex-1 flex items-center justify-between gap-3">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={sub || ""}
                                      onChange={(e) => {
                                        const newData = { ...assessmentData };
                                        newData.sections[sIdx].questions[qIdx].subQuestions[subIdx] = e.target.value;
                                        setAssessmentData(newData);
                                      }}
                                      className="text-xs font-semibold text-slate-600 bg-indigo-50/50 border-b border-indigo-400 outline-none px-2 py-0.5 rounded w-full"
                                    />
                                  ) : (
                                    <span>{sub}</span>
                                  )}

                                  {isEditing && (
                                    <button
                                      onClick={() => deleteSubQuestion(sIdx, qIdx, subIdx)}
                                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                    >
                                      <X size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            {isEditing && (
                              <button
                                onClick={() => addSubQuestion(sIdx, qIdx)}
                                className="text-[10px] text-emerald-700 font-extrabold hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={12} />
                                <span>{t("add_sub_question") || "Add Sub-question"}</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Workspaces for theory exams */}
                        {q.hasWorkspace && !isEditing && (
                          <div className="h-20 border border-dashed border-slate-200 bg-slate-50/40 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {t("student_workspace") || "Workspace / Working Area"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add question helper */}
                {isEditing && (
                  <button
                    onClick={() => addQuestion(sIdx)}
                    className="w-full py-3 border border-dashed border-emerald-200 bg-emerald-50/15 hover:bg-emerald-50/40 rounded-2xl text-xs font-black text-emerald-800 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus size={15} />
                    <span>{t("add_question") || "Add Question Entry"}</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add new section helper */}
          {isEditing && (
            <button
              onClick={addSection}
              className="w-full py-4 border border-dashed border-indigo-200 bg-indigo-50/10 hover:bg-indigo-50/30 rounded-3xl text-sm font-black text-indigo-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Plus size={18} />
              <span>{t("add_new_section") || "Add New Section"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Image Preview Zoom Overlay Modal */}
      {fullScreenImage && (
        <div 
          onClick={() => setFullScreenImage(null)}
          className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-50 p-4 cursor-zoom-out"
        >
          <button 
            onClick={() => setFullScreenImage(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white cursor-pointer"
          >
            <X size={20} />
          </button>
          <img 
            src={fullScreenImage} 
            alt="Fullscreen zoom view" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-fade-in"
          />
        </div>
      )}

      {/* Export / Print Parameters Popover Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-40 p-4 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Printer size={18} className="text-emerald-600" />
                <span>Export Parameters</span>
              </h3>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Duration parameter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Exam Duration (minutes)</label>
                <input
                  type="number"
                  value={exportDuration}
                  onChange={(e) => setExportDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                />
              </div>

              {/* Instructions parameter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Custom Instructions</label>
                <textarea
                  value={exportInstructions}
                  rows={4}
                  onChange={(e) => setExportInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                />
              </div>
            </div>

            {/* Action selections */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleExportWord}
                className="bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 text-indigo-700 font-extrabold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileSpreadsheet size={15} />
                <span>Export Word</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer size={15} />
                <span>Print PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
