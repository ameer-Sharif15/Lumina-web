import { white } from '@/assets';
import SiteTwoColumn from '@/components/SiteTwoColumn';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  LuScrollText,
  LuUserCheck,
  LuShieldAlert,
  LuBrainCircuit,
  LuCreditCard,
  LuCopyright,
  LuTriangleAlert,
  LuScale,
  LuHandshake,
  LuPowerOff,
  LuGlobe,
  LuMail,
} from 'react-icons/lu';

export const metadata: Metadata = {
  title: 'Terms of Service | Lumina AI',
  description:
    'Terms and conditions for using Lumina AI, the intelligent co-pilot for modern educators.',
};

const sections = [
  {
    number: '01',
    icon: LuScrollText,
    title: 'Acceptance of terms',
    color: '#006c51',
    content:
      "By accessing or using Lumina AI's website, mobile applications, or other services (\"Services\"), you agree to be bound by these Terms of Service. If you do not agree, do not use our Services. We may update these terms from time to time; continued use after changes constitutes acceptance.",
  },
  {
    number: '02',
    icon: LuUserCheck,
    title: 'Eligibility and account',
    color: '#0284c7',
    content:
      'You must be at least 18 years old and able to enter into a binding contract to use our Services. You are responsible for providing accurate information when you register and for keeping your credentials secure. You must notify us promptly of any unauthorised use of your account.',
  },
  {
    number: '03',
    icon: LuShieldAlert,
    title: 'Use of services',
    color: '#7c3aed',
    content:
      'You may use our Services only for lawful educational purposes and in accordance with these terms. You agree not to use the platform to generate harmful, misleading, or plagiarised content; not to circumvent security or access controls; and not to interfere with the proper operation of our systems or other users. We reserve the right to suspend or terminate accounts that violate these terms.',
  },
  {
    number: '04',
    icon: LuBrainCircuit,
    title: 'AI-generated content',
    color: '#d97706',
    content:
      'Lumina AI uses advanced AI models to assist in generating lesson plans, assessments, and teaching notes. The content generated is intended as a starting point and should be reviewed and adapted by the educator before use. You are responsible for the accuracy and appropriateness of any content you share with students. Lumina AI is not liable for any errors in AI-generated content.',
  },
  {
    number: '05',
    icon: LuCreditCard,
    title: 'Subscriptions and billing',
    color: '#059669',
    content:
      'Lumina AI offers free and paid subscription plans. Fees for paid plans are displayed before you subscribe and are charged on a recurring monthly basis. You can cancel your subscription at any time through your account settings. Refunds are handled in line with our refund policy. We reserve the right to modify pricing with reasonable notice.',
  },
  {
    number: '06',
    icon: LuCopyright,
    title: 'Intellectual property',
    color: '#c2410c',
    content:
      "Lumina AI and its licensors own all rights in the Services, including software, design, and branding. You may not copy, modify, or create derivative works without our written permission. You retain rights in the original content you provide; you grant us a licence to use it as needed to provide and improve the Services.",
  },
  {
    number: '07',
    icon: LuTriangleAlert,
    title: 'Disclaimers',
    color: '#f59e0b',
    content:
      'The Services are provided "as is" and "as available". We do not warrant that they will be uninterrupted or error-free. To the fullest extent permitted by law, we disclaim implied warranties. AI-generated content is not a substitute for professional educational judgment.',
  },
  {
    number: '08',
    icon: LuScale,
    title: 'Limitation of liability',
    color: '#6b7280',
    content:
      'Our liability for any claim arising from or related to the Services is limited to the amount you paid us in the twelve (12) months before the claim, or to the extent permitted by law. We are not liable for indirect, incidental, or consequential damages.',
  },
  {
    number: '09',
    icon: LuHandshake,
    title: 'Indemnification',
    color: '#0891b2',
    content:
      'You agree to indemnify and hold harmless Lumina AI and its officers, directors, and agents from any claims, damages, or expenses (including legal fees) arising from your use of the Services, your violation of these terms, or your violation of any third-party rights.',
  },
  {
    number: '10',
    icon: LuPowerOff,
    title: 'Termination',
    color: '#dc2626',
    content:
      "We may suspend or terminate your access to the Services at any time for breach of these terms or for other reasons we consider necessary. You may close your account at any time through the app or by contacting us. Upon termination, your right to use the Services ceases; provisions that by their nature should survive (e.g. disclaimers, limitation of liability) will survive.",
  },
  {
    number: '11',
    icon: LuGlobe,
    title: 'Governing law and disputes',
    color: '#7c3aed',
    content:
      'These terms are governed by the laws of the Federal Republic of Nigeria. Any dispute shall be subject to the exclusive jurisdiction of the courts of Nigeria, unless otherwise required by applicable law.',
  },
];

export default function TermsOfServicePage() {
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
              Legal
            </span>
            <h1 className='text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight'>
              Terms of <br />
              <span className='text-[#006c51]'>Service</span>
            </h1>
            <p className='text-base text-slate-500 leading-relaxed'>
              Last updated: <strong className='text-slate-700'>May 2025</strong>.
              Please read these terms carefully before using Lumina AI.
            </p>
          </div>

          {/* Quick nav pills */}
          <div className='flex flex-wrap gap-2 mb-12'>
            {sections.map((s) => (
              <a
                key={s.number}
                href={`#tos-section-${s.number}`}
                className='px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors'
              >
                {s.number}. {s.title}
              </a>
            ))}
          </div>

          {/* Sections */}
          <div className='flex flex-col gap-5 mb-14'>
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.number}
                  id={`tos-section-${s.number}`}
                  className='p-6 rounded-3xl border border-slate-200 hover:border-slate-300 transition-colors bg-white'
                >
                  <div className='flex items-start gap-4'>
                    <div
                      className='size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5'
                      style={{ backgroundColor: `${s.color}15` }}
                    >
                      <Icon className='text-lg' style={{ color: s.color }} />
                    </div>
                    <div>
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-[11px] font-bold text-slate-400 uppercase tracking-wider'>
                          {s.number}
                        </span>
                        <h2 className='text-base font-bold text-slate-900'>{s.title}</h2>
                      </div>
                      <p className='text-sm text-slate-500 leading-relaxed'>{s.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact */}
          <div className='border-t border-slate-100 pt-10'>
            <div className='flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-200'>
              <div className='size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0'>
                <LuMail className='text-lg text-[#006c51]' />
              </div>
              <div>
                <h3 className='text-base font-bold text-slate-900 mb-1'>Questions about these terms?</h3>
                <p className='text-sm text-slate-500 leading-relaxed'>
                  Visit our{' '}
                  <Link href='/contact' className='text-[#006c51] font-semibold hover:underline underline-offset-2'>
                    Contact page
                  </Link>{' '}
                  or email us at{' '}
                  <a href='mailto:helloluminai@gmail.com' className='text-[#006c51] font-semibold hover:underline underline-offset-2'>
                    helloluminai@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

        </article>
      </SiteTwoColumn>
    </main>
  );
}
