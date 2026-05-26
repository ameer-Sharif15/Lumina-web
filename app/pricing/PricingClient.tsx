'use client';

import { white } from '@/assets';
import SiteTwoColumn from '@/components/SiteTwoColumn';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  LuArrowRight,
  LuCheck,
  LuX,
  LuSparkles,
  LuZap,
  LuCrown,
} from 'react-icons/lu';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

type PlanFeature = { text: string; included: boolean };

const plans: {
  id: string;
  icon: React.ElementType;
  name: string;
  tagline: string;
  price: string;
  period: string;
  cta: string;
  ctaHref: string;
  badge?: string;
  accentColor: string;
  highlight: boolean;
  features: PlanFeature[];
}[] = [
  {
    id: 'free',
    icon: LuSparkles,
    name: 'Lumina Free',
    tagline: 'Free for 5 days upon registration to test the app out.',
    price: '₦0',
    period: 'forever',
    cta: 'Get Started Free',
    ctaHref: '/auth/register',
    accentColor: '#6B7280',
    highlight: false,
    features: [
      { text: 'Unlimited classes', included: true },
      { text: '5 days full AI generation access', included: true },
      { text: 'Empty plan & note templates after trial', included: true },
      { text: 'AI Assessments', included: false },
      { text: 'AI Regenerations', included: false },
      { text: 'Export to PDF / Word / PowerPoint', included: false },
    ],
  },
  {
    id: 'pro',
    icon: LuZap,
    name: 'Lumina Pro',
    tagline: 'Full AI power for the everyday educator.',
    price: '₦3,000',
    period: '/ month',
    cta: 'Start Pro Free Trial',
    ctaHref: '/auth/register?plan=pro',
    badge: '⭐ Popular',
    accentColor: '#006D4E',
    highlight: true,
    features: [
      { text: 'Unlimited AI creation', included: true },
      { text: '3 AI regenerations per item', included: true },
      { text: 'Unlimited classes', included: true },
      { text: 'Advanced AI Exam & CA Assessment Generator', included: true },
      { text: 'Export to PDF / Word / PowerPoint', included: true },
      { text: 'Topic-picker for targeted Assessments', included: true },
    ],
  },
  {
    id: 'ultimate',
    icon: LuCrown,
    name: 'Lumina Ultimate',
    tagline: 'For power users who want everything unlimited.',
    price: '₦5,000',
    period: '/ month',
    cta: 'Get Ultimate',
    ctaHref: '/auth/register?plan=ultimate',
    accentColor: '#8B5CF6',
    highlight: false,
    features: [
      { text: 'Unlimited AI everything', included: true },
      { text: 'Unlimited AI regenerations', included: true },
      { text: 'Everything in Pro', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to new features', included: true },
      { text: 'Topic-picker for targeted Assessments', included: true },
    ],
  },
];

export default function PricingClient() {
  return (
    <main className='min-h-0 bg-white relative'>
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
          <motion.div
            className='mb-12 max-w-2xl'
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className='inline-block px-3 py-1 bg-emerald-50 text-[#006c51] text-xs font-bold tracking-widest uppercase rounded-full mb-5 border border-emerald-100'>
              Pricing
            </span>
            <h1 className='text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight'>
              Simple, Transparent <br />
              <span className='text-[#006c51]'>Pricing</span>
            </h1>
            <p className='text-lg text-slate-600 leading-relaxed'>
              Choose the plan that fits you. All paid plans include a free trial
              — no credit card required.
            </p>
          </motion.div>

          {/* Plans — stacked list layout */}
          <motion.div
            className='flex flex-col gap-5 mb-14'
            initial='hidden'
            animate='visible'
            variants={containerVariants}
          >
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className={`relative rounded-3xl border overflow-hidden transition-all duration-300 ${
                    plan.highlight
                      ? 'border-[#006c51]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Coloured top accent bar */}
                  <div
                    className='h-1 w-full'
                    style={{ backgroundColor: plan.accentColor }}
                  />

                  <div className='p-6 sm:p-8'>
                    {/* Badge */}
                    {plan.badge && (
                      <span
                        className='inline-block mb-4 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full text-white'
                        style={{ backgroundColor: plan.accentColor }}
                      >
                        {plan.badge}
                      </span>
                    )}

                    {/* Plan top row: icon + name + price */}
                    <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6'>
                      <div className='flex items-center gap-4'>
                        <div
                          className='size-12 rounded-2xl flex items-center justify-center shrink-0'
                          style={{ backgroundColor: `${plan.accentColor}18` }}
                        >
                          <Icon
                            className='text-2xl'
                            style={{ color: plan.accentColor }}
                          />
                        </div>
                        <div>
                          <h2 className='text-xl font-extrabold text-slate-900'>
                            {plan.name}
                          </h2>
                          <p className='text-sm text-slate-500 leading-snug mt-0.5 max-w-sm'>
                            {plan.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className='sm:text-right shrink-0'>
                        <span
                          className='text-3xl font-black'
                          style={{ color: plan.accentColor }}
                        >
                          {plan.price}
                        </span>
                        <span className='text-sm text-slate-400 ml-1.5'>
                          {plan.period}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className='h-px bg-slate-100 mb-5' />

                    {/* Features grid */}
                    <ul className='grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 mb-7'>
                      {plan.features.map((f) => (
                        <li key={f.text} className='flex items-center gap-2.5 text-sm'>
                          {f.included ? (
                            <span
                              className='shrink-0 size-4 rounded-full flex items-center justify-center'
                              style={{ backgroundColor: `${plan.accentColor}20` }}
                            >
                              <LuCheck
                                className='text-[10px]'
                                style={{ color: plan.accentColor }}
                              />
                            </span>
                          ) : (
                            <span className='shrink-0 size-4 rounded-full bg-slate-100 flex items-center justify-center'>
                              <LuX className='text-[10px] text-slate-400' />
                            </span>
                          )}
                          <span className={f.included ? 'text-slate-700' : 'text-slate-400'}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link
                      href={plan.ctaHref}
                      className='inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:scale-[0.98]'
                      style={{ backgroundColor: plan.accentColor }}
                    >
                      {plan.cta}
                      <LuArrowRight className='text-base' />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* FAQ strip */}
          <motion.section
            className='border-t border-slate-100 pt-10'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h2 className='text-xl font-bold text-slate-900 mb-5'>
              Billing Questions?
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {[
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes. No lock-in contracts — cancel from your account settings at any time.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept card payments and major Nigerian bank transfers via Paystack.',
                },
                {
                  q: 'Is there a free trial on paid plans?',
                  a: 'Yes! Every paid plan comes with a 7-day free trial, no credit card needed.',
                },
                {
                  q: 'Can I switch plans?',
                  a: "Absolutely. Upgrade or downgrade at any time and we'll prorate the difference.",
                },
              ].map(({ q, a }) => (
                <div
                  key={q}
                  className='p-5 rounded-2xl bg-slate-50 border border-slate-100'
                >
                  <p className='text-sm font-bold text-slate-900 mb-1.5'>{q}</p>
                  <p className='text-sm text-slate-500 leading-relaxed'>{a}</p>
                </div>
              ))}
            </div>
            <p className='text-sm text-slate-500 mt-6'>
              More questions?{' '}
              <Link
                href='/faqs'
                className='text-[#006c51] font-semibold hover:underline underline-offset-2'
              >
                Read our FAQs
              </Link>{' '}
              or{' '}
              <Link
                href='/contact'
                className='text-[#006c51] font-semibold hover:underline underline-offset-2'
              >
                contact us directly
              </Link>
              .
            </p>
          </motion.section>
        </article>
      </SiteTwoColumn>
    </main>
  );
}
