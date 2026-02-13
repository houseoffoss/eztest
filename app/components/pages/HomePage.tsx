'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { GlassFooter } from '@/frontend/reusable-components/layout/GlassFooter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/frontend/reusable-elements/tabs/Tabs';
import { HeroSection } from './subcomponents/HeroSection';
import { HowEzTestWorksSection } from './subcomponents/HowEzTestWorksSection';
import { UnifiedTraceabilitySection } from './subcomponents/UnifiedTraceabilitySection';
import { PhilosophySection } from './subcomponents/PhilosophySection';
import { FeaturesGrid } from './subcomponents/FeaturesGrid';
import { StatsSection } from './subcomponents/StatsSection';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ProductShowcaseSection } from './subcomponents/ProductShowcaseSection';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Why Choose?', href: '#why-choose' },
];

export default function HomePage() {
  const [stars, setStars] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('features');
  const activeTabRef = useRef(activeTab);
  const hasInitializedRef = useRef(false);
  const isUserTabChangeRef = useRef(false);
  const { trackButton } = useAnalytics();

  // Keep ref in sync with state
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Wrapper for setActiveTab to track user-initiated changes
  const handleTabChange = (value: string) => {
    isUserTabChangeRef.current = true;
    setActiveTab(value);
  };

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

  // Track if scroll should happen (only when coming from navbar, not direct tab clicks)
  const [shouldScroll, setShouldScroll] = useState(false);
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false);

  // Handle hash changes to switch tabs (from navbar clicks)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove #
      if (hash === 'overview' || hash === 'features' || hash === 'why-choose') {
        // Only scroll if switching to a different tab
        if (hash !== activeTabRef.current) {
          setShouldScroll(true); // Mark that we should scroll
          setActiveTab(hash);
        } else {
          // Tab is already active, just scroll to it without changing state
          setShouldScroll(true);
        }
        setShouldScrollToTop(false); // Don't scroll to top if we have a hash
      } else if (!hash) {
        // If no hash, default to features and scroll to top
        setActiveTab('features');
        setShouldScroll(false); // Don't scroll to tabs
        setShouldScrollToTop(true); // Scroll to top instead
      }
    };

    // Handle clicks on anchor links in navbar
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement;
      if (link && link.hash) {
        const hash = link.hash.slice(1);
        if (hash === 'overview' || hash === 'features' || hash === 'why-choose') {
          // Only handle if it's a different tab
          if (hash !== activeTabRef.current) {
            e.preventDefault();
            e.stopPropagation();
            // Immediately switch tab and set scroll flag
            setShouldScroll(true);
            setActiveTab(hash);
            // Update URL
            window.history.pushState(null, '', link.hash);
          } else {
            // Tab is already active, just scroll to it
            e.preventDefault();
            e.stopPropagation();
            setShouldScroll(true);
            // Update URL
            window.history.pushState(null, '', link.hash);
          }
        }
      }
    };

    // Check initial hash on mount
    handleHashChange();
    
    // If no hash on initial mount, scroll to top and clear any hash
    if (!window.location.hash) {
      setShouldScrollToTop(true);
      // Clear any hash that might be in the URL
      window.history.replaceState(null, '', window.location.pathname);
    }
    
    // Mark as initialized after checking initial hash
    hasInitializedRef.current = true;

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    // Use capture phase to catch clicks early
    document.addEventListener('click', handleLinkClick, true);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, []);

  // Scroll to top when navigating to home page without hash
  useEffect(() => {
    if (shouldScrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShouldScrollToTop(false);
    }
  }, [shouldScrollToTop]);

  // Scroll to section when tab becomes active (only if shouldScroll is true)
  useEffect(() => {
    if (shouldScroll && activeTab) {
      // Wait for tab content to be visible and rendered
      let retryCount = 0;
      const maxRetries = 20; // Maximum retries (2 seconds total)
      
      const scrollToSection = () => {
        // Find the tab container (the div containing the Tabs component)
        const tabContainer = document.querySelector('[data-slot="tabs"]')?.parentElement;
        
        // Also check if the tab content is actually visible (Radix UI might hide it initially)
        const tabContent = document.querySelector(`[data-state="active"][data-slot="tabs-content"]`);
        const contentElement = document.getElementById(activeTab);
        
        // Check if tab content is rendered and visible
        const isContentReady = tabContent && contentElement && 
          (tabContent as HTMLElement).offsetHeight > 0;
        
        if (tabContainer && isContentReady) {
          // Get the tab container's position relative to the document
          const rect = tabContainer.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const absoluteTop = rect.top + scrollTop;
          
          // Offset to position tab component below the navbar (accounting for navbar height)
          const yOffset = 150; // Offset to position tab component below the top
          
          // Check if the tab container is already properly positioned in viewport
          // The container should be visible with at least yOffset pixels from the top of viewport
          const containerTopInViewport = rect.top;
          const isAlreadyVisible = containerTopInViewport >= (yOffset - 30) && 
                                   containerTopInViewport <= (yOffset + 30);
          
          if (!isAlreadyVisible) {
            // Calculate target scroll position
            let targetY = absoluteTop - yOffset;
            // Ensure we don't scroll to negative position
            targetY = Math.max(0, targetY);
            
            // Only scroll if we're not already at the right position (with some tolerance)
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            if (Math.abs(currentScroll - targetY) > 50) {
              window.scrollTo({ top: targetY, behavior: 'smooth' });
            }
          }
          setShouldScroll(false); // Reset scroll flag
        } else if (retryCount < maxRetries) {
          // Retry if content not ready yet
          retryCount++;
          setTimeout(scrollToSection, 100);
        } else {
          // Fallback: try to scroll anyway after max retries
          if (tabContainer) {
            const rect = tabContainer.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const absoluteTop = rect.top + scrollTop;
            const yOffset = 150;
            let targetY = absoluteTop - yOffset;
            // Ensure we don't scroll to negative position
            targetY = Math.max(0, targetY);
            window.scrollTo({ top: targetY, behavior: 'smooth' });
          }
          setShouldScroll(false);
        }
      };
      
      // Initial delay to ensure tab starts rendering
      setTimeout(scrollToSection, 300);
    }
  }, [activeTab, shouldScroll]);

  // Update hash when tab changes via tab clicks (without scrolling)
  // Only update hash if user clicked a tab directly, not on initial mount
  useEffect(() => {
    // Don't set hash on initial mount if there was no hash
    if (!hasInitializedRef.current) {
      return;
    }
    
    // Only update hash if this was a user-initiated tab change
    if (activeTab && !shouldScroll && isUserTabChangeRef.current) {
      const currentHash = window.location.hash.slice(1);
      if (currentHash !== activeTab) {
        // Update hash when user clicks a tab directly
        window.history.replaceState(null, '', `#${activeTab}`);
      }
      // Reset the flag after handling
      isUserTabChangeRef.current = false;
    }
  }, [activeTab, shouldScroll]);

  return (
    <div className="min-h-screen bg-[#050608]">
      <Navbar
        variant="marketing"
        brandLabel={
          <div 
            className="flex items-center justify-center rounded-[59.79px] backdrop-blur-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] p-[1px] relative transition-all"
            style={{
              width: '52px',
              height: '52px',
              background: 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)',
            }}
          >
            <div className="flex items-center justify-center w-full h-full rounded-[59.79px]" style={{ backgroundColor: '#050608' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <rect width="24" height="24" fill="url(#pattern0_105_611)" />
                <defs>
                  <pattern
                    id="pattern0_105_611"
                    patternContentUnits="objectBoundingBox"
                    width="1"
                    height="1"
                  >
                    <use
                      xlinkHref="#image0_105_611"
                      transform="scale(0.03125 0.0344828)"
                    />
                  </pattern>
                  <image
                    id="image0_105_611"
                    width="32"
                    height="29"
                    preserveAspectRatio="none"
                    xlinkHref="data:image/png;base64,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"
                  />
                </defs>
              </svg>
            </div>
          </div>
        }
        items={navItems.map(item => ({
          ...item,
          href: item.href,
        }))}
        breadcrumbs={
          <>
            <a
              href="https://github.com/houseoffoss/eztest"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm rounded-full transition-colors cursor-pointer text-white/80 hover:text-white hover:bg-white/8 inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span>GitHub</span>
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
              className="px-4 py-2 text-sm rounded-full transition-colors cursor-pointer text-white/80 hover:text-white hover:bg-white/8 inline-flex items-center gap-2"
              onClick={async () => {
                // Track analytics event
                await trackButton('Home Page - Self Host with House Of FOSS', { source: 'navbar' });
              }}
            >
              <span>Self host with</span>
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

      <div className="bg-gradient-to-b from-[#050608] via-black to-[#050608]">
        {/* Hero wrapper - shares same background as navbar */}
        <div className="pt-24 pb-20">
          <HeroSection />
        </div>
      </div>

      <div className="pb-20">
        <HowEzTestWorksSection />
      </div>

      <div className="pb-20">
        <UnifiedTraceabilitySection />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mt-24 mb-16 flex justify-center">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList variant="glass" className="mx-auto h-12 px-1 !rounded-full !border-white/10 !bg-white/5 !backdrop-blur-2xl !shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] !ring-1 !ring-white/5">
              <TabsTrigger value="overview" className="px-6 text-base font-medium !rounded-full data-[state=active]:!bg-white/12 data-[state=active]:!text-white data-[state=active]:!shadow-inner text-white/80 hover:!text-white hover:!bg-white/8">Overview</TabsTrigger>
              <TabsTrigger value="features" className="px-6 text-base font-medium !rounded-full data-[state=active]:!bg-white/12 data-[state=active]:!text-white data-[state=active]:!shadow-inner text-white/80 hover:!text-white hover:!bg-white/8">Features</TabsTrigger>
              <TabsTrigger value="why-choose" className="px-6 text-base font-medium !rounded-full data-[state=active]:!bg-white/12 data-[state=active]:!text-white data-[state=active]:!shadow-inner text-white/80 hover:!text-white hover:!bg-white/8">Why Choose</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-12">
              <div id="overview" className="scroll-mt-24 space-y-32">
                <StatsSection />
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="mt-12">
              <div id="features" className="scroll-mt-24">
                <ProductShowcaseSection />
              </div>
            </TabsContent>
            
            <TabsContent value="why-choose" className="mt-12">
              <div id="why-choose" className="scroll-mt-24">
                <FeaturesGrid />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Philosophy section positioned below the tabs */}
      <div className="mt-10">
        <PhilosophySection />
      </div>

      <GlassFooter />
    </div>
  );
}
