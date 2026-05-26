'use client';

import { noBg, white } from '@/assets';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { auth, googleProvider } from '@/lib/firebase';
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function HeroLeft({ hideCtas = false }: { hideCtas?: boolean }) {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isMobile = () =>
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Handle Google redirect result (mobile sign-in) + redirect if already authenticated
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result) return; // No redirect in progress

        setIsGoogleLoading(true);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const idToken = credential?.idToken;

        if (!idToken) throw new Error('Failed to retrieve Google ID token.');

        const response = await apiClient.post('/auth/google', {
          idToken,
          fullName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      if (isMobile()) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken;

      if (!idToken) {
        throw new Error('Failed to retrieve Google ID token.');
      }

      const response = await apiClient.post('/auth/google', {
        idToken,
        fullName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
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
      console.error('[Google Login Error]:', error);
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
    <div className='flex flex-col justify-center items-stretch min-h-0 max-lg:py-8 py-4 sm:py-0'>
      <div className='w-full h-full max-w-xl mx-auto px-2 flex flex-col items-center text-center min-h-0'>
        {/* Logo */}
        <motion.div
          className='mb-6 sm:mb-8 lg:mb-12 w-full flex justify-center shrink-0'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Image
            src={white}
            alt='Lumina AI Logo'
            width={163}
            height={118}
            sizes='(max-width: 400px) 140px, (max-width: 1024px) 180px, 200px'
            className='w-full max-w-[120px] sm:max-w-[140px] md:max-w-[160px] lg:max-w-[180px] h-auto object-contain object-center'
            priority
          />
        </motion.div>

        {/* Badge */}
        <motion.p
          className='text-xs sm:text-sm md:text-base text-[#F2C600] mb-5 sm:mb-6 lg:mb-8 uppercase tracking-tight w-full shrink-0'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          AI-POWERED CO-PILOT FOR EDUCATORS
        </motion.p>

        {/* Heading */}
        <motion.h1
          className='text-4xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-4 leading-none tracking-tight w-full [font-family:var(--font-bricolage-grotesque)] shrink-0'
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <div className='tracking-tight'>Teaching Just Got</div>
          <div className='tracking-tight'>
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#F2C600] to-[#FFE566]'>
              Smarter
            </span>{' '}
            with AI.
          </div>
        </motion.h1>

        {/* Description */}
        <motion.p
          className='text-sm sm:text-lg md:text-xl text-white font-semibold mb-8 sm:mb-8 lg:mb-10 leading-relaxed max-sm:leading-snug tracking-tight w-full shrink-0'
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        >
          Your intelligent classroom co-pilot. Automate lesson plans, notes, and assessments instantly so you can focus on inspiring students.
        </motion.p>

        {/* CTA Buttons */}
        {!hideCtas && (
          <motion.div
            className='flex flex-col sm:flex-row justify-center items-stretch gap-4 w-full shrink-0 mt-2 sm:mt-0'
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            {/* Get Started */}
            <motion.div
              className='flex-1 sm:basis-0 sm:min-w-0'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href='/auth/register'
                className='flex h-14 sm:h-16 w-full items-center justify-center gap-2 px-6 sm:px-8 bg-white rounded-full font-semibold text-sm sm:text-base tracking-tight text-primary'
              >
                {/* Rocket icon */}
                <svg
                  className='size-5 shrink-0 text-primary'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  aria-hidden
                >
                  <path
                    d='M9.5 8.5 L14.5 3.5 C16 2 18.5 2 20 3.5 C21.5 5 21.5 7.5 20 9L15 14 M9.5 8.5 L5.5 10 L4 14 L10 10 M14.5 14.5 L16 18.5 L20 20 L16 14 M8 16 C8 16 6 18 4 20'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    fill='none'
                    strokeLinecap='round'
                  />
                </svg>
                Get Started Free
              </Link>
            </motion.div>

            {/* Sign in with Google */}
            <motion.div
              className='flex-1 sm:basis-0 sm:min-w-0'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                type='button'
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                aria-label='Sign in with Google'
                className='flex h-14 sm:h-16 w-full items-center justify-center gap-2 px-6 sm:px-8 rounded-full font-semibold text-sm sm:text-base tracking-tight text-white bg-white/10 hover:bg-white/20 transition-colors border border-white/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none'
              >
                {isGoogleLoading ? (
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                ) : (
                  <>
                    {/* Google icon */}
                    <svg
                      className='size-5 shrink-0'
                      viewBox='0 0 24 24'
                      aria-hidden
                    >
                      <path
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                        fill='#4285F4'
                      />
                      <path
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                        fill='#34A853'
                      />
                      <path
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                        fill='#FBBC05'
                      />
                      <path
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                        fill='#EA4335'
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
