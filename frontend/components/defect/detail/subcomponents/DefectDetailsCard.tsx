'use client';

import { DetailCard } from '@/components/design/DetailCard';
import { Defect, DefectFormData } from '../types';
import { Textarea } from '@/elements/textarea';
import { Label } from '@/elements/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';
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
        .then((data) => {
          if (data.data && Array.isArray(data.data)) {
            const mappedUsers = data.data.map((member: any) => ({
              id: member.user.id,
              name: member.user.name,
              email: member.user.email,
            }));
            setUsers(mappedUsers);
          }
        })
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

  return (
    <DetailCard title="Details" contentClassName="space-y-6">
      {isEditing ? (
        <>
          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity *</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) =>
                onFormChange({ ...formData, severity: value })
              }
              required
            >
              <SelectTrigger variant="glass">
                <SelectValue placeholder="Select Severity" />
              </SelectTrigger>
              <SelectContent variant="glass">
                {SEVERITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.severity && (
              <p className="text-xs text-red-400 mt-1">{errors.severity}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                onFormChange({ ...formData, priority: value })
              }
              required
            >
              <SelectTrigger variant="glass">
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent variant="glass">
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-xs text-red-400 mt-1">{errors.priority}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                onFormChange({ ...formData, status: value })
              }
              required
            >
              <SelectTrigger variant="glass">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent variant="glass">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-red-400 mt-1">{errors.status}</p>
            )}
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assignedToId">Assigned To</Label>
            <Select
              value={formData.assignedToId || 'unassigned'}
              onValueChange={(value) =>
                onFormChange({
                  ...formData,
                  assignedToId: value === 'unassigned' ? null : value,
                })
              }
            >
              <SelectTrigger variant="glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent variant="glass">
                <SelectItem value="unassigned">Not Assigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Environment */}
          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Textarea
              id="environment"
              variant="glass"
              value={formData.environment || ''}
              onChange={(e) =>
                onFormChange({ ...formData, environment: e.target.value })
              }
              rows={2}
              placeholder="e.g., Production, Staging, Development"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate || ''}
              onChange={(e) =>
                onFormChange({ ...formData, dueDate: e.target.value || null })
              }
              className="flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm whitespace-nowrap transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 h-10 bg-[#101a2b]/70 border-white/15 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl hover:bg-[#101a2b]/80 hover:border-white/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>

          {/* Progress Percentage */}
          <div className="space-y-2">
            <Label htmlFor="progressPercentage">Progress (%)</Label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              id="progressPercentage"
              value={formData.progressPercentage ?? ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                const numValue = value ? Number(value) : null;
                if (numValue === null || (numValue >= 0 && numValue <= 100)) {
                  onFormChange({
                    ...formData,
                    progressPercentage: numValue,
                  });
                }
              }}
              placeholder="0-100"
              className="flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm whitespace-nowrap transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 h-10 bg-[#101a2b]/70 border-white/15 text-white/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl hover:bg-[#101a2b]/80 hover:border-white/20 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              variant="glass"
              value={formData.description || ''}
              onChange={(e) =>
                onFormChange({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Detailed description of the defect"
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

          {defect.dueDate && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Due Date
              </h4>
              <p className="text-white/90">
                {new Date(defect.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {defect.progressPercentage !== null && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Progress
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${defect.progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-white/90 min-w-[3rem] text-right">
                  {defect.progressPercentage}%
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </DetailCard>
  );
}
