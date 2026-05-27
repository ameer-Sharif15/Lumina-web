'use client';

import { white } from '@/assets';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';
import LegalFooterNav from './LegalFooterNav';
import LightRays from './LightRays';

type SiteTwoColumnProps = {
  leftCenter: ReactNode;
  children: ReactNode;
};

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/how-it-works', label: 'How it Works' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/contact', label: 'Contact Us' },
  // { href: '/privacy-policy', label: 'Privacy Policy' },
];

/**
 * Shared layout: branded left panel + scrollable right panel.
 *
 * Mobile  → compact tab header with hamburger → slide-down nav drawer
 * lg+     → full-height side panel with LightRays, watermark & footer nav
 */
export default function SiteTwoColumn({
  leftCenter,
  children,
}: SiteTwoColumnProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className='relative min-h-dvh lg:min-h-screen flex items-stretch justify-center bg-background '>
      <div className='relative z-10 w-full lg:min-h-screen lg:h-screen flex flex-col lg:flex-row gap-2 items-stretch p-1 sm:p-2'>
        {/* ── Left panel ───────────────────────────────────────────────── */}
        <div
          className='
          relative overflow-visible rounded-3xl bg-primary
          flex flex-col
          min-h-0 shrink-0
          lg:flex-1 lg:min-h-0 lg:overflow-hidden
        '
        >
          {/* Mobile tab header row */}
          <div className='flex flex-row items-center justify-between px-5 py-3 lg:hidden'>
            {/* leftCenter content (logo + back link) — horizontal */}
            <div className='flex flex-row items-center gap-3 flex-1 min-w-0'>
              {leftCenter}
            </div>

            {/* Hamburger button */}
            <button
              type='button'
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className='relative z-20 ml-3 shrink-0 flex flex-col items-center justify-center w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors cursor-pointer'
            >
              <span
                className={`block w-4.5 h-[2px] bg-white rounded-full transition-all duration-300 ${
                  menuOpen ? 'translate-y-[5px] rotate-45' : ''
                }`}
              />
              <span
                className={`block w-4.5 h-[2px] bg-white rounded-full transition-all duration-300 my-[4px] ${
                  menuOpen ? 'opacity-0 scale-x-0' : ''
                }`}
              />
              <span
                className={`block w-4.5 h-[2px] bg-white rounded-full transition-all duration-300 ${
                  menuOpen ? '-translate-y-[7px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>

          {/* Mobile slide-down nav drawer */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {/* Backdrop tap-to-close (invisible, sits behind drawer) */}
            {menuOpen && (
              <div
                className='fixed inset-0 z-10'
                onClick={() => setMenuOpen(false)}
              />
            )}
            <nav
              className='relative z-20 flex flex-col gap-1 px-5 pb-4 pt-1'
              aria-label='Site navigation'
            >
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className='flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-xl px-3 py-2.5 transition-colors'
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Desktop-only inner contents ───────────────────────────── */}

          {/* LightRays */}
          <div
            className='hidden lg:block absolute inset-0'
            style={{ width: '100%', height: '100%' }}
          >
            <LightRays
              raysOrigin='top-center'
              raysColor='#006c51'
              raysSpeed={1.5}
              lightSpread={0.5}
              rayLength={2.5}
              followMouse={true}
              mouseInfluence={0.1}
              noiseAmount={0.1}
              distortion={0.05}
              fadeDistance={1.5}
              saturation={1.2}
              className='custom-rays'
            />
          </div>

          {/* Watermark logo */}
          <div
            aria-hidden
            className='hidden lg:flex pointer-events-none absolute inset-x-0 bottom-0 z-[1] w-full items-end'
          >
            <Image
              src={white}
              alt=''
              width={512}
              height={512}
              sizes='100vw'
              className='h-[135vh] w-full max-w-none origin-bottom scale-[1.08] object-contain object-bottom opacity-[0.07] select-none translate-y-[48%]'
            />
          </div>

          {/* Centred content column (desktop only) */}
          <div className='hidden lg:flex relative z-10 w-full flex-1 flex-col justify-center items-center text-center px-12 py-20 min-h-0'>
            {leftCenter}
          </div>

          {/* Footer nav (desktop only) */}
          <div className='hidden lg:block relative z-10 pb-8 mx-4 items-center'>
            <LegalFooterNav />
          </div>
        </div>

        {/* ── Right panel ──────────────────────────────────────────────── */}
        <div className='flex flex-1 flex-col min-h-0 rounded-3xl border border-none bg-card text-card-foreground py-6 px-4 sm:py-10 sm:px-6 lg:py-12 lg:px-6 lg:max-h-none overflow-y-auto'>
          <div className='relative z-10 w-full max-w-7xl mx-auto'>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
