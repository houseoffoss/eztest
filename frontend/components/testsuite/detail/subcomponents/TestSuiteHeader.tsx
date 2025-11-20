import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { Input } from '@/elements/input';
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
              <Button variant="glass" onClick={onCancelEdit}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button variant="glass-primary" onClick={onSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="glass" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="glass-destructive" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
