'use client';

import { Card, CardContent } from '@/elements/card';
import { Button } from '@/elements/button';
import { Folder, Plus } from 'lucide-react';

interface EmptyTestSuiteStateProps {
  onCreateClick: () => void;
  canCreate?: boolean;
}

export function EmptyTestSuiteState({ onCreateClick, canCreate = false }: EmptyTestSuiteStateProps) {
  return (
    <Card
      variant="glass"
      className="hover:shadow-xl hover:shadow-primary/10 transition-all"
    >
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Folder className="w-16 h-16 text-white/50 mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-white">No test suites found</h3>
        <p className="text-white/60 mb-6 text-center max-w-sm">
          Organize your test cases into suites to keep your testing structured and manageable.
        </p>
        {canCreate && (
          <Button onClick={onCreateClick} variant="glass-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Test Suite
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
