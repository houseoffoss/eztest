'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { GlassFooter } from '@/frontend/reusable-components/layout/GlassFooter';
import { 
  Shield, 
  Clock, 
  Headphones, 
  DollarSign,
  Rocket,
  Settings,
  Zap,
  Database
} from 'lucide-react';

export default function HouseOfFOSSPage() {
  const [stars, setStars] = useState<number | null>(null);

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

  const features = [
    {
      icon: Rocket,
      title: 'Quick Setup',
      description: 'Get EZTest up and running in minutes, not days. Our team handles all the technical setup so you can focus on testing.'
    },
    {
      icon: Shield,
      title: 'Managed Security',
      description: 'Enterprise-grade security with regular updates, patches, and monitoring. Your data is protected 24/7.'
    },
    {
      icon: Clock,
      title: '99% Uptime',
      description: 'Reliable infrastructure with guaranteed uptime. Your test management platform is always available when you need it.'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Expert support team ready to help. Get assistance when you need it.'
    },
    {
      icon: DollarSign,
      title: 'Save Up to 60%',
      description: 'Pay only for server usage instead of fixed monthly rates. No per-user pricing means significant cost savings.'
    },
    {
      icon: Settings,
      title: 'Custom Solutions',
      description: 'Need something specific? We can customize EZTest to fit your unique workflow and requirements.'
    },
    {
      icon: Zap,
      title: 'Managed Maintenance',
      description: 'Regular backups and maintenance. We keep everything running smoothly so you don\'t have to.'
    },
    {
      icon: Database,
      title: 'Data Ownership',
      description: 'Your data stays yours. Full control over your test data with no vendor lock-in or data restrictions.'
    }
  ];

  return (
    <main className="min-h-screen bg-[#050608]">
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
              <Image 
                src="/favicon.png" 
                alt="EZTest" 
                width={24} 
                height={24} 
                className="w-6 h-6"
              />
            </div>
          </div>
        }
        items={[]}
        breadcrumbs={
          <>
            <div className="relative inline-flex group">
              <div
                className="absolute -inset-[1px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                style={{
                  background:
                    'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  padding: '1px',
                }}
              />
              <a
                href="https://github.com/houseoffoss/eztest"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 sm:px-4 py-2 rounded-full transition-all cursor-pointer inline-flex items-center gap-1 sm:gap-2 relative z-20 group"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  lineHeight: '100%',
                  letterSpacing: '0.2px',
                  verticalAlign: 'middle',
                }}
              >
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(36px) saturate(220%)',
                    WebkitBackdropFilter: 'blur(36px) saturate(220%)',
                    zIndex: 0,
                  } as React.CSSProperties}
                />
                <span className="relative z-30 flex items-center gap-1 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#5C5C5C' }}>
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden lg:inline"
                    style={{
                      background: 'linear-gradient(90deg, #F3F3F3 0%, #5C5C5C 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    GitHub
                  </span>
                </span>
                {stars !== null && (
                  <span className="relative z-30 hidden lg:flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="#5C5C5C" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span
                      className="text-xs sm:text-sm font-semibold"
                      style={{
                        background: 'linear-gradient(90deg, #F3F3F3 0%, #5C5C5C 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      {stars.toLocaleString()}
                    </span>
                  </span>
                )}
              </a>
            </div>
            <div className="relative inline-flex group">
              <div
                className="absolute -inset-[1px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                style={{
                  background:
                    'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  padding: '1px',
                }}
              />
              <Link
                href="/"
                className="px-2 sm:px-4 py-2 rounded-full transition-all cursor-pointer inline-flex items-center gap-1 sm:gap-2 relative z-20 group"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  lineHeight: '100%',
                  letterSpacing: '0.2px',
                  verticalAlign: 'middle',
                }}
              >
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(36px) saturate(220%)',
                    WebkitBackdropFilter: 'blur(36px) saturate(220%)',
                    zIndex: 0,
                  } as React.CSSProperties}
                />
                <span
                  className="relative z-30 flex items-center gap-1 sm:gap-2"
                  style={{
                    background: 'linear-gradient(90deg, #F3F3F3 0%, #5C5C5C 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  <span className="hidden lg:inline">Back to Home</span>
                  <span className="lg:hidden">Home</span>
                </span>
              </Link>
            </div>
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
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
                    background: 'conic-gradient(from 305deg, rgba(255, 255, 255, 0.4) 0deg, rgba(255, 255, 255, 0.4) 80deg, rgba(255, 255, 255, 0.05) 125deg, rgba(255, 255, 255, 0.4) 145deg, rgba(255, 255, 255, 0.4) 280deg, rgba(255, 255, 255, 0.05) 300deg, rgba(255, 255, 255, 0.4) 357deg)',
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
                    lineHeight: '23.33px',
                    letterSpacing: '0.29px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    background: 'linear-gradient(94.37deg, #D97F4C 11.75%, #734328 88.32%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Sign in
                </span>
              </div>
            </Link>
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
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Launch EZTest with
            <br />
            <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #c5490c, #0c5498)' }}>
              House Of FOSS
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
            Get EZTest fully managed and deployed in minutes. Save up to 60% on your monthly software costs 
            while getting enterprise-grade support and 99% uptime guarantee.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://app.houseoffoss.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
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
                    background: 'conic-gradient(from 349deg, rgba(255, 255, 255, 0.4) 0deg, rgba(255, 255, 255, 0.4) 70deg, rgba(255, 255, 255, 0.05) 90deg, rgba(255, 255, 255, 0.4) 120deg, rgba(255, 255, 255, 0.4) 240deg, rgba(255, 255, 255, 0.05) 270deg, rgba(255, 255, 255, 0.4) 360deg)',
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
                  Get Started with House Of FOSS
                </span>
              </div>
            </a>
            <a
              href="https://eztest.houseoffoss.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
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
                    background: 'conic-gradient(from 315deg, rgba(255, 255, 255, 0.4) 0deg, rgba(255, 255, 255, 0.4) 80deg, rgba(255, 255, 255, 0.05) 125deg, rgba(255, 255, 255, 0.4) 145deg, rgba(255, 255, 255, 0.4) 280deg, rgba(255, 255, 255, 0.05) 300deg, rgba(255, 255, 255, 0.4) 357deg)',
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
                    lineHeight: '23.33px',
                    letterSpacing: '0.29px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    background: 'linear-gradient(94.37deg, #D97F4C 11.75%, #734328 88.32%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  View Live Demo
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Why Choose House Of FOSS */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">Why Choose House Of FOSS?</h2>
          <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto">
            House Of FOSS makes Free and Open Source Software accessible to everyone—not just technical experts. 
            We handle the complexity so you can focus on what matters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const gradientStyle = 'conic-gradient(from 60deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';
              return (
                <div
                  key={index}
                  className="rounded-3xl relative p-[1px]"
                  style={{ background: gradientStyle }}
                >
                  <div className="relative rounded-3xl h-full" style={{ 
                    backgroundColor: '#050608',
                    backdropFilter: 'blur(40px)',
                    boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
                  }}>
                    <div className="rounded-3xl border-0 bg-transparent overflow-visible flex flex-col h-full p-6">
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-2 break-words">{feature.title}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0b72ff]/30 via-[#0b72ff]/20 to-[#ff7a18]/30 flex items-center justify-center shrink-0 ring-1 ring-inset ring-white/15 backdrop-blur-sm">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-white/70 text-sm break-words">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services Section - Hidden for now */}
        {/* <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">What We Offer</h2>
          <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto">
            Complete managed services to help you get the most out of EZTest. From setup to ongoing support, we handle the technical details so you can focus on testing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl"
              >
                <h3 className="text-xl font-semibold text-white mb-4">{service.title}</h3>
                <ul className="space-y-3">
                  {service.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div> */}

        {/* Cost Savings Section */}
        <div className="mb-20">
          <div className="rounded-3xl relative transition-all p-[1px]" style={{ background: 'conic-gradient(from 75deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)' }}>
            <div className="relative rounded-3xl h-full" style={{ 
              backgroundColor: '#050608',
              backdropFilter: 'blur(40px)',
              boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
            }}>
              <div className="rounded-3xl border-0 bg-transparent overflow-visible transition-all flex flex-col h-full p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Save Up to 60% on Software Costs</h2>
                  <p className="text-white/70 max-w-2xl mx-auto break-words">
                    Unlike commercial tools that charge per user, House Of FOSS charges only for server usage. 
                    This means significant savings, especially for larger teams.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {[
                    { value: '60%', label: 'Cost Savings', color: 'text-green-400' },
                    { value: '99%', label: 'Uptime Guarantee', color: 'text-blue-400' },
                    { value: '24/7', label: 'Support Available', color: 'text-purple-400' }
                  ].map((stat, index) => {
                    const gradientStyle = 'conic-gradient(from 75deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';
                    return (
                      <div
                        key={index}
                        className="rounded-3xl relative p-[1px]"
                        style={{ background: gradientStyle }}
                      >
                        <div className="relative rounded-3xl h-full" style={{ 
                          backgroundColor: '#050608',
                          backdropFilter: 'blur(40px)',
                          boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
                        }}>
                          <div className="rounded-3xl border-0 bg-transparent overflow-visible flex flex-col h-full p-6 text-center">
                            <div className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
                            <div className="text-white/70 text-sm break-words">{stat.label}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              { step: '1', title: 'Login to House Of FOSS', description: 'Sign in to your House Of FOSS account to get started.' },
              { step: '2', title: 'Create Workspace', description: 'Create a new workspace to organize your applications and projects.' },
              { step: '3', title: 'Choose Application', description: 'Select EZTest from the available applications in your workspace to launch.' },
              { step: '4', title: 'Launch EZTest', description: 'Launch your EZTest application and start managing your test cases immediately.' }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0b72ff]/30 via-[#0b72ff]/20 to-[#ff7a18]/30 flex items-center justify-center mb-6 text-3xl font-bold text-white ring-1 ring-inset ring-white/15 backdrop-blur-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 break-words">{item.title}</h3>
                <p className="text-white/70 break-words">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-3xl relative transition-all p-[1px]" style={{ background: 'conic-gradient(from 70deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)' }}>
          <div className="relative rounded-3xl h-full" style={{ 
            backgroundColor: '#050608',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.6)',
          }}>
            <div className="rounded-3xl border-0 bg-transparent overflow-visible transition-all flex flex-col h-full p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-white/70 mb-8 max-w-2xl mx-auto break-words">
                Join teams who have saved thousands of dollars while getting better test management tools. Contact House Of FOSS today to learn more.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://app.houseoffoss.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
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
                        background: 'conic-gradient(from 349deg, rgba(255, 255, 255, 0.4) 0deg, rgba(255, 255, 255, 0.4) 70deg, rgba(255, 255, 255, 0.05) 90deg, rgba(255, 255, 255, 0.4) 120deg, rgba(255, 255, 255, 0.4) 240deg, rgba(255, 255, 255, 0.05) 270deg, rgba(255, 255, 255, 0.4) 360deg)',
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
                      Contact House Of FOSS
                    </span>
                  </div>
                </a>
                <Link href="/" className="inline-flex">
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
                        background: 'conic-gradient(from 319deg, rgba(255, 255, 255, 0.4) 0deg, rgba(255, 255, 255, 0.4) 80deg, rgba(255, 255, 255, 0.05) 125deg, rgba(255, 255, 255, 0.4) 145deg, rgba(255, 255, 255, 0.4) 280deg, rgba(255, 255, 255, 0.05) 300deg, rgba(255, 255, 255, 0.4) 357deg)',
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
                        lineHeight: '23.33px',
                        letterSpacing: '0.29px',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        background: 'linear-gradient(94.37deg, #D97F4C 11.75%, #734328 88.32%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      Learn More About EZTest
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GlassFooter />
    </main>
  );
}

