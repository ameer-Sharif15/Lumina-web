import ContactForm from '@/components/ContactForm';
import { white } from '@/assets';
import SiteTwoColumn from '@/components/SiteTwoColumn';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LuMail, LuClock, LuMessageSquare, LuUsers } from 'react-icons/lu';

export const metadata: Metadata = {
  title: 'Contact us | Lumina AI',
  description:
    'Get in touch with the Lumina AI team for support, partnerships, or general enquiries.',
};

const SUPPORT_EMAIL = 'helloluminai@gmail.com';

const contactInfo = [
  {
    icon: LuMail,
    label: 'Email us',
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    color: '#006c51',
  },
  {
    icon: LuClock,
    label: 'Response time',
    value: 'Within 24 hours',
    href: null,
    color: '#0284c7',
  },
  {
    icon: LuUsers,
    label: 'School / partnership',
    value: 'Contact sales',
    href: `mailto:${SUPPORT_EMAIL}?subject=School+Partnership+Enquiry`,
    color: '#7c3aed',
  },
];

export default function ContactPage() {
  return (
    <main className='min-h-0 bg-white'>
      <SiteTwoColumn
        leftCenter={
          <>
            <Link
              href='/'
              className='text-sm font-semibold tracking-tight text-white/90 hover:text-white'
            >
              <Image
                src={white}
                alt='Lumina AI'
                width={163}
                height={118}
                className='mb-5 h-auto max-w-[120px] sm:max-w-[140px]'
                priority
              />
            </Link>
            <Link
              href='/'
              className='text-sm hidden md:block font-semibold tracking-tight text-white/90 hover:text-white'
            >
              Back to Home
            </Link>
          </>
        }
      >
        <article className='pb-24 pt-4 w-full'>

          {/* Header */}
          <div className='mb-12 max-w-2xl'>
            <span className='inline-block px-3 py-1 bg-emerald-50 text-[#006c51] text-xs font-bold tracking-widest uppercase rounded-full mb-5 border border-emerald-100'>
              Contact
            </span>
            <h1 className='text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight'>
              We&apos;d love to <br />
              <span className='text-[#006c51]'>hear from you.</span>
            </h1>
            <p className='text-lg text-slate-600 leading-relaxed'>
              Whether it&apos;s a support question, a partnership enquiry, or feedback about Lumina — we&apos;re here and happy to help.
            </p>
          </div>

          {/* Contact info cards */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12'>
            {contactInfo.map((item) => {
              const Icon = item.icon;
              const inner = (
                <div className='flex flex-col gap-2 p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors h-full'>
                  <div
                    className='size-9 rounded-xl flex items-center justify-center'
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Icon className='text-lg' style={{ color: item.color }} />
                  </div>
                  <p className='text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1'>
                    {item.label}
                  </p>
                  <p className='text-sm font-bold text-slate-900 leading-snug'>
                    {item.value}
                  </p>
                </div>
              );

              return item.href ? (
                <a key={item.label} href={item.href}>
                  {inner}
                </a>
              ) : (
                <div key={item.label}>{inner}</div>
              );
            })}
          </div>

          {/* Form section */}
          <div className='mb-14'>
            <div className='flex items-center gap-3 mb-6'>
              <LuMessageSquare className='text-xl text-[#006c51]' />
              <h2 className='text-xl font-bold text-slate-900'>
                Send us a message
              </h2>
            </div>
            <div className='p-6 sm:p-8 rounded-3xl bg-slate-50/50 border border-slate-200'>
              <ContactForm />
            </div>
          </div>

          {/* Footer note */}
          <div className='border-t border-slate-100 pt-8'>
            <p className='text-sm text-slate-500'>
              Looking for answers first?{' '}
              <Link
                href='/faqs'
                className='text-[#006c51] font-semibold hover:underline underline-offset-2'
              >
                Browse our FAQs
              </Link>{' '}
              — you might find what you need instantly.
            </p>
          </div>

        </article>
      </SiteTwoColumn>
    </main>
  );
}
