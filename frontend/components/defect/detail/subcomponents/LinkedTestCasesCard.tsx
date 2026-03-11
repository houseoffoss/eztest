'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TestTube2, AlertCircle } from 'lucide-react';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
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

  return (
    <>
      <DetailCard 
        title="関連テストケース"
        headerAction={
          testCases.length > 0 && (
            <span className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
              {testCases.length} 件
            </span>
          )
        }
        contentClassName=""
      >
      {testCases.length === 0 ? (
        <div className="text-center py-8">
          <TestTube2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60 text-sm">
            このDefectにリンクされたテストケースはまだありません
          </p>
          <p className="text-white/40 text-xs mt-1">
            テスト実行からリンクするか、手動で関連付けられます
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {/* Header Row */}
          <div
            className="grid gap-3 px-3 py-2 text-xs font-semibold text-white/60 border-b border-white/10 rounded-t-md"
            style={{ gridTemplateColumns: '100px 1fr 150px' }}
          >
            <div>テストケースID</div>
            <div>タイトル</div>
            <div className="text-right">失敗数</div>
          </div>

          {/* Data Rows */}
          {tableData.map((row, rowIndex) => (
            <div
              key={row.id}
              className={`grid gap-3 px-3 py-2.5 transition-colors items-center text-sm rounded-sm hover:bg-accent/20 cursor-pointer ${
                rowIndex % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.04] border-b border-white/10'
              } ${
                rowIndex === tableData.length - 1 ? 'rounded-b-md' : ''
              }`}
              style={{ gridTemplateColumns: '100px 1fr 150px' }}
              onClick={() => router.push(`/projects/${defect.projectId}/testcases/${row.testCaseId}`)}
            >
              <span className="text-blue-400 font-mono text-sm font-semibold">{row.tcId}</span>
              <span className="text-white/90 truncate">{row.title}</span>
              <div className="text-right">
                {row.failureCount === 0 ? (
                  <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-500 border-gray-500/20 justify-self-end">
                    失敗なし
                  </Badge>
                ) : (
                  <div className="flex items-center justify-end gap-1">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/20">
                      {row.failureCount} 回
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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
