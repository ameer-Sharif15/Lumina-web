'use client';

import { noBg, white } from '@/assets';
import HeroLeft from '@/components/HeroLeft';
import SiteTwoColumn from '@/components/SiteTwoColumn';
import { useTranslation } from '@/context/LanguageContext';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function SuccessPage() {
  const router = useRouter();
  const { t, language, setLanguage, isRTL } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleProceed = () => {
    router.push('/auth/profile-complete');
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
          className='relative flex flex-col items-center py-4 text-center max-w-md mx-auto'
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

          {/* Animated Checkmark Rings */}
          <div className='relative mb-6'>
            <div className='w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-100 flex items-center justify-center'>
              <div className='w-18 h-18 rounded-full bg-emerald-50 flex items-center justify-center shadow-sm'>
                <Check className='w-10 h-10 text-emerald-600 stroke-[3]' />
              </div>
            </div>
          </div>

          {/* Text Details */}
          <div className='space-y-2 mb-6'>
            <h1 className='text-2xl font-extrabold text-slate-900 tracking-tight'>
              {t('account_created')}
            </h1>
            <p className='text-slate-500 text-sm leading-relaxed px-2'>
              {t('account_success_msg')}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleProceed}
            className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[0.98] cursor-pointer text-sm'
          >
            <span>{t('continue')}</span>
            {isRTL ? (
              <ArrowLeft className='w-4 h-4' />
            ) : (
              <ArrowRight className='w-4 h-4' />
            )}
          </button>
        </div>
      </SiteTwoColumn>
    </main>
  );
}
