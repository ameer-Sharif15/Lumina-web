'use client';

import { noBg, white } from '@/assets';
import HeroLeft from '@/components/HeroLeft';
import SiteTwoColumn from '@/components/SiteTwoColumn';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import apiClient from '@/lib/api';
import { getDeviceId } from '@/lib/deviceId';
import { auth, googleProvider } from '@/lib/firebase';
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import {
  Award,
  Check,
  ChevronDown,
  Globe,
  Key,
  Lock,
  Mail,
  Sparkles,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading, setUser } = useAuth();
  const { t, language, setLanguage, isRTL } = useTranslation();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Handle Google redirect result (mobile sign-in) + redirect if already authenticated
  useEffect(() => {
    // Handle redirect result from mobile Google sign-up
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result) return; // No redirect in progress

        setIsGoogleLoading(true);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const idToken = credential?.idToken;

        if (!idToken) throw new Error('Failed to retrieve Google ID token.');

        const deviceId = await getDeviceId();

        const response = await apiClient.post('/auth/google', {
          idToken,
          fullName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          deviceId,
        });
        const { token, user } = response.data;
        setUser(user, token);
        toast.success('Welcome to Lumina!');

        if (user.isOnboarded) {
          router.push('/dashboard');
        } else {
          router.push('/auth/profile-complete');
        }
      } catch (error: any) {
        if (error?.code === 'auth/null-user') return; // No redirect, ignore
        console.error('[Google Redirect Result Error]:', error);
        const errorMsg =
          error.response?.data?.message ||
          'Google sign-in failed. Please try again.';
        toast.error(errorMsg);
      } finally {
        setIsGoogleLoading(false);
      }
    };

    handleRedirectResult();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user && !user.isOnboarded) {
        router.push('/auth/profile-complete');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('All required fields must be filled.');
      return;
    }
    if (password.length < 6) {
      toast.error(t('password_min_length'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('passwords_do_not_match'));
      return;
    }
    if (!agreeTerms) {
      toast.error('You must agree to the Terms & Conditions.');
      return;
    }

    setIsSubmitting(true);
    try {
      const deviceId = await getDeviceId();

      await apiClient.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        deviceId: deviceId,
        referralCode: referralCode.trim() || undefined,
      });

      toast.success(t('otp_sent_to_email') || 'OTP sent successfully!');
      // Navigate to OTP page passing the email as a query parameter
      router.push(
        `/auth/otp?email=${encodeURIComponent(email.trim().toLowerCase())}`,
      );
    } catch (error: any) {
      console.error('[Registration Error]:', error);
      if (error.response?.data?.code === 'ONBOARDING_INCOMPLETE') {
        toast.success(
          'Incomplete profile found. Redirecting to login to complete your setup...',
        );
        setTimeout(() => {
          router.push(
            `/auth/login?email=${encodeURIComponent(email.trim().toLowerCase())}`,
          );
        }, 1500);
        return;
      }
      const errorMsg =
        error.response?.data?.message ||
        'Failed to create account. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // Always try popup first. This avoids issues in Chrome responsive mode and works on many mobile browsers.
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-blocked') {
          // Fallback to redirect ONLY if popup was explicitly blocked
          await signInWithRedirect(auth, googleProvider);
          return;
        } else {
          throw popupError;
        }
      }
      // Extract the original Google OAuth idToken (not the Firebase token)
      // This matches what the mobile app sends to the backend
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;

      if (!idToken) {
        throw new Error('Failed to retrieve Google ID token.');
      }

      const deviceId = await getDeviceId();

      const response = await apiClient.post('/auth/google', {
        idToken,
        fullName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        deviceId,
      });
      const { token, user } = response.data;

      setUser(user, token);
      toast.success('Welcome to Lumina!');

      if (user.isOnboarded) {
        router.push('/dashboard');
      } else {
        router.push('/auth/profile-complete');
      }
    } catch (error: any) {
      console.error('[Google SignUp Error]:', error);
      if (error.code === 'auth/popup-closed-by-user') return;
      const errorMsg =
        error.response?.data?.message ||
        'Google sign-in failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsGoogleLoading(false);
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
          className='relative flex flex-col items-stretch py-4 max-w-md mx-auto'
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Custom Floating Language Dropdown */}
          {/* <div className='w-full flex justify-end mb-6'>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className='flex items-center gap-2 bg-white hover:bg-slate-55 border border-slate-200 px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer select-none'
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

          {/* Header Branding */}
          <div className='text-center mb-6'>
            {/* <span className='text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2'>
              <Sparkles className='w-6 h-6 text-emerald-600' />
              <span>Lumina</span>
            </span> */}
            <p className='text-slate-500 mt-1 text-sm'>
              {t('create_account_subtitle')}
            </p>
          </div>

          <form onSubmit={handleRegister} className='space-y-4'>
            {/* Full Name input */}
            <div className='space-y-1.5'>
              <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                {t('full_name_label')}
              </label>
              <div className='relative flex items-center'>
                <span
                  className={`absolute ${isRTL ? 'right-4' : 'left-4'} text-slate-400`}
                >
                  <User className='w-5 h-5' />
                </span>
                <input
                  type='text'
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('full_name_placeholder')}
                  className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm`}
                />
              </div>
            </div>

            {/* Email input */}
            <div className='space-y-1.5'>
              <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                {t('email_address_label')}
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
                  placeholder={t('email_address_placeholder')}
                  className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm`}
                />
              </div>
            </div>

            {/* Passwords stacked tightly */}
            <div className='space-y-4'>
              {/* Password input */}
              <div className='space-y-1.5'>
                <label className='block text-xs font-bold text-slate-500 tracking-wider uppercase'>
                  {t('password_label')}
                </label>
                <div className='relative flex items-center'>
                  <span
                    className={`absolute ${isRTL ? 'right-4' : 'left-4'} text-slate-400`}
                  >
                    <Lock className='w-5 h-5' />
                  </span>
                  <input
                    type='password'
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='••••••••'
                    className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm`}
                  />
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
                    <Key className='w-5 h-5' />
                  </span>
                  <input
                    type='password'
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='••••••••'
                    className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm`}
                  />
                </div>
              </div>
            </div>

            {/* Referral Code (optional) */}
            <div className='space-y-1.5'>
              <label className='block text-xs font-bold text-slate-550 tracking-wider uppercase'>
                {t('referral_code_label')}
              </label>
              <div className='relative flex items-center'>
                <span
                  className={`absolute ${isRTL ? 'right-4' : 'left-4'} text-slate-400`}
                >
                  <Award className='w-5 h-5' />
                </span>
                <input
                  type='text'
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder={t('referral_code_placeholder')}
                  className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm`}
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className='flex items-start gap-2.5 pt-1'>
              <input
                type='checkbox'
                id='terms'
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className='mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer'
              />
              <label
                htmlFor='terms'
                className='text-xs text-slate-500 leading-normal select-none cursor-pointer'
              >
                <span>{t('agree_to')} </span>
                <a
                  href='/Privacy'
                  target='_blank'
                  className='text-emerald-600 hover:underline font-bold'
                >
                  {t('terms_conditions')}
                </a>
              </label>
            </div>

            {/* Submit button */}
            <button
              type='submit'
              disabled={isSubmitting || isGoogleLoading || !agreeTerms}
              className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[0.98] cursor-pointer disabled:opacity-50 mt-2 text-sm'
            >
              {isSubmitting ? (
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              ) : (
                <span>{t('sign_up')}</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className='mt-2 pt-4 border-t border-slate-100 text-center text-xs text-slate-500'>
            {/* Google Sign-Up Divider */}
            <div className='flex items-center gap-3 mb-4'>
              <div className='flex-1 h-px bg-slate-200'></div>
              <span className='text-xs text-slate-400 font-semibold uppercase tracking-wider'>
                or
              </span>
              <div className='flex-1 h-px bg-slate-200'></div>
            </div>

            <button
              type='button'
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isSubmitting}
              className='w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-55 text-slate-700 font-bold py-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[0.99] cursor-pointer disabled:opacity-50 mb-4 text-xs'
            >
              {isGoogleLoading ? (
                <div className='w-5 h-5 border-2 border-slate-400 border-t-emerald-600 rounded-full animate-spin'></div>
              ) : (
                <svg className='w-4 h-4' viewBox='0 0 24 24'>
                  <path
                    fill='#4285F4'
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  />
                  <path
                    fill='#34A853'
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  />
                  <path
                    fill='#FBBC05'
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z'
                  />
                  <path
                    fill='#EA4335'
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  />
                </svg>
              )}
              <span>
                {isGoogleLoading ? 'Signing up...' : 'Continue with Google'}
              </span>
            </button>

            <span>{t('already_have_account')} </span>
            <Link
              href='/auth/login'
              className='text-emerald-600 hover:underline font-bold'
            >
              {t('sign_in')}
            </Link>
          </div>
        </div>
      </SiteTwoColumn>
    </main>
  );
}
