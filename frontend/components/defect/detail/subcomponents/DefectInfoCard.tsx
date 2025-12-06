'use client';

import { Badge } from '@/elements/badge';
import { DetailCard } from '@/components/design/DetailCard';
import { formatDateTime } from '@/lib/date-utils';
import { Defect } from '../types';

interface DefectInfoCardProps {
  defect: Defect;
}

export function DefectInfoCard({ defect }: DefectInfoCardProps) {
  return (
    <DetailCard title="Information" contentClassName="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">Defect ID</h4>
        <p className="text-white/90 text-sm font-mono">{defect.defectId}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">Created By</h4>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold text-white">
            {defect.createdBy.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white/90 text-sm">{defect.createdBy.name}</p>
            <p className="text-white/60 text-xs">{defect.createdBy.email}</p>
          </div>
        </div>
      </div>

      {defect.assignedTo && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">
            Assigned To
          </h4>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-sm font-semibold text-white">
              {defect.assignedTo.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white/90 text-sm">{defect.assignedTo.name}</p>
              <p className="text-white/60 text-xs">{defect.assignedTo.email}</p>
            </div>
          </div>
        </div>
      )}

      {defect.testCases && defect.testCases.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">
            Related Test Cases
          </h4>
          <div className="space-y-2">
            {defect.testCases.map((tc) => (
              <div key={tc.id}>
                <Badge variant="outline" className="font-mono">
                  {tc.testCase.tcId}
                </Badge>
                <p className="text-white/70 text-xs mt-1">{tc.testCase.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {defect.testRun && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">
            Test Run
          </h4>
          <Badge variant="outline">{defect.testRun.name}</Badge>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">Statistics</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-white/90">
            <span>Comments</span>
            <span>{defect.comments.length}</span>
          </div>
          <div className="flex justify-between text-white/90">
            <span>Attachments</span>
            <span>{defect.attachments.length}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">Created</h4>
        <p className="text-white/90 text-sm">
          {formatDateTime(defect.createdAt)}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">
          Last Updated
        </h4>
        <p className="text-white/90 text-sm">
          {formatDateTime(defect.updatedAt)}
        </p>
      </div>

      {defect.resolvedAt && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">Resolved At</h4>
          <p className="text-white/90 text-sm">
            {formatDateTime(defect.resolvedAt)}
          </p>
        </div>
      )}

      {defect.closedAt && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">Closed At</h4>
          <p className="text-white/90 text-sm">
            {formatDateTime(defect.closedAt)}
          </p>
        </div>
      )}
    </DetailCard>
  );
}
