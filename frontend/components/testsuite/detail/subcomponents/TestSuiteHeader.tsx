import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Folder, Edit, Trash2, Save, X } from 'lucide-react';

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
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-500 border-blue-500/20"
            >
              <Folder className="w-3 h-3 mr-1" />
              Test Suite
            </Badge>
          </div>
          {isEditing ? (
            <Input
              variant="glass"
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              className="text-3xl font-bold mb-1"
            />
          ) : (
            <h1 className="text-3xl font-bold text-white/90 mb-1">
              {testSuite.name}
            </h1>
          )}
          <p className="text-white/60">
            {testSuite.project.name} ({testSuite.project.key})
          </p>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="glass" onClick={onCancelEdit} className="cursor-pointer">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <ButtonPrimary onClick={onSave} className="cursor-pointer">
                <Save className="w-4 h-4 mr-2" />
                Save
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
