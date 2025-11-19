'use client';

import { Button } from '@/elements/button';
import { Card, CardContent } from '@/elements/card';
import { AlertCircle, Plus } from 'lucide-react';

interface EmptyTestCaseStateProps {
  hasFilters: boolean;
  onCreateClick: () => void;
}

export function EmptyTestCaseState({ hasFilters, onCreateClick }: EmptyTestCaseStateProps) {
  return (
    <Card variant="glass">
      <CardContent className="py-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No test cases found
        </h3>
        <p className="text-gray-400 mb-4">
          {hasFilters
            ? 'Try adjusting your filters'
            : 'Get started by creating your first test case'}
        </p>
        {!hasFilters && (
          <Button onClick={onCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            Create Test Case
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
