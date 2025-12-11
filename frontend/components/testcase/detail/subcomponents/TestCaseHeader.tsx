'use client';

import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { ButtonDestructive } from '@/elements/button-destructive';
import { Input } from '@/elements/input';
import { Edit, Trash2, Save, X } from 'lucide-react';
import { TestCase, TestCaseFormData } from '../types';

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

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={getPriorityColor(testCase.priority)}
            >
              {testCase.priority}
            </Badge>
            <Badge variant="outline" className={getStatusColor(testCase.status)}>
              {testCase.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {isEditing ? (
              <Input
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  onFormChange({ ...formData, title: e.target.value })
                }
                className="text-3xl font-bold text-white bg-white/5 border-white/10"
              />
            ) : (
              testCase.title
            )}
          </h1>
          <p className="text-white/60">
            {testCase.project.name} ({testCase.project.key})
          </p>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="glass" onClick={onCancel} className="cursor-pointer" disabled={saving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <ButtonPrimary onClick={onSave} className="cursor-pointer" disabled={saving}>
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </ButtonPrimary>
            </>
          ) : (
            <>
              {canUpdate && (
                <Button variant="glass" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <ButtonDestructive onClick={onDelete} className="cursor-pointer">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </ButtonDestructive>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
