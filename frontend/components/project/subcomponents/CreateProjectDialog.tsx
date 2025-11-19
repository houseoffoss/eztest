'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/elements/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/elements/dialog';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import { Project } from '../types';

interface CreateProjectDialogProps {
  onProjectCreated: (project: Project) => void;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CreateProjectDialog = ({ onProjectCreated, triggerOpen, onOpenChange }: CreateProjectDialogProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (triggerOpen) {
      setOpen(true);
    }
  }, [triggerOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          key: formData.key.toUpperCase(),
          description: formData.description || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Ensure the project has the required structure
        const project: Project = {
          ...data.data,
          createdBy: data.data.createdBy || { id: '', name: '', email: '', avatar: null },
          members: data.data.members || [],
        };
        onProjectCreated(project);
        setFormData({ name: '', key: '', description: '' });
        handleOpenChange(false);
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up a new project to organize your test cases and test runs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="E-Commerce Platform"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, name: e.target.value })}
              required
              minLength={3}
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Project Key *</Label>
            <Input
              id="key"
              placeholder="ECOM"
              value={formData.key}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
              required
              minLength={2}
              maxLength={10}
              pattern="[A-Z0-9]+"
              className="uppercase backdrop-blur-none"
            />
            <p className="text-xs text-muted-foreground">
              2-10 characters, letters and numbers only
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the project..."
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="glass"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating}
              variant="glass-primary"
            >
              {creating ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
