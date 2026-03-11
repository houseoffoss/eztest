'use client';

import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Plus } from 'lucide-react';
import { Project } from '../types';

interface MembersHeaderProps {
  project: Project;
  isAdminOrManager: boolean;
  onAddMember: () => void;
}

export function MembersHeader({ project, isAdminOrManager, onAddMember }: MembersHeaderProps) {
  return (
    <div className="max-w-6xl mx-auto px-8 pt-8">
      <div className="flex items-center justify-end mb-4">
        {isAdminOrManager && (
          <ButtonPrimary onClick={onAddMember} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            メンバーを追加
          </ButtonPrimary>
        )}
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">プロジェクトメンバー</h1>
        <p className="text-white/70 text-sm">
          <span className="font-semibold text-white">{project.name}</span> のチームメンバーを管理
          {!isAdminOrManager && (
            <span className="text-white/50 ml-2">（プロジェクトマネージャーと管理者がメンバーを管理できます）</span>
          )}
        </p>
      </div>
    </div>
  );
}
