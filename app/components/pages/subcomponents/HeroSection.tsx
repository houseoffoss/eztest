'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';

type CinematicZoomOptions = {
  from?: number;
  to?: number;
  /** Progress value (0..1) at which zoom should already be completed */
  finishBy?: number;
  /** Smoothing factor per animation frame (0..1). Higher = faster, less smooth */
  lerp?: number;
};

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(t: number) {
  // Smooth and cinematic: ease-in-out without overshoot
  return t * t * (3 - 2 * t);
}

/**
 * Scroll-driven cinematic zoom, using IntersectionObserver to activate only when in/near view,
 * and rAF to smooth transforms. No layout shift (transform only) and reverses smoothly.
 */
function useCinematicScrollZoom(
  viewportRef: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>,
  { from = 0.9, to = 1, finishBy = 0.65, lerp = 0.12 }: CinematicZoomOptions = {}
) {
  const opts = useMemo(() => ({ from, to, finishBy, lerp }), [from, to, finishBy, lerp]);

  useEffect(() => {
    const viewportEl = viewportRef.current;
    const targetEl = targetRef.current;
    if (!viewportEl || !targetEl) return;

    let rafId = 0;
    let active = false;
    let current = opts.from;

    const setZoom = (z: number) => {
      // Use CSS var so CSS can compose additional transforms if needed
      targetEl.style.setProperty('--hero-zoom', z.toFixed(4));
    };

    const computeProgress = () => {
      const rect = viewportEl.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      /**
       * Raw progress through the viewport:
       * - 0 when the hero top is at bottom of viewport
       * - 1 when the hero bottom reaches top of viewport
       */
      const raw = (vh - rect.top) / (vh + rect.height);
      const p = clamp01(raw / opts.finishBy); // finish early while hero is still in view
      return smoothstep(p);
    };

    const tick = () => {
      rafId = 0;
      if (!active) return;

      const eased = computeProgress();
      const target = opts.from + (opts.to - opts.from) * eased;
      current += (target - current) * opts.lerp;
      setZoom(current);

      // Continue smoothing until we're close to target
      if (Math.abs(target - current) > 0.0006) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const requestTick = () => {
      if (!active) return;
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    // Activate only near viewport for performance
    const io = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        active = Boolean(entry?.isIntersecting);
        if (active) requestTick();
      },
      { root: null, threshold: 0, rootMargin: '200px 0px 200px 0px' }
    );

    io.observe(viewportEl);

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);

    // Initial paint
    setZoom(current);
    requestTick();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', requestTick);
      window.removeEventListener('resize', requestTick);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [viewportRef, targetRef, opts]);
}

export const HeroSection = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const zoomTargetRef = useRef<HTMLDivElement | null>(null);

  useCinematicScrollZoom(heroRef, zoomTargetRef, {
    from: 0.78,
    to: 1.2, // keep original layout but give a bit more zoom than before
    // Completes before the next section fully appears
    finishBy: 0.55,
    lerp: 0.12,
  });

  return (
    <section
      ref={heroRef}
      className="relative mb-16 overflow-hidden pt-1 pb-24 text-center bg-gradient-to-b from-[#050608] via-black to-[#050608]"
    >
      {/* Blurred orange glow over grid */}
      <div className="hero-grid-glow" aria-hidden="true" />

      {/* Grid image layer - shifted down so it starts below title/description */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[28%] z-0 h-[420px] bg-[url('/Grid.png')] bg-top bg-no-repeat bg-[length:min(1600px,100vw)_auto]"
        aria-hidden="true"
      />

      {/* Centered content container (match width with HowEzTestWorksSection) */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="mb-4 text-[34px] sm:text-[42px] md:text-[50px] lg:text-[55px] font-semibold leading-[1] tracking-[0] text-white"
          style={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 600,
            lineHeight: '100%',
            letterSpacing: '0%',
          }}
        >
          Open Source test management
          <br />
          for modern QA teams
        </h1>

        <p
          className="mb-8 max-w-3xl mx-auto text-white/75"
          style={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: '37.26px',
            letterSpacing: '0%',
          }}
        >
          EZTest helps QA and engineering teams organize test cases, executions, and
          results in one transparent, self-hosted platform.
        </p>

        {/* Screenshot Showcase */}
        <div className="relative mx-auto mt-64 max-w-6xl px-1 hero-tilt-perspective">
          <div ref={zoomTargetRef} className="relative hero-zoom-target">
            <div className="hero-window-glow" aria-hidden="true" />
            <div className="hero-window">
              <div className="hero-window-topbar">
                <div className="flex items-center gap-[5.66px]">
                  <span className="hero-window-dot bg-[#F95959]" aria-hidden="true" />
                  <span className="hero-window-dot bg-[#F8DB46]" aria-hidden="true" />
                  <span className="hero-window-dot bg-[#41CC4F]" aria-hidden="true" />
                </div>
              </div>
              <div className="hero-window-content">
                <Image
                  src="/screenshots/TestCase_List_Page1.png"
                  alt="EZTest Test Cases screen"
                  width={1920}
                  height={1080}
                  className="block h-auto w-full select-none"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
