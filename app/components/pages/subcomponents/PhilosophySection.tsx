import Image from 'next/image';
import Link from 'next/link';

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
        className="pointer-events-none absolute right-0 top-[42%] z-[4] h-[1200px] sm:h-[1500px] md:h-[1900px] w-[600px] sm:w-[800px] md:w-[1100px] -translate-y-1/2 translate-x-[3%] opacity-[0.38]"
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
      <div className="relative z-10 mx-auto flex min-h-[400px] sm:min-h-[520px] max-w-[1440px] flex-col justify-between px-4 sm:px-6 md:px-10 lg:px-20 py-12 sm:py-16 lg:py-24">
        {/* Top-left heading + CTA */}
        <div className="max-w-3xl text-left text-white">
          <h2
            id="philosophy-heading"
            className="text-[24px] sm:text-[28px] font-semibold leading-[32px] sm:leading-[36px] tracking-[0.01em] text-white md:text-[32px] md:leading-[40px] lg:text-[40px] lg:leading-[48px]"
          >
            The goal isn&apos;t to reinvent the wheel it&apos;s to break the cycle of mediocre, overpriced software
          </h2>

            <div className="mt-6 sm:mt-8">
              <Link href="/auth/register">
                <div 
                  className="inline-flex items-center relative rounded-[100px] transition-all cursor-pointer"
                  style={{
                    height: '52px',
                    backgroundColor: 'rgba(51, 51, 51, 0.10)',
                    paddingTop: '6px',
                    paddingRight: '10px',
                    paddingBottom: '6px',
                    paddingLeft: '10px',
                    gap: '10px',
                    backdropFilter: 'blur(40px)',
                    boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(51, 51, 51, 0.32)';
                    e.currentTarget.style.boxShadow = '0 18px 45px -18px rgba(0, 0, 0, 0.95)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(51, 51, 51, 0.10)';
                    e.currentTarget.style.boxShadow = '0 10px 30px -12px rgba(0, 0, 0, 0.6)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    className="absolute -inset-[1px] rounded-[100px] pointer-events-none -z-10"
                    style={{
                      background: 'conic-gradient(from 339deg, rgba(255, 255, 255, 0.4) 0deg, rgba(255, 255, 255, 0.4) 70deg, rgba(255, 255, 255, 0.05) 90deg, rgba(255, 255, 255, 0.4) 120deg, rgba(255, 255, 255, 0.4) 240deg, rgba(255, 255, 255, 0.05) 270deg, rgba(255, 255, 255, 0.4) 360deg)',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'exclude',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      padding: '1px',
                    }}
                  />
                  <span 
                    className="relative z-10 px-4 py-2 transition-colors cursor-pointer"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '21.85px',
                      letterSpacing: '0.27px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      background: 'linear-gradient(94.37deg, #3291FF 11.75%, #405998 88.32%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    Get started
                  </span>
                </div>
              </Link>
            </div>
        </div>

        {/* Our Philosophy card - bottom right on larger screens */}
        <div className="mt-8 sm:mt-12 flex w-full justify-center lg:mt-0 lg:justify-end">
          <div className="relative z-20 w-full max-w-[500px] rounded-[16px] sm:rounded-[20.6px] border border-[#BAB8B8]/60 border-b-0 bg-[rgba(13,13,13,0.04)] px-4 sm:px-6 md:px-[32px] py-6 sm:py-8 md:py-[40px] backdrop-blur-2xl">
              <div className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2">
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#28C840]" />
              </div>

              <h3 className="mb-4 sm:mb-6 text-[24px] sm:text-[28px] md:text-[35.26px] font-semibold leading-[1.2] sm:leading-[35.26px] tracking-[0.2px] text-white">
                Our Philosophy
              </h3>

              <div className="space-y-3 sm:space-y-4 text-[14px] sm:text-[16px] md:text-[18px] leading-[1.6] sm:leading-[1.8] md:leading-[35.26px] tracking-[0.2px] text-white">
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

