import Image from 'next/image';
import Link from 'next/link';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';

export const PhilosophySection = () => {
  return (
    <section
      aria-labelledby="philosophy-heading"
      className="relative mb-16 overflow-hidden bg-black"
    >
      {/* Background image - full width, blending with gradients on top */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/screenshots/philosophy_background.png"
          alt="EZTest interface background"
          fill
          priority
          className="object-cover opacity-70"
        />
      </div>

      {/* Radial blue glow - positioned behind card area, covering full card including top */}
      <div
        className="pointer-events-none absolute right-0 top-[42%] z-[4] h-[1900px] w-[1100px] -translate-y-1/2 translate-x-[3%] opacity-[0.38]"
        style={{
          background:
            'radial-gradient(100% 100% at 77.21% 100%, #2563EE 0%, #000000 100%)',
          backdropFilter: 'blur(480.6px)',
        }}
      />

      {/* Linear (top & bottom) + horizontal gradient overlay above image, below content */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.85) 25%, rgba(0, 0, 0, 0.08) 45%, rgba(0, 0, 0, 0) 75%), linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 18%, rgba(0, 0, 0, 0.0) 55%), linear-gradient(90deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 18%, rgba(0, 0, 0, 0.08) 35%, rgba(0, 0, 0, 0.0) 55%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[520px] max-w-[1440px] flex-col justify-between px-6 py-16 sm:px-10 lg:px-20 lg:py-24">
        {/* Top-left heading + CTA */}
        <div className="max-w-3xl text-left text-white">
          <h2
            id="philosophy-heading"
            className="text-[28px] font-semibold leading-[36px] tracking-[0.01em] text-white sm:text-[32px] sm:leading-[40px] lg:text-[40px] lg:leading-[48px]"
          >
            The goal isn&apos;t to reinvent the wheel it&apos;s to break the cycle of mediocre, overpriced software
          </h2>

            <div className="mt-8">
              <Link href="/auth/register">
                <ButtonPrimary
                  size="lg"
                  className="cursor-pointer"
                  buttonName="Home Page - Philosophy Section - Get Started"
                >
                  Get started
                </ButtonPrimary>
              </Link>
            </div>
        </div>

        {/* Our Philosophy card - bottom right on larger screens */}
        <div className="mt-12 flex w-full justify-center lg:mt-0 lg:justify-end">
          <div className="relative z-20 w-full max-w-[500px] rounded-[20.6px] border border-[#BAB8B8]/60 border-b-0 bg-[rgba(13,13,13,0.04)] px-[32px] py-[40px] backdrop-blur-2xl">
              <div className="mb-6 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <span className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>

              <h3 className="mb-6 text-[35.26px] font-semibold leading-[35.26px] tracking-[0.2px] text-white">
                Our Philosophy
              </h3>

              <div className="space-y-4 text-[18px] leading-[35.26px] tracking-[0.2px] text-white">
                <p className="bg-transparent">
                  Most test management tools are glorified spreadsheets but
                  charge a minimum of $19 per user per month. ChatGPT & Claude are cheaper. So we decided to build a Test Management tool from scratch using AI Coding Agents
                </p>

                <p className="bg-transparent text-[#CBCBCB]">
                  Why not use modern tools to build a test management platform
                  that actually works?
                </p>

                <p className="bg-transparent">
                  The goal isn&apos;t to reinvent the wheel it&apos;s to break
                  the cycle of mediocre, overpriced software. EZTest brings
                  clarity, structure, and flow to your testing workflow with zero
                  tolerance for bloat.
                </p>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
};

