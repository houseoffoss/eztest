"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./GlassFooter.module.css";

type GlassFooterProps = {
  variant?: "full" | "simple";
  description?: React.ReactNode;
  className?: string;
  hidePrivacyLink?: boolean;
};


export function GlassFooter({ variant = "full", description, className, hidePrivacyLink = false }: GlassFooterProps) {
  if (variant === "simple") {
    return (
      <footer className={className ? className + " mt-24" : "mt-24"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl ring-1 ring-white/5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧪</span>
                <span className="font-semibold text-primary">EZTest</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {description ?? "UI Component Library - All components ready for use"}
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`relative overflow-hidden w-full ${className || ""}`} style={{ minHeight: '600px', paddingTop: '80px', paddingBottom: '20px' }}>
      {/* Dots background image - positioned absolutely */}
      <div 
        className="absolute pointer-events-none"
        style={{
          backgroundImage: 'url(/screenshots/Background_Footer_dots.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '417.421px',
          top: '300px',
          left: '0',
          right: '0',
          opacity: 0.6,
          zIndex: 3,
        }}
      />

      {/* Wide light gradient layer - extends to all areas with very light effect */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          top: '0',
          left: '0',
          right: '0',
          background: 'radial-gradient(ellipse 2000px 800px at 50% 60%, rgba(232, 154, 107, 0.08) 0%, rgba(232, 154, 107, 0.05) 30%, rgba(232, 154, 107, 0.03) 50%, rgba(232, 154, 107, 0.01) 70%, transparent 100%)',
          zIndex: -1,
        }}
      />

      {/* Background gradient blob - centered, with light top reaching description */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '1300px',
          maxWidth: 'calc(100% - 40px)',
          height: '500px',
          top: '250px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse at center bottom, rgba(217, 127, 76, 0.30) 0%, rgba(217, 127, 76, 0.20) 40%, rgba(217, 127, 76, 0.10) 70%, transparent 100%)',
          backdropFilter: 'blur(1007.2px)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          WebkitFilter: 'blur(100px)',
          zIndex: 1,
          overflow: 'visible',
          WebkitBackdropFilter: 'blur(1007.2px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Main content container - positioned at left 112px with max-width 1216px */}
      <div 
        className="relative z-10" 
        style={{ 
          maxWidth: '1400px', 
          width: '100%',
          marginLeft: 'clamp(16px, 112px, calc((100% - 1400px) / 2 + 112px))',
          paddingRight: 'clamp(16px, 112px, calc((100% - 1400px) / 2 + 112px))',
          paddingTop: '0px', 
          paddingBottom: '0px',
        }}
      >
        {/* Contact Us and Logo Container */}
        <div className="flex items-center gap-[2px] mb-6" style={{ height: '28px', width: '134.377px' }}>
          <div style={{ width: '33.377px', height: '20.078px', flexShrink: 0 }}>
            <Image
              src="/screenshots/Belsterns_Logo.png"
              alt="Belsterns Logo"
              width={33.376625061035156}
              height={20.078125}
              className="object-contain w-full h-full"
              unoptimized
            />
          </div>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '99px',
              height: '28px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '18px',
              lineHeight: '28px',
              letterSpacing: '0.2px',
              color: 'rgba(50, 145, 255, 0.8)',
            }}
          >
            Contact Us
          </div>
        </div>

        {/* Description Part - width 852px */}
        <div
          className="mb-8"
          style={{
            width: '852px',
            maxWidth: '100%',
            minHeight: '56px',
          }}
        >
          <p
            className="text-white"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '28px',
              letterSpacing: '0.2px',
              boxShadow: '0px 4.66px 4.66px 0px rgba(0, 0, 0, 0.15)',
              margin: 0,
            }}
          >
            EZTest is an open-source, self-hosted test management platform for managing manual and automated testing across projects, suites, and test runs.
          </p>
        </div>

        {/* Email and Navigation Links - width 1216px, height 48px */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12"
          style={{
            width: '100%',
            maxWidth: '100%',
            minHeight: '48px',
            marginTop: '50px',
          }}
        >
          <div className="flex items-center gap-2 text-white flex-shrink-0">
            <a
              href="mailto:info@belsterns.com"
              className="flex items-center gap-1 hover:opacity-80 transition-opacity text-white"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
              }}
            >
              <span>info@belsterns.com</span>
              <svg width="24" height="24" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M14.8657 10.6945L23.4173 11.4427L22.6692 19.9943" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.3945 22.3703L23.2871 11.5521" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-white flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', marginLeft: 'auto', paddingRight: '40px' }}>
            <Link href="https://belsterns.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity text-white">
              About
            </Link>
            <Link href="https://www.houseoffoss.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity text-white">
              Blog
            </Link>
            <Link href="https://github.com/houseoffoss/eztest" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity text-white">
              GitHub
            </Link>
            <Link href="https://github.com/houseoffoss/eztest/issues" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity text-white">
              Support
            </Link>
            {!hidePrivacyLink && (
              <Link href="/privacy" className="hover:opacity-80 transition-opacity text-white">
                Privacy Policy
              </Link>
            )}
            <Link href="https://github.com/houseoffoss/eztest/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity text-white">
              License
            </Link>
          </div>
        </div>
      </div>

      {/* Large EZTest Text - showing only top half, centered horizontally */}
      <div
        className="relative z-10 w-full flex items-start justify-center overflow-hidden"
        style={{
          width: '100%',
          height: '200px',
            marginTop: '80px',
          paddingLeft: '0',
          paddingRight: '0',
        }}
      >
        <h1 className={styles.footerGradientText}>
          eztest
        </h1>
      </div>

      {/* Copyright Section */}
      <div 
        className="relative z-10 w-full"
        style={{
          marginTop: '20px',
          paddingTop: '16px',
          paddingBottom: '24px',
          marginLeft: 'clamp(16px, 112px, calc((100% - 1400px) / 2 + 112px))',
          paddingRight: 'clamp(16px, 112px, calc((100% - 1400px) / 2 + 112px))',
        }}
      >
        <p 
          className="text-white/60 text-sm"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            letterSpacing: '0.2px',
          }}
        >
          © {new Date().getFullYear()} Belsterns. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default GlassFooter;
