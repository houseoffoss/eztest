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
      label: 'Full Name',
      placeholder: 'John Doe',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      placeholder: 'john@example.com',
      type: 'email',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: '••••••••',
      type: 'password',
      required: true,
    },
    {
      name: 'roleId',
      label: 'User Role',
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
      title="Add New User"
      description="Create a new user account with application-level role"
      fields={fields}
      submitLabel="Add User"
      triggerOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
    />
  );
}
