"use client";

import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import {
  Briefcase,
  Building2,
  Camera,
  Check,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Gift,
  Globe,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Phone,
  Settings,
  Share2,
  Sparkles,
  Star,
  ToggleLeft,
  ToggleRight,
  User as UserIcon,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type TabType =
  | "personal"
  | "professional"
  | "classroom"
  | "subscription"
  | "referrals"
  | "security"
  | "language";

const REWARD_TIERS = [
  { count: 3, label: "7 Days Pro", id: "tier_3" },
  { count: 5, label: "14 Days Pro", id: "tier_5" },
  { count: 10, label: "1 Month Pro", id: "tier_10" },
  { count: 25, label: "1 Month Ultimate", id: "tier_25" },
];

const PLAN_AMOUNTS: Record<string, number> = {
  Pro: 3000,
  Ultimate: 5000,
};

export default function ProfilePage() {
  const { t, language, setLanguage, isRTL } = useTranslation();
  const { user, token, setUser, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  // Tab 1: Personal Details State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.personal?.phone || "");
  const [bio, setBio] = useState(user?.personal?.bio || "");
  const [profileImageUrl, setProfileImageUrl] = useState(
    user?.personal?.profilePhoto || user?.personal?.photoUrl || "",
  );
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Tab 2: Professional Profile State
  const [institution, setInstitution] = useState(
    user?.professional?.institution || "",
  );
  const [position, setPosition] = useState(user?.professional?.position || "");
  const [yearsExperience, setYearsExperience] = useState(
    user?.professional?.yearsExperience || "1 - 3 years",
  );
  const [isSavingProfessional, setIsSavingProfessional] = useState(false);

  // Tab 3: Classroom Settings State
  const [studentLevel, setStudentLevel] = useState(
    user?.classroom?.studentLevel || "Average",
  );
  const [planStyle, setPlanStyle] = useState(
    Array.isArray(user?.classroom?.planStyle)
      ? user?.classroom?.planStyle[0] || "Standard Weekly"
      : user?.classroom?.planStyle || "Standard Weekly",
  );
  const [academicSession, setAcademicSession] = useState(
    user?.settings?.academicSession || "2024/2025",
  );
  const [customSession, setCustomSession] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.settings?.notificationsEnabled ?? true,
  );
  const [subjects, setSubjects] = useState<string[]>(
    user?.classroom?.subjects || [],
  );
  const [newSubject, setNewSubject] = useState("");
  const [teachingPhilosophy, setTeachingPhilosophy] = useState<string[]>(
    //@ts-ignore
    user?.classroom?.teachingPhilosophy || [],
  );
  const [newPhilosophy, setNewPhilosophy] = useState("");
  const [sessionsList, setSessionsList] = useState<string[]>([]);
  const [isSavingClassroom, setIsSavingClassroom] = useState(false);

  // Tab 4: Subscription State
  const [selectedPlan, setSelectedPlan] = useState<"Free" | "Pro" | "Ultimate">(
    (user?.settings?.subscriptionPlan as any) || "Free",
  );
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

  // Tab 5: Referrals State
  const [referralsStats, setReferralsStats] = useState<any>(null);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  // Tab 6: Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Tab 7: Language State
  const [selectedLang, setSelectedLang] = useState<any>(language);
  const [isApplyingLanguage, setIsApplyingLanguage] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhone(user.personal?.phone || "");
      setBio(user.personal?.bio || "");
      setProfileImageUrl(
        user.personal?.profilePhoto || user.personal?.photoUrl || "",
      );

      setInstitution(user.professional?.institution || "");
      setPosition(user.professional?.position || "");
      setYearsExperience(user.professional?.yearsExperience || "1 - 3 years");

      setStudentLevel(user.classroom?.studentLevel || "Average");
      setPlanStyle(
        Array.isArray(user.classroom?.planStyle)
          ? user.classroom?.planStyle[0] || "Standard Weekly"
          : user.classroom?.planStyle || "Standard Weekly",
      );
      setAcademicSession(user.settings?.academicSession || "2024/2025");
      setNotificationsEnabled(user.settings?.notificationsEnabled ?? true);
      setSubjects(user.classroom?.subjects || []);
      //@ts-ignore
      setTeachingPhilosophy(user.classroom?.teachingPhilosophy || []);
      setSelectedPlan((user.settings?.subscriptionPlan as any) || "Free");
    }
  }, [user]);

  // Fetch classroom sessions when classroom tab is loaded
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await apiClient.get("/classes/sessions");
        if (res.data.success) {
          setSessionsList(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching academic sessions:", err);
      }
    }
    if (activeTab === "classroom") {
      fetchSessions();
    }
  }, [activeTab]);

  // Fetch referrals stats & list
  useEffect(() => {
    async function fetchReferrals() {
      setLoadingReferrals(true);
      try {
        const statsRes = await apiClient.get("/referrals/stats");
        if (statsRes.data.success) {
          setReferralsStats(statsRes.data.data);
        }
        const listRes = await apiClient.get("/referrals/list");
        if (listRes.data.success) {
          setReferralsList(listRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching referrals details:", err);
      } finally {
        setLoadingReferrals(false);
      }
    }
    if (activeTab === "referrals") {
      fetchReferrals();
    }
  }, [activeTab]);

  // Helper: Get Experience Options
  const EXPERIENCE_OPTIONS = [
    {
      label:
        t("exp_less_than_1") === "exp_less_than_1"
          ? "Less than 1 year"
          : t("exp_less_than_1"),
      value: "Less than 1 year",
    },
    {
      label: t("exp_1_3") === "exp_1_3" ? "1 - 3 years" : t("exp_1_3"),
      value: "1 - 3 years",
    },
    {
      label: t("exp_4_7") === "exp_4_7" ? "4 - 7 years" : t("exp_4_7"),
      value: "4 - 7 years",
    },
    {
      label: t("exp_8_12") === "exp_8_12" ? "8 - 12 years" : t("exp_8_12"),
      value: "8 - 12 years",
    },
    {
      label:
        t("exp_13_plus") === "exp_13_plus" ? "13+ years" : t("exp_13_plus"),
      value: "13+ years",
    },
  ];

  // Helper: Get Student Levels
  const STUDENT_LEVELS = [
    { key: "Slow", label: t("slow") === "slow" ? "Slow" : t("slow") },
    {
      key: "Average",
      label: t("average") === "average" ? "Average" : t("average"),
    },
    { key: "Fast", label: t("fast") === "fast" ? "Fast" : t("fast") },
    { key: "Mixed", label: t("mixed") === "mixed" ? "Mixed" : t("mixed") },
  ];

  // Helper: Get Lesson Templates
  const LESSON_TEMPLATES = [
    {
      key: "Standard Weekly",
      label:
        t("standard_weekly") === "standard_weekly"
          ? "Standard Weekly"
          : t("standard_weekly"),
    },
    {
      key: "Detailed Daily",
      label:
        t("detailed_daily") === "detailed_daily"
          ? "Detailed Daily"
          : t("detailed_daily"),
    },
    {
      key: "5E Model",
      label: t("5e_model") === "5e_model" ? "5E Model" : t("5e_model"),
    },
  ];

  // 1. Save Personal Details
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPersonal(true);
    try {
      const res = await apiClient.put("/auth/profile", {
        fullName,
        personal: {
          bio,
          phone,
          profilePhoto: profileImageUrl,
        },
      });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success(
          t("save_success") === "save_success"
            ? "Personal information saved successfully!"
            : t("save_success"),
        );
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update personal information.",
      );
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // Profile Picture Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `${apiClient.defaults.baseURL}/auth/upload-photo`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      if (res.ok && data.url) {
        setProfileImageUrl(data.url);
        toast.success("Profile picture uploaded successfully!");
        // Update user profile immediately
        const updateRes = await apiClient.put("/auth/profile", {
          personal: {
            bio,
            phone,
            profilePhoto: data.url,
          },
        });
        if (updateRes.data.success) {
          setUser(updateRes.data.user);
        }
      } else {
        toast.error(data.message || "Image upload failed.");
      }
    } catch (err) {
      toast.error("Network error during picture upload.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // 2. Save Professional Details
  const handleSaveProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfessional(true);
    try {
      const res = await apiClient.put("/auth/profile", {
        professional: {
          institution,
          position,
          yearsExperience,
        },
      });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success("Professional profile saved successfully!");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update professional details.",
      );
    } finally {
      setIsSavingProfessional(false);
    }
  };

  // 3. Save Classroom Settings
  const handleSaveClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingClassroom(true);
    try {
      const activeSessionValue = customSession.trim() || academicSession;

      const res = await apiClient.put("/auth/profile", {
        classroom: {
          ...user?.classroom,
          studentLevel,
          planStyle: [planStyle],
          subjects,
          teachingPhilosophy,
        },
        settings: {
          ...user?.settings,
          notificationsEnabled,
          academicSession: activeSessionValue,
        },
      });
      if (res.data.success) {
        setUser(res.data.user);
        setCustomSession("");
        toast.success("Classroom settings updated successfully!");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to save classroom settings.",
      );
    } finally {
      setIsSavingClassroom(false);
    }
  };

  // Classroom Tag Helpers
  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const removeSubject = (subj: string) => {
    setSubjects(subjects.filter((s) => s !== subj));
  };

  const addPhilosophy = () => {
    if (
      newPhilosophy.trim() &&
      !teachingPhilosophy.includes(newPhilosophy.trim())
    ) {
      setTeachingPhilosophy([...teachingPhilosophy, newPhilosophy.trim()]);
      setNewPhilosophy("");
    }
  };

  const removePhilosophy = (phil: string) => {
    setTeachingPhilosophy(teachingPhilosophy.filter((p) => p !== phil));
  };

  // 4. Paid Subscription Pop Checkout & Free Plan Switch
  const loadPaystackPop = (): Promise<any> => {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) {
        resolve((window as any).PaystackPop);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v2/inline.js";
      script.async = true;
      script.onload = () => {
        resolve((window as any).PaystackPop);
      };
      document.body.appendChild(script);
    });
  };

  const handleSwitchToFree = async () => {
    setIsSubmittingPlan(true);
    try {
      const res = await apiClient.put("/auth/profile", {
        settings: { subscriptionPlan: "Free" },
      });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success("Successfully reverted to Lumina Free.");
      }
    } catch (err) {
      toast.error("Something went wrong. Failed to switch plan.");
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  const handlePaidCheckout = async (plan: "Pro" | "Ultimate") => {
    setIsSubmittingPlan(true);
    try {
      const res = await apiClient.post("/payments/initialize", { plan });
      if (res.data.success) {
        const { reference, publicKey } = res.data.data;
        const PaystackPop = await loadPaystackPop();

        const paystack = new PaystackPop();
        paystack.newTransaction({
          key: publicKey || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
          email: user?.email || "",
          amount: PLAN_AMOUNTS[plan] * 100, // in kobo
          reference: reference,
          currency: "NGN",
          onSuccess: async (response: any) => {
            setIsSubmittingPlan(true);
            try {
              const verifyRes = await apiClient.get(
                `/payments/verify/${response.reference}`,
              );
              if (verifyRes.data.success) {
                setUser(verifyRes.data.user);
                toast.success(
                  `Subscription Activated! You are now on ${plan} 🎉`,
                );
              }
            } catch (verifyErr) {
              toast.error(
                "Payment verification failed. Please contact support.",
              );
            } finally {
              setIsSubmittingPlan(false);
            }
          },
          onCancel: () => {
            toast.error("Payment cancelled.");
            setIsSubmittingPlan(false);
          },
        });
      } else {
        toast.error("Failed to initialize payment.");
        setIsSubmittingPlan(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Checkout failed.");
      setIsSubmittingPlan(false);
    }
  };

  const handleSubscribe = () => {
    if (selectedPlan === user?.settings?.subscriptionPlan) return;
    if (selectedPlan === "Free") {
      handleSwitchToFree();
    } else {
      handlePaidCheckout(selectedPlan);
    }
  };

  // 5. Change Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await apiClient.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password updated successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getPasswordStrength = () => {
    if (newPassword.length === 0) return null;
    if (newPassword.length < 6)
      return {
        label: "Weak",
        color: "bg-red-500 text-red-500",
        width: "w-1/3",
      };
    if (newPassword.length < 10)
      return {
        label: "Fair",
        color: "bg-amber-500 text-amber-500",
        width: "w-2/3",
      };
    return {
      label: "Strong",
      color: "bg-emerald-600 text-emerald-600",
      width: "w-full",
    };
  };

  const strength = getPasswordStrength();

  // 6. Language Settings Apply
  const handleApplyLanguage = async () => {
    setIsApplyingLanguage(true);
    try {
      const res = await apiClient.put("/auth/profile", {
        settings: {
          language: selectedLang,
        },
      });
      if (res.data.success) {
        setUser(res.data.user);
        setLanguage(selectedLang);
        toast.success(
          selectedLang === "ar"
            ? "تم تطبيق اللغة العربية بنجاح!"
            : "English language applied successfully!",
        );
      }
    } catch (err) {
      toast.error("Failed to update language settings.");
    } finally {
      setIsApplyingLanguage(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success(
      t("logout_successful") === "logout_successful"
        ? "Logged out successfully!"
        : t("logout_successful"),
    );
    router.push("/auth/login");
  };

  // Referral Copy Utility
  const copyReferralCode = () => {
    if (referralsStats?.code) {
      navigator.clipboard.writeText(referralsStats.code);
      toast.success("Referral code copied!");
    }
  };

  const shareReferral = () => {
    if (referralsStats) {
      const shareText = `Join me on Lumina AI and generate lesson plans in seconds! Use my referral code: ${referralsStats.code}\n\nDownload here: ${referralsStats.referralLink}`;
      navigator.clipboard.writeText(shareText);
      toast.success(
        "Referral message copied to clipboard! Share it with your friends.",
      );
    }
  };

  // Referral Milestone Metrics
  const successCount = referralsStats?.stats?.successfulReferrals || 0;
  const nextTier =
    REWARD_TIERS.find((t) => successCount < t.count) ||
    REWARD_TIERS[REWARD_TIERS.length - 1];
  const progressPercent = Math.min((successCount / nextTier.count) * 100, 100);

  return (
    <div
      className={`p-4 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-800`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-8 h-8 text-emerald-600 animate-spin-slow" />
            {t("profile") === "profile" ? "Settings & Profile" : t("profile")}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your personal settings, classrooms, subscriptions, and
            referral rewards.
          </p>
        </div>
      </div>

      {/* Main settings grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column navigation panel */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          {/* User Profile Header */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
            <div className="relative group mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
                accept="image/*"
              />
              <div className="w-24 h-24 rounded-full border-4 border-emerald-50 bg-slate-50 overflow-hidden flex items-center justify-center relative shadow-inner">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-slate-400" />
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full border-2 border-white hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
              {fullName || "Lumina User"}
            </h3>
            <p className="text-slate-400 text-xs mt-1 mb-3">{email}</p>

            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                user?.settings?.subscriptionPlan === "Ultimate"
                  ? "bg-purple-50 text-purple-700 border border-purple-100"
                  : user?.settings?.subscriptionPlan === "Pro"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-slate-50 text-slate-500 border border-slate-200"
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              LUMINA {user?.settings?.subscriptionPlan?.toUpperCase() || "FREE"}
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("personal")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "personal"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 shrink-0" />
                <span>
                  {t("personal_info") === "personal_info"
                    ? "Personal Details"
                    : t("personal_info")}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "personal" ? "translate-x-1" : ""}`}
              />
            </button>

            <button
              onClick={() => setActiveTab("professional")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "professional"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 shrink-0" />
                <span>
                  {t("professional_info") === "professional_info"
                    ? "Professional Profile"
                    : t("professional_info")}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "professional" ? "translate-x-1" : ""}`}
              />
            </button>

            <button
              onClick={() => setActiveTab("classroom")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "classroom"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 shrink-0" />
                <span>
                  {t("classroom_settings") === "classroom_settings"
                    ? "Classroom & Session"
                    : t("classroom_settings")}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "classroom" ? "translate-x-1" : ""}`}
              />
            </button>

            <button
              onClick={() => setActiveTab("subscription")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "subscription"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 shrink-0" />
                <span>
                  {t("subscription_plan") === "subscription_plan"
                    ? "Subscription Plan"
                    : t("subscription_plan")}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "subscription" ? "translate-x-1" : ""}`}
              />
            </button>

            <button
              onClick={() => setActiveTab("referrals")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "referrals"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 shrink-0" />
                <span>
                  {t("referrals_rewards") === "referrals_rewards"
                    ? "Referrals & Rewards"
                    : t("referrals_rewards")}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "referrals" ? "translate-x-1" : ""}`}
              />
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 shrink-0" />
                <span>
                  {t("change_password") === "change_password"
                    ? "Change Password"
                    : t("change_password")}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "security" ? "translate-x-1" : ""}`}
              />
            </button>

            <button
              onClick={() => setActiveTab("language")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "language"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 shrink-0" />
                <span>
                  {t("language") === "language"
                    ? "Language Preferences"
                    : t("language")}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${activeTab === "language" ? "translate-x-1" : ""}`}
              />
            </button>

            {/* Mobile-only Logout Button */}
            <div className="my-2 border-t border-slate-100 md:hidden" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer md:hidden"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 shrink-0 text-red-500" />
                <span>
                  {t("sign_out") === "sign_out" ? "Sign Out" : t("sign_out")}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 text-red-400" />
            </button>
          </nav>
        </div>

        {/* Right column active card workspace */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {t("personal_info") === "personal_info"
                    ? "Personal Details"
                    : t("personal_info")}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Keep your personal contact details and bio updated.
                </p>
              </div>

              <form onSubmit={handleSavePersonal} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {t("full_name")}
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {t("phone_label") || "Phone Number"}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold"
                        placeholder="+234 80 1234 5678"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t("email")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-400 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 italic font-medium">
                    To modify your primary account email, please contact IT
                    administration support.
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Biography / Professional Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold resize-none"
                    placeholder="Tell us about yourself, your specialties, teaching goals..."
                  />
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingPersonal}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 cursor-pointer shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSavingPersonal ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PROFESSIONAL PROFILE */}
          {activeTab === "professional" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {t("professional_info") === "professional_info"
                    ? "Professional Profile"
                    : t("professional_info")}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Specify your current workspace details and experience level.
                </p>
              </div>

              <form onSubmit={handleSaveProfessional} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {t("school_name") || "School / Institution"}
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Lagos International High School"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {t("job_title_label") || "Position / Job Title"}
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Mathematics Specialist Teacher"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t("years_experience") || "Years of Experience"}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setYearsExperience(opt.value)}
                        className={`px-4 py-2 rounded-full border text-xs font-extrabold cursor-pointer transition-all ${
                          yearsExperience === opt.value
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-50"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfessional}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 cursor-pointer shadow-md disabled:opacity-75"
                  >
                    {isSavingProfessional ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CLASSROOM & SESSION SETTINGS */}
          {activeTab === "classroom" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {t("classroom_settings") === "classroom_settings"
                    ? "Classroom & Session"
                    : t("classroom_settings")}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Configure default structures and session data for new plan
                  generation.
                </p>
              </div>

              <form onSubmit={handleSaveClassroom} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {t("default_student_level")}
                    </label>
                    <select
                      value={studentLevel}
                      onChange={(e) => setStudentLevel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white text-sm font-semibold"
                    >
                      {STUDENT_LEVELS.map((lvl) => (
                        <option key={lvl.key} value={lvl.key}>
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400">
                      {t("adjust_complexity")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {t("lesson_plan_template")}
                    </label>
                    <select
                      value={planStyle}
                      onChange={(e) => setPlanStyle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white text-sm font-semibold"
                    >
                      {LESSON_TEMPLATES.map((tmpl) => (
                        <option key={tmpl.key} value={tmpl.key}>
                          {tmpl.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400">
                      {t("preferred_structure")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {t("active_session")}
                    </label>
                    <select
                      value={academicSession}
                      onChange={(e) => setAcademicSession(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white text-sm font-semibold"
                    >
                      {sessionsList.map((session) => (
                        <option key={session} value={session}>
                          {session}
                        </option>
                      ))}
                      {!sessionsList.includes(academicSession) && (
                        <option value={academicSession}>
                          {academicSession}
                        </option>
                      )}
                    </select>
                    <p className="text-[10px] text-slate-400">
                      {t("default_session_desc")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {t("add_custom_session") || "Or Custom Session"}
                    </label>
                    <input
                      type="text"
                      value={customSession}
                      onChange={(e) => setCustomSession(e.target.value)}
                      placeholder={
                        t("custom_session_placeholder") || "e.g. 2026/2027"
                      }
                      className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white text-sm font-semibold"
                    />
                    <p className="text-[10px] text-slate-400">
                      Leave blank to use the active session choice.
                    </p>
                  </div>
                </div>

                {/* Subjects Tag List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t("subjects")}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {subjects.map((subj) => (
                      <span
                        key={subj}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-100"
                      >
                        {subj}
                        <button
                          type="button"
                          onClick={() => removeSubject(subj)}
                          className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {subjects.length === 0 && (
                      <span className="text-slate-400 text-xs italic font-semibold">
                        No default subjects added.
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubject();
                        }
                      }}
                      placeholder="Add a new subject..."
                      className="flex-1 px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={addSubject}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Teaching Philosophy Tag List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t("teaching_philosophy")}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {teachingPhilosophy.map((phil) => (
                      <span
                        key={phil}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-800 text-xs font-bold rounded-full border border-purple-100"
                      >
                        {phil}
                        <button
                          type="button"
                          onClick={() => removePhilosophy(phil)}
                          className="text-purple-600 hover:text-purple-800 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {teachingPhilosophy.length === 0 && (
                      <span className="text-slate-400 text-xs italic font-semibold">
                        No default philosophies specified.
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPhilosophy}
                      onChange={(e) => setNewPhilosophy(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPhilosophy();
                        }
                      }}
                      placeholder="Add philosophy (e.g., Inquiry-Based, Montessori)..."
                      className="flex-1 px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={addPhilosophy}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Smart Notifications Switches */}
                <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {t("smart_notifications")}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {t("ai_assisted_alerts")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationsEnabled(!notificationsEnabled)
                    }
                    className="text-slate-600 hover:text-emerald-600 cursor-pointer"
                  >
                    {notificationsEnabled ? (
                      <ToggleRight className="w-12 h-12 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-12 h-12 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingClassroom}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 cursor-pointer shadow-md disabled:opacity-75"
                  >
                    {isSavingClassroom ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SUBSCRIPTION PLAN */}
          {activeTab === "subscription" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {t("subscription_plan") === "subscription_plan"
                    ? "Subscription Plan"
                    : t("subscription_plan")}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Upgrade or modify your pricing package to unlock pro features.
                </p>
              </div>

              {/* Package cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <div
                  onClick={() => setSelectedPlan("Free")}
                  className={`bg-white rounded-2xl border p-5 flex flex-col justify-between cursor-pointer transition-all relative ${
                    selectedPlan === "Free"
                      ? "border-emerald-600 shadow-md ring-2 ring-emerald-500/10"
                      : "border-slate-100 shadow-sm hover:border-slate-200"
                  }`}
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      {t("lumina_free") || "Lumina Free"}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">
                        ₦0
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold">
                        {t("forever")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Active for testing out structures. Limited AI functions.
                    </p>
                    <div className="h-[1px] bg-slate-100 my-2" />
                    <ul className="space-y-2 text-[11px] font-semibold text-slate-500">
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-slate-400" /> Unlimited
                        classes
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-slate-400" /> 5 days
                        full AI access
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-slate-400" /> Standard
                        templates
                      </li>
                    </ul>
                  </div>

                  {user?.settings?.subscriptionPlan === "Free" && (
                    <span className="mt-4 text-center block text-[10px] font-bold bg-slate-50 border border-slate-100 rounded-lg py-1.5 text-slate-500 uppercase">
                      Current Plan
                    </span>
                  )}
                </div>

                {/* Pro Plan */}
                <div
                  onClick={() => setSelectedPlan("Pro")}
                  className={`bg-white rounded-2xl border p-5 flex flex-col justify-between cursor-pointer transition-all relative ${
                    selectedPlan === "Pro"
                      ? "border-emerald-600 shadow-md ring-2 ring-emerald-500/10"
                      : "border-slate-100 shadow-sm hover:border-slate-200"
                  }`}
                >
                  <div className="absolute -top-3.5 left-5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-full shadow-sm flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                    POPULAR
                  </div>
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
                      {t("lumina_pro") || "Lumina Pro"}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">
                        ₦3,000
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold">
                        {t("per_month")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Perfect for professional teachers needing quick AI
                      creations.
                    </p>
                    <div className="h-[1px] bg-slate-100 my-2" />
                    <ul className="space-y-2 text-[11px] font-semibold text-slate-500">
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600" />{" "}
                        Unlimited AI creation
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600" /> 3 AI
                        regenerations/item
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600" />{" "}
                        Advanced assessments
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600" />{" "}
                        High-fidelity PDF exports
                      </li>
                    </ul>
                  </div>

                  {user?.settings?.subscriptionPlan === "Pro" && (
                    <span className="mt-4 text-center block text-[10px] font-bold bg-emerald-50 border border-emerald-100 rounded-lg py-1.5 text-emerald-700 uppercase">
                      Current Plan
                    </span>
                  )}
                </div>

                {/* Ultimate Plan */}
                <div
                  onClick={() => setSelectedPlan("Ultimate")}
                  className={`bg-white rounded-2xl border p-5 flex flex-col justify-between cursor-pointer transition-all relative ${
                    selectedPlan === "Ultimate"
                      ? "border-emerald-600 shadow-md ring-2 ring-emerald-500/10"
                      : "border-slate-100 shadow-sm hover:border-slate-200"
                  }`}
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest block">
                      {t("lumina_ultimate") || "Lumina Ultimate"}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">
                        ₦5,000
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold">
                        {t("per_month")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      For educators who want unlimited power without boundaries.
                    </p>
                    <div className="h-[1px] bg-slate-100 my-2" />
                    <ul className="space-y-2 text-[11px] font-semibold text-slate-500">
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-purple-600" />{" "}
                        Unlimited everything
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-purple-600" />{" "}
                        Unlimited AI regenerations
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-purple-600" />{" "}
                        Dedicated priority support
                      </li>
                    </ul>
                  </div>

                  {user?.settings?.subscriptionPlan === "Ultimate" && (
                    <span className="mt-4 text-center block text-[10px] font-bold bg-purple-50 border border-purple-100 rounded-lg py-1.5 text-purple-700 uppercase">
                      Current Plan
                    </span>
                  )}
                </div>
              </div>

              {/* Secure payment notes */}
              {selectedPlan !== "Free" && (
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">
                      🔒 Secured by Paystack Pop · No credit cards stored.
                    </span>
                  </div>
                </div>
              )}

              {/* Apply / Upgrade Button */}
              <div className="pt-4 border-t border-slate-50 flex justify-end">
                <button
                  onClick={handleSubscribe}
                  disabled={
                    isSubmittingPlan ||
                    selectedPlan === user?.settings?.subscriptionPlan
                  }
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingPlan ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initializing Secure Checkout...</span>
                    </>
                  ) : selectedPlan === user?.settings?.subscriptionPlan ? (
                    <span>Your Active Plan</span>
                  ) : selectedPlan === "Free" ? (
                    <span>Switch to Free Plan</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>
                        Pay ₦{PLAN_AMOUNTS[selectedPlan]?.toLocaleString()}
                        /month
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: REFERRALS & REWARDS */}
          {activeTab === "referrals" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {t("referrals_rewards") === "referrals_rewards"
                    ? "Referrals & Rewards"
                    : t("referrals_rewards")}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Invite other teachers and earn free Lumina Pro & Ultimate
                  access.
                </p>
              </div>

              {loadingReferrals && !referralsStats ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-slate-500 text-xs mt-3">
                    Loading referral metrics...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Share Promo Card */}
                  <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-6 md:p-8 relative shadow-lg overflow-hidden">
                    <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="space-y-4 max-w-lg">
                      <h3 className="text-2xl font-black leading-tight">
                        {t("invite_friends") === "invite_friends"
                          ? "Invite Friends & Earn Pro Access"
                          : t("invite_friends")}
                      </h3>
                      <p className="text-sm text-emerald-100/90 leading-relaxed">
                        Share your custom referral code. You will earn up to 1
                        Month of Ultimate access when they register and generate
                        their first plan.
                      </p>

                      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center pt-2">
                        <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-300 tracking-wider uppercase block">
                              {t("your_code") === "your_code"
                                ? "YOUR CODE"
                                : t("your_code")}
                            </span>
                            <span className="text-xl font-extrabold tracking-widest">
                              {referralsStats?.code || "—"}
                            </span>
                          </div>
                          <button
                            onClick={copyReferralCode}
                            className="p-2.5 bg-white text-emerald-800 rounded-full hover:scale-105 transition-transform cursor-pointer"
                            title="Copy Code"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={shareReferral}
                          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-full border border-emerald-500/30 hover:shadow-md transition-all cursor-pointer shadow-sm text-sm"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share Link</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Milestone Section */}
                  <div className="space-y-4 bg-slate-50/50 border border-slate-100 p-6 rounded-3xl">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-slate-800">
                        {t("your_progress") === "your_progress"
                          ? "Your Progress"
                          : t("your_progress")}
                      </h4>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                        {successCount} Successful Ref
                        {successCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Progress Bar Fill */}
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <p className="text-xs text-slate-500">
                      {successCount < nextTier.count
                        ? `${nextTier.count - successCount} more successful referral${nextTier.count - successCount !== 1 ? "s" : ""} required to unlock ${nextTier.label}`
                        : "Congratulations! All milestone tiers unlocked! 🏆"}
                    </p>

                    {/* Milestone Tiers Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                      {REWARD_TIERS.map((tier) => {
                        const isUnlocked = successCount >= tier.count;
                        return (
                          <div
                            key={tier.id}
                            className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between ${
                              isUnlocked
                                ? "bg-emerald-50/55 border-emerald-200 text-emerald-900"
                                : "bg-white border-slate-100 text-slate-400 opacity-60"
                            }`}
                          >
                            <div
                              className={`w-3 h-3 rounded-full mb-2 ${isUnlocked ? "bg-emerald-600" : "bg-slate-300"}`}
                            />
                            <span className="text-[10px] font-black tracking-wider uppercase block">
                              {tier.count} REF{tier.count !== 1 ? "S" : ""}
                            </span>
                            <span className="text-[11px] font-extrabold mt-1">
                              {tier.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Invited Friends List */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-800">
                      {t("invited_friends") === "invited_friends"
                        ? "Invited Friends"
                        : t("invited_friends")}
                    </h4>

                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
                      <table className="w-full text-left text-xs font-semibold text-slate-600">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <tr>
                            <th className="px-5 py-3.5">Friend Name</th>
                            <th className="px-5 py-3.5">Email Address</th>
                            <th className="px-5 py-3.5 text-right">
                              Referral Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {referralsList.map((item) => (
                            <tr
                              key={item._id}
                              className="hover:bg-slate-50/30 transition-colors"
                            >
                              <td className="px-5 py-4 font-bold text-slate-800">
                                {item.referredUser?.fullName || "Lumina User"}
                              </td>
                              <td className="px-5 py-4 text-slate-400">
                                {item.referredUser?.email || "—"}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span
                                  className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    item.status === "successful"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                      : "bg-amber-50 text-amber-700 border border-amber-100"
                                  }`}
                                >
                                  {item.status === "successful"
                                    ? t("successful") || "Successful"
                                    : t("pending") || "Pending"}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {referralsList.length === 0 && (
                            <tr>
                              <td
                                colSpan={3}
                                className="px-5 py-8 text-center text-slate-400 italic"
                              >
                                {t("no_referrals_yet") === "no_referrals_yet"
                                  ? "No friends invited yet. Start sharing!"
                                  : t("no_referrals_yet")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CHANGE PASSWORD */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {t("change_password") === "change_password"
                    ? "Change Password"
                    : t("change_password")}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Ensure your account safety by periodically changing your
                  password.
                </p>
              </div>

              {/* Info Tips Box */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-100/60 rounded-2xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {t("password_hint") === "password_hint"
                    ? "Password must be at least 6 characters. Include lowercase, uppercase, and numbers for better strength."
                    : t("password_hint")}
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t("current_password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder={
                        t("enter_current_password") === "enter_current_password"
                          ? "Enter current password"
                          : t("enter_current_password")
                      }
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white text-sm font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100 my-4" />

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t("new_password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder={
                        t("enter_new_password") === "enter_new_password"
                          ? "Enter new password"
                          : t("enter_new_password")
                      }
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white text-sm font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength checker bar */}
                  {strength && (
                    <div className="space-y-1.5 pt-1">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`}
                        />
                      </div>
                      <span
                        className="text-[10px] font-black uppercase tracking-wider block"
                        style={{
                          color: strength.color.includes("emerald")
                            ? "#059669"
                            : strength.color.includes("amber")
                              ? "#d97706"
                              : "#dc2626",
                        }}
                      >
                        Password Strength: {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t("confirm_new_password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder={
                        t("re_enter_new_password") === "re_enter_new_password"
                          ? "Re-enter new password"
                          : t("re_enter_new_password")
                      }
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white text-sm font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 &&
                    newPassword !== confirmPassword && (
                      <span className="text-[11px] text-red-500 font-semibold mt-1 block">
                        {t("passwords_dont_match") === "passwords_dont_match"
                          ? "Passwords don't match."
                          : t("passwords_dont_match")}
                      </span>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      isUpdatingPassword ||
                      (newPassword.length > 0 &&
                        newPassword !== confirmPassword)
                    }
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 cursor-pointer shadow-md disabled:opacity-75"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: LANGUAGE PREFERENCES */}
          {activeTab === "language" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {t("language") === "language"
                    ? "Language Preferences"
                    : t("language")}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Select your preferred default language for the Lumina
                  interface.
                </p>
              </div>

              {/* Info tips details */}
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs text-slate-500 font-semibold leading-relaxed">
                {t("language_hint") === "language_hint"
                  ? "Switching the interface language will load translations and adjust margins/layout direction automatically."
                  : t("language_hint")}
              </div>

              {/* Language Options Checklist */}
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
                {/* English */}
                <button
                  type="button"
                  onClick={() => setSelectedLang("en")}
                  className={`w-full flex items-center justify-between p-5 text-left cursor-pointer transition-colors ${
                    selectedLang === "en"
                      ? "bg-emerald-50/30"
                      : "hover:bg-slate-50/20"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-800">
                      English
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      English
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLang === "en" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"}`}
                  >
                    {selectedLang === "en" && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                </button>

                {/* Arabic */}
                <button
                  type="button"
                  onClick={() => setSelectedLang("ar")}
                  className={`w-full flex items-center justify-between p-5 text-left cursor-pointer transition-colors ${
                    selectedLang === "ar"
                      ? "bg-emerald-50/30"
                      : "hover:bg-slate-50/20"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-800">
                      العربية
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Arabic
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLang === "ar" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"}`}
                  >
                    {selectedLang === "ar" && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                </button>
              </div>

              {/* Save apply button */}
              <div className="pt-4 border-t border-slate-50 flex justify-end">
                <button
                  onClick={handleApplyLanguage}
                  disabled={isApplyingLanguage || selectedLang === language}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-all active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isApplyingLanguage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Applying Language...</span>
                    </>
                  ) : (
                    <span>
                      {t("apply_language") === "apply_language"
                        ? "Apply Language"
                        : t("apply_language")}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
