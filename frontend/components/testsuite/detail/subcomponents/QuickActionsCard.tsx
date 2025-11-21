import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';
import { Button } from '@/elements/button';
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
  onAddTestCase,
  onAddExistingTestCases,
  onViewAllTestCases,
  onViewAllSuites,
  canCreateTestCase = false,
}: QuickActionsCardProps) {
  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
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
      </CardContent>
    </Card>
  );
}
