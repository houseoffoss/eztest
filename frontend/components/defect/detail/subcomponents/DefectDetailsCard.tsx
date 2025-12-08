'use client';

import { DetailCard } from '@/components/design/DetailCard';
import { Defect, DefectFormData } from '../types';
import { FormBuilder, FormFieldConfig, SelectOption } from '@/frontend/components/form';
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
        .then((data: { data?: Array<{ user: { id: string; name: string; email: string } }> }) => {
          if (data.data && Array.isArray(data.data)) {
            const mappedUsers = data.data.map((member) => ({
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

  const SEVERITY_OPTIONS: SelectOption[] = [
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const PRIORITY_OPTIONS: SelectOption[] = [
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const STATUS_OPTIONS: SelectOption[] = [
    { value: 'NEW', label: 'New' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'FIXED', label: 'Fixed' },
    { value: 'TESTED', label: 'Tested' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  const assignedToOptions: SelectOption[] = [
    { value: 'unassigned', label: 'Not Assigned' },
    ...users.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    })),
  ];

  const fields: FormFieldConfig[] = [
    {
      name: 'severity',
      label: 'Severity',
      type: 'select',
      options: SEVERITY_OPTIONS,
      required: true,
      cols: 1,
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: PRIORITY_OPTIONS,
      required: true,
      cols: 1,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: STATUS_OPTIONS,
      required: true,
      cols: 1,
    },
    {
      name: 'assignedToId',
      label: 'Assigned To',
      type: 'select',
      options: assignedToOptions,
      cols: 1,
    },
    {
      name: 'environment',
      label: 'Environment',
      type: 'textarea',
      placeholder: 'e.g., Production, Staging, Development',
      rows: 2,
      cols: 1,
    },
    {
      name: 'dueDate',
      label: 'Due Date',
      type: 'date',
      cols: 1,
    },
    {
      name: 'progressPercentage',
      label: 'Progress (%)',
      type: 'number',
      placeholder: '0-100',
      cols: 1,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Detailed description of the defect',
      rows: 4,
      cols: 1,
    },
  ];

  const handleFieldChange = (field: keyof DefectFormData, value: string | number | null) => {
    if (field === 'assignedToId' && value === 'unassigned') {
      onFormChange({ ...formData, assignedToId: null });
    } else if (field === 'progressPercentage') {
      const numValue = value !== null && value !== '' ? Number(value) : null;
      if (numValue === null || (numValue >= 0 && numValue <= 100)) {
        onFormChange({ ...formData, [field]: numValue });
      }
    } else if (field === 'dueDate') {
      // Keep as date string for form display, only convert to ISO datetime on actual save
      const dateStr = typeof value === 'string' ? value : null;
      onFormChange({ ...formData, [field]: dateStr });
    } else {
      onFormChange({ ...formData, [field]: value });
    }
  };

  return (
    <DetailCard title="Details" contentClassName="space-y-6">
      {isEditing ? (
        <FormBuilder
          fields={fields}
          formData={formData}
          errors={errors}
          onFieldChange={handleFieldChange}
          variant="glass"
        />
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
