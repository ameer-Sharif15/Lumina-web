import { white } from '@/assets';
import SiteTwoColumn from '@/components/SiteTwoColumn';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  LuShieldCheck,
  LuCamera,
  LuBrainCircuit,
  LuLock,
  LuUserCheck,
  LuCookie,
  LuRefreshCw,
  LuMail,
  LuFileText,
} from 'react-icons/lu';

export const metadata: Metadata = {
  title: 'Privacy Policy | Lumina AI',
  description:
    'How Lumina AI collects, uses, and protects your information when you use our AI teacher productivity platform.',
};

const sections = [
  {
    number: '01',
    icon: LuShieldCheck,
    title: 'Information we collect',
    color: '#006c51',
    content:
      'We collect information you provide when you register and use Lumina AI, such as your name, email address, school affiliation, and professional details (subject, grade level). We also collect data generated through your use of the platform, including lesson plans, notes, and teaching materials you create with our AI tools. We may also collect technical data such as device information and usage analytics to improve our services.',
  },
  {
    number: '02',
    icon: LuCamera,
    title: 'Camera & media permissions',
    color: '#0284c7',
    content:
      "Lumina AI may request access to your device's camera and photo library. This is used exclusively for: (a) capturing or uploading profile photographs, and (b) scanning physical teaching materials or documents to be processed by our AI for lesson plan generation. We do not access your camera in the background or store images without your explicit action.",
  },
  {
    number: '03',
    icon: LuBrainCircuit,
    title: 'How we use your information',
    color: '#7c3aed',
    content:
      'We use your information to provide and improve our AI-powered education tools — specifically to personalise your experience, generate lesson plans and assessments, facilitate the teacher referral programme, and communicate important updates. We use anonymised, aggregated data for platform analytics and to improve our AI models.',
  },
  {
    number: '04',
    icon: LuFileText,
    title: 'AI processing & third parties',
    color: '#d97706',
    content:
      'Lumina AI uses advanced Artificial Intelligence models to assist in generating lesson content. By using the platform, you acknowledge that the text you input may be processed by third-party AI providers. We do not sell your personal information. We may share data with service providers (e.g. hosting, database management) who are contractually bound to protect your information in line with this policy.',
  },
  {
    number: '05',
    icon: LuLock,
    title: 'Data security',
    color: '#059669',
    content:
      'We implement technical and organisational measures to protect your data against unauthorised access, loss, or misuse. This includes encryption, access controls, and secure infrastructure. No method of transmission over the internet is 100% secure; we encourage you to keep your account credentials confidential.',
  },
  {
    number: '06',
    icon: LuUserCheck,
    title: 'Your rights',
    color: '#e11d48',
    content:
      'Depending on your location, you may have the right to access, correct, or delete your personal data, to object to or restrict processing, and to data portability. You can update account details in the app or contact us to exercise these rights. Upon deletion, your personal data will be removed from our active databases within 30 days.',
  },
  {
    number: '07',
    icon: LuCookie,
    title: 'Cookies and similar technologies',
    color: '#c2410c',
    content:
      'We use cookies and similar technologies to maintain sessions, improve security, and understand how our services are used. You can manage cookie preferences in your browser settings.',
  },
  {
    number: '08',
    icon: LuRefreshCw,
    title: 'Changes to this policy',
    color: '#6b7280',
    content:
      'We may update this privacy policy from time to time. We will post the updated version on this page and indicate the last updated date. Continued use of our services after changes constitutes acceptance of the updated policy where permitted by law.',
  },
];

export default function PrivacyPolicyPage() {
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
              Privacy <br />
              <span className='text-[#006c51]'>Policy</span>
            </h1>
            <p className='text-base text-slate-500 leading-relaxed'>
              Last updated: <strong className='text-slate-700'>May 2025</strong>.
              How we collect, use, and protect your information on the Lumina AI platform.
            </p>
          </div>

          {/* Quick nav pills */}
          <div className='flex flex-wrap gap-2 mb-12'>
            {sections.map((s) => (
              <a
                key={s.number}
                href={`#section-${s.number}`}
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
                  id={`section-${s.number}`}
                  className='p-6 rounded-3xl border border-slate-200 hover:border-slate-300 transition-colors bg-white group'
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
                <h3 className='text-base font-bold text-slate-900 mb-1'>Questions about this policy?</h3>
                <p className='text-sm text-slate-500 leading-relaxed'>
                  Reach us via the{' '}
                  <Link href='/contact' className='text-[#006c51] font-semibold hover:underline underline-offset-2'>
                    Contact page
                  </Link>{' '}
                  or email us directly at{' '}
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
