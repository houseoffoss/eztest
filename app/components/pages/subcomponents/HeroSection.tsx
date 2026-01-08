import Link from 'next/link';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';

export const HeroSection = () => {
  return (
    <div className="text-center mb-24 relative">
      {/* Simple Gradient Orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10"></div>

      <Badge className="mb-8">
        <span>✨ Open Source & Self-Hosted</span>
      </Badge>

      <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
        Test Management,
        <br />
        <span className="text-primary">Made Simple</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
        Lightweight, powerful test management platform that runs on minimal hardware.
        Perfect for teams who want control without complexity.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link href="/auth/register">
          <ButtonPrimary size="lg" className="cursor-pointer" buttonName="Home Page - Hero Section - Start Testing">
            Start Testing 🚀
          </ButtonPrimary>
        </Link>
        <Link href="/auth/login">
          <ButtonSecondary size="lg" className="cursor-pointer" buttonName="Home Page - Hero Section - Sign In">
            Sign In
          </ButtonSecondary>
        </Link>
      </div>
    </div>
  );
};
