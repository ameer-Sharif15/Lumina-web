'use client';

import Image from 'next/image';
import HeroLeft from './HeroLeft';
import HeroRight from './HeroRight';
import LegalFooterNav from './LegalFooterNav';
import LightRays from './LightRays';
import Silk from './Silk';

export default function Hero() {
  return (
    <section className='relative min-h-dvh lg:min-h-screen flex items-stretch justify-center bg-background'>
      <div className='relative z-10 w-full lg:min-h-screen lg:h-screen flex flex-col lg:flex-row gap-2 items-stretch p-1 sm:p-2'>
        {/* Left Side — solid brand blue (sole column on small screens) */}
        <div className='flex flex-1 flex-col min-h-0 lg:min-h-0 md:rounded-3xl py-8 px-4 sm:py-12 sm:px-6 lg:py-20 lg:px-12 relative overflow-hidden bg-[#006c51] max-lg:min-h-dvh'>
          {/* LightRays Background */}
          <div
            className='absolute inset-0 w-full h-full'
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
          {/* Lumina — lower watermark (above rays, below content) */}
          <div
            aria-hidden
            className='pointer-events-none absolute inset-x-0 bottom-0 z-[1] flex w-full items-end'
          >
            <Image
              src='/logo.png'
              alt=''
              width={512}
              height={512}
              sizes='100vw'
              className='h-[92vh] sm:h-[110vh] lg:h-[135vh] w-full max-w-none origin-bottom scale-[1.08] object-contain object-bottom opacity-[0.07] select-none translate-y-[40%] sm:translate-y-[44%] lg:translate-y-[48%]'
            />
          </div>
          {/* Content — flex-1 + justify-center so mobile fills viewport and centers vertically */}
          <div className='relative z-10 flex w-full flex-1 flex-col justify-center min-h-0'>
            <HeroLeft />
          </div>
          <LegalFooterNav />
        </div>

        {/* Right Side — desktop / large screens only */}
        <div className='hidden lg:flex lg:flex-1 rounded-3xl py-8 px-4 sm:py-12 sm:px-6 lg:py-20 lg:px-12 relative overflow-hidden min-h-0 flex-col'>
          {/* Silk Background */}
          <div className='absolute inset-0'>
            <Silk
              speed={5}
              scale={1}
              color='#006c51'
              noiseIntensity={1.5}
              rotation={0}
            />
          </div>

          {/* Phone Mockup */}
          <div className='relative z-10 w-full h-full flex-1'>
            <HeroRight />
          </div>
        </div>
      </div>
    </section>
  );
}
