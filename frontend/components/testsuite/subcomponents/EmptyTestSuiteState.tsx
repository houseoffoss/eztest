'use client';

import { Button } from '@/elements/button';
import { Folder } from 'lucide-react';

interface EmptyTestSuiteStateProps {
  onCreateClick: () => void;
}

export function EmptyTestSuiteState({ onCreateClick }: EmptyTestSuiteStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-white/5 p-6 mb-4">
        <Folder className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        No test suites found
      </h3>
      <p className="text-gray-400 mb-6 max-w-md">
        Organize your test cases into suites to keep your testing structured and manageable.
      </p>
      <Button variant="glass-primary" onClick={onCreateClick}>
        Create Test Suite
      </Button>
    </div>
  );
}
