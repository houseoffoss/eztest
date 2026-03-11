'use client';

import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import { Save } from 'lucide-react';
import { Project, ProjectFormData } from '../types';

interface GeneralSettingsCardProps {
  project: Project;
  formData: ProjectFormData;
  saving: boolean;
  onFormChange: (data: ProjectFormData) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  canUpdate?: boolean;
}

export function GeneralSettingsCard({
  project,
  formData,
  saving,
  onFormChange,
  onSave,
  onCancel,
  canUpdate = true,
}: GeneralSettingsCardProps) {
  return (
    <DetailCard
      title="基本情報"
      description="プロジェクト名と説明を更新"
      contentClassName="p-8"
    >
      <form onSubmit={onSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="block text-sm font-medium text-muted-foreground">
              プロジェクト名 *
            </Label>
            <Input
              id="name"
              variant="glass"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, name: e.target.value })
              }
              required
              minLength={3}
              maxLength={255}
              placeholder="Demo Project"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key" className="block text-sm font-medium text-muted-foreground">
              プロジェクトキー
            </Label>
            <Input
              id="key"
              variant="glass"
              value={project.key}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              プロジェクトキーは作成後に変更できません
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="block text-sm font-medium text-muted-foreground">
              説明
            </Label>
            <Textarea
              id="description"
              variant="glass"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Welcome to EZTest! This is a demo project to help you get started. Feel free to explore the features and create your own test suites, test cases, and test plans."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <ButtonPrimary type="submit" disabled={saving || !canUpdate}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '変更を保存'}
            </ButtonPrimary>
            <Button type="button" variant="glass" onClick={onCancel} className="!rounded-full">
              キャンセル
            </Button>
          </div>
        </form>
    </DetailCard>
  );
}
