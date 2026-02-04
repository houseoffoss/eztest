import Link from 'next/link';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';

export const PhilosophySection = () => {
  const gradientStyle = 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';

  return (
    <div className="mb-32">
      <div className="rounded-3xl relative transition-all p-[1px]" style={{ background: gradientStyle }}>
        <div className="relative rounded-3xl h-full" style={{ backgroundColor: '#0a1628' }}>
          <div className="rounded-3xl border-0 bg-transparent overflow-visible transition-all flex flex-col h-full py-16 px-8">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why are you still putting up with
                <br />
                <span className="text-primary">legacy test management tools?</span>
              </h2>
              
              <div className="space-y-6 text-white/90 text-lg md:text-xl leading-relaxed">
                <p>
                  Most test management tools are glorified spreadsheets but charge $19+ per user per month. Why pay premium prices
                  for basic functionality when you can have a modern, open-source solution?
                </p>
                
                <p className="text-primary font-semibold text-xl">
                  Why not use modern tools to build a test management platform that actually works?
                </p>
                
                <p className="text-white/80">
                  The goal isn&apos;t to reinvent the wheel—it&apos;s to break the cycle of mediocre, overpriced software.
                  EZTest brings clarity, structure, and flow to your testing workflow with zero tolerance for bloat.
                </p>
              </div>

              <div className="pt-8">
                <Link href="/auth/register">
                  <ButtonPrimary size="lg" className="cursor-pointer" buttonName="Home Page - Philosophy Section - Get Started">
                    Get started free
                  </ButtonPrimary>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

