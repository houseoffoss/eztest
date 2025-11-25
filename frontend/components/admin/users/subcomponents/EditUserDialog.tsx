'use client';

import { BaseDialog, type BaseDialogField } from '@/components/design/BaseDialog';
import { Role, User, EditUserFormData } from '../types';

interface EditUserDialogProps {
  open: boolean;
  user: User | null;
  roles: Role[];
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: EditUserFormData) => Promise<void>;
}

export function EditUserDialog({ open, user, roles, onOpenChange, onUpdate }: EditUserDialogProps) {
  const fields: BaseDialogField[] = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      defaultValue: user?.name || '',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      defaultValue: user?.email || '',
    },
    {
      name: 'roleId',
      label: 'Application Role',
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
      label: 'Phone',
      placeholder: 'Optional',
      type: 'text',
      defaultValue: user?.phone || '',
    },
    {
      name: 'location',
      label: 'Location',
      placeholder: 'Optional',
      type: 'text',
      defaultValue: user?.location || '',
    },
    {
      name: 'bio',
      label: 'Bio',
      placeholder: 'Optional',
      type: 'textarea',
      rows: 3,
      cols: 2,
      defaultValue: user?.bio || '',
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    const userData: EditUserFormData = {
      name: formData.name,
      email: formData.email,
      roleId: formData.roleId,
      avatar: formData.avatar || '',
      bio: formData.bio || '',
      phone: formData.phone || '',
      location: formData.location || '',
    };
    await onUpdate(userData);
  };

  return (
    <BaseDialog
      title="Edit User"
      description="Update user information and role"
      fields={fields}
      submitLabel="Update User"
      triggerOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    />
  );
}
