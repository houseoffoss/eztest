import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';
import { Button } from '@/elements/button';
import { Badge } from '@/elements/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/elements/table';
import { Plus, TestTube2, Trash2 } from 'lucide-react';
import { PriorityBadge } from '@/components/design/PriorityBadge';
import { TestCase } from '@/frontend/components/testcase/types';

interface TestCasesCardProps {
  testCases: TestCase[];
  testCasesCount: number;
  onAddTestCase: () => void;
  onTestCaseClick: (testCaseId: string) => void;
  onRemoveTestCase?: (testCase: TestCase) => void;
  canAdd?: boolean;
  canDelete?: boolean;
}

export function TestCasesCard({
  testCases,
  testCasesCount,
  onAddTestCase,
  onTestCaseClick,
  onRemoveTestCase,
  canAdd = false,
  canDelete = false,
}: TestCasesCardProps) {
  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Test Cases ({testCasesCount})</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {testCases && testCases.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Steps</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                  {onRemoveTestCase && canDelete && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases.map((testCase) => (
                  <TableRow
                    key={testCase.id}
                    className="cursor-pointer hover:bg-white/5"
                    onClick={() => onTestCaseClick(testCase.id)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-white/90">
                          {testCase.title}
                        </p>
                        {testCase.description && (
                          <p className="text-xs text-white/60 line-clamp-1 mt-1">
                            {testCase.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge
                        priority={
                          testCase.priority.toLowerCase() as
                            | 'low'
                            | 'medium'
                            | 'high'
                            | 'critical'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          testCase.status === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : testCase.status === 'DRAFT'
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                        }
                      >
                        {testCase.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-white/70">
                      {testCase._count.steps}
                    </TableCell>
                    <TableCell className="text-right text-white/70">
                      {testCase._count.results}
                    </TableCell>
                    {onRemoveTestCase && canDelete && (
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveTestCase(testCase);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <TestTube2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-white/60 mb-4">
              No test cases in this suite yet
            </p>
            {canAdd && (
              <Button variant="glass-primary" size="sm" onClick={onAddTestCase}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Test Case
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
