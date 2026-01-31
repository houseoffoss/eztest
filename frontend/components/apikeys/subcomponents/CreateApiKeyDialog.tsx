'use client';

import { useState, useEffect } from 'react';
import { BaseDialog, type BaseDialogField } from '@/frontend/reusable-components/dialogs/BaseDialog';
import type { ApiKey } from '../ApiKeysManagement';

interface Project {
  id: string;
  name: string;
}

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeyCreated: (data: { key: string; apiKey: ApiKey }) => void;
}

export function CreateApiKeyDialog({
  open,
  onOpenChange,
  onApiKeyCreated,
}: CreateApiKeyDialogProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const projectOptions = [
    { value: '__all__', label: 'All Projects (No Restriction)' },
    ...projects.map((project) => ({
      value: project.id,
      label: project.name,
    })),
  ];

  const fields: BaseDialogField[] = [
    {
      name: 'name',
      label: 'Key Name',
      placeholder: 'e.g., CI/CD Pipeline Key, Local Dev Key',
      type: 'text',
      required: true,
      minLength: 1,
      maxLength: 255,
    },
    {
      name: 'projectId',
      label: 'Project (Optional)',
      placeholder: 'Select a project to restrict this key',
      type: 'select',
      required: false,
      defaultValue: '__all__',
      options: projectOptions,
    },
    {
      name: 'expiresAt',
      label: 'Expiration Date (Optional)',
      type: 'date',
      required: false,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    const requestBody: {
      name: string;
      projectId: string | null;
      expiresAt: string | null;
    } = {
      name: formData.name,
      projectId: formData.projectId === '__all__' ? null : (formData.projectId || null),
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
    };

    const response = await fetch('/api/apikeys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to create API key');
    }

    const data = await response.json();
    // The route handler already returns result.data, so data is already { key, apiKey }
    return data;
  };

  return (
    <BaseDialog
      title="Create API Key"
      description="Create a new API key for SDK authentication. The full key will be shown only once - make sure to save it!"
      fields={fields}
      submitLabel="Create API Key"
      triggerOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      onSuccess={(result) => {
        if (result) {
          onApiKeyCreated(result);
        }
      }}
    />
  );
}

