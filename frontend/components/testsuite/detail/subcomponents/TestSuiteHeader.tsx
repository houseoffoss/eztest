import { DetailPageHeader } from '@/frontend/reusable-components/layout/DetailPageHeader';
import { Edit, Trash2 } from 'lucide-react';

interface TestSuiteHeaderProps {
  testSuite: {
    name: string;
    project: {
      id: string;
      name: string;
      key: string;
    };
  };
  isEditing: boolean;
  formData: { name: string };
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onNameChange: (name: string) => void;
  onBack?: () => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export function TestSuiteHeader({
  testSuite,
  isEditing,
  formData,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onNameChange,
  canUpdate = false,
  canDelete = false,
}: TestSuiteHeaderProps) {
  return (
    <DetailPageHeader
      title={testSuite.name}
      subtitle={`${testSuite.project.name} (${testSuite.project.key})`}
      isEditing={isEditing}
      editTitle={formData.name}
      onTitleChange={onNameChange}
      badges={[]}
      actions={[
        { 
          label: 'Edit', 
          icon: Edit, 
          onClick: onEdit, 
          show: canUpdate,
          buttonName: 'Test Suite Detail - Edit',
        },
        { 
          label: 'Delete', 
          icon: Trash2, 
          onClick: onDelete, 
          variant: 'destructive', 
          show: canDelete,
          buttonName: 'Test Suite Detail - Delete',
        },
      ]}
      editActions={{
        onSave,
        onCancel: onCancelEdit,
      }}
    />
  );
}
