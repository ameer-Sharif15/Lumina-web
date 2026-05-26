'use client';

import { white } from '@/assets';
import SiteTwoColumn from '@/components/SiteTwoColumn';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  LuBookOpen,
  LuDownload,
  LuFileText,
  LuGraduationCap,
  LuPencilLine,
  LuSettings2,
  LuSparkles,
  LuArrowRight,
} from 'react-icons/lu';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const steps = [
  {
    number: '01',
    icon: LuGraduationCap,
    title: 'Create Your Class',
    description:
      'Set up your classroom in seconds. Add your student roster and choose your curriculum standard — Nigerian National Curriculum, British Curriculum, or your own custom school guidelines.',
    tag: 'Setup',
    color: '#006c51',
  },
  {
    number: '02',
    icon: LuBookOpen,
    title: 'Select Your Topic',
    description:
      'Type in any subject or topic (e.g., Mathematics, Solar System, Chemistry) or upload a PDF or image of a textbook page to use as source material.',
    tag: 'Input',
    color: '#0284c7',
  },
  {
    number: '03',
    icon: LuSettings2,
    title: 'Customize Style & Tone',
    description:
      'Pick the teaching style that matches your personality: strict, encouraging, visual, technical, or even humorous. Lumina adapts every output to fit your tone perfectly.',
    tag: 'Personalize',
    color: '#7c3aed',
  },
  {
    number: '04',
    icon: LuSparkles,
    title: 'AI Generates Your Content',
    description:
      'Watch Lumina build fully structured lesson plans, notes, AI-generated Exams, and CAs in real-time — all personalized to your class profile and teaching style.',
    tag: 'Generate',
    color: '#d97706',
  },
  {
    number: '05',
    icon: LuPencilLine,
    title: 'Edit & Refine',
    description:
      'Fine-tune every detail. Add your personal touch, custom questions, or ask the Lumina assistant to "make this section more visual" or "add a group activity."',
    tag: 'Refine',
    color: '#059669',
  },
  {
    number: '06',
    icon: LuDownload,
    title: 'Export & Teach',
    description:
      'Download your finished lessons as PowerPoint (PPTX), PDF, or Word (DOCX) and walk into your classroom with total confidence.',
    tag: 'Export',
    color: '#e11d48',
  },
];

const highlights = [
  { label: 'Time to first lesson plan', value: '< 30 sec' },
  { label: 'Curriculum standards', value: '3+' },
  { label: 'Export formats', value: 'PPT, PDF, DOCX' },
  { label: 'Teaching styles', value: '5 modes' },
];

export default function HowItWorksClient() {
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
              How It Works
            </span>
            <h1 className='text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight'>
              Up and running <br />
              <span className='text-[#006c51]'>in minutes.</span>
            </h1>
            <p className='text-lg text-slate-600 leading-relaxed'>
              From class setup to exporting your first AI-powered lesson — here
              are the six simple steps to classroom success with Lumina.
            </p>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14'
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            {highlights.map((h) => (
              <div
                key={h.label}
                className='p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center'
              >
                <p className='text-lg font-black text-[#006c51] mb-0.5'>{h.value}</p>
                <p className='text-[11px] text-slate-500 font-semibold leading-tight'>{h.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Steps */}
          <motion.div
            className='flex flex-col gap-5 mb-14'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-60px' }}
            variants={containerVariants}
          >
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === steps.length - 1;
              return (
                <motion.div key={step.number} variants={itemVariants} className='relative flex gap-0'>
                  {/* Left: number + connector line */}
                  <div className='flex flex-col items-center mr-5 shrink-0'>
                    <div
                      className='size-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shrink-0 z-10'
                      style={{ backgroundColor: step.color }}
                    >
                      {step.number}
                    </div>
                    {!isLast && (
                      <div className='w-px flex-1 mt-2' style={{ backgroundColor: `${step.color}30`, minHeight: '24px' }} />
                    )}
                  </div>

                  {/* Right: card */}
                  <div className='flex-1 pb-5'>
                    <div className='p-6 bg-white rounded-3xl border border-slate-200 hover:border-slate-300 transition-colors duration-200 group'>
                      <div className='flex items-start gap-4'>
                        <div
                          className='size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5'
                          style={{ backgroundColor: `${step.color}15` }}
                        >
                          <Icon className='text-xl' style={{ color: step.color }} />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-3 mb-1.5'>
                            <h2 className='text-base font-bold text-slate-900'>
                              {step.title}
                            </h2>
                            <span
                              className='px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider'
                              style={{ backgroundColor: `${step.color}15`, color: step.color }}
                            >
                              {step.tag}
                            </span>
                          </div>
                          <p className='text-sm text-slate-500 leading-relaxed'>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA section */}
          <motion.section
            className='border-t border-slate-100 pt-10'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className='flex items-start gap-4 mb-7'>
              <LuFileText className='text-2xl text-[#006c51] mt-0.5 shrink-0' />
              <div>
                <h3 className='text-lg font-bold text-slate-900 mb-1'>
                  Ready to save hours every week?
                </h3>
                <p className='text-sm text-slate-500 leading-relaxed'>
                  Join thousands of educators already using Lumina to generate
                  lesson plans, notes, and assessments in seconds.
                </p>
              </div>
            </div>
            <div className='flex flex-col sm:flex-row gap-3'>
              <Link
                href='/auth/register'
                className='inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#006c51] text-white font-bold rounded-2xl hover:bg-[#00523e] transition-colors text-sm'
              >
                Get Started Free
                <LuArrowRight className='text-base' />
              </Link>
              <Link
                href='/features'
                className='inline-flex items-center justify-center gap-2 px-7 py-4 bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold rounded-2xl transition-colors text-sm'
              >
                Explore Features
              </Link>
            </div>
          </motion.section>

        </article>
      </SiteTwoColumn>
    </main>
  );
}
