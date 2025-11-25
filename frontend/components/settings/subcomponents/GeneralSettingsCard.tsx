'use client';

import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { DetailCard } from '@/components/design/DetailCard';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import { Save } from 'lucide-react';
import { Project, ProjectFormData } from '../types';

interface GeneralSettingsCardProps {
  project: Project;
  formData: ProjectFormData;
  saving: boolean;
  onFormChange: (data: ProjectFormData) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function GeneralSettingsCard({
  project,
  formData,
  saving,
  onFormChange,
  onSave,
  onCancel,
}: GeneralSettingsCardProps) {
  return (
    <DetailCard
      title="General Information"
      description="Update your project name and description"
      contentClassName="p-8"
    >
      <form onSubmit={onSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="block text-sm font-medium text-muted-foreground">
              Project Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, name: e.target.value })
              }
              required
              minLength={3}
              maxLength={255}
              placeholder="Demo Project"
              className="w-full px-4 py-2 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key" className="block text-sm font-medium text-muted-foreground">
              Project Key
            </Label>
            <Input
              id="key"
              value={project.key}
              disabled
              className="w-full px-4 py-2 rounded-[10px] border border-border bg-transparent cursor-not-allowed opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              Project key cannot be changed after creation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="block text-sm font-medium text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Welcome to EZTest! This is a demo project to help you get started. Feel free to explore the features and create your own test suites, test cases, and test plans."
              className="w-full px-4 py-2.5 rounded-[10px] border border-border bg-transparent focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm leading-relaxed"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <ButtonPrimary type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </ButtonPrimary>
            <Button type="button" variant="glass" onClick={onCancel} className="!rounded-full">
              Cancel
            </Button>
          </div>
        </form>
    </DetailCard>
  );
}
