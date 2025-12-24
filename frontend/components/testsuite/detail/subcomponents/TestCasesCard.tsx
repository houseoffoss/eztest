import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Plus } from 'lucide-react';
import { TestCase, Module } from '@/frontend/components/testcase/types';
import { TestCaseTable } from '@/frontend/reusable-components/tables/TestCaseTable';

interface TestCasesCardProps {
  testCases: TestCase[];
  testCasesCount: number;
  modules?: Module[];
  onAddTestCase: () => void;
  onTestCaseClick: (testCaseId: string) => void;
  onRemoveTestCase?: (testCase: TestCase) => void;
  canAdd?: boolean;
  canDelete?: boolean;
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
}: TestCasesCardProps) {
  return (
    <DetailCard 
      title={`Test Cases (${testCasesCount})`} 
      contentClassName=""
    >
      {testCases && testCases.length > 0 ? (
        <TestCaseTable
          testCases={testCases}
          groupedByModule={true}
          modules={modules}
          onClick={onTestCaseClick}
          onDelete={onRemoveTestCase}
          canDelete={canDelete}
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
