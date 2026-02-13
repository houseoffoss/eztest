'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { GlassFooter } from '@/frontend/reusable-components/layout/GlassFooter';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
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
  useEffect(() => {
    document.title = 'Launch EZTest with House Of FOSS | EZTest';
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
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={[]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <ButtonSecondary className="cursor-pointer" buttonName="House Of FOSS Page - Navbar - Sign In">
                Sign in
              </ButtonSecondary>
            </Link>
            <Link href="/auth/register">
              <ButtonPrimary className="cursor-pointer" buttonName="House Of FOSS Page - Navbar - Get Started">
                Get started
              </ButtonPrimary>
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
              <ButtonPrimary className="cursor-pointer" buttonName="House Of FOSS Page - Hero - Get Started">
                Get Started with House Of FOSS
              </ButtonPrimary>
            </a>
            <a
              href="https://eztest.houseoffoss.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <ButtonSecondary className="cursor-pointer" buttonName="House Of FOSS Page - Hero - View Demo">
                View Live Demo
              </ButtonSecondary>
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
              const gradientStyle = 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';
              return (
                <div
                  key={index}
                  className="rounded-3xl relative p-[1px]"
                  style={{ background: gradientStyle }}
                >
                  <div className="relative rounded-3xl h-full" style={{ backgroundColor: '#0a1628' }}>
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
          <div className="rounded-3xl relative transition-all p-[1px]" style={{ background: 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)' }}>
            <div className="relative rounded-3xl h-full" style={{ backgroundColor: '#0a1628' }}>
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
                    const gradientStyle = 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)';
                    return (
                      <div
                        key={index}
                        className="rounded-3xl relative p-[1px]"
                        style={{ background: gradientStyle }}
                      >
                        <div className="relative rounded-3xl h-full" style={{ backgroundColor: '#0a1628' }}>
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
        <div className="rounded-3xl relative transition-all p-[1px]" style={{ background: 'conic-gradient(from 45deg, rgba(255, 255, 255, 0.1) 0deg, rgba(255, 255, 255, 0.4) 90deg, rgba(255, 255, 255, 0.1) 180deg, rgba(255, 255, 255, 0.4) 270deg, rgba(255, 255, 255, 0.1) 360deg)' }}>
          <div className="relative rounded-3xl h-full" style={{ backgroundColor: '#0a1628' }}>
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
                  <ButtonPrimary className="cursor-pointer" buttonName="House Of FOSS Page - CTA - Contact Us">
                    Contact House Of FOSS
                  </ButtonPrimary>
                </a>
                <Link href="/">
                  <ButtonSecondary className="cursor-pointer" buttonName="House Of FOSS Page - CTA - Learn More">
                    Learn More About EZTest
                  </ButtonSecondary>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GlassFooter />
    </div>
  );
}

