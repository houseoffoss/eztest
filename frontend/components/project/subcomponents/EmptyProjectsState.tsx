'use client';

import { Card, CardContent } from '@/frontend/reusable-elements/cards/Card';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Folder, Plus } from 'lucide-react';

interface EmptyProjectsStateProps {
  onCreateProject: () => void;
  canCreateProject?: boolean;
}

export const EmptyProjectsState = ({ onCreateProject, canCreateProject = true }: EmptyProjectsStateProps) => {
  return (
    <Card
      variant="glass"
      className="hover:shadow-xl hover:shadow-primary/10 transition-all"
    >
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Folder className="w-16 h-16 text-white/50 mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-white">プロジェクトがありません</h3>
        <p className="text-white/60 mb-6 text-center max-w-sm">
          {canCreateProject
            ? '最初のプロジェクトを作成して、テストケースの管理とテスト進捗の追跡を始めましょう。'
            : 'プロジェクトを作成する権限がありません。管理者にお問い合わせください。'}
        </p>
        {canCreateProject && (
          <ButtonPrimary 
            onClick={onCreateProject}
            buttonName="Project List - Create Your First Project (Empty State)"
          >
            <Plus className="w-4 h-4 mr-2" />
            最初のプロジェクトを作成
          </ButtonPrimary>
        )}
      </CardContent>
    </Card>
  );
};
