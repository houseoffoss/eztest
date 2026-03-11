'use client';

import { BaseDialog, type BaseDialogField } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { Role, UserFormData } from '../types';

interface AddUserDialogProps {
  open: boolean;
  roles: Role[];
  onOpenChange: (open: boolean) => void;
  onAdd: (data: UserFormData) => Promise<void>;
}

export function AddUserDialog({ open, roles, onOpenChange, onAdd }: AddUserDialogProps) {
  // Find TESTER role or default to first role
  const testerRole = roles.find((role) => role.name === 'TESTER');
  const defaultRoleId = testerRole ? testerRole.id : (roles.length > 0 ? roles[0].id : '');

  const fields: BaseDialogField[] = [
    {
      name: 'name',
      label: '氏名',
      placeholder: '山田 太郎',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'メールアドレス',
      placeholder: 'user@example.com',
      type: 'email',
      required: true,
    },
    {
      name: 'password',
      label: 'パスワード',
      placeholder: '••••••••',
      type: 'password',
      required: true,
    },
    {
      name: 'roleId',
      label: 'ユーザーロール',
      type: 'select',
      required: true,
      defaultValue: defaultRoleId,
      options: roles.map((role) => ({
        value: role.id,
        label: role.name,
      })),
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    const userData: UserFormData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      roleId: formData.roleId,
    };
    await onAdd(userData);
  };

  return (
    <BaseDialog
      title="新規ユーザーを追加"
      description="アプリケーションレベルのロールを持つ新しいユーザーアカウントを作成"
      fields={fields}
      submitLabel="ユーザーを追加"
      triggerOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    />
  );
}
