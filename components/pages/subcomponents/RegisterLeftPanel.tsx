import Link from 'next/link';
import { Card } from '@/elements/card';

export const RegisterLeftPanel = () => {
  return (
    <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-10 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 25% 30%, rgba(11,114,255,0.25), transparent 60%), radial-gradient(circle at 80% 70%, rgba(255,122,24,0.25), transparent 55%)',
        }}
      />
      <div className="bg-white/[0.02] border-white/10 border-2 backdrop-blur-xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] h-full w-full p-10 flex flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-12 group">
            <span className="text-3xl">🧪</span>
            <span className="text-2xl font-bold group-hover:scale-105 transition-transform text-primary">
              EZTest
            </span>
          </Link>
          <h2 className="text-4xl font-bold mb-4 text-white">Start Testing Smarter 🚀</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Join teams who have simplified their test management. No credit card required, start for free today.
          </p>
        </div>
        <div className="space-y-4">
          <Card variant="glass" className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold mb-1">Complete Control</h3>
                <p className="text-muted-foreground text-sm">
                  Self-host on your infrastructure, own your data completely
                </p>
              </div>
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold mb-1">Lightweight & Fast</h3>
                <p className="text-muted-foreground text-sm">
                  Runs on minimal resources, no complex setup required
                </p>
              </div>
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔓</span>
              <div>
                <h3 className="font-semibold mb-1">100% Open Source</h3>
                <p className="text-muted-foreground text-sm">Free forever, transparent and community-driven</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
