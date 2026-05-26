import FaqAccordion from '@/components/FaqAccordion';
import { white } from '@/assets';
import SiteTwoColumn from '@/components/SiteTwoColumn';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LuArrowRight } from 'react-icons/lu';

export const metadata: Metadata = {
  title: 'FAQs | Lumina AI',
  description:
    'Find answers to common questions about Lumina AI — lesson plans, assessments, pricing, AI personalization, and more.',
};

const faqItems = [
  {
    id: 'what-is-lumina',
    question: 'What is Lumina AI?',
    answer:
      "Lumina AI is an intelligent teaching co-pilot designed for educators. It automates lesson planning, generates personalized student notes, creates assessments, and provides smart teaching resources — all powered by AI. It's designed to save teachers hours every week so they can focus on what truly matters: their students.",
  },
  {
    id: 'lesson-plans',
    question: 'How does the AI lesson plan generator work?',
    answer:
      'Simply enter your subject, topic, and curriculum requirements. Lumina AI will generate a fully structured, multi-modal lesson plan in under 30 seconds — complete with learning objectives, teaching activities, and resource suggestions. You can then review, edit, and export it as a PDF, Word document, or PowerPoint.',
  },
  {
    id: 'assessments',
    question: 'Can Lumina AI create assessments and exams?',
    answer:
      'Yes! Lumina AI generates Exams and Continuous Assessments (CAs) directly from your accumulated lesson plans and class notes. Simply select the topics you want to cover and the AI instantly crafts targeted questions. Our Pro and Ultimate plans include full exam generation.',
  },
  {
    id: 'personalization',
    question: 'How does AI personalization work?',
    answer:
      'Lumina AI analyses class performance data and dynamically adjusts teaching strategies. It can suggest enrichment activities for accelerated learners and simplified visual aids for steady learners — all within the same lesson plan. This ensures no student is left behind and no gifted student is bored.',
  },
  {
    id: 'free-plan',
    question: 'Is there a free plan?',
    answer:
      'Yes! The Lumina Free plan gives you 5 days of full AI access upon registration so you can explore every feature. After the trial, you keep unlimited class access with empty templates. Upgrade to Pro or Ultimate for unlimited AI generation.',
  },
  {
    id: 'privacy',
    question: "Is my data and my students' data safe?",
    answer: (
      <>
        Absolutely. We do not sell your personal data or your students&apos;
        data to third parties. All data is encrypted in transit and at rest. We
        comply with applicable data protection standards. For full details, see
        our{' '}
        <Link
          href='/privacy-policy'
          className='font-semibold text-[#006c51] underline-offset-4 hover:underline'
        >
          Privacy Policy
        </Link>
        .
      </>
    ),
  },
  {
    id: 'export',
    question: 'What formats can I export lesson plans in?',
    answer:
      'You can export your AI-generated lesson plans and notes as PDF, Microsoft Word (.docx), or PowerPoint (.pptx) files. This makes it easy to share with colleagues, print, or present directly in class.',
  },
  {
    id: 'regeneration',
    question: 'Can I regenerate or edit AI content?',
    answer:
      'Yes. Pro users get 3 AI regenerations per item, and Ultimate users get unlimited regenerations. You can also manually edit any section of the generated content directly in the app before exporting.',
  },
];

const categories = [
  { label: 'Getting Started', count: 2 },
  { label: 'AI Features', count: 3 },
  { label: 'Pricing & Plans', count: 2 },
  { label: 'Data & Privacy', count: 1 },
];

export default function FaqsPage() {
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
              FAQs
            </span>
            <h1 className='text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight'>
              Frequently Asked <br />
              <span className='text-[#006c51]'>Questions</span>
            </h1>
            <p className='text-lg text-slate-600 leading-relaxed'>
              Find answers to common questions about Lumina AI, our features,
              pricing, and data privacy.
            </p>
          </div>

          {/* Category pills */}
          <div className='flex flex-wrap gap-2 mb-10'>
            {categories.map((c) => (
              <span
                key={c.label}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200'
              >
                {c.label}
                <span className='size-4 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center'>
                  {c.count}
                </span>
              </span>
            ))}
          </div>

          {/* Accordion */}
          <div className='mb-14'>
            <FaqAccordion items={faqItems} />
          </div>

          {/* Still have questions CTA */}
          <div className='border-t border-slate-100 pt-10'>
            <div className='p-7 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5'>
              <div>
                <p className='text-base font-bold text-slate-900 mb-1'>
                  Still have questions?
                </p>
                <p className='text-sm text-slate-500'>
                  Our team usually responds within 24 hours on business days.
                </p>
              </div>
              <Link
                href='/contact'
                className='inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#006c51] text-white font-bold rounded-2xl hover:bg-[#00523e] transition-colors text-sm shrink-0'
              >
                Contact us
                <LuArrowRight className='text-base' />
              </Link>
            </div>
          </div>

        </article>
      </SiteTwoColumn>
    </main>
  );
}
