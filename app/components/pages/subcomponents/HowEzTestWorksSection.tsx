import Image from "next/image";

export const HowEzTestWorksSection = () => {
  return (
    <section className="relative overflow-hidden w-full">
      {/* Heading */}
      <div className="text-center mb-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
          How EZTest works
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
          EZTest provides a structured workflow for managing manual and automated
          tests, helping QA and engineering teams stay organized and move with
          confidence.
        </p>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 items-start">
        {/* LEFT – Steps */}
        <div className="space-y-0 relative">
          {/* Step 1 */}
          <div 
            className="relative"
            style={{
              borderRadius: '8px',
              borderWidth: '0.89px',
              borderStyle: 'solid',
              borderColor: '#D97F4C',
              backgroundColor: 'transparent',
              padding: '16px',
            }}
          >
            {/* Header: Step badge and Title on same line */}
            <div className="flex items-center gap-2 mb-2">
              {/* Step badge - dashed border, transparent background */}
              <div 
                className="inline-flex items-center justify-center px-2 py-[4px]"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  borderRadius: '4px',
                  borderWidth: '0.89px',
                  borderStyle: 'dashed',
                  borderColor: '#D97F4C',
                  backgroundColor: 'transparent',
                  color: '#D97F4C',
                  minWidth: '44px',
                }}
              >
                Step 1
              </div>
              
              {/* Title - on same line as badge */}
              <p 
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#D97F4C',
                  margin: 0,
                }}
              >
                Plan your tests
              </p>
            </div>
            
            {/* Description */}
            <p 
              style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '22px',
                letterSpacing: '0%',
                color: '#FFFFFF',
                marginBottom: '15px',
                marginTop: 0,
              }}
            >
              Create and organize test cases clearly
            </p>
            
            {/* Innercard - solid muted brown-orange background */}
            <div 
              className="flex flex-col"
              style={{
                borderRadius: '8px',
                borderWidth: '0.89px',
                borderStyle: 'solid',
                borderColor: '#D97F4C',
                paddingTop: '12px',
                paddingRight: '8px',
                paddingBottom: '12px',
                paddingLeft: '8px',
                backgroundColor: 'rgba(217, 127, 76, 0.2)', // #D97F4C at 20% opacity
                boxSizing: 'border-box',
              }}
            >
              <p 
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '22px',
                  letterSpacing: '0%',
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                Define test cases across projects and modules with a consistent
                structure, making it easy for teams to plan, review, and maintain
                test coverage.
              </p>
            </div>
          </div>

          {/* Connector: Step 1 (orange) to Step 2 (blue) */}
          <div className="flex justify-center">
            <div 
              className="w-[2px] h-12 relative overflow-hidden rounded-full"
              style={{
                background: 'linear-gradient(to bottom, #D97F4C, #4C80D9)',
              }}
            >
              <div
                className="absolute w-full left-0 rounded-full"
                style={{
                  height: '50%',
                  background: 'linear-gradient(to bottom, rgba(217, 127, 76, 0.9), rgba(76, 128, 217, 0.9))',
                  boxShadow: '0 0 8px rgba(217, 127, 76, 0.8), 0 0 12px rgba(76, 128, 217, 0.6)',
                  animation: 'flowDown 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                }}
              />
            </div>
          </div>

          {/* Step 2 */}
          <div 
            className="relative"
            style={{
              borderRadius: '8px',
              borderWidth: '0.89px',
              borderStyle: 'solid',
              borderColor: '#4C80D9',
              backgroundColor: 'transparent',
              padding: '16px',
            }}
          >
            {/* Header: Step badge and Title on same line */}
            <div className="flex items-center gap-2 mb-2">
              {/* Step badge - dashed border, transparent background */}
              <div 
                className="inline-flex items-center justify-center px-2 py-[4px]"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  borderRadius: '4px',
                  borderWidth: '0.89px',
                  borderStyle: 'dashed',
                  borderColor: '#4C80D9',
                  backgroundColor: 'transparent',
                  color: '#4C80D9',
                  minWidth: '44px',
                }}
              >
                Step 2
              </div>
              
              {/* Title - on same line as badge */}
              <p 
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#4C80D9',
                  margin: 0,
                }}
              >
                Execute with confidence
              </p>
            </div>
            
            {/* Description */}
            <p 
              style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '22px',
                letterSpacing: '0%',
                color: '#FFFFFF',
                marginBottom: '15px',
                marginTop: 0,
              }}
            >
              Run tests and track results efficiently
            </p>
            
            {/* Innercard - solid muted blue background */}
            <div 
              className="flex flex-col"
              style={{
                borderRadius: '8px',
                borderWidth: '0.89px',
                borderStyle: 'solid',
                borderColor: '#4C80D9',
                paddingTop: '12px',
                paddingRight: '8px',
                paddingBottom: '12px',
                paddingLeft: '8px',
                backgroundColor: 'rgba(76, 128, 217, 0.2)', // #4C80D9 at 20% opacity
                boxSizing: 'border-box',
              }}
            >
              <p 
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '22px',
                  letterSpacing: '0%',
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                Track executions across builds, record outcomes, and manage
                priorities without switching tools or losing context.
              </p>
            </div>
          </div>

          {/* Connector: Step 2 (blue) to Step 3 (green) */}
          <div className="flex justify-center">
            <div 
              className="w-[2px] h-12 relative overflow-hidden rounded-full"
              style={{
                background: 'linear-gradient(to bottom, #4C80D9, #0E7700)',
              }}
            >
              <div
                className="absolute w-full left-0 rounded-full"
                style={{
                  height: '50%',
                  background: 'linear-gradient(to bottom, rgba(76, 128, 217, 0.9), rgba(14, 119, 0, 0.9))',
                  boxShadow: '0 0 8px rgba(76, 128, 217, 0.8), 0 0 12px rgba(14, 119, 0, 0.6)',
                  animation: 'flowDown 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                }}
              />
            </div>
          </div>

          {/* Step 3 */}
          <div 
            className="relative"
            style={{
              borderRadius: '8px',
              borderWidth: '0.89px',
              borderStyle: 'solid',
              borderColor: '#0E7700',
              backgroundColor: 'transparent',
              padding: '16px',
            }}
          >
            {/* Header: Step badge and Title on same line */}
            <div className="flex items-center gap-2 mb-2">
              {/* Step badge - dashed border, transparent background */}
              <div 
                className="inline-flex items-center justify-center px-2 py-[4px]"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  borderRadius: '4px',
                  borderWidth: '0.89px',
                  borderStyle: 'dashed',
                  borderColor: '#0E7700',
                  backgroundColor: 'transparent',
                  color: '#0E7700',
                  minWidth: '44px',
                }}
              >
                Step 3
              </div>
              
              {/* Title - on same line as badge */}
              <p 
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#0E7700',
                  margin: 0,
                }}
              >
                Review and improve
              </p>
            </div>
            
            {/* Description */}
            <p 
              style={{
                fontFamily: 'var(--font-inter)',
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: '14px',
                lineHeight: '22px',
                letterSpacing: '0%',
                color: '#FFFFFF',
                marginBottom: '15px',
                marginTop: 0,
              }}
            >
              Understand results and trace issues quickly
            </p>
            
            {/* Innercard - solid muted green background */}
            <div 
              className="flex flex-col"
              style={{
                borderRadius: '8px',
                borderWidth: '0.89px',
                borderStyle: 'solid',
                borderColor: '#0E7700',
                paddingTop: '12px',
                paddingRight: '8px',
                paddingBottom: '12px',
                paddingLeft: '8px',
                backgroundColor: 'rgba(14, 119, 0, 0.2)', // #0E7700 at 20% opacity
                boxSizing: 'border-box',
              }}
            >
              <p 
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  lineHeight: '22px',
                  letterSpacing: '0%',
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                Monitor test progress, identify failures, and trace defects back
                to test cases for better visibility across the testing lifecycle.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT – Screenshot */}
        <div className="relative">
          {/* Ambient glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

          {/* Glass frame */}
          <div className="relative w-full rounded-2xl bg-[#0b1220]/85 backdrop-blur-xl p-4 shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Border - gradient thickness from top-left */}
            {/* Rounded corner at top-left */}
            <div 
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                width: '16px',
                height: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
                borderTopLeftRadius: '16px',
              }}
            />
            {/* Top border - fades left to right */}
            <div 
              className="absolute top-0 right-0 pointer-events-none"
              style={{
                left: '16px',
                height: '1px',
                background: 'linear-gradient(to right, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0))',
              }}
            />
            {/* Left border - fades top to bottom */}
            <div 
              className="absolute left-0 bottom-0 pointer-events-none"
              style={{
                top: '16px',
                width: '1px',
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0))',
              }}
            />

            {/* macOS window dots */}
            <div className="absolute top-4 left-4 flex gap-2 z-20">
              <span className="w-3 h-3 rounded-full bg-red-500/90" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/90" />
              <span className="w-3 h-3 rounded-full bg-green-500/90" />
            </div>

            {/* Screenshot */}
            <div className="relative mt-6 rounded-xl overflow-hidden bg-[#050816]">
              <Image
                src="/screenshots/TestRun_List_Page_half.png"
                alt="EZTest test run results dashboard"
                width={1920}
                height={1080}
                className="w-full h-auto"
                priority
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
      </div>
    </section>
  );
};
