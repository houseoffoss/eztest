'use client';

import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Edit, Trash2, Save, X, RotateCcw } from 'lucide-react';
import { Defect, DefectFormData } from '../types';

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

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-white mb-1">
            {isEditing ? (
              <Input
                value={formData.title}
                onChange={(e) =>
                  onFormChange({ ...formData, title: e.target.value })
                }
                className="text-3xl font-bold"
                placeholder="Defect title"
              />
            ) : (
              defect.title
            )}
          </h1>
          <p className="text-white/60 text-sm mb-3">{defect.defectId}</p>
          <div className="flex items-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-white/60">Severity:</span>
              <Badge
                variant="outline"
                className={getSeverityColor(defect.severity)}
              >
                {defect.severity}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Priority:</span>
              <Badge variant="outline" className={getPriorityColor(defect.priority)}>
                {defect.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Status:</span>
              <Badge variant="outline" className={getStatusColor(defect.status)}>
                {formatStatus(defect.status)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="glass" onClick={onCancel} className="cursor-pointer">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <ButtonPrimary onClick={onSave} disabled={saving} className="cursor-pointer">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </ButtonPrimary>
            </>
          ) : (
            <>
              {defect.status === 'CLOSED' && canUpdate && (
                <Button variant="glass" onClick={onReopen} className="cursor-pointer">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reopen
                </Button>
              )}
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
