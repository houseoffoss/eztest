'use client';

import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/frontend/reusable-elements/dialogs/Dialog';

interface DeleteProjectDialogProps {
  open: boolean;
  projectName: string;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteProjectDialog({
  open,
  projectName,
  deleting,
  onOpenChange,
  onConfirm,
}: DeleteProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>プロジェクトを削除</DialogTitle>
          <DialogDescription>
            「{projectName}」を削除してもよろしいですか？この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-red-300">
            <p className="font-semibold mb-2">以下が永続的に削除されます:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>すべてのテストケース</li>
              <li>すべてのテスト実行</li>
              <li>すべてのテストスイート</li>
              <li>すべての要件</li>
              <li>すべてのプロジェクトデータ</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={deleting}
              data-analytics-button="Delete Project Dialog (Settings) - Cancel"
            >
              キャンセル
            </Button>
            <ButtonDestructive
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              buttonName="Delete Project Dialog (Settings) - Delete Project"
            >
              {deleting ? '削除中...' : 'プロジェクトを削除'}
            </ButtonDestructive>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
