'use client';

import { useEffect, useState } from 'react';
import { BaseDialog, type BaseDialogField } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { Role, User, EditUserFormData } from '../types';

interface EditUserDialogProps {
  open: boolean;
  user: User | null;
  roles: Role[];
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: EditUserFormData) => Promise<void>;
}

export function EditUserDialog({ open, user, roles, onOpenChange, onUpdate }: EditUserDialogProps) {
  const [key, setKey] = useState(0);

  // Reset the dialog when user changes or dialog opens
  useEffect(() => {
    if (open && user) {
      setKey((prev) => prev + 1);
    }
  }, [open, user]);

  const fields: BaseDialogField[] = [
    {
      name: 'name',
      label: '氏名',
      type: 'text',
      required: true,
      defaultValue: user?.name || '',
    },
    {
      name: 'email',
      label: 'メールアドレス',
      type: 'email',
      required: true,
      defaultValue: user?.email || '',
    },
    {
      name: 'roleId',
      label: 'アプリケーションロール',
      type: 'select',
      required: true,
      defaultValue: user?.role.id || '',
      options: roles.map((role) => ({
        value: role.id,
        label: role.name,
      })),
    },
    {
      name: 'phone',
      label: '電話番号',
      placeholder: '任意',
      type: 'text',
      defaultValue: user?.phone || '',
    },
    {
      name: 'location',
      label: '所在地',
      placeholder: '任意',
      type: 'text',
      defaultValue: user?.location || '',
    },
    {
      name: 'bio',
      label: '自己紹介',
      placeholder: '任意',
      type: 'textarea',
      rows: 3,
      cols: 2,
      maxLength: 250,
      defaultValue: user?.bio || '',
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    if (!user) return;

    // Only include fields that have actually changed
    const userData: Partial<EditUserFormData> = {};
    
    if (formData.name && formData.name !== user.name) {
      userData.name = formData.name;
    }
    if (formData.email && formData.email !== user.email) {
      userData.email = formData.email;
    }
    // For roleId, ensure we have a value and it's different from current role
    if (formData.roleId && formData.roleId !== user.role.id) {
      userData.roleId = formData.roleId;
    }
    if (formData.bio !== (user.bio || '')) {
      userData.bio = formData.bio || '';
    }
    if (formData.phone !== (user.phone || '')) {
      userData.phone = formData.phone || '';
    }
    if (formData.location !== (user.location || '')) {
      userData.location = formData.location || '';
    }
    
    await onUpdate(userData as EditUserFormData);
  };

  return (
    <BaseDialog
      key={key}
      title="ユーザーを編集"
      description="ユーザー情報とロールを更新"
      fields={fields}
      submitLabel="ユーザーを更新"
      triggerOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      disablePersistence={true}
    />
  );
}
