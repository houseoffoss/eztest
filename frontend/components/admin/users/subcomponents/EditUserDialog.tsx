'use client';

import { useEffect, useState } from 'react';
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
  const [key, setKey] = useState(0);

  // Reset the dialog when user changes or dialog opens
  useEffect(() => {
    if (open && user) {
      setKey((prev) => prev + 1);
    }
  }, [open, user?.id]);

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
      maxLength: 250,
      defaultValue: user?.bio || '',
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    if (!user) return;

    console.log('EditUserDialog - Form data received:', formData);
    console.log('EditUserDialog - Current user role:', user.role.id, user.role.name);

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
      console.log('EditUserDialog - Role change detected:', formData.roleId, '!=', user.role.id);
      userData.roleId = formData.roleId;
    } else {
      console.log('EditUserDialog - No role change:', formData.roleId, '==', user.role.id);
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
    
    console.log('EditUserDialog - Sending update with data:', userData);
    await onUpdate(userData as EditUserFormData);
  };

  return (
    <BaseDialog
      key={key}
      title="Edit User"
      description="Update user information and role"
      fields={fields}
      submitLabel="Update User"
      triggerOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      disablePersistence={true}
    />
  );
}
