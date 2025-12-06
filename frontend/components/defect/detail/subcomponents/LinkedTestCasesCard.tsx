'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TestTube2, AlertCircle } from 'lucide-react';
import { DetailCard } from '@/components/design/DetailCard';
import { DataTable, type ColumnDef } from '@/components/design/DataTable';
import { Badge } from '@/elements/badge';
import { LinkTestCaseDialog } from './LinkTestCaseDialog';
import { Defect } from '../types';

interface LinkedTestCasesCardProps {
  defect: Defect;
  onRefresh: () => void;
}

interface TestCaseRow {
  id: string;
  testCaseId: string;
  tcId: string;
  title: string;
  failureCount: number;
}

export function LinkedTestCasesCard({ defect, onRefresh }: LinkedTestCasesCardProps) {
  const router = useRouter();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  // Ensure testCases is an array
  const testCases = Array.isArray(defect.testCases) ? defect.testCases : [];
  const alreadyLinkedTestCaseIds = testCases.map((tc) => tc.testCase.id);

  // Transform the data for the table
  const tableData: TestCaseRow[] = testCases.map((tc) => ({
    id: tc.testCase.id,
    testCaseId: tc.testCase.id,
    tcId: tc.testCase.tcId,
    title: tc.testCase.title,
    failureCount: tc.failureCount || 0,
  }));

  const columns: ColumnDef<TestCaseRow>[] = [
    {
      key: 'tcId',
      label: 'Test Case ID',
      render: (value: unknown) => (
        <span className="text-blue-400 font-mono text-sm font-semibold">
          {value as string}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (value: unknown) => (
        <span className="text-white/90 text-sm font-medium">
          {value as string}
        </span>
      ),
    },
    {
      key: 'failureCount',
      label: 'Failures',
      render: (value: unknown) => {
        const count = value as number;
        if (count === 0) {
          return (
            <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-500 border-gray-500/20">
              No failures
            </Badge>
          );
        }
        return (
          <div className="flex items-center justify-end gap-1">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
              {count} {count === 1 ? 'failure' : 'failures'}
            </Badge>
          </div>
        );
      },
      align: 'right',
    },
  ];

  return (
    <>
      <DetailCard 
        title="Linked Test Cases"
        headerAction={
          testCases.length > 0 && (
            <span className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
              {testCases.length} {testCases.length === 1 ? 'Test Case' : 'Test Cases'}
            </span>
          )
        }
        contentClassName=""
      >
      {testCases.length === 0 ? (
        <div className="text-center py-8">
          <TestTube2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60 text-sm">
            No test cases linked to this defect yet
          </p>
          <p className="text-white/40 text-xs mt-1">
            Link test cases from test runs or manually associate them
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          onRowClick={(row) => router.push(`/projects/${defect.projectId}/testcases/${row.testCaseId}`)}
          emptyMessage="No linked test cases"
        />
      )}
      </DetailCard>

      <LinkTestCaseDialog
        projectId={defect.projectId}
        defectId={defect.id}
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onTestCaseLinked={() => {
          setLinkDialogOpen(false);
          onRefresh();
        }}
        alreadyLinkedTestCaseIds={alreadyLinkedTestCaseIds}
      />
    </>
  );
}
