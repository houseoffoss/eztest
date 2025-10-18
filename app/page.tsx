import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧪</span>
              <span className="text-xl font-bold text-slate-900">EZTest</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm shadow-sm hover:shadow-md"
              >
                Get started →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-medium text-indigo-700">✨ Open Source & Self-Hosted</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
            Test Management,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Lightweight, powerful test management platform that runs on minimal hardware.
            Perfect for teams who want control without complexity.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              Start Testing 🚀
            </Link>
            <Link
              href="/auth/login"
              className="bg-white text-slate-700 px-8 py-4 rounded-xl hover:bg-slate-50 transition-all font-semibold text-lg shadow-md border border-slate-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Multi-Project Support</h3>
            <p className="text-slate-600 leading-relaxed">
              Manage multiple projects with role-based access control. Keep everything organized in one place.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="text-4xl mb-4">🗂️</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Hierarchical Tests</h3>
            <p className="text-slate-600 leading-relaxed">
              Organize tests in hierarchical suites. Create detailed test cases with steps and expected results.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="text-4xl mb-4">▶️</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Test Execution</h3>
            <p className="text-slate-600 leading-relaxed">
              Run tests and track results in real-time. Monitor progress with comprehensive dashboards.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Traceability</h3>
            <p className="text-slate-600 leading-relaxed">
              Link test cases to requirements. Ensure complete coverage and maintain audit trails.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Collaboration</h3>
            <p className="text-slate-600 leading-relaxed">
              Add comments, attach files, and collaborate with your team. Everything in context.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Lightweight</h3>
            <p className="text-slate-600 leading-relaxed">
              Runs efficiently on minimal hardware. 1 core, 2GB RAM is all you need to get started.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose EZTest? 🤔</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Built for teams who value simplicity, control, and open-source freedom
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-indigo-100">Open Source</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2GB</div>
              <div className="text-indigo-100">RAM Required</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">∞</div>
              <div className="text-indigo-100">Projects & Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧪</span>
              <span className="font-semibold text-slate-900">EZTest</span>
            </div>
            <p className="text-sm text-slate-500">
              Self-hostable test management platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
