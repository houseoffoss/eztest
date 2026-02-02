'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { GlassFooter } from '@/frontend/reusable-components/layout/GlassFooter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/frontend/reusable-elements/tabs/Tabs';
import { HeroSection } from './subcomponents/HeroSection';
import { PhilosophySection } from './subcomponents/PhilosophySection';
import { FeaturesGrid } from './subcomponents/FeaturesGrid';
import { StatsSection } from './subcomponents/StatsSection';
import { useAnalytics } from '@/hooks/useAnalytics';
// import { ProductShowcaseSection } from './subcomponents/ProductShowcaseSection';

const navItems = [
  { label: 'Why Choose?', href: '#why-choose' },
];

export default function HomePage() {
  const [stars, setStars] = useState<number | null>(null);
  const { trackButton } = useAnalytics();

  useEffect(() => {
    // Fetch GitHub stars count
    fetch('https://api.github.com/repos/houseoffoss/eztest')
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // Silently fail if API request fails
        setStars(null);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={navItems}
        breadcrumbs={
          <>
            <a
              href="https://github.com/houseoffoss/eztest"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl px-3 py-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/5 text-white transition-colors hover:text-white/80"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Star on GitHub</span>
              {stars !== null && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold">{stars.toLocaleString()}</span>
                </span>
              )}
            </a>
            <Link
              href="/houseoffoss"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl px-3 py-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/5 text-white transition-colors hover:text-white/80"
              onClick={async () => {
                // Track analytics event
                await trackButton('Home Page - Self Host with House Of FOSS', { source: 'navbar' });
              }}
            >
              <span className="text-sm">Self host in minutes with</span>
              <Image
                src="/houseoffoss.jpg"
                alt="House Of FOSS"
                width={24}
                height={24}
                className="h-6 w-6 rounded object-cover"
              />
            </Link>
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <ButtonSecondary className="cursor-pointer" buttonName="Home Page - Navbar - Sign In">
                Sign in
              </ButtonSecondary>
            </Link>
            <Link href="/auth/register">
              <ButtonPrimary className="cursor-pointer" buttonName="Home Page - Navbar - Get Started">
                Get started
              </ButtonPrimary>
            </Link>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <HeroSection />
        
        {/* Tab Navigation */}
        {/* <div className="mb-16 flex justify-center">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList variant="glass" className="mx-auto h-12 px-1">
              <TabsTrigger value="overview" className="px-6 text-base font-medium">Overview</TabsTrigger>
              <TabsTrigger value="features" className="px-6 text-base font-medium">Features</TabsTrigger>
              <TabsTrigger value="why-choose" className="px-6 text-base font-medium">Why Choose</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-12">
              <div className="space-y-32">
                <StatsSection />
                <PhilosophySection />
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="mt-12">
              <div id="features" className="scroll-mt-24">
                <ProductShowcaseSection />
              </div>
            </TabsContent>
            
            <TabsContent value="why-choose" className="mt-12"> */}
              <div id="why-choose" className="scroll-mt-24">
                <FeaturesGrid />
              </div>
            {/* </TabsContent>
          </Tabs>
        </div> */}
                <PhilosophySection />

      </div>

      <GlassFooter />
    </div>
  );
}
