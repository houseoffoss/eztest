import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { Plus, TestTube2, Folder } from 'lucide-react';

interface QuickActionsCardProps {
  onCreateTestCase: () => void;
  onAddTestCase: () => void;
  onAddExistingTestCases: () => void;
  onViewAllTestCases: () => void;
  onViewAllSuites: () => void;
  canCreateTestCase?: boolean;
}

export function QuickActionsCard({
  onCreateTestCase,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAddTestCase,
  onAddExistingTestCases,
  onViewAllTestCases,
  onViewAllSuites,
  canCreateTestCase = false,
}: QuickActionsCardProps) {
  return (
    <DetailCard title="Quick Actions" contentClassName="space-y-2">
      {canCreateTestCase && (
        <Button
          variant="glass"
          className="w-full justify-start"
          onClick={onCreateTestCase}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Test Case
        </Button>
      )}
      {canCreateTestCase && (
        <Button
          variant="glass"
          className="w-full justify-start"
          onClick={onAddExistingTestCases}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Test Cases
        </Button>
      )}
      <Button
        variant="glass"
        className="w-full justify-start"
        onClick={onViewAllTestCases}
      >
        <TestTube2 className="w-4 h-4 mr-2" />
        View All Test Cases
      </Button>
      <Button
        variant="glass"
        className="w-full justify-start"
        onClick={onViewAllSuites}
      >
        <Folder className="w-4 h-4 mr-2" />
        View All Suites
      </Button>
    </DetailCard>
  );
}
