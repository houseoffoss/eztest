'use client';

import { DetailCard } from '@/components/design/DetailCard';
import { Defect, DefectFormData } from '../types';
import { Textarea } from '@/elements/textarea';
import { Label } from '@/elements/label';
import { useEffect, useState } from 'react';

interface DefectDetailsCardProps {
  defect: Defect;
  isEditing: boolean;
  formData: DefectFormData;
  errors?: Record<string, string>;
  onFormChange: (data: DefectFormData) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function DefectDetailsCard({
  defect,
  isEditing,
  formData,
  errors = {},
  onFormChange,
}: DefectDetailsCardProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isEditing) {
      fetch(`/api/projects/${defect.projectId}/members`)
        .then((res) => res.json())
        .then((data) => setUsers(data.members || []))
        .catch((err) => console.error('Failed to fetch users:', err));
    }
  }, [isEditing, defect.projectId]);

  const SEVERITY_OPTIONS = [
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const PRIORITY_OPTIONS = [
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const STATUS_OPTIONS = [
    { value: 'NEW', label: 'New' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'FIXED', label: 'Fixed' },
    { value: 'TESTED', label: 'Tested' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  const DEFECT_TYPE_OPTIONS = [
    { value: 'BUG', label: 'Bug' },
    { value: 'IMPROVEMENT', label: 'Improvement' },
    { value: 'UI_ISSUE', label: 'UI Issue' },
    { value: 'BACKEND_ISSUE', label: 'Backend Issue' },
    { value: 'PERFORMANCE', label: 'Performance' },
    { value: 'SECURITY', label: 'Security' },
    { value: 'DATA_ISSUE', label: 'Data Issue' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <DetailCard title="Details" contentClassName="space-y-4">
      {isEditing ? (
        <>
          {/* Severity */}
          <div>
            <Label htmlFor="severity">Severity *</Label>
            <select
              id="severity"
              value={formData.severity}
              onChange={(e) =>
                onFormChange({ ...formData, severity: e.target.value })
              }
              required
              className="flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm whitespace-nowrap transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 h-10 bg-[#101a2b]/70 border-white/15 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl hover:bg-[#101a2b]/80 hover:border-white/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <option value="">Select Severity</option>
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.severity && (
              <p className="text-xs text-red-400 mt-1">{errors.severity}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority *</Label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                onFormChange({ ...formData, priority: e.target.value })
              }
              required
              className="flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm whitespace-nowrap transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 h-10 bg-[#101a2b]/70 border-white/15 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl hover:bg-[#101a2b]/80 hover:border-white/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <option value="">Select Priority</option>
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p className="text-xs text-red-400 mt-1">{errors.priority}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                onFormChange({ ...formData, status: e.target.value })
              }
              required
              className="flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm whitespace-nowrap transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 h-10 bg-[#101a2b]/70 border-white/15 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl hover:bg-[#101a2b]/80 hover:border-white/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <option value="">Select Status</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-red-400 mt-1">{errors.status}</p>
            )}
          </div>

          {/* Defect Type */}
          <div>
            <Label htmlFor="defectType">Type *</Label>
            <select
              id="defectType"
              value={formData.defectType}
              onChange={(e) =>
                onFormChange({ ...formData, defectType: e.target.value })
              }
              required
              className="flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm whitespace-nowrap transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 h-10 bg-[#101a2b]/70 border-white/15 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl hover:bg-[#101a2b]/80 hover:border-white/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <option value="">Select Type</option>
              {DEFECT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.defectType && (
              <p className="text-xs text-red-400 mt-1">{errors.defectType}</p>
            )}
          </div>

          {/* Assigned To */}
          <div>
            <Label htmlFor="assignedToId">Assigned To</Label>
            <select
              id="assignedToId"
              value={formData.assignedToId || ''}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  assignedToId: e.target.value || null,
                })
              }
              className="flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm whitespace-nowrap transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 h-10 bg-[#101a2b]/70 border-white/15 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl hover:bg-[#101a2b]/80 hover:border-white/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <option value="">Not Assigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Environment */}
          <div>
            <Label htmlFor="environment">Environment</Label>
            <Textarea
              id="environment"
              value={formData.environment || ''}
              onChange={(e) =>
                onFormChange({ ...formData, environment: e.target.value })
              }
              rows={2}
              placeholder="e.g., Production, Staging, Development"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) =>
                onFormChange({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Detailed description of the defect"
            />
          </div>

          {/* Steps to Reproduce */}
          <div>
            <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
            <Textarea
              id="stepsToReproduce"
              value={formData.stepsToReproduce || ''}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  stepsToReproduce: e.target.value,
                })
              }
              rows={4}
              placeholder="1. Navigate to..."
            />
          </div>

          {/* Expected Result */}
          <div>
            <Label htmlFor="expectedResult">Expected Result</Label>
            <Textarea
              id="expectedResult"
              value={formData.expectedResult || ''}
              onChange={(e) =>
                onFormChange({ ...formData, expectedResult: e.target.value })
              }
              rows={3}
              placeholder="What should happen"
            />
          </div>

          {/* Actual Result */}
          <div>
            <Label htmlFor="actualResult">Actual Result</Label>
            <Textarea
              id="actualResult"
              value={formData.actualResult || ''}
              onChange={(e) =>
                onFormChange({ ...formData, actualResult: e.target.value })
              }
              rows={3}
              placeholder="What actually happened"
            />
          </div>
        </>
      ) : (
        <>
          {defect.description && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Description
              </h4>
              <p className="text-white/90 break-words whitespace-pre-wrap">
                {defect.description}
              </p>
            </div>
          )}

          {defect.environment && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Environment
              </h4>
              <p className="text-white/90 break-words whitespace-pre-wrap">
                {defect.environment}
              </p>
            </div>
          )}

          {defect.stepsToReproduce && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Steps to Reproduce
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {defect.stepsToReproduce}
              </p>
            </div>
          )}

          {defect.expectedResult && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Expected Result
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {defect.expectedResult}
              </p>
            </div>
          )}

          {defect.actualResult && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Actual Result
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {defect.actualResult}
              </p>
            </div>
          )}
        </>
      )}
    </DetailCard>
  );
}
