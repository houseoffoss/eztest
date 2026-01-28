'use client';

import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Module } from '../../types';

interface ModuleDetailsCardProps {
  module: Module;
  isEditing: boolean;
  formData: { name: string; description: string };
  onFormChange: (formData: { name: string; description: string }) => void;
}

export function ModuleDetailsCard({
  module,
  isEditing,
  formData,
  onFormChange,
}: ModuleDetailsCardProps) {
  return (
    <DetailCard title="Details" contentClassName="space-y-4">
      {isEditing ? (
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            variant="glass"
            value={formData.description}
            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
            placeholder="Enter description"
            rows={3}
            maxLength={250}
            className="w-full"
          />
        </div>
      ) : (
        <>
          {module.description && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Description
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {module.description}
              </p>
            </div>
          )}
          {!module.description && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Description
              </h4>
              <p className="text-white/40 italic">No description provided</p>
            </div>
          )}
        </>
      )}
    </DetailCard>
  );
}
