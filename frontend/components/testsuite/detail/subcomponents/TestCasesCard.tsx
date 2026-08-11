import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Plus } from 'lucide-react';
import { TestCase, Module } from '@/frontend/components/testcase/types';
import { TestSuiteTestCaseTable } from './TestSuiteTestCaseTable';

interface TestCasesCardProps {
  testCases: TestCase[];
  testCasesCount: number;
  modules?: Module[];
  onAddTestCase: () => void;
  onTestCaseClick: (testCaseId: string) => void;
  onRemoveTestCase?: (testCase: TestCase) => void;
  canAdd?: boolean;
  canDelete?: boolean;
  projectId?: string;
}

export function TestCasesCard({
  testCases,
  testCasesCount,
  modules = [],
  onAddTestCase,
  onTestCaseClick,
  onRemoveTestCase,
  canAdd = false,
  canDelete = false,
  projectId,
}: TestCasesCardProps) {
  return (
    <DetailCard 
      title={`Test Cases (${testCasesCount})`} 
      contentClassName="p-0"
    >
      {testCases && testCases.length > 0 ? (
        <TestSuiteTestCaseTable
          testCases={testCases}
          modules={modules}
          onClick={onTestCaseClick}
          onDelete={onRemoveTestCase}
          canDelete={canDelete}
          projectId={projectId}
        />
      ) : (
        <div className="text-center py-8">
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-white/60 mb-4">
            No test cases in this suite yet
          </p>
          {canAdd && (
            <ButtonPrimary onClick={onAddTestCase} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Add Test Cases
            </ButtonPrimary>
          )}
        </div>
      )}
    </DetailCard>
  );
}
