'use client';

import { Textarea } from '@/elements/textarea';
import { DetailCard } from '@/components/design/DetailCard';
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
    <DetailCard title="Module Details" contentClassName="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-2">
          Description
        </h4>
        {isEditing ? (
          <Textarea
            value={formData.description}
            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
            placeholder="Describe the purpose of this module..."
            rows={5}
            className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        ) : (
          <div className="text-white/90 whitespace-pre-wrap break-words">
            {module.description || (
              <span className="text-white/40 italic">No description provided</span>
            )}
          </div>
        )}
      </div>
    </DetailCard>
  );
}
