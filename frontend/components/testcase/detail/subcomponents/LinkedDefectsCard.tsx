'use client';

import { useRouter } from 'next/navigation';
import { Bug, AlertCircle } from 'lucide-react';
import { DetailCard } from '@/components/design/DetailCard';
import { DataTable, type ColumnDef } from '@/components/design/DataTable';
import { Badge } from '@/elements/badge';
import { TestCase } from '../types';

interface LinkedDefectsCardProps {
  testCase: TestCase;
}

interface DefectRow {
  id: string;
  defectId: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export function LinkedDefectsCard({ testCase }: LinkedDefectsCardProps) {
  const router = useRouter();

  // Ensure defects is an array
  const defects = Array.isArray(testCase.defects) ? testCase.defects : [];

  // Transform the data for the table, filtering out defects without valid data
  const tableData: DefectRow[] = defects
    .filter((d: any) => d.Defect || d.defect)
    .map((d: any) => {
      const defectData = d.Defect || d.defect;
      return {
        id: defectData.id,
        defectId: defectData.defectId,
        title: defectData.title,
        severity: defectData.severity,
        status: defectData.status,
        priority: defectData.priority,
      };
    });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'LOW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'IN_PROGRESS':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'FIXED':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'TESTED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'CLOSED':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const columns: ColumnDef<DefectRow>[] = [
    {
      key: 'defectId',
      label: 'Defect ID',
      render: (value: unknown) => (
        <span className="text-red-400 font-mono text-sm font-semibold">
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
      key: 'severity',
      label: 'Severity',
      render: (value: unknown, row: DefectRow) => (
        <Badge variant="outline" className={`text-xs ${getSeverityColor(row.severity)}`}>
          {value as string}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown, row: DefectRow) => (
        <Badge variant="outline" className={`text-xs ${getStatusColor(row.status)}`}>
          {(value as string).replace('_', ' ')}
        </Badge>
      ),
      align: 'right',
    },
  ];

  return (
    <DetailCard 
      title="Linked Defects"
      headerAction={
        defects.length > 0 && (
          <span className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
            {defects.length} {defects.length === 1 ? 'Defect' : 'Defects'}
          </span>
        )
      }
      contentClassName=""
    >
      {defects.length === 0 ? (
        <div className="text-center py-8">
          <Bug className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60 text-sm">
            No defects linked to this test case yet
          </p>
          <p className="text-white/40 text-xs mt-1">
            Defects will appear here when they are linked to this test case
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          onRowClick={(row) => router.push(`/projects/${testCase.project.id}/defects/${row.id}`)}
          emptyMessage="No linked defects"
        />
      )}
    </DetailCard>
  );
}
