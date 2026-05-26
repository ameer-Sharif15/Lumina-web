'use client';

import { hero } from '@/assets';
import Iphone15Pro from '@/components/ui/shadcn-io/iphone-15-pro';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function PhoneMockup() {
  return (
    <div className='flex items-center justify-center h-full'>
      <motion.div
        className='relative'
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      >
        <Image
          src={hero}
          alt='hero'
          width={1200}
          height={1200}
          className='h-[300px] sm:h-[400px] md:h-[580px] lg:h-[640px] xl:h-[720px] w-auto'
        />
      </motion.div>
    </div>
  );
}
