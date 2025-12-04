'use client';

import { Badge } from '@/elements/badge';
import { Input } from '@/elements/input';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { ButtonDestructive } from '@/elements/button-destructive';
import { Edit, Save, X, Trash2 } from 'lucide-react';
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
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              MODULE
            </Badge>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
              {testCaseCount} Test Case{testCaseCount !== 1 ? 's' : ''}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                className="text-3xl font-bold text-white bg-white/5 border-white/10"
                placeholder="Module name"
              />
            ) : (
              module.name
            )}
          </h1>
          <p className="text-white/60">
            {projectName} ({projectKey})
          </p>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="glass" onClick={onCancel} className="cursor-pointer">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <ButtonPrimary onClick={onSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </ButtonPrimary>
            </>
          ) : (
            <>
              {canUpdate && (
                <Button variant="glass" onClick={onEdit} className="cursor-pointer">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <ButtonDestructive onClick={onDelete}>
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
