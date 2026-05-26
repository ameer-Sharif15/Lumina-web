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
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

function OtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const { user, setUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, language, isRTL } = useTranslation();

  // OTP form state (6 single-digit inputs)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // References to the 6 input elements
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already authenticated, unless we just completed verification in this session
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isVerified) {
      if (user && !user.isOnboarded) {
        router.push('/auth/profile-complete');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, authLoading, user, router, isVerified]);

  // Countdown timer for resend code
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Input change handler
  const handleInputChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    // Take only the last character if multiple are entered (e.g. keypress)
    newOtp[index] = cleanValue.substring(cleanValue.length - 1);
    setOtp(newOtp);

    // Auto-focus next input box if filled
    if (newOtp[index] !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace key handler for navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Resubmit handler
  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the full 6-digit code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/auth/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: code,
      });

      const { token, user: updatedUser } = response.data;

      // Prevent automatic active session redirect guard from hijacking routing
      setIsVerified(true);

      setUser(updatedUser, token);
      toast.success(
        t('verification_successful') || 'Email verified successfully!',
      );

      // Route specifically to the Success celebration screen first!
      router.push('/auth/success');
    } catch (error: any) {
      console.error('[OTP Verify Error]:', error);
      const errorMsg =
        error.response?.data?.message || 'Invalid or expired OTP code.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend code handler
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await apiClient.post('/auth/resend-otp', {
        email: email.trim().toLowerCase(),
      });

      toast.success(t('otp_resent_successfully') || 'A new OTP has been sent.');
      setTimer(45);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      console.error('[Resend OTP Error]:', error);
      toast.error(
        'Failed to resend code. Please check your network and try again.',
      );
    } finally {
      setIsResending(false);
    }
  };

  // Format timer as 00:SS
  const formatTime = (seconds: number) => {
    const ss = seconds < 10 ? `0${seconds}` : seconds;
    return `00:${ss}`;
  };

  return (
    <div className='w-full max-w-md mx-auto' dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Branding */}
      <div className='text-center mb-6'>
        <span className='text-xl font-extrabold text-slate-900 flex items-center justify-center gap-1.5'>
          <Sparkles className='w-5 h-5 text-emerald-600' />
          <span>Lumina</span>
        </span>
        <span className='text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1.5 inline-block'>
          Teacher Assistant
        </span>
      </div>

      <div className='text-center mb-6'>
        <h1 className='text-2xl font-extrabold text-slate-900 tracking-tight'>
          {t('verify_email')}
        </h1>
        <p className='text-slate-500 mt-2 text-sm leading-relaxed px-2'>
          {t('otp_sent_to')}{' '}
          <strong className='text-emerald-600 font-semibold break-all'>
            {email || 'your email'}
          </strong>
        </p>
      </div>

      {/* Verification Inputs Container */}
      <div className='space-y-6'>
        <div className='flex justify-center gap-2 sm:gap-3' dir='ltr'>
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
              onChange={(e) => handleInputChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className='w-10 h-12 sm:w-11 sm:h-14 bg-slate-50/50 border border-slate-200 rounded-2xl text-center text-lg sm:text-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all animate-none'
              placeholder='-'
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleVerifyOtp}
          disabled={isSubmitting}
          className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[0.98] cursor-pointer disabled:opacity-50 text-sm'
        >
          {isSubmitting ? (
            <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
          ) : (
            <>
              <span>{t('verify_and_continue')}</span>
              {isRTL ? (
                <ArrowLeft className='w-4 h-4' />
              ) : (
                <ArrowRight className='w-4 h-4' />
              )}
            </>
          )}
        </button>

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

      {/* Back to signup */}
      <div className='mt-6 text-center border-t border-slate-100 pt-4'>
        <Link
          href='/auth/register'
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

export default function OtpPage() {
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
                Loading email verification details...
              </div>
            }
          >
            <OtpContent />
          </Suspense>
        </div>
      </SiteTwoColumn>
    </main>
  );
}
