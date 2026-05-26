'use client';

import { white } from '@/assets';
import SiteTwoColumn from '@/components/SiteTwoColumn';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  LuBookOpen,
  LuCpu,
  LuFilePenLine,
  LuGauge,
  LuGraduationCap,
  LuLibrary,
  LuSparkles,
  LuUsers,
  LuZap,
} from 'react-icons/lu';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function FeaturesClient() {
  return (
    <main className='min-h-0 bg-white relative '>
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
            className='mb-16 max-w-4xl'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className='text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight'>
              Intelligence for <br />
              <span className='text-[#006c51]'>Every Classroom Task</span>
            </h1>
            <p className='text-lg text-slate-600 leading-relaxed max-w-2xl'>
              Discover how Lumina AI empowers educators to save hours and
              personalize learning with state-of-the-art AI models designed
              specifically for education.
            </p>
          </motion.div>

          {/* Section 1: Core Ecosystem */}
          <motion.section
            className='mb-28'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className='mb-10'>
              <span className='inline-block px-3 py-1 bg-emerald-50 text-[#006c51] text-xs font-bold tracking-widest uppercase rounded-full mb-4 border border-emerald-100'>
                Our Ecosystem
              </span>
              <h2 className='text-3xl font-bold text-slate-900 tracking-tight mb-4'>
                Powerful Tools for the Modern Educator
              </h2>
            </motion.div>

            <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8'>
              {/* Feature 1 */}
              <motion.div
                variants={itemVariants}
                className='group p-8 bg-slate-50/50 rounded-3xl border border-slate-200 hover:border-[#006c51]/30 hover:bg-emerald-50/20 transition-all duration-300'
              >
                <div className='size-12 rounded-xl bg-[#006c51] text-white flex items-center justify-center mb-6'>
                  <LuBookOpen className='text-2xl' />
                </div>
                <div className='flex items-center gap-3 mb-3'>
                  <h3 className='text-xl font-bold text-slate-900'>
                    AI Lesson Plan Generator
                  </h3>
                  {/* \\\<span className='px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full uppercase tracking-wider'>
                    Most Loved
                  </span>\\\\ */}
                </div>
                <p className='text-slate-600 leading-relaxed text-sm sm:text-base'>
                  Input your curriculum requirements and get a fully structured,
                  multi-modal lesson plan in 30 seconds. Includes specific
                  learning objectives, resource requirements, and teaching aids
                  perfectly tailored to your class.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                variants={itemVariants}
                className='group p-8 bg-slate-50/50 rounded-3xl border border-slate-200 hover:border-[#006c51]/30 hover:bg-emerald-50/20 transition-all duration-300'
              >
                <div className='size-12 rounded-xl bg-slate-200 text-[#006c51] flex items-center justify-center mb-6 group-hover:bg-[#006c51] group-hover:text-white transition-colors duration-300'>
                  <LuGraduationCap className='text-2xl' />
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3'>
                  AI Exam &amp; CA Assessment Generator
                </h3>
                <p className='text-slate-600 leading-relaxed text-sm sm:text-base'>
                  Instantly generate comprehensive Exams and Continuous
                  Assessments (CAs) using AI. It strictly bases questions on the
                  lesson plans and class notes you've generated over time.
                  Simply select the topics to cover, and Lumina handles the
                  rest.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                variants={itemVariants}
                className='group p-8 bg-slate-50/50 rounded-3xl border border-slate-200 hover:border-[#006c51]/30 hover:bg-emerald-50/20 transition-all duration-300'
              >
                <div className='size-12 rounded-xl bg-slate-200 text-[#006c51] flex items-center justify-center mb-6 group-hover:bg-[#006c51] group-hover:text-white transition-colors duration-300'>
                  <LuFilePenLine className='text-2xl' />
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3'>
                  AI Lesson Notes
                </h3>
                <p className='text-slate-600 leading-relaxed text-sm sm:text-base'>
                  Dictate or type brief reflections after a class session.
                  Lumina organizes your raw observations into highly structured,
                  professional student progress notes.
                </p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                variants={itemVariants}
                className='group p-8 bg-slate-50/50 rounded-3xl border border-slate-200 hover:border-[#006c51]/30 hover:bg-emerald-50/20 transition-all duration-300'
              >
                <div className='size-12 rounded-xl bg-slate-200 text-[#006c51] flex items-center justify-center mb-6 group-hover:bg-[#006c51] group-hover:text-white transition-colors duration-300'>
                  <LuLibrary className='text-2xl' />
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3'>
                  Smart Resource Hub
                </h3>
                <p className='text-slate-600 leading-relaxed text-sm sm:text-base'>
                  Never spend hours searching for supplemental assets. Lumina
                  suggests curated digital assets, videos, activities, and
                  reading lists automatically based on the exact topic of your
                  lesson plan.
                </p>
              </motion.div>
            </div>
          </motion.section>

          {/* Section 2: Adaptive Learning */}
          <motion.section
            className='mb-28'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className='mb-10'>
              <span className='inline-block px-3 py-1 bg-emerald-50 text-[#006c51] text-xs font-bold tracking-widest uppercase rounded-full mb-4 border border-emerald-100'>
                Adaptive Intelligence
              </span>
              <h2 className='text-3xl font-bold text-slate-900 mb-4 tracking-tight'>
                AI That Learns Your Students&apos; Pace
              </h2>
              <p className='text-lg text-slate-600 leading-relaxed max-w-2xl'>
                Lumina doesn&apos;t just generate generic templates. It adapts
                to the unique requirements and academic capabilities of every
                single classroom, adjusting strategies so no child is left
                behind.
              </p>
            </motion.div>

            <div className='flex flex-col gap-4'>
              <motion.div
                variants={itemVariants}
                className='flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 bg-white rounded-3xl border border-slate-200 hover:border-[#006c51]/30 transition-all duration-300'
              >
                <div className='shrink-0 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center'>
                  <LuUsers className='text-3xl text-[#006c51]' />
                </div>
                <div>
                  <h4 className='text-lg font-bold text-slate-900 mb-1'>
                    Personalized Styles
                  </h4>
                  <p className='text-sm text-slate-600 leading-relaxed'>
                    Adapt the system output to match your strict, encouraging,
                    visual, or humorous teaching tone effortlessly.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className='flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 bg-white rounded-3xl border border-slate-200 hover:border-[#006c51]/30 transition-all duration-300'
              >
                <div className='shrink-0 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center'>
                  <LuSparkles className='text-3xl text-[#006c51]' />
                </div>
                <div>
                  <h4 className='text-lg font-bold text-slate-900 mb-1'>
                    Diverse Needs
                  </h4>
                  <p className='text-sm text-slate-600 leading-relaxed'>
                    Automatically generate differentiated materials tailored for
                    slow learners, steady learners, and gifted students alike.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className='flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 bg-white rounded-3xl border border-slate-200 hover:border-[#006c51]/30 transition-all duration-300'
              >
                <div className='shrink-0 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center'>
                  <LuGauge className='text-3xl text-[#006c51]' />
                </div>
                <div>
                  <h4 className='text-lg font-bold text-slate-900 mb-1'>
                    Real-time Feedback
                  </h4>
                  <p className='text-sm text-slate-600 leading-relaxed'>
                    Refine generated content based on previous lesson
                    performance data dynamically and automatically over time.
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className='flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 bg-white rounded-3xl border border-slate-200 hover:border-[#006c51]/30 transition-all duration-300'
              >
                <div className='shrink-0 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center'>
                  <LuGraduationCap className='text-3xl text-[#006c51]' />
                </div>
                <div>
                  <h4 className='text-lg font-bold text-slate-900 mb-1'>
                    Smart AI Assessments
                  </h4>
                  <p className='text-sm text-slate-600 leading-relaxed'>
                    Generate Exams and CAs based on the lesson plans and notes
                    you've accumulated over time. Just select the topics to
                    cover, and targeted assessments are instantly created!
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Section 3: One Lesson, Thirty Personalities */}
          <motion.section
            className='mb-16'
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '100px' }}
            variants={containerVariants}
          >
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-16 items-start'>
              <motion.div variants={itemVariants}>
                <h2 className='text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]'>
                  One Lesson, <br />
                  <span className='text-[#006c51]'>Thirty Personalities.</span>
                </h2>
                <p className='text-lg text-slate-600 leading-relaxed mb-10'>
                  Lumina doesn&apos;t just create content; it structures it
                  dynamically for your students. Differentiate lessons in
                  seconds with unparalleled precision.
                </p>

                <div className='flex flex-col gap-4'>
                  <Link
                    href='/auth/register'
                    className='w-full px-8 py-4 text-center bg-[#006c51] text-white font-bold rounded-2xl hover:bg-[#00523e] transition-colors text-sm'
                  >
                    Start Using Lumina AI
                  </Link>
                  <Link
                    href='/pricing'
                    className='w-full px-8 py-4 text-center bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold rounded-2xl transition-colors text-sm'
                  >
                    View Pricing Plans
                  </Link>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className='space-y-4'>
                <div className='flex items-start gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-amber-200 transition-colors'>
                  <div className='size-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0'>
                    <LuZap className='text-amber-600 text-2xl' />
                  </div>
                  <div>
                    <strong className='text-slate-900 text-lg block mb-1'>
                      Fast Learners
                    </strong>
                    <span className='text-sm text-slate-600 leading-relaxed block'>
                      Automatically append advanced enrichment, deep-dive
                      activities, and extra-credit projects to keep them
                      engaged.
                    </span>
                  </div>
                </div>

                <div className='flex items-start gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors'>
                  <div className='size-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0'>
                    <LuBookOpen className='text-blue-600 text-2xl' />
                  </div>
                  <div>
                    <strong className='text-slate-900 text-lg block mb-1'>
                      Steady Learners
                    </strong>
                    <span className='text-sm text-slate-600 leading-relaxed block'>
                      Use structured reinforcement, interactive guides, and
                      standardized exercises to ensure foundational
                      understanding.
                    </span>
                  </div>
                </div>

                <div className='flex items-start gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-emerald-200 transition-colors'>
                  <div className='size-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0'>
                    <LuUsers className='text-emerald-600 text-2xl' />
                  </div>
                  <div>
                    <strong className='text-slate-900 text-lg block mb-1'>
                      Inclusive Learning
                    </strong>
                    <span className='text-sm text-slate-600 leading-relaxed block'>
                      Instantly translate lessons into simplified visual aids,
                      repetitive prompts, and accessible reading structures.
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>
        </article>
      </SiteTwoColumn>
    </main>
  );
}
