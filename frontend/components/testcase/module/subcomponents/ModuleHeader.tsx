'use client';

import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { DetailPageHeader } from '@/frontend/reusable-components/layout/DetailPageHeader';
import { Edit, Trash2 } from 'lucide-react';
import { Module } from '../../types';

interface ModuleHeaderProps {
  module: Module;
  projectName: string;
  projectKey: string;
  testCaseCount: number;
  isEditing: boolean;
  formData: { name: string; description: string };
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onFormChange: (formData: { name: string; description: string }) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export function ModuleHeader({
  module,
  projectName,
  projectKey,
  testCaseCount,
  isEditing,
  formData,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onFormChange,
  canUpdate,
  canDelete,
}: ModuleHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          MODULE
        </Badge>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
          {testCaseCount} Test Case{testCaseCount !== 1 ? 's' : ''}
        </Badge>
      </div>
      <DetailPageHeader
        title={module.name}
        subtitle={`${projectName} (${projectKey})`}
        isEditing={isEditing}
        editTitle={formData.name}
        onTitleChange={(name) => onFormChange({ ...formData, name })}
        maxLength={150}
        actions={[
          { 
            label: 'Edit', 
            icon: Edit, 
            onClick: onEdit, 
            show: canUpdate,
            buttonName: 'Module Detail - Edit',
          },
          { 
            label: 'Delete', 
            icon: Trash2, 
            onClick: onDelete, 
            variant: 'destructive', 
            show: canDelete,
            buttonName: 'Module Detail - Delete',
          },
        ]}
        editActions={{
          onSave,
          onCancel,
        }}
      />
    </>
  );
}
