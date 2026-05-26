import Link from 'next/link';

export default function LegalFooterNav() {
  return (
    <nav
      className='relative z-10 mt-auto shrink-0 pt-8 pb-5 sm:pb-8 translate-y-6 sm:translate-y-8 flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-6'
      aria-label='Legal and support links'
    >
      <Link
        href='/features'
        className='text-[11px] sm:text-xs text-white/90 hover:text-white underline-offset-2 hover:underline transition-colors'
      >
        Features
      </Link>
      <Link
        href='/pricing'
        className='text-[11px] sm:text-xs text-white/90 hover:text-white underline-offset-2 hover:underline transition-colors'
      >
        Pricing
      </Link>
      <Link
        href='/how-it-works'
        className='text-[11px] sm:text-xs text-white/90 hover:text-white underline-offset-2 hover:underline transition-colors'
      >
        How it Works
      </Link>
      <Link
        href='/faqs'
        className='text-[11px] sm:text-xs text-white/90 hover:text-white underline-offset-2 hover:underline transition-colors'
      >
        FAQs
      </Link>
      <Link
        href='/contact'
        className='text-[11px] sm:text-xs text-white/90 hover:text-white underline-offset-2 hover:underline transition-colors'
      >
        Contact Us
      </Link>
      <Link
        href='/privacy-policy'
        className='text-[11px] sm:text-xs text-white/90 hover:text-white underline-offset-2 hover:underline transition-colors'
      >
        Privacy Policy
      </Link>
    </nav>
  );
}
