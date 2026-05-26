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
  Check,
  ChevronDown,
  Globe,
  Mail,
  ShieldQuestion,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, language, setLanguage, isRTL } = useTranslation();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      toast.success(t('otp_sent_to_email') || 'OTP sent successfully!');
      // Navigate to Reset Password passing the email as a query parameter
      router.push(
        `/auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`,
      );
    } catch (error: any) {
      console.error('[Forgot Password Error]:', error);
      const errorMsg =
        error.response?.data?.message ||
        'Failed to send recovery OTP. Please verify your email.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className='relative flex flex-col items-center py-4 max-w-md mx-auto'
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
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between hover:bg-slate-50 ${language === 'en' ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-700'}`}
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
                      className={`w-full text-right px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between hover:bg-slate-50 ${language === 'ar' ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-700'}`}
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

          {/* Icon */}
          <div className='w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4'>
            <ShieldQuestion className='w-7 h-7 text-emerald-600' />
          </div>

          {/* Header Text */}
          <div className='text-center mb-6'>
            <h1 className='text-2xl font-extrabold text-slate-900 tracking-tight'>
              {t('forgot_password')}
            </h1>
            <p className='text-slate-500 mt-2 text-sm leading-relaxed px-4'>
              {t('forgot_password_subtitle')}
            </p>
          </div>

          {/* Action Form */}
          <form onSubmit={handleSubmit} className='w-full space-y-4'>
            {/* Email input field */}
            <div className='space-y-1.5'>
              <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                {t('email_label')}
              </label>
              <div className='relative flex items-center'>
                <span
                  className={`absolute ${isRTL ? 'right-4' : 'left-4'} text-slate-400`}
                >
                  <Mail className='w-5 h-5' />
                </span>
                <input
                  type='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email_placeholder')}
                  className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm`}
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none text-sm mt-2'
            >
              {isSubmitting ? (
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              ) : (
                <>
                  <span>{t('send_recovery_code') || 'Send Recovery Code'}</span>
                  {isRTL ? (
                    <ArrowLeft className='w-4 h-4' />
                  ) : (
                    <ArrowRight className='w-4 h-4' />
                  )}
                </>
              )}
            </button>
          </form>

          {/* Back Link */}
          <div className='mt-6 text-center border-t border-slate-100 pt-4 w-full'>
            <Link
              href='/auth/login'
              className='text-xs text-slate-550 hover:text-emerald-600 font-bold flex items-center justify-center gap-1.5 transition-all'
            >
              {isRTL ? (
                <ArrowRight className='w-3.5 h-3.5' />
              ) : (
                <ArrowLeft className='w-3.5 h-3.5' />
              )}
              <span>{t('back_to_login')}</span>
            </Link>
          </div>
        </div>
      </SiteTwoColumn>
    </main>
  );
}
