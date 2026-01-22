import { Card, CardContent } from '@/frontend/reusable-elements/cards/Card';

export const PhilosophySection = () => {
  return (
    <Card variant="glass" className="mb-0">
      <CardContent className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Philosophy</h2>
          <div className="space-y-4 text-white/90 text-lg leading-relaxed">
            <p>
              Most Test Management tools are glorified excel sheets but charge $19 per user per month. Why pay $19
              for a fancy excel sheet when you can get state-of-the-art AI coding agents for the same?
            </p>
            <p className="text-primary font-semibold">
              WHY NOT use AI coding agent to build a modern, useful test management tool?
            </p>
            <p className="text-white/80">
              The goal is not to reinvent the wheel, it&apos;s to break the cycle of mediocre, overpriced software
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

