'use client';

import { DetailPageHeader } from '@/frontend/reusable-components/layout/DetailPageHeader';
import { Edit, Trash2 } from 'lucide-react';
import { TestCase, TestCaseFormData } from '../types';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';

interface TestCaseHeaderProps {
  testCase: TestCase;
  isEditing: boolean;
  formData: TestCaseFormData;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onFormChange: (data: TestCaseFormData) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
  saving?: boolean;
}

export function TestCaseHeader({
  testCase,
  isEditing,
  formData,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onFormChange,
  canUpdate = true,
  canDelete = true,
  saving = false,
}: TestCaseHeaderProps) {
  const { options: priorityOptions } = useDropdownOptions('TestCase', 'priority');
  const { options: statusOptions } = useDropdownOptions('TestCase', 'status');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'LOW':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'DRAFT':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DEPRECATED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const priorityBadgeProps = getDynamicBadgeProps(testCase.priority, priorityOptions);
  const statusBadgeProps = getDynamicBadgeProps(testCase.status, statusOptions);

  // Get labels from dropdown options
  const priorityLabel = priorityOptions.find(opt => opt.value === testCase.priority)?.label || testCase.priority;
  const statusLabel = statusOptions.find(opt => opt.value === testCase.status)?.label || testCase.status;

  return (
    <DetailPageHeader
      title={testCase.title}
      subtitle={`${testCase.project.name} (${testCase.project.key})`}
      isEditing={isEditing}
      editTitle={formData.title}
      onTitleChange={(title) => onFormChange({ ...formData, title })}
      maxLength={200}
      badges={[
        { 
          label: '優先度', 
          value: priorityLabel, 
          className: priorityBadgeProps.className,
          style: priorityBadgeProps.style 
        },
        { 
          label: '状態', 
          value: statusLabel, 
          className: statusBadgeProps.className,
          style: statusBadgeProps.style 
        },
      ]}
      actions={[
        { 
          label: 'Edit', 
          icon: Edit, 
          onClick: onEdit, 
          show: canUpdate,
          buttonName: 'TestCase Detail - Edit',
        },
        { 
          label: 'Delete', 
          icon: Trash2, 
          onClick: onDelete, 
          variant: 'destructive', 
          show: canDelete,
          buttonName: 'TestCase Detail - Delete',
        },
      ]}
      editActions={{
        onSave,
        onCancel,
        saving,
      }}
    />
  );
}
