"use client";

import UpgradeModal from "@/components/UpgradeModal";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/LanguageContext";
import useActionHandler from "@/hooks/useActionHandler";
import { apiClient } from "@/lib/api";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardCheck,
  Edit3,
  Eye,
  FileText,
  Flag,
  Lightbulb,
  Plus,
  Printer,
  RotateCw,
  Save,
  Sparkles,
  Trash,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// Normalize lesson note from old AI structure to new structure (backward compatibility)
const normalizeNote = (n: any) => {
  if (!n) return n;
  return {
    ...n,
    topic: n.topic || "",
    summary: n.summary || "",
    introduction: n.introduction || n.overview || "",
    mainContent: n.mainContent?.length
      ? n.mainContent
      : (n.process || []).map((p: any) => ({
          heading: p.title || "",
          content: p.desc || "",
          examples: [],
          image: p.image || null,
        })),
    keyPoints: n.keyPoints?.length ? n.keyPoints : [],
    conclusion: n.conclusion || "",
    evaluation:
      n.evaluation && typeof n.evaluation === "object"
        ? n.evaluation
        : { method: n.evaluation || "", criteria: [] },
    assignment: n.assignment || "",
  };
};

export default function LessonNotePage({
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
  const [note, setNote] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { handleAction, isLoading } = useActionHandler();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Custom states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // File input refs
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Fetch plan & note details on mount
  const fetchPlanAndNote = async () => {
    handleAction({
      route: `/plans/${planId}`,
      type: "get",
      onSuccess: (data) => {
        setPlan(data.data);
        setNote(normalizeNote(data.data.lessonNote));
      },
      showToast: false,
    });
  };

  useEffect(() => {
    if (planId) {
      fetchPlanAndNote();
    }
  }, [planId]);

  // Handle saving of lesson note updates
  const handleSave = async () => {
    handleAction({
      route: `/plans/${planId}`,
      type: "put",
      body: {
        ...plan,
        lessonNote: note,
      },
      onSuccess: () => {
        setIsEditing(false);
      },
      successMessage:
        t("note_updated_successfully") || "Note updated successfully!",
    });
  };

  // Handle AI Regeneration
  const handleRegenerateNote = async () => {
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
        plan?.noteGenerationCount >= 3
      ) {
        setShowUpgradeModal(true);
        return;
      }
    }

    handleAction({
      route: `/plans/${planId}/regenerate-note`,
      type: "post",
      body: note ? { ...plan, lessonNote: note } : plan,
      onSuccess: (data) => {
        setNote(normalizeNote(data.data.lessonNote));
        setPlan(data.data);
      },
      successMessage:
        t("note_generated_successfully") || "Lesson note generated!",
    });
  };

  // Browser Direct Image Uploader
  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadingIndex(idx);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await apiClient.post("/auth/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data && res.data.url) {
        const newContent = [...(note.mainContent || [])];
        newContent[idx].image = res.data.url;
        setNote({ ...note, mainContent: newContent });
        toast.success("Diagram uploaded successfully!");
      } else {
        toast.error(t("upload_failed") || "Upload failed.");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error(t("network_error_upload") || "Network error during upload.");
    } finally {
      setIsUploading(false);
      setUploadingIndex(null);
    }
  };

  const triggerFileInput = (idx: number) => {
    fileInputRefs.current[idx]?.click();
  };

  const handleRemoveImage = (idx: number) => {
    const newContent = [...(note.mainContent || [])];
    newContent[idx].image = null;
    setNote({ ...note, mainContent: newContent });
  };

  // Inline array modifiers
  const handleUpdateStep = (index: number, field: string, text: string) => {
    const newContent = [...(note.mainContent || [])];
    newContent[index] = { ...newContent[index], [field]: text };
    setNote({ ...note, mainContent: newContent });
  };

  const handleAddStep = () => {
    setNote({
      ...note,
      mainContent: [
        ...(note.mainContent || []),
        {
          heading: t("new_step") || "New Step",
          content: "",
          examples: [],
          image: null,
        },
      ],
    });
  };

  const handleDeleteStep = (index: number) => {
    const newContent = (note.mainContent || []).filter(
      (_: any, i: number) => i !== index,
    );
    setNote({ ...note, mainContent: newContent });
  };

  const handleUpdateExample = (
    stepIdx: number,
    exIdx: number,
    text: string,
  ) => {
    const newContent = [...(note.mainContent || [])];
    const newExamples = [...(newContent[stepIdx].examples || [])];
    newExamples[exIdx] = text;
    newContent[stepIdx] = { ...newContent[stepIdx], examples: newExamples };
    setNote({ ...note, mainContent: newContent });
  };

  const handleAddExample = (stepIdx: number) => {
    const newContent = [...(note.mainContent || [])];
    const newExamples = [...(newContent[stepIdx].examples || []), ""];
    newContent[stepIdx] = { ...newContent[stepIdx], examples: newExamples };
    setNote({ ...note, mainContent: newContent });
  };

  const handleDeleteExample = (stepIdx: number, exIdx: number) => {
    const newContent = [...(note.mainContent || [])];
    const newExamples = (newContent[stepIdx].examples || []).filter(
      (_: any, i: number) => i !== exIdx,
    );
    newContent[stepIdx] = { ...newContent[stepIdx], examples: newExamples };
    setNote({ ...note, mainContent: newContent });
  };

  const handleAddKeyPoint = () => {
    setNote({
      ...note,
      keyPoints: [...(note.keyPoints || []), ""],
    });
  };

  const handleDeleteKeyPoint = (index: number) => {
    const newKP = (note.keyPoints || []).filter(
      (_: any, i: number) => i !== index,
    );
    setNote({ ...note, keyPoints: newKP });
  };

  // Generate HTML for exports
  const generateNoteHTML = (data: any) => {
    const dir = isRTL ? "rtl" : "ltr";
    const norm = normalizeNote(data);
    const evalObj = norm.evaluation || {};

    return `
      <!DOCTYPE html>
      <html dir="${dir}">
        <head>
          <meta charset="utf-8">
          <title>${plan?.topic || "Lesson Note"}</title>
          <style>
            @page { margin: 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #006D4E; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #006D4E; font-size: 28px; }
            .header p { margin: 5px 0; color: #666; font-weight: 600; }
            .section { margin-bottom: 28px; }
            .section-title { font-size: 18px; color: #006D4E; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 14px; font-weight: bold; }
            .summary-box { background-color: #F0FDF4; padding: 15px; border-radius: 8px; border-left: 4px solid #006D4E; margin-bottom: 24px; }
            .content-item { margin-bottom: 20px; border-left: 3px solid #006D4E; padding-left: 15px; }
            .content-heading { font-weight: bold; margin-bottom: 4px; color: #1E293B; }
            .example { margin-left: 16px; color: #475569; font-style: italic; }
            .list-item { margin-bottom: 8px; padding-left: 20px; position: relative; }
            .list-item:before { content: "\\2022"; position: absolute; left: 0; color: #10B981; font-weight: bold; }
            .diagram-img { max-width: 100%; border-radius: 8px; margin: 10px 0; border: 1px solid #E2E8F0; }
            .footer { text-align: center; font-size: 10px; color: #94A3B8; margin-top: 40px; border-t: 1px solid #F1F5F9; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${t("lesson_note") || "Lesson Note"}: ${plan?.topic || ""}</h1>
            <p>${plan?.subjectName || ""} &bull; ${plan?.class || ""}</p>
          </div>

          <div class="summary-box">
            <div class="section-title">${t("summary") || "Summary"}</div>
            <p>${norm.summary}</p>
          </div>

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
            norm.mainContent?.length
              ? `
            <div class="section">
              <div class="section-title">${t("main_content") || "Main Content"}</div>
              ${norm.mainContent
                .filter((item: any) => item.heading || item.content)
                .map(
                  (item: any, idx: number) => `
                <div class="content-item">
                  ${item.heading ? `<div class="content-heading">${idx + 1}. ${item.heading}</div>` : ""}
                  ${item.content ? `<p>${item.content}</p>` : ""}
                  ${item.image ? `<img src="${item.image}" class="diagram-img" alt="Diagram" />` : ""}
                  ${item.examples?.length ? item.examples.map((ex: string) => `<div class="example">&bull; ${ex}</div>`).join("") : ""}
                </div>
              `,
                )
                .join("")}
            </div>`
              : ""
          }

          ${
            norm.keyPoints?.length
              ? `
            <div class="section">
              <div class="section-title">${t("key_points") || "Key Points"}</div>
              ${norm.keyPoints.map((kp: string) => `<div class="list-item">${kp}</div>`).join("")}
            </div>`
              : ""
          }

          ${
            norm.conclusion
              ? `
            <div class="section">
              <div class="section-title">${t("conclusion") || "Conclusion"}</div>
              <p>${norm.conclusion}</p>
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

          <div class="footer">Generated by Lumina AI</div>
        </body>
      </html>
    `;
  };

  // PDF Direct Print helper
  const handleExportPDF = () => {
    const html = generateNoteHTML(note);
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
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
    setIsExportMenuOpen(false);
  };

  // Word DOCX Direct download helper
  const handleExportWord = () => {
    const html = generateNoteHTML(note);
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${plan?.topic?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_") || "LessonNote"}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
    toast.success("Word document downloaded successfully!");
  };

  if (isLoading && !note) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold text-sm animate-pulse">
          {t("loading") || "Loading..."}
        </p>
      </div>
    );
  }

  if (!note || !plan) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <p className="text-rose-500 font-black">
          {t("note_not_found") || "Note not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      {/* Top Navigation Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
        <div>
          {/* Back button */}
          <Link
            href={`/dashboard/plans/${planId}`}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 transition-colors font-bold text-xs mb-3"
          >
            <ArrowLeft size={14} className={isRTL ? "rotate-180" : ""} />
            <span>{t("back_to_plan") || "Back to Plan"}</span>
          </Link>

          {/* Title */}
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FileText size={16} className="text-indigo-600" />
            </div>
            {t("lesson_note_title") || "Lesson Note"}
          </h1>
          <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wide">
            {plan.subjectName} &bull; {plan.topic}
          </p>
        </div>

        {/* Action Panel */}
        <div className="flex flex-wrap items-center gap-1 md:gap-3 relative z-30">
          {/* Edit/Save Toggle */}
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

          {/* AI Regenerate Note */}
          <button
            onClick={handleRegenerateNote}
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

      {/* Main Reading Paper */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6 md:p-10 space-y-10">
        {/* Copilot Summary Box */}
        <div className="p-6 bg-indigo-50/40 border border-indigo-100/30 rounded-3xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles size={18} className="animate-pulse" />
            <h2 className="font-extrabold text-sm uppercase tracking-wider">
              {t("copilot_summary") || "Co-pilot Summary"}
            </h2>
          </div>
          {isEditing ? (
            <textarea
              value={note.summary}
              onChange={(e) => setNote({ ...note, summary: e.target.value })}
              className="w-full text-xs font-semibold leading-relaxed text-slate-700 bg-white border border-slate-100 rounded-2xl p-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 h-28"
            />
          ) : (
            <p className="text-slate-600 text-sm font-semibold leading-relaxed">
              {note.summary}
            </p>
          )}
        </div>

        {/* Introduction */}
        {(note.introduction || isEditing) && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-indigo-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Lightbulb size={18} className="text-indigo-600" />
              {t("introduction") || "Introduction"}
            </h2>
            {isEditing ? (
              <textarea
                value={note.introduction}
                onChange={(e) =>
                  setNote({ ...note, introduction: e.target.value })
                }
                className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 h-28"
                placeholder={
                  t("overview_placeholder") || "Enter introduction..."
                }
              />
            ) : (
              <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                {note.introduction}
              </p>
            )}
          </div>
        )}

        {/* Main Content Steps */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-indigo-900 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" />
              {t("main_content") || "Main Content"}
            </h2>
            {isEditing && (
              <button
                onClick={handleAddStep}
                className="flex items-center gap-1 text-emerald-650 hover:text-emerald-700 font-bold text-xs cursor-pointer"
              >
                <Plus size={14} />
                <span>{t("add_step") || "Add Step"}</span>
              </button>
            )}
          </div>

          <div className="space-y-8">
            {(note.mainContent || []).map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row items-stretch md:items-start gap-4 p-5 bg-slate-50/30 border border-slate-100 rounded-3xl relative"
              >
                {/* Step indicator (desktop only) */}
                <div className="hidden md:flex w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                  {idx + 1}
                </div>

                <div className="flex-1 space-y-4 w-full">
                  {/* Step Heading */}
                  <div className="flex items-center justify-between gap-3">
                    {isEditing ? (
                      <>
                        {/* Desktop only Heading input */}
                        <div className="hidden md:flex flex-1 items-center gap-3">
                          <input
                            type="text"
                            value={item.heading}
                            placeholder={
                              t("step_title_placeholder") || "Heading..."
                            }
                            onChange={(e) =>
                              handleUpdateStep(idx, "heading", e.target.value)
                            }
                            className="flex-1 text-sm font-extrabold text-slate-800 bg-white border border-slate-100 rounded-xl p-2 outline-none focus:border-indigo-500 focus:ring-1"
                          />
                        </div>
                        {/* Mobile only Heading input with Step Number */}
                        <div className="flex md:hidden flex-1 items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                            {idx + 1}
                          </div>
                          <input
                            type="text"
                            value={item.heading}
                            placeholder={
                              t("step_title_placeholder") || "Heading..."
                            }
                            onChange={(e) =>
                              handleUpdateStep(idx, "heading", e.target.value)
                            }
                            className="flex-1 text-sm font-extrabold text-slate-800 bg-white border border-slate-100 rounded-xl p-2 outline-none focus:border-indigo-500 focus:ring-1"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Desktop only heading */}
                        <h3 className="hidden md:block font-extrabold text-slate-900 text-sm leading-snug">
                          {item.heading}
                        </h3>
                        {/* Mobile only heading with Step Number */}
                        <div className="flex md:hidden items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                            {idx + 1}
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                            {item.heading}
                          </h3>
                        </div>
                      </>
                    )}

                    {isEditing && (
                      <button
                        onClick={() => handleDeleteStep(idx)}
                        className="text-rose-500 hover:text-rose-600 p-1 flex-shrink-0 cursor-pointer self-center"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>

                  {/* Step Description */}
                  {isEditing ? (
                    <textarea
                      value={item.content}
                      placeholder={t("step_desc_placeholder") || "Content..."}
                      onChange={(e) =>
                        handleUpdateStep(idx, "content", e.target.value)
                      }
                      className="w-full text-xs text-slate-650 bg-white border border-slate-100 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 h-24 resize-none"
                    />
                  ) : (
                    item.content && (
                      <p className="text-slate-600 text-xs font-semibold leading-relaxed whitespace-pre-wrap">
                        {item.content}
                      </p>
                    )
                  )}

                  {/* Diagrams (Images) */}
                  {(item.image || isEditing) && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Diagram / Illustration
                      </span>

                      {item.image ? (
                        <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-slate-100 group">
                          <img
                            src={item.image}
                            alt="Step Illustration"
                            className="w-full object-cover max-h-48 cursor-zoom-in"
                            onClick={() => setPreviewImage(item.image)}
                          />
                          {isEditing && (
                            <button
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 rounded-full transition-colors cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <div className="absolute bottom-2 left-2 bg-slate-900/60 text-white text-[10px] py-1 px-2.5 rounded-lg flex items-center gap-1 backdrop-blur-sm pointer-events-none">
                            <Eye size={10} />
                            <span>Click to Zoom</span>
                          </div>
                        </div>
                      ) : (
                        isEditing && (
                          <div className="max-w-md">
                            {/* Hide standard input */}
                            <input
                              type="file"
                              accept="image/*"
                              ref={(el) => {
                                fileInputRefs.current[idx] = el;
                              }}
                              onChange={(e) => handleImageChange(e, idx)}
                              className="hidden"
                            />

                            <button
                              onClick={() => triggerFileInput(idx)}
                              disabled={isUploading}
                              className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-200 hover:border-indigo-400 p-4 rounded-2xl transition-all text-xs font-bold text-slate-500 hover:text-indigo-600 bg-white cursor-pointer"
                            >
                              {isUploading && uploadingIndex === idx ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-650 rounded-full animate-spin" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload size={14} />
                                  <span>
                                    {t("add_diagram") || "Add Diagram / Image"}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Examples bulleted items */}
                  {((item.examples || []).length > 0 || isEditing) && (
                    <div className="space-y-2 pt-2 border-t border-slate-50/50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Examples
                      </span>
                      <div className="space-y-2">
                        {(item.examples || []).map(
                          (ex: string, exIdx: number) => (
                            <div
                              key={exIdx}
                              className="flex items-center gap-2"
                            >
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                              {isEditing ? (
                                <div className="flex-1 flex gap-2">
                                  <input
                                    type="text"
                                    value={ex}
                                    onChange={(e) =>
                                      handleUpdateExample(
                                        idx,
                                        exIdx,
                                        e.target.value,
                                      )
                                    }
                                    className="flex-1 text-xs bg-white border border-slate-100 rounded-xl p-2 outline-none focus:border-indigo-500 focus:ring-1"
                                  />
                                  <button
                                    onClick={() =>
                                      handleDeleteExample(idx, exIdx)
                                    }
                                    className="text-rose-500 hover:text-rose-600 p-1 flex-shrink-0 cursor-pointer self-center"
                                  >
                                    <Trash size={14} />
                                  </button>
                                </div>
                              ) : (
                                <p className="text-slate-500 text-xs font-semibold italic">
                                  {ex}
                                </p>
                              )}
                            </div>
                          ),
                        )}
                        {isEditing && (
                          <button
                            onClick={() => handleAddExample(idx)}
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-bold text-[10px] cursor-pointer mt-1"
                          >
                            <Plus size={12} />
                            <span>Add Example</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Points */}
        {((note.keyPoints || []).length > 0 || isEditing) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-indigo-900 flex items-center gap-2">
                <Flag size={18} className="text-indigo-600" />
                {t("key_points") || "Key Points"}
              </h2>
              {isEditing && (
                <button
                  onClick={handleAddKeyPoint}
                  className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{t("add") || "Add"}</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(note.keyPoints || []).map((kp: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100"
                >
                  <Check className="w-4 h-4 text-indigo-650 mt-1 flex-shrink-0" />
                  {isEditing ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={kp}
                        onChange={(e) => {
                          const newKP = [...(note.keyPoints || [])];
                          newKP[idx] = e.target.value;
                          setNote({ ...note, keyPoints: newKP });
                        }}
                        className="flex-1 text-xs bg-white border border-slate-100 rounded-xl p-2 outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleDeleteKeyPoint(idx)}
                        className="text-rose-500 hover:text-rose-600 p-1 flex-shrink-0 cursor-pointer self-center"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                      {kp}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conclusion */}
        {(note.conclusion || isEditing) && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-indigo-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Lightbulb size={18} className="text-indigo-600" />
              {t("conclusion") || "Conclusion"}
            </h2>
            <div className="bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
              {isEditing ? (
                <textarea
                  value={note.conclusion}
                  onChange={(e) =>
                    setNote({ ...note, conclusion: e.target.value })
                  }
                  className="w-full text-sm bg-white border border-slate-100 rounded-2xl p-4 outline-none focus:border-indigo-500 focus:ring-1 h-20 resize-none"
                />
              ) : (
                <p className="text-slate-650 text-sm font-semibold leading-relaxed">
                  {note.conclusion}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Evaluation Method */}
        {(note.evaluation?.method || isEditing) && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-indigo-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-indigo-600" />
              {t("evaluation") || "Evaluation"}
            </h2>
            <div className="bg-slate-50/60 p-5 rounded-3xl border border-slate-100 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">
                  Method Statement
                </label>
                {isEditing ? (
                  <textarea
                    value={note.evaluation?.method || ""}
                    onChange={(e) =>
                      setNote({
                        ...note,
                        evaluation: {
                          ...(note.evaluation || {}),
                          method: e.target.value,
                        },
                      })
                    }
                    className="w-full text-sm bg-white border border-slate-100 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 h-20 resize-none"
                  />
                ) : (
                  <p className="text-slate-650 text-sm font-semibold leading-relaxed">
                    {note.evaluation?.method}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assignment */}
        {(note.assignment || isEditing) && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-indigo-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" />
              {t("assignment") || "Assignment"}
            </h2>
            <div className="bg-slate-50/60 p-5 rounded-3xl border border-slate-100">
              {isEditing ? (
                <textarea
                  value={note.assignment}
                  onChange={(e) =>
                    setNote({ ...note, assignment: e.target.value })
                  }
                  className="w-full text-sm bg-white border border-slate-100 rounded-2xl p-4 outline-none focus:border-indigo-500 focus:ring-1 h-20 resize-none"
                />
              ) : (
                <p className="text-slate-650 text-sm font-semibold leading-relaxed">
                  {note.assignment}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Picture Zoom Modal Preview */}
      {previewImage && (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
          <img
            src={previewImage}
            alt="Expanded Diagram Preview"
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
