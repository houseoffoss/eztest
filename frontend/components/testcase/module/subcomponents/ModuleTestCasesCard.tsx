'use client';

import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Plus, TestTube2 } from 'lucide-react';
import { TestCase } from '../../types';
import { TestCaseTable } from '@/frontend/components/testcase/subcomponents/TestCaseTable';

interface ModuleTestCasesCardProps {
  testCases: TestCase[];
  testCasesCount: number;
  onCreateClick: () => void;
  onAddExistingClick: () => void;
  onTestCaseClick: (testCaseId: string) => void;
  onDeleteClick: (testCase: TestCase) => void;
  canCreate: boolean;
  canDelete: boolean;
}

export function ModuleTestCasesCard({
  testCases,
  testCasesCount,
  onCreateClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAddExistingClick,
  onTestCaseClick,
  onDeleteClick,
  canCreate,
  canDelete,
}: ModuleTestCasesCardProps) {
  const headerAction = canCreate && testCases.length > 0 ? (
    <ButtonPrimary size="sm" onClick={onCreateClick}>
      <Plus className="w-4 h-4 mr-2" />
      Create
    </ButtonPrimary>
  ) : undefined;

  return (
    <DetailCard title={`Test Cases (${testCasesCount})`} headerAction={headerAction} contentClassName="p-0">
      {testCases && testCases.length > 0 ? (
        <TestCaseTable
          testCases={testCases}
          groupedByModule={false}
          onClick={onTestCaseClick}
          onDelete={onDeleteClick}
          canDelete={canDelete}
        />
      ) : (
        <div className="text-center py-8 px-4">
          <TestTube2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white/60 mb-4">
            No test cases in this module yet
          </p>
          {canCreate && (
            <ButtonPrimary onClick={onCreateClick} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Create Test Case
            </ButtonPrimary>
          )}
        </div>
      )}
    </DetailCard>
  );
}
