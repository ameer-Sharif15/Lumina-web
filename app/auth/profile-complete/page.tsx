'use client';

import { noBg, white } from '@/assets';
import HeroLeft from '@/components/HeroLeft';
import SiteTwoColumn from '@/components/SiteTwoColumn';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import apiClient from '@/lib/api';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Camera,
  Check,
  ChevronDown,
  Globe,
  GraduationCap,
  Plus,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProfileCompletePage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, language, setLanguage, isRTL } = useTranslation();

  // Onboarding Step Control
  const [step, setStep] = useState(1);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Verification protection
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error('Session expired. Please log in.');
        router.push('/auth/login');
      } else if (user?.isOnboarded) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Step 1 Form States (Professional Identity)
  const [schoolName, setSchoolName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize fields once user is loaded
  useEffect(() => {
    if (user) {
      setSchoolName(user.professional?.institution || '');
      setPosition(user.professional?.position || '');
      setPhone(user.personal?.phone || '');
      setYearsExperience(user.professional?.yearsExperience || '');
      setBio(user.personal?.bio || '');
      setProfilePhotoUrl(user.personal?.profilePhoto || '');

      if (user.onboardingStep === 'classroom-preferences') {
        setStep(2);
      }
    }
  }, [user]);

  // Step 2 Form States (Classroom Preferences)
  const defaultSubjects = [
    { key: 'math', label: t('math') },
    { key: 'science', label: t('science') },
    { key: 'english', label: t('english') },
    { key: 'social_studies', label: t('social_studies') },
    { key: 'art', label: t('art') },
  ];
  const [subjectsList, setSubjectsList] = useState(defaultSubjects);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  // Learning pace selectors
  const [studentLevel, setStudentLevel] = useState('Average');
  const studentLevels = [
    { key: 'Slow', label: 'Slow Pace' },
    { key: 'Average', label: 'Average Pace' },
    { key: 'Fast', label: 'Fast Pace' },
    { key: 'Mixed', label: t('mixed') },
  ];

  // Plan types
  const defaultPlanStyles = [
    { key: 'Standard Weekly', label: t('standard_weekly') },
    { key: 'Detailed Daily', label: t('detailed_daily') },
    { key: '5E Model', label: t('5e_model') },
  ];
  const [planStylesList, setPlanStylesList] = useState(defaultPlanStyles);
  const [selectedPlanStyles, setSelectedPlanStyles] = useState<string[]>([
    'Standard Weekly',
  ]);
  const [customPlanStyleInput, setCustomPlanStyleInput] = useState('');

  // Philosophy
  const defaultPhilosophies = [
    { key: 'Student-Centered', label: t('student_centered') },
    { key: 'Montessori', label: t('montessori') },
    { key: 'Inquiry-Based', label: t('inquiry_based') },
  ];
  const [philosophiesList, setPhilosophiesList] = useState(defaultPhilosophies);
  const [selectedPhilosophies, setSelectedPhilosophies] = useState<string[]>([
    'Student-Centered',
  ]);
  const [customPhilosophyInput, setCustomPhilosophyInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe checks for arrays
  useEffect(() => {
    if (user?.classroom) {
      if (user.classroom.subjects?.length) {
        setSelectedSubjects(user.classroom.subjects);
        // Include any subjects in the list that aren't defaults
        user.classroom.subjects.forEach((sub: string) => {
          if (!subjectsList.some((s) => s.key === sub)) {
            setSubjectsList((prev) => [...prev, { key: sub, label: sub }]);
          }
        });
      }
      if (user.classroom.studentLevel) {
        setStudentLevel(user.classroom.studentLevel);
      }
      if (user.classroom.teachingPhilosophy) {
        const phil = user.classroom.teachingPhilosophy;
        const philArray = Array.isArray(phil) ? phil : [phil];
        setSelectedPhilosophies(philArray);
        philArray.forEach((ph: string) => {
          if (!philosophiesList.some((p) => p.key === ph)) {
            setPhilosophiesList((prev) => [...prev, { key: ph, label: ph }]);
          }
        });
      }
      if (user.classroom.planStyle?.length) {
        setSelectedPlanStyles(user.classroom.planStyle);
        user.classroom.planStyle.forEach((st: string) => {
          if (!planStylesList.some((s) => s.key === st)) {
            setPlanStylesList((prev) => [...prev, { key: st, label: st }]);
          }
        });
      }
    }
  }, [user]);

  // Image upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be smaller than 5MB.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiClient.post('/auth/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.url) {
        setProfilePhotoUrl(response.data.url);
        toast.success('Profile photo uploaded successfully!');
      } else {
        toast.error('Upload completed, but no URL was returned.');
      }
    } catch (error: any) {
      console.error('[Upload Photo Error]:', error);
      toast.error('Failed to upload photo. Setting mock local placeholder.');
      setProfilePhotoUrl(URL.createObjectURL(file));
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle selection utility
  const toggleSubject = (subjKey: string) => {
    if (selectedSubjects.includes(subjKey)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subjKey));
    } else {
      setSelectedSubjects([...selectedSubjects, subjKey]);
    }
  };

  const togglePlanStyle = (styleKey: string) => {
    if (selectedPlanStyles.includes(styleKey)) {
      setSelectedPlanStyles(selectedPlanStyles.filter((s) => s !== styleKey));
    } else {
      setSelectedPlanStyles([...selectedPlanStyles, styleKey]);
    }
  };

  const togglePhilosophy = (phKey: string) => {
    if (selectedPhilosophies.includes(phKey)) {
      setSelectedPhilosophies(selectedPhilosophies.filter((p) => p !== phKey));
    } else {
      setSelectedPhilosophies([...selectedPhilosophies, phKey]);
    }
  };

  // Custom chip builders
  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customSubjectInput.trim();
    if (!clean) return;

    if (
      !subjectsList.some((s) => s.key.toLowerCase() === clean.toLowerCase())
    ) {
      const newItem = { key: clean, label: clean };
      setSubjectsList([...subjectsList, newItem]);
      setSelectedSubjects([...selectedSubjects, clean]);
    } else {
      toast.error('Subject already exists.');
    }
    setCustomSubjectInput('');
  };

  const handleAddCustomPhilosophy = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customPhilosophyInput.trim();
    if (!clean) return;

    if (
      !philosophiesList.some((p) => p.key.toLowerCase() === clean.toLowerCase())
    ) {
      const newItem = { key: clean, label: clean };
      setPhilosophiesList([...philosophiesList, newItem]);
      setSelectedPhilosophies([...selectedPhilosophies, clean]);
    }
    setCustomPhilosophyInput('');
  };

  const handleAddCustomPlanStyle = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customPlanStyleInput.trim();
    if (!clean) return;

    if (
      !planStylesList.some((s) => s.key.toLowerCase() === clean.toLowerCase())
    ) {
      const newItem = { key: clean, label: clean };
      setPlanStylesList([...planStylesList, newItem]);
      setSelectedPlanStyles([...selectedPlanStyles, clean]);
    }
    setCustomPlanStyleInput('');
  };

  // Submit Step 1 Professional Setup
  const handleSaveStep1 = async () => {
    if (!schoolName.trim() || !yearsExperience.trim()) {
      toast.error('School name and Years of experience are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.put('/auth/onboarding-step', {
        onboardingStep: 'classroom-preferences',
        professional: {
          institution: schoolName.trim(),
          position: position.trim() || 'Teacher',
          yearsExperience: yearsExperience.trim(),
        },
        personal: {
          phone: phone.trim() || undefined,
          bio: bio.trim() || undefined,
          profilePhoto: profilePhotoUrl || undefined,
        },
      });

      const { user: updatedUser } = response.data;
      setUser(updatedUser);
      toast.success('Professional identity saved!');
      setStep(2);
    } catch (error: any) {
      console.error('[Onboarding Step 1 Error]:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to save onboarding step. Continuing...',
      );
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete Onboarding Step 2 Preferences Setup
  const handleCompleteOnboarding = async () => {
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject.');
      return;
    }
    if (selectedPhilosophies.length === 0) {
      toast.error('Please select at least one teaching philosophy.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.put('/auth/onboarding', {
        professional: {
          institution: schoolName.trim(),
          position: position.trim() || 'Teacher',
          yearsExperience: yearsExperience.trim(),
        },
        personal: {
          phone: phone.trim() || undefined,
          bio: bio.trim() || undefined,
          profilePhoto: profilePhotoUrl || undefined,
        },
        classroom: {
          subjects: selectedSubjects,
          studentLevel: studentLevel,
          teachingPhilosophy: selectedPhilosophies,
          planStyle: selectedPlanStyles,
        },
      });

      const { user: updatedUser } = response.data;
      setUser(updatedUser);
      toast.success(
        t('profile_completed_successfully') || 'Onboarding complete!',
      );
      router.push('/dashboard');
    } catch (error: any) {
      console.error('[Onboarding Complete Error]:', error);
      toast.error(
        error.response?.data?.message ||
          'Failed to complete profile onboarding. Please check inputs.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className='min-h-screen bg-slate-50/70 flex items-center justify-center'>
        <div className='w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <main className='min-h-0'>
      <SiteTwoColumn
        leftCenter={
          <>
            <Link
              href='/'
              className='text-sm font-semibold tracking-tight text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline'
            >
              <Image
                src={white}
                alt='Lumina AI'
                width={163}
                height={118}
                className='mb-5 h-auto max-w-[120px] object-contain sm:max-w-[140px] w-auto'
                priority
              />
            </Link>
            <Link
              href='/'
              className='text-sm hidden md:block font-semibold tracking-tight text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline'
            >
              Back to Home
            </Link>
          </>
        }
      >
        <div
          className='relative flex flex-col items-stretch py-4 w-full'
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Custom Floating Language Dropdown */}
          <div className='w-full flex justify-end mb-6'>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className='flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer select-none'
              >
                <Globe className='w-3.5 h-3.5 text-slate-400' />
                <span>{language === 'en' ? 'English' : 'العربية'}</span>
                <ChevronDown
                  className={`w-3 h-3 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className='fixed inset-0 z-10'
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div
                    className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-36 bg-white border border-slate-100 rounded-2xl shadow-md z-20 py-1.5`}
                  >
                    <button
                      type='button'
                      onClick={() => {
                        setLanguage('en');
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between hover:bg-slate-55 ${language === 'en' ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-700'}`}
                    >
                      <span>English</span>
                      {language === 'en' && (
                        <Check className='w-3.5 h-3.5 text-emerald-600' />
                      )}
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        setLanguage('ar');
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-right px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between hover:bg-slate-55 ${language === 'ar' ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-700'}`}
                    >
                      <span>العربية</span>
                      {language === 'ar' && (
                        <Check className='w-3.5 h-3.5 text-emerald-600' />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Page title and Branding */}
          <div className='text-center mb-6'>
            <span className='text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2'>
              <Sparkles className='w-6 h-6 text-emerald-600' />
              <span>Lumina</span>
            </span>
            <h1 className='text-base font-bold text-slate-500 mt-1'>
              Complete Teacher Profile
            </h1>
          </div>

          {/* Progress Stepper - Clean, borderless and low-spacing */}
          <div className='bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-6 flex justify-around items-center gap-2 text-xs font-semibold select-none overflow-hidden'>
            <div
              className={`flex items-center gap-2 ${step === 1 ? 'text-emerald-700 font-extrabold' : 'text-slate-400 font-normal'}`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center ${step === 1 ? 'bg-emerald-600 text-white font-bold' : 'bg-white border border-slate-200 text-slate-400'} text-[10px]`}
              >
                1
              </span>
              <span>{t('professional_info')}</span>
            </div>
            <div className='h-px w-8 bg-slate-200'></div>
            <div
              className={`flex items-center gap-2 ${step === 2 ? 'text-emerald-700 font-extrabold' : 'text-slate-400 font-normal'}`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center ${step === 2 ? 'bg-emerald-600 text-white font-bold' : 'bg-white border border-slate-200 text-slate-400'} text-[10px]`}
              >
                2
              </span>
              <span>{t('classroom_settings')}</span>
            </div>
          </div>

          {/* Wizard Panel Box - Clean without massive shadow and spacing */}
          <div className='relative overflow-hidden w-full'>
            {step === 1 ? (
              /* ==================== STEP 1: PROFESSIONAL IDENTITY ==================== */
              <div className='space-y-4'>
                <div>
                  <h2 className='text-lg font-extrabold text-slate-900 mb-0.5 flex items-center gap-2'>
                    <User className='w-4 h-4 text-emerald-600' />
                    <span>{t('professional_info')}</span>
                  </h2>
                  <p className='text-slate-550 text-xs leading-relaxed'>
                    Tell us about your educational background and current
                    workspace settings.
                  </p>
                </div>

                {/* Photo upload mock zone - compact */}
                <div className='flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200'>
                  <div className='relative shrink-0'>
                    <div className='w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative'>
                      {profilePhotoUrl ? (
                        <img
                          src={profilePhotoUrl}
                          alt='Avatar'
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <User className='w-8 h-8 text-slate-400' />
                      )}
                      {isUploading && (
                        <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
                          <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        </div>
                      )}
                    </div>
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full shadow-sm transition-all cursor-pointer'
                    >
                      <Camera className='w-3 h-3' />
                    </button>
                    <input
                      type='file'
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept='image/*'
                      className='hidden'
                    />
                  </div>
                  <div>
                    <h3 className='text-xs font-extrabold text-slate-900'>
                      {t('upload_photo')}
                    </h3>
                    <p className='text-[10px] text-slate-500 mt-0.5 leading-relaxed'>
                      {t('optional_recommended')}. Supports PNG, JPG (max 5MB).
                    </p>
                  </div>
                </div>

                {/* Step 1 Input Form */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {/* School Name */}
                  <div className='space-y-1'>
                    <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                      {t('school_name')} *
                    </label>
                    <input
                      type='text'
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder='E.g. Oakridge International'
                      className='w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm'
                    />
                  </div>

                  {/* Job Position */}
                  <div className='space-y-1'>
                    <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                      {t('job_title_label') || 'Job Position / Title'}
                    </label>
                    <input
                      type='text'
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder='E.g. High School Instructor'
                      className='w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm'
                    />
                  </div>

                  {/* Years experience */}
                  <div className='space-y-1'>
                    <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                      {t('years_experience')} *
                    </label>
                    <input
                      type='number'
                      min={0}
                      required
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      placeholder='E.g. 5'
                      className='w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm'
                    />
                  </div>

                  {/* Phone number */}
                  <div className='space-y-1'>
                    <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                      {t('phone_label')}
                    </label>
                    <input
                      type='tel'
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder='+1 (555) 000-0000'
                      className='w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm'
                    />
                  </div>
                </div>

                {/* Bio description */}
                <div className='space-y-1'>
                  <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                    {t('bio_label')}
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder='Tell us about your background, goals, or passion...'
                    rows={3}
                    className='w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm resize-none'
                  />
                </div>

                {/* Step 1 Next Actions */}
                <div className='flex justify-end pt-4 border-t border-slate-100'>
                  <button
                    type='button'
                    onClick={handleSaveStep1}
                    disabled={isSubmitting}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm'
                  >
                    {isSubmitting ? (
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    ) : (
                      <>
                        <span>{t('save_continue')}</span>
                        {isRTL ? (
                          <ArrowLeft className='w-4 h-4' />
                        ) : (
                          <ArrowRight className='w-4 h-4' />
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ==================== STEP 2: CLASSROOM PREFERENCES ==================== */
              <div className='space-y-6'>
                <div>
                  <h2 className='text-lg font-extrabold text-slate-900 mb-0.5 flex items-center gap-2'>
                    <GraduationCap className='w-4 h-4 text-emerald-600' />
                    <span>{t('classroom_settings')}</span>
                  </h2>
                  <p className='text-slate-500 text-xs leading-relaxed'>
                    Customize the defaults for lesson plans and diagnostic test
                    parameters.
                  </p>
                </div>

                {/* A: Subjects Taught Section */}
                <div className='space-y-2'>
                  <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                    {t('subjects_taught')} *
                  </label>

                  <div className='flex flex-wrap gap-2 p-3 bg-slate-50/50 border border-slate-200 rounded-2xl'>
                    {subjectsList.map((subj) => {
                      const isSelected = selectedSubjects.includes(subj.key);
                      return (
                        <button
                          key={subj.key}
                          onClick={() => toggleSubject(subj.key)}
                          type='button'
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className='w-3 h-3' />}
                          <span>{subj.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Subject */}
                  <form
                    onSubmit={handleAddCustomSubject}
                    className='flex gap-2 max-w-sm'
                  >
                    <input
                      type='text'
                      value={customSubjectInput}
                      onChange={(e) => setCustomSubjectInput(e.target.value)}
                      placeholder='Type subject (e.g. Physics)'
                      className='flex-1 bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white'
                    />
                    <button
                      type='submit'
                      className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer'
                    >
                      <Plus className='w-3.5 h-3.5' />
                      <span>Add</span>
                    </button>
                  </form>
                </div>

                {/* B: Student Pace Select Grid */}
                <div className='space-y-2'>
                  <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                    Default Student Learning Pace Level
                  </label>
                  <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                    {studentLevels.map((lvl) => {
                      const isSelected = studentLevel === lvl.key;
                      return (
                        <button
                          key={lvl.key}
                          type='button'
                          onClick={() => setStudentLevel(lvl.key)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className='w-3 h-3' />}
                          <span>{lvl.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* C: Plan styles */}
                <div className='space-y-2'>
                  <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                    Preferred Lesson Plan Styles
                  </label>
                  <div className='flex flex-wrap gap-2 p-3 bg-slate-50/50 border border-slate-200 rounded-2xl'>
                    {planStylesList.map((style) => {
                      const isSelected = selectedPlanStyles.includes(style.key);
                      return (
                        <button
                          key={style.key}
                          onClick={() => togglePlanStyle(style.key)}
                          type='button'
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className='w-3 h-3' />}
                          <span>{style.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Plan style */}
                  <form
                    onSubmit={handleAddCustomPlanStyle}
                    className='flex gap-2 max-w-sm'
                  >
                    <input
                      type='text'
                      value={customPlanStyleInput}
                      onChange={(e) => setCustomPlanStyleInput(e.target.value)}
                      placeholder='E.g. Project-Based'
                      className='flex-1 bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white'
                    />
                    <button
                      type='submit'
                      className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer'
                    >
                      <Plus className='w-3.5 h-3.5' />
                      <span>Add</span>
                    </button>
                  </form>
                </div>

                {/* D: Teaching Philosophy Select */}
                <div className='space-y-2'>
                  <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                    Teaching Philosophy Default Settings
                  </label>
                  <div className='flex flex-wrap gap-2 p-3 bg-slate-50/50 border border-slate-200 rounded-2xl'>
                    {philosophiesList.map((phil) => {
                      const isSelected = selectedPhilosophies.includes(
                        phil.key,
                      );
                      return (
                        <button
                          key={phil.key}
                          onClick={() => togglePhilosophy(phil.key)}
                          type='button'
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className='w-3 h-3' />}
                          <span>{phil.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Philosophy */}
                  <form
                    onSubmit={handleAddCustomPhilosophy}
                    className='flex gap-2 max-w-sm'
                  >
                    <input
                      type='text'
                      value={customPhilosophyInput}
                      onChange={(e) => setCustomPhilosophyInput(e.target.value)}
                      placeholder='E.g. Waldorf Method'
                      className='flex-1 bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white'
                    />
                    <button
                      type='submit'
                      className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer'
                    >
                      <Plus className='w-3.5 h-3.5' />
                      <span>Add</span>
                    </button>
                  </form>
                </div>

                {/* Step 2 Back & Submit Buttons */}
                <div className='flex justify-between items-center pt-4 border-t border-slate-100'>
                  <button
                    type='button'
                    onClick={() => setStep(1)}
                    className='text-xs font-bold text-slate-400 hover:text-emerald-700 flex items-center gap-1.5 transition-all cursor-pointer'
                  >
                    {isRTL ? (
                      <ArrowRight className='w-3.5 h-3.5' />
                    ) : (
                      <ArrowLeft className='w-3.5 h-3.5' />
                    )}
                    <span>{t('back')}</span>
                  </button>

                  <button
                    onClick={handleCompleteOnboarding}
                    disabled={isSubmitting}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm'
                  >
                    {isSubmitting ? (
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    ) : (
                      <>
                        <span>{t('finish')}</span>
                        {isRTL ? (
                          <ArrowLeft className='w-4 h-4' />
                        ) : (
                          <ArrowRight className='w-4 h-4' />
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SiteTwoColumn>
    </main>
  );
}
