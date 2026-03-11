'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bug, Plus } from 'lucide-react';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { DataTable, type ColumnDef } from '@/frontend/reusable-components/tables/DataTable';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { TestCase } from '../types';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';
import { LinkDefectDialog } from './LinkDefectDialog';
import { usePermissions } from '@/hooks/usePermissions';

interface LinkedDefectsCardProps {
  testCase: TestCase;
  onRefresh?: () => void;
}

interface DefectRow {
  id: string;
  defectId: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export function LinkedDefectsCard({ testCase, onRefresh }: LinkedDefectsCardProps) {
  const router = useRouter();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { options: severityOptions } = useDropdownOptions('Defect', 'severity');
  const { options: statusOptions } = useDropdownOptions('Defect', 'status');
  const { hasPermission: hasPermissionCheck } = usePermissions();
  
  // Check if user has permission to link defects
  const canLinkDefect = hasPermissionCheck('defects:update');

  // Ensure defects is an array
  const defects = Array.isArray(testCase.defects) ? testCase.defects : [];
  const alreadyLinkedDefectIds = defects
    .filter((d) => d.Defect || (d as { defect?: { id: string } }).defect)
    .map((d) => {
      const defectData = d.Defect || (d as { defect?: { id: string } }).defect;
      return defectData?.id || '';
    })
    .filter((id) => id !== '');

  // Transform the data for the table, filtering out defects without valid data
  const tableData: DefectRow[] = defects
    .filter((d) => d.Defect || (d as { defect?: { id: string } }).defect)
    .map((d) => {
      const defectData = d.Defect || (d as { defect?: { id: string; defectId: string; title: string; severity: string; status: string; priority: string } }).defect;
      if (!defectData) {
        return null;
      }
      return {
        id: defectData.id,
        defectId: defectData.defectId,
        title: defectData.title,
        severity: defectData.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
        status: defectData.status,
        priority: defectData.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
      };
    })
    .filter((row): row is DefectRow => row !== null);

  const columns: ColumnDef<DefectRow>[] = [
    {
      key: 'defectId',
      label: '不具合ID',
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
      render: (value: unknown, row: DefectRow) => {
        const badgeProps = getDynamicBadgeProps(row.severity, severityOptions);
        const severityLabel = severityOptions.find(opt => opt.value === row.severity)?.label || row.severity;
        return (
          <Badge 
            variant="outline" 
            className={`text-xs ${badgeProps.className}`}
            style={badgeProps.style}
          >
            {severityLabel}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown, row: DefectRow) => {
        const badgeProps = getDynamicBadgeProps(row.status, statusOptions);
        const statusLabel = statusOptions.find(opt => opt.value === row.status)?.label || row.status;
        return (
          <Badge 
            variant="outline" 
            className={`text-xs ${badgeProps.className}`}
            style={badgeProps.style}
          >
            {statusLabel}
          </Badge>
        );
      },
      align: 'right',
    },
  ];

  return (
    <>
      <DetailCard 
        title="Linked Defects"
        headerAction={
          <div className="flex items-center gap-3">
            {defects.length > 0 && (
              <span className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                {defects.length} {defects.length === 1 ? 'Defect' : 'Defects'}
              </span>
            )}
            {canLinkDefect && (
              <ButtonPrimary
                size="sm"
                onClick={() => setLinkDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Link Defect
              </ButtonPrimary>
            )}
          </div>
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

      <LinkDefectDialog
        projectId={testCase.project.id}
        testCaseId={testCase.id}
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onDefectLinked={() => {
          setLinkDialogOpen(false);
          onRefresh?.();
        }}
        alreadyLinkedDefectIds={alreadyLinkedDefectIds}
      />
    </>
  );
}
