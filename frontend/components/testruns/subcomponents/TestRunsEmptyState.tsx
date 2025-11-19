import { Card, CardContent } from '@/elements/card';
import { Button } from '@/elements/button';
import { AlertCircle, Plus } from 'lucide-react';

interface TestRunsEmptyStateProps {
  hasTestRuns: boolean;
  onCreateClick: () => void;
}

export function TestRunsEmptyState({
  hasTestRuns,
  onCreateClick,
}: TestRunsEmptyStateProps) {
  return (
    <Card variant="glass">
      <CardContent className="py-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No test runs found
        </h3>
        <p className="text-gray-400 mb-4">
          {hasTestRuns
            ? 'Try adjusting your filters'
            : 'Get started by creating your first test run'}
        </p>
        {!hasTestRuns && (
          <Button variant="glass-primary" onClick={onCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            Create Test Run
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
