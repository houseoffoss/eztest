import Link from 'next/link';
import Image from 'next/image';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';

export const HeroSection = () => {
  return (
    <div className="text-center mb-32 relative">
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-3xl -z-10"></div>

      <Badge className="mb-8">
        <span>✨ Open Source & Self-Hosted</span>
      </Badge>

      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-[1.1]">
        Test management for teams
        <br />
        <span className="text-primary">that prefer shipping over configuring</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
        EZTest brings structure, flow and clarity to all of your testing with zero tolerance for bloat or baggage.
      </p>
      
      <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
        Open Source alternative to Testiny, Testrail, TestLink, Testmo
      </p>

      <div className="flex gap-4 justify-center flex-wrap mb-16">
        <Link href="/auth/register">
          <ButtonPrimary size="lg" className="cursor-pointer" buttonName="Home Page - Hero Section - Get Started">
            Get started free
          </ButtonPrimary>
        </Link>
        <Link href="/auth/login">
          <ButtonSecondary size="lg" className="cursor-pointer" buttonName="Home Page - Hero Section - Sign In">
            Sign in
          </ButtonSecondary>
        </Link>
      </div>

      {/* Screenshot Showcase */}
      <div className="relative max-w-6xl mx-auto mt-20">
        <div className="relative rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl p-4 shadow-2xl">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur opacity-50"></div>
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#0a1628] to-[#0b1028] border border-white/10">
            <Image
              src="/screenshots/Project_Detail_Page.png"
              alt="EZTest Project Management Dashboard"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};
