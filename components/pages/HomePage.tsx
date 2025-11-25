'use client';

import Link from 'next/link';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { ButtonSecondary } from '@/elements/button-secondary';
import { Navbar } from '@/components/design/Navbar';
import { GlassFooter } from '@/components/design/GlassFooter';
import { HeroSection } from './subcomponents/HeroSection';
import { FeaturesGrid } from './subcomponents/FeaturesGrid';
import { StatsSection } from './subcomponents/StatsSection';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Why Choose?', href: '#why-choose' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={navItems}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <ButtonSecondary className="cursor-pointer">
                Sign in
              </ButtonSecondary>
            </Link>
            <Link href="/auth/register">
              <ButtonPrimary className="cursor-pointer">
                Get started
              </ButtonPrimary>
            </Link>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <HeroSection />
        <div id="features">
          <FeaturesGrid />
        </div>
        <div id="why-choose">
          <StatsSection />
        </div>
      </div>

      <GlassFooter />
    </div>
  );
}
