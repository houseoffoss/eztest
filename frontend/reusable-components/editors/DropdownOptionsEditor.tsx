'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/frontend/reusable-elements/dialogs/Dialog';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { InlineError } from '@/frontend/reusable-elements/alerts/InlineError';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import {
  Plus,
  Trash2,
  Save,
  X,
  Edit2,
  Check,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

export interface DropdownOptionData {
  id?: string;
  value: string;
  label: string;
  isActive: boolean;
  order: number;
}

export interface CreateOptionData {
  entity: string;
  field: string;
  value: string;
  label: string;
  isActive: boolean;
  order: number;
}

export interface UpdateOptionData {
  id: string;
  value: string;
  label: string;
  isActive: boolean;
  order: number;
}

export interface DropdownOptionsEditorConfig {
  title: string;
  description?: string;
  entity: string;
  field: string;
  options: DropdownOptionData[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave: (
    toCreate: CreateOptionData[],
    toUpdate: UpdateOptionData[],
    orderUpdates: Array<{ id: string; order: number }>
  ) => Promise<void>;
  onSuccess?: () => void;
}

interface OptionFormData extends DropdownOptionData {
  isNew?: boolean;
  isEditing?: boolean;
}

/**
 * Reusable Dropdown Options Editor Dialog
 * 
 * @example
 * ```tsx
 * <DropdownOptionsEditor
 *   title="Edit Priority Options"
 *   description="Manage priority dropdown values"
 *   entity="TestCase"
 *   field="priority"
 *   options={priorityOptions}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onSave={async (toCreate, toUpdate, orderUpdates) => {
 *     // Handle save logic
 *   }}
 *   onSuccess={() => {
 *     // Refresh data
 *   }}
 * />
 * ```
 */
export function DropdownOptionsEditor({
  title,
  description,
  entity,
  field,
  options,
  open = false,
  onOpenChange,
  onSave,
  onSuccess,
}: DropdownOptionsEditorConfig) {
  const [formOptions, setFormOptions] = useState<OptionFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const sortedOptions = [...options].sort((a, b) => a.order - b.order);
    setFormOptions(
      sortedOptions.map((opt) => ({
        id: opt.id,
        value: opt.value,
        label: opt.label,
        isActive: opt.isActive,
        order: opt.order,
      }))
    );
  }, [options]);

  const formatFieldName = (field: string): string => {
    return field
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatEntityName = (entity: string): string => {
    return entity
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleAddOption = () => {
    const newOption: OptionFormData = {
      value: '',
      label: '',
      isActive: true,
      isNew: true,
      isEditing: true,
      order: formOptions.length,
    };
    setFormOptions([...formOptions, newOption]);
    setEditingId('new');
  };

  const handleUpdateOption = (index: number, updates: Partial<OptionFormData>) => {
    const updated = [...formOptions];
    updated[index] = { ...updated[index], ...updates };
    setFormOptions(updated);
  };

  const handleRemoveOption = (index: number) => {
    const option = formOptions[index];
    if (option.isNew) {
      setFormOptions(formOptions.filter((_, i) => i !== index));
    } else {
      handleUpdateOption(index, { isActive: false });
    }
  };

  const handleRestoreOption = (index: number) => {
    handleUpdateOption(index, { isActive: true });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...formOptions];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setFormOptions(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === formOptions.length - 1) return;
    const updated = [...formOptions];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setFormOptions(updated);
  };

  const handleEditClick = (index: number) => {
    const option = formOptions[index];
    setEditingId(option.id || 'new');
    handleUpdateOption(index, { isEditing: true });
  };

  const handleSaveEdit = (index: number) => {
    handleUpdateOption(index, { isEditing: false });
    setEditingId(null);
  };

  const handleCancelEdit = (index: number) => {
    const option = formOptions[index];
    if (option.isNew) {
      setFormOptions(formOptions.filter((_, i) => i !== index));
    } else {
      const original = options.find((o) => o.id === option.id);
      if (original) {
        handleUpdateOption(index, {
          value: original.value,
          label: original.label,
          isEditing: false,
        });
      }
    }
    setEditingId(null);
  };

  const handleSaveAll = async () => {
    setError('');
    setAlert(null);
    const activeOptions = formOptions.filter((opt) => opt.isActive);
    
    if (activeOptions.length === 0) {
      setError('At least one option must be active');
      return;
    }

    for (const opt of activeOptions) {
      if (!opt.value.trim() || !opt.label.trim()) {
        setError('All active options must have both value and label');
        return;
      }
    }

    setLoading(true);

    try {
      const toCreate = formOptions
        .filter((opt) => opt.isNew && !opt.id)
        .map((opt) => ({
          entity,
          field,
          value: opt.value,
          label: opt.label,
          isActive: opt.isActive,
          order: opt.order,
        }));

      const toUpdate = formOptions
        .filter((opt) => !opt.isNew && opt.id)
        .map((opt) => ({
          id: opt.id!,
          value: opt.value,
          label: opt.label,
          isActive: opt.isActive,
          order: opt.order,
        }));

      const orderUpdates = formOptions
        .filter((opt) => opt.id)
        .map((opt, index) => ({
          id: opt.id!,
          order: index,
        }));

      await onSave(toCreate, toUpdate, orderUpdates);

      setAlert({
        type: 'success',
        title: 'Success',
        message: 'Dropdown options saved successfully',
      });

      if (onSuccess) {
        onSuccess();
      }

      if (onOpenChange) {
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to save options',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
          <div className="pt-6 pb-6">
            <DialogHeader className="mb-6">
              <DialogTitle>{title || `Edit ${formatEntityName(entity)} - ${formatFieldName(field)}`}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2">{description}</DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-2">
              {formOptions.map((option, index) => (
                <div
                  key={option.id || `new-${index}`}
                  className={`p-4 rounded-lg border ${
                    option.isActive
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  {option.isEditing ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">Value *</label>
                          <Input
                            value={option.value}
                            onChange={(e) => handleUpdateOption(index, { value: e.target.value })}
                            placeholder="VALUE"
                            className="bg-[#0f172a] border-[#334155] text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 mb-1 block">Label *</label>
                          <Input
                            value={option.label}
                            onChange={(e) => handleUpdateOption(index, { label: e.target.value })}
                            placeholder="Display Label"
                            className="bg-[#0f172a] border-[#334155] text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="glass"
                          onClick={() => handleCancelEdit(index)}
                          disabled={loading}
                          className="cursor-pointer"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <ButtonPrimary
                          size="sm"
                          onClick={() => handleSaveEdit(index)}
                          disabled={loading}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Done
                        </ButtonPrimary>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{option.label}</span>
                            <span className="text-xs text-white/40 font-mono">{option.value}</span>
                            {!option.isActive && (
                              <span className="text-xs text-white/40">(Inactive)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || loading || editingId !== null}
                          className="rounded-full border border-white/30 text-white hover:text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === formOptions.length - 1 || loading || editingId !== null}
                          className="rounded-full border border-white/30 text-white hover:text-white/80 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(index)}
                          disabled={loading || editingId !== null}
                          className="rounded-full border border-blue-400/30 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {option.isActive ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOption(index)}
                            disabled={loading || editingId !== null}
                            className="rounded-full border border-red-400/30 text-red-400 hover:text-red-300 hover:bg-red-400/10 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRestoreOption(index)}
                            disabled={loading || editingId !== null}
                            className="rounded-full border border-green-400/30 text-green-400 hover:text-green-300 hover:bg-green-400/10 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Restore"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="accent"
              className="w-full mt-4"
              onClick={handleAddOption}
              disabled={loading || editingId !== null}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>

            <InlineError message={error} />
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-white/10 bg-[#0f172a] px-6 py-4 flex gap-3 justify-end">
          <Button 
            type="button"
            variant="glass" 
            onClick={handleClose} 
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <ButtonPrimary 
            type="button"
            onClick={handleSaveAll} 
            disabled={loading || editingId !== null}
            className="cursor-pointer"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </ButtonPrimary>
        </div>
      </DialogContent>
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
    </Dialog>
  );
}

