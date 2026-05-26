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
  Eye,
  EyeOff,
  Globe,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type Step = 'otp' | 'password';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, isRTL } = useTranslation();

  // Multi-step control
  const [step, setStep] = useState<Step>('otp');

  // OTP states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // OTP Timer countdown
  useEffect(() => {
    if (step !== 'otp') return;
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  // OTP Change
  const handleOtpChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (newOtp[index] !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit OTP if 6 digits are loaded
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      handleVerifyRecoveryOtp(fullCode);
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyRecoveryOtp = async (code: string) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/verify-reset-otp', {
        email: email.trim().toLowerCase(),
        otp: code,
      });

      setVerifiedOtp(code);
      toast.success('Recovery code verified successfully.');
      setStep('password');
    } catch (error: any) {
      console.error('[OTP Verify Recovery Error]:', error);
      const errorMsg =
        error.response?.data?.message ||
        'Invalid recovery code. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await apiClient.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      toast.success(
        t('otp_resent_successfully') || 'A new recovery code has been sent.',
      );
      setTimer(45);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      console.error('[Resend Recovery Code Error]:', error);
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Submit new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        otp: verifiedOtp,
        newPassword: newPassword,
      });

      toast.success(
        t('password_reset_success') || 'Password reset successfully!',
      );
      router.push('/auth/login');
    } catch (error: any) {
      console.error('[Reset Password Submit Error]:', error);
      const errorMsg =
        error.response?.data?.message ||
        'Failed to reset password. Please check details.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const ss = seconds < 10 ? `0${seconds}` : seconds;
    return `00:${ss}`;
  };

  return (
    <div className='w-full max-w-md mx-auto' dir={isRTL ? 'rtl' : 'ltr'}>
      {step === 'otp' ? (
        /* STAGE 1: OTP ENTER FOR PASSWORD RESET */
        <div className='space-y-6'>
          <div className='text-center mb-6'>
            <span className='text-xl font-extrabold text-slate-900 flex items-center justify-center gap-1.5 mb-6'>
              <Sparkles className='w-5 h-5 text-emerald-600' />
              <span>Lumina</span>
            </span>
            <h1 className='text-2xl font-extrabold text-slate-900 tracking-tight'>
              {t('enter_otp')}
            </h1>
            <p className='text-slate-500 mt-2 text-sm leading-relaxed px-2'>
              {t('otp_sent_to')}{' '}
              <strong className='text-emerald-600 font-semibold break-all'>
                {email || 'your email'}
              </strong>
            </p>
          </div>

          {/* 6 Digit inputs */}
          <div className='flex justify-center gap-2 sm:gap-3 py-2' dir='ltr'>
            {otp.map((digit, index) => (
              <input
                key={index}
                type='text'
                pattern='[0-9]*'
                inputMode='numeric'
                maxLength={1}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                className='w-10 h-12 sm:w-11 sm:h-14 bg-slate-50/50 border border-slate-200 rounded-2xl text-center text-lg sm:text-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all animate-none'
                placeholder='-'
              />
            ))}
          </div>

          {/* Resend utility */}
          <div className='flex items-center justify-between text-xs pt-4 border-t border-slate-100'>
            <span className='text-slate-500 font-medium'>
              Didn't receive the code?
            </span>
            {canResend ? (
              <button
                onClick={handleResendOtp}
                disabled={isResending}
                className='text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-all cursor-pointer disabled:opacity-50'
              >
                {isResending ? 'Resending...' : t('resend_now')}
              </button>
            ) : (
              <span className='text-slate-550 font-semibold bg-slate-50/70 border border-slate-200 px-2.5 py-1 rounded-full'>
                {t('resend')} in{' '}
                <strong className='text-emerald-600 font-bold'>
                  {formatTime(timer)}
                </strong>
              </span>
            )}
          </div>
        </div>
      ) : (
        /* STAGE 2: ENTER NEW PASSWORD & CONFIRM */
        <div className='space-y-6'>
          <div className='text-center flex flex-col items-center mb-6'>
            <div className='w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4'>
              <ShieldCheck className='w-6 h-6 text-emerald-600' />
            </div>
            <h1 className='text-2xl font-extrabold text-slate-900 tracking-tight'>
              {t('new_password')}
            </h1>
            <p className='text-slate-555 mt-2 text-sm leading-relaxed px-4'>
              {t('new_password_subtitle')}
            </p>
          </div>

          <form onSubmit={handleResetPassword} className='space-y-4'>
            {/* New Password input */}
            <div className='space-y-1.5'>
              <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                {t('new_password')}
              </label>
              <div className='relative flex items-center'>
                <span
                  className={`absolute ${isRTL ? 'right-4' : 'left-4'} text-slate-400`}
                >
                  <Lock className='w-5 h-5' />
                </span>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder='••••••••'
                  className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-all text-sm`}
                />
                <button
                  type='button'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`absolute ${isRTL ? 'left-4' : 'right-4'} text-slate-400 hover:text-slate-600 transition-all cursor-pointer`}
                >
                  {showNewPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password input */}
            <div className='space-y-1.5'>
              <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                {t('confirm_password')}
              </label>
              <div className='relative flex items-center'>
                <span
                  className={`absolute ${isRTL ? 'right-4' : 'left-4'} text-slate-400`}
                >
                  <Lock className='w-5 h-5' />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='••••••••'
                  className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-all text-sm`}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute ${isRTL ? 'left-4' : 'right-4'} text-slate-400 hover:text-slate-600 transition-all cursor-pointer`}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none text-sm mt-2'
            >
              {isSubmitting ? (
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              ) : (
                <span>{t('reset_password')}</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Back link */}
      <div className='mt-6 text-center border-t border-slate-100 pt-4'>
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
  );
}

export default function ResetPasswordPage() {
  const { language, setLanguage, isRTL } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

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

          <Suspense
            fallback={
              <div className='w-full bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-550 shadow-sm'>
                Loading email recovery details...
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </div>
      </SiteTwoColumn>
    </main>
  );
}
