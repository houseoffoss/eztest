import Image from "next/image";

export const HowEzTestWorksSection = () => {
  return (
    <section className="mt-24 relative overflow-x-hidden">
      {/* Heading */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
          How EZTest works
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
          EZTest provides a structured workflow for managing manual and automated
          tests, helping QA and engineering teams stay organized and move with
          confidence.
        </p>
      </div>

      <div className="grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)] items-start">
        {/* LEFT – Steps */}
        <div className="space-y-0 relative">
          {/* Step 1 */}
          <div className="relative rounded-2xl border border-orange-400/40 p-4">
            <div className="inline-flex items-center rounded-md border border-dashed border-orange-400/70 px-3 py-1 text-sm font-medium text-orange-400 mb-2">
              Step 1
            </div>
            <p className="text-base font-medium text-orange-400 mb-1">
              Plan your tests
            </p>
            <p className="text-sm text-white/80 mb-3">
              Create and organize test cases clearly
            </p>
            <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
              <p className="text-sm text-white leading-relaxed">
                Define test cases across projects and modules with a consistent
                structure, making it easy for teams to plan, review, and maintain
                test coverage.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-px h-12 bg-white/40" />
          </div>

          {/* Step 2 */}
          <div className="relative rounded-2xl border border-blue-400/40 p-4">
            <div className="inline-flex items-center rounded-md border border-dashed border-blue-400/70 px-3 py-1 text-sm font-medium text-blue-400 mb-2">
              Step 2
            </div>
            <p className="text-base font-medium text-blue-400 mb-1">
              Execute with confidence
            </p>
            <p className="text-sm text-white/80 mb-3">
              Create and organize test cases clearly
            </p>
            <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-3">
              <p className="text-sm text-white leading-relaxed">
                Track executions across builds, record outcomes, and manage
                priorities without switching tools or losing context.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-px h-12 bg-white/40" />
          </div>

          {/* Step 3 */}
          <div className="relative rounded-2xl border border-green-400/40 p-4">
            <div className="inline-flex items-center rounded-md border border-dashed border-green-400/70 px-3 py-1 text-sm font-medium text-green-400 mb-2">
              Step 3
            </div>
            <p className="text-base font-medium text-green-400 mb-1">
              Review and improve
            </p>
            <p className="text-sm text-white/80 mb-3">
              Understand results and trace issues quickly
            </p>
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
              <p className="text-sm text-white leading-relaxed">
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
          <div className="relative rounded-2xl bg-[#0b1220]/85 backdrop-blur-xl p-4 shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Border - full border on all edges, but top border only on left half */}
            <div className="absolute inset-0 rounded-2xl border-l border-r border-b border-white/30 pointer-events-none" />
            <div className="absolute left-0 top-0 w-1/2 border-t border-white/30 rounded-tl-2xl pointer-events-none" />

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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
