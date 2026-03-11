'use client';

import { DetailPageHeader } from '@/frontend/reusable-components/layout/DetailPageHeader';
import { Edit, Trash2, RotateCcw } from 'lucide-react';
import { Defect, DefectFormData } from '../types';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';

interface DefectHeaderProps {
  defect: Defect;
  isEditing: boolean;
  formData: DefectFormData;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onReopen: () => void;
  onFormChange: (data: DefectFormData) => void;
  saving?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export function DefectHeader({
  defect,
  isEditing,
  formData,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onReopen,
  onFormChange,
  saving = false,
  canUpdate = true,
  canDelete = true,
}: DefectHeaderProps) {
  const { options: severityOptions } = useDropdownOptions('Defect', 'severity');
  const { options: priorityOptions } = useDropdownOptions('Defect', 'priority');
  const { options: statusOptions } = useDropdownOptions('Defect', 'status');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
      case 'NEW':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'IN_PROGRESS':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'FIXED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'TESTED':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'CLOSED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ');
  };

  const severityBadgeProps = getDynamicBadgeProps(defect.severity, severityOptions);
  const priorityBadgeProps = getDynamicBadgeProps(defect.priority, priorityOptions);
  const statusBadgeProps = getDynamicBadgeProps(defect.status, statusOptions);

  // Get labels from dropdown options
  const severityLabel = severityOptions.find(opt => opt.value === defect.severity)?.label || defect.severity;
  const priorityLabel = priorityOptions.find(opt => opt.value === defect.priority)?.label || defect.priority;
  const statusLabel = statusOptions.find(opt => opt.value === defect.status)?.label || formatStatus(defect.status);

  return (
    <DetailPageHeader
      title={defect.title}
      subtitle={defect.defectId}
      subtitleClassName="text-sm"
      isEditing={isEditing}
      editTitle={formData.title}
      onTitleChange={(title) => onFormChange({ ...formData, title })}
      badges={[
        { 
          label: '深刻度', 
          value: severityLabel, 
          className: severityBadgeProps.className,
          style: severityBadgeProps.style 
        },
        { 
          label: '優先度', 
          value: priorityLabel, 
          className: priorityBadgeProps.className,
          style: priorityBadgeProps.style 
        },
        { 
          label: 'ステータス', 
          value: statusLabel, 
          className: statusBadgeProps.className,
          style: statusBadgeProps.style 
        },
      ]}
      actions={[
        { 
          label: '再オープン', 
          icon: RotateCcw, 
          onClick: onReopen, 
          show: defect.status === 'CLOSED' && canUpdate,
          buttonName: 'Defect Detail - Reopen',
        },
        { 
          label: '編集', 
          icon: Edit, 
          onClick: onEdit, 
          show: canUpdate,
          buttonName: 'Defect Detail - Edit',
        },
        { 
          label: '削除', 
          icon: Trash2, 
          onClick: onDelete, 
          variant: 'destructive', 
          show: canDelete,
          buttonName: 'Defect Detail - Delete',
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
