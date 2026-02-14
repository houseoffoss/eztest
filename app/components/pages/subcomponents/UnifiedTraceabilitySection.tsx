'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ArrowRight } from 'lucide-react';

const capabilities = [
  {
    title: 'Unified Traceability',
    description: 'Link test cases to defects, test runs, and modules for complete end-to-end traceability across your testing lifecycle.',
    image: '/screenshots/Testrun_Detail_Page_updated.png',
  },
  {
    title: 'Defect Management',
    description: 'Track bugs with severity, priority, status, and file attachments. Link defects directly to test cases.',
    image: '/screenshots/Defects_Detail_Page.png',
  },
  {
    title: 'Built-in Migration Support',
    description: 'Import test cases and defects in bulk using CSV or Excel files. Auto-create modules and test suites during import.',
    image: '/screenshots/Import TestCase.png',
  },
  {
    title: 'Manual & Automation Testing',
    description: 'Support both manual and automated test cases. Track execution results, attach evidence, and maintain comprehensive test history.',
    image: '/screenshots/Supports_Both_Manual_And_Automation.png',
  },
  {
    title: 'Fully Customizable',
    description: 'Open-source and self-hosted platform. Full source code access allows complete customization to fit your team\'s needs.',
    image: '/screenshots/fully_customizable.png',
  },
  {
    title: 'AuthN + AuthZ',
    description: 'Secure authentication with email/password, JWT sessions, and role-based access control with 27 granular permissions.',
    image: '/screenshots/AuthN.png',
  },
];

export const UnifiedTraceabilitySection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .capabilities-scroll-container::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    
    if (!scrollContainer) return;

    // Track mouse enter/leave to detect when cursor is over the container
    const handleMouseEnter = () => {
      isHoveringRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
    };

    // Handle wheel events when cursor is over the container
    const handleWheel = (e: WheelEvent) => {
      if (!isHoveringRef.current) return;

      // Prevent default vertical scroll
      e.preventDefault();
      
      // Convert vertical scroll to horizontal scroll
      const scrollAmount = e.deltaY;
      scrollContainer.scrollLeft += scrollAmount;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden w-full py-12 sm:py-16 lg:py-20">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Key capabilities title */}
          <div className="mb-12 sm:mb-16 lg:mb-24">
          <h3 
            className="text-2xl sm:text-3xl lg:text-4xl"
            style={{
              fontFamily: 'Inter, var(--font-inter)',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: 'clamp(28px, 5vw, 40px)',
              lineHeight: '1.3',
              letterSpacing: '0%',
              color: '#FFFFFF',
              margin: 0,
              marginBottom: '10px',
            }}
          >
            Key capabilities
          </h3>
          
          <p 
            className="text-sm sm:text-base"
            style={{
              fontFamily: 'Inter, var(--font-inter)',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: 'clamp(14px, 2vw, 16px)',
              lineHeight: '28px',
              letterSpacing: '0%',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              maxWidth: '100%',
            }}
          >
            Built to support real QA workflows — from test planning to execution and reporting.
          </p>
        </div>

        {/* Horizontal scroll container */}
        <div 
          ref={scrollContainerRef}
          className="capabilities-scroll-container overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="flex gap-4 sm:gap-6 lg:gap-8" style={{ width: 'max-content' }}>
            {capabilities.map((capability, index) => (
              index === 0 || index === 1 || index === 2 || index === 3 || index === 4 ? (
                // FIRST, SECOND, THIRD, FOURTH, AND FIFTH SLIDES - Asymmetric grid layout with real borders
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{ 
                    width: 'min(100vw - 2rem, 1440px)', 
                    minWidth: 'min(100vw - 2rem, 320px)',
                    display: 'grid',
                    gridTemplateColumns: index === 0 || index === 3
                      ? 'clamp(150px, 16vw, 260px) clamp(230px, 24vw, 320px) clamp(200px, 21.5vw, 309.1895px) clamp(200px, 20vw, 280px) clamp(100px, 10vw, 150px)'
                      : index === 1 || index === 4
                      ? 'clamp(100px, 12vw, 200px) clamp(230px, 24vw, 320px) clamp(200px, 21.5vw, 309.1895px) clamp(280px, 28vw, 360px) clamp(100px, 10vw, 150px)'
                      : 'clamp(100px, 12vw, 200px) clamp(230px, 24vw, 320px) clamp(150px, 18vw, 260px) clamp(330px, 30vw, 410px) clamp(100px, 10vw, 150px)',
                    gridTemplateRows: index === 2
                      ? 'clamp(90px, 9vw, 130px) clamp(35px, 3vw, 45px) clamp(120px, 12vw, 180px) clamp(225px, 23vw, 300px) clamp(35px, 3vw, 45px)'
                      : index === 4
                      ? 'clamp(90px, 9vw, 130px) clamp(35px, 3vw, 45px) clamp(180px, 17vw, 250px) clamp(120px, 12vw, 160px) clamp(35px, 3vw, 45px)'
                      : 'clamp(90px, 9vw, 130px) clamp(35px, 3vw, 45px) clamp(200px, 19vw, 280px) clamp(145px, 13.5vw, 195px) clamp(35px, 3vw, 45px)',
                    gap: 0,
                    position: 'relative',
                    borderTop: '1px solid #1c1c1c',
                    borderLeft: '1px solid #1c1c1c',
                  }}
                >
                  {/* Grid cells for borders - create cells for all positions except image area */}
                  {Array.from({ length: 5 }, (_, colIdx) =>
                    Array.from({ length: 5 }, (_, rowIdx) => {
                      // Skip cells in image/title span area
                      // First and fourth slides: row 3-4, col 3-4 (image)
                      // Second and fifth slides: row 3-4, col 2-3 (image)
                      // Third slide: row 3-4, col 2-3 (title)
                      const isInImageArea = index === 0 || index === 3
                        ? (rowIdx + 1 >= 3 && rowIdx + 1 <= 4) && (colIdx + 1 >= 3 && colIdx + 1 <= 4)
                        : (rowIdx + 1 >= 3 && rowIdx + 1 <= 4) && (colIdx + 1 >= 2 && colIdx + 1 <= 3);
                      if (isInImageArea) return null;
                      
                      // Add extra height to row 2, columns 4-5 in fifth slide
                      const isRow2Cols45 = index === 4 && rowIdx === 1 && (colIdx === 3 || colIdx === 4);
                      
                      return (
                        <div
                          key={`cell-${colIdx}-${rowIdx}`}
                          style={{
                            gridColumn: colIdx + 1,
                            gridRow: rowIdx + 1,
                            borderRight: '1px solid #1c1c1c',
                            borderBottom: '1px solid #1c1c1c',
                            pointerEvents: 'none',
                            ...(isRow2Cols45 && {
                              minHeight: '60px',
                              height: '60px',
                            }),
                          }}
                        />
                      );
                    })
                  )}

                  {/* Increased height for row 2, columns 4-5 in fifth slide */}
                  {index === 4 && (
                    <div
                      style={{
                        gridColumn: '4 / span 2',
                        gridRow: '2',
                        minHeight: '60px',
                      }}
                    />
                  )}

                  {/* Slide Title */}
                  <h2 
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px]"
                    style={{
                      gridColumn: index === 2 ? '2 / span 2' : index === 0 || index === 3 ? '2' : '4',
                      gridRow: index === 2 ? '3 / span 2' : '3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Inter, var(--font-inter)',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      fontSize: 'clamp(20px, 3.5vw, 56px)',
                      lineHeight: 'clamp(24px, 4.2vw, 65.52px)',
                      letterSpacing: '0.2px',
                      color: '#FFFFFF',
                      margin: 0,
                      padding: '8px',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      textAlign: 'center',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      zIndex: 10,
                      ...(index === 2 && {
                        border: '1px solid #1c1c1c',
                        background: 'radial-gradient(70.71% 70.71% at 50% 50%, rgba(47, 48, 49, 0.4) 2.08%, rgba(47, 48, 49, 0) 2.08%)',
                        boxShadow: '0px 0px 0px 1px #07080A inset, 0px 0px 0px 1px #1B1C1E',
                      }),
                    }}
                  >
                    {capability.title}
                  </h2>
                  
                  {/* Description and Button */}
                  <div 
                    style={{
                      gridColumn: index === 2 ? '4' : index === 0 || index === 3 ? '2' : '4',
                      gridRow: index === 2 ? '3' : '4',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '8px',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      zIndex: 10,
                    }}
                  >
                    <p 
                      className="text-sm sm:text-base"
                      style={{
                        fontFamily: 'Geist Mono, monospace',
                        fontWeight: 500,
                        fontStyle: 'normal',
                        fontSize: 'clamp(11px, 1.2vw, 14px)',
                        lineHeight: 'clamp(16px, 1.8vw, 22.4px)',
                        letterSpacing: '0.3px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: 0,
                        maxWidth: '100%',
                        textAlign: 'center',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {capability.description}
                    </p>
                    
                    <Link href="/auth/register">
                      <ButtonPrimary 
                        className="inline-flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                        buttonName={`Home Page - ${capability.title} - Get Started`}
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </ButtonPrimary>
                    </Link>
                  </div>

                  {/* Image */}
                  <div 
                    className="relative"
                    style={{
                      gridColumn: index === 2 ? '4' : index === 0 || index === 3 ? '3 / span 2' : '2 / span 2',
                      gridRow: index === 2 ? '4' : '3 / span 2',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                      border: '1px solid #1c1c1c',
                      background: 'radial-gradient(70.71% 70.71% at 50% 50%, rgba(47, 48, 49, 0.4) 2.08%, rgba(47, 48, 49, 0) 2.08%)',
                      boxShadow: '0px 0px 0px 1px #07080A inset, 0px 0px 0px 1px #1B1C1E',
                    }}
                  >
                    {/* Glass frame */}
                    <div className="relative w-full h-full bg-[#0b1220]/85 p-2 sm:p-3 lg:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] sm:shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden flex items-center justify-center">
                      {/* Screenshot */}
                      <div className="relative overflow-hidden bg-[#050816] flex items-center justify-center" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                        <Image
                          src={capability.image}
                          alt={`EZTest ${capability.title.toLowerCase()} dashboard`}
                          width={1920}
                          height={1080}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                          priority={index === 0 || index === 1 || index === 2 || index === 3 || index === 4}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // OTHER SLIDES - Keep existing flex layout
                <div
                  key={index}
                  className="flex-shrink-0 grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2 items-start"
                  style={{ 
                    width: 'min(100vw - 2rem, 1440px)', 
                    minWidth: 'min(100vw - 2rem, 320px)',
                  }}
                >
                  {/* LEFT – Text Content */}
                  <div className="flex flex-col relative z-10 gap-3 sm:gap-4" style={{ maxWidth: '100%', width: '100%' }}>
                    <h2 
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px]"
                      style={{
                        fontFamily: 'Inter, var(--font-inter)',
                        fontWeight: 600,
                        lineHeight: '1.2',
                        letterSpacing: '0%',
                        color: '#FFFFFF',
                        margin: 0,
                        fontSize: 'clamp(32px, 6vw, 64px)',
                      }}
                    >
                      {capability.title}
                    </h2>
                    
                    <p 
                      className="text-sm sm:text-base"
                      style={{
                        fontFamily: 'Inter, var(--font-inter)',
                        fontWeight: 500,
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        lineHeight: '1.75',
                        letterSpacing: '0%',
                        color: 'rgba(255, 255, 255, 0.7)',
                        margin: 0,
                        maxWidth: '100%',
                      }}
                    >
                      {capability.description}
                    </p>
                    
                    {/* Call to Action */}
                    <div style={{ marginTop: '8px' }}>
                      <Link href="/auth/register">
                        <ButtonPrimary 
                          className="inline-flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                          buttonName={`Home Page - ${capability.title} - Get Started`}
                        >
                          Get Started
                          <ArrowRight className="w-4 h-4" />
                        </ButtonPrimary>
                      </Link>
                    </div>
                  </div>

                  {/* RIGHT – Dashboard Image */}
                  <div className="relative w-full">
                    {/* Ambient glow */}
                    <div className="absolute -top-12 -left-12 sm:-top-24 sm:-left-24 w-48 h-48 sm:w-96 sm:h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 -right-20 sm:-right-40 w-48 h-48 sm:w-96 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

                    {/* Glass frame */}
                    <div className="relative w-full rounded-xl sm:rounded-2xl bg-[#0b1220]/85 backdrop-blur-xl p-2 sm:p-3 lg:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] sm:shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden">
                      {/* Border - gradient thickness from top-left */}
                      <div 
                        className="absolute top-0 left-0 pointer-events-none"
                        style={{
                          width: 'clamp(12px, 2vw, 16px)',
                          height: 'clamp(12px, 2vw, 16px)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                          borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
                          borderTopLeftRadius: 'clamp(12px, 2vw, 16px)',
                        }}
                      />
                      <div 
                        className="absolute top-0 right-0 pointer-events-none"
                        style={{
                          left: 'clamp(12px, 2vw, 16px)',
                          height: '1px',
                          background: 'linear-gradient(to right, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0))',
                        }}
                      />
                      <div 
                        className="absolute left-0 bottom-0 pointer-events-none"
                        style={{
                          top: 'clamp(12px, 2vw, 16px)',
                          width: '1px',
                          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0))',
                        }}
                      />

                      {/* macOS window dots */}
                      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex gap-1.5 sm:gap-2 z-20">
                        <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/90" />
                        <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400/90" />
                        <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500/90" />
                      </div>

                      {/* Screenshot */}
                      <div className="relative mt-4 sm:mt-6 rounded-lg sm:rounded-xl overflow-hidden bg-[#050816]">
                        <Image
                          src={capability.image}
                          alt={`EZTest ${capability.title.toLowerCase()} dashboard`}
                          width={1920}
                          height={1080}
                          className="w-full h-auto"
                          priority={index === 0}
                        />
                        {/* Right fade/glass blur effect */}
                        <div 
                          className="absolute inset-0 pointer-events-none backdrop-blur-[0.5px]"
                          style={{
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                            maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                          }}
                        />
                        {/* Dark overlay on right side */}
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'linear-gradient(to right, transparent 50%, rgba(5, 8, 22, 0.7) 75%, rgba(5, 8, 22, 0.98) 100%)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

