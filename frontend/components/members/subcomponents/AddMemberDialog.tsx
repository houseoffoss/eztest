'use client';

import { Button } from '@/elements/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/elements/dialog';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/elements/select';
import { AddMemberFormData } from '../types';

interface AddMemberDialogProps {
  open: boolean;
  formData: AddMemberFormData;
  adding: boolean;
  error: string;
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: AddMemberFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddMemberDialog({
  open,
  formData,
  adding,
  error,
  onOpenChange,
  onFormChange,
  onSubmit,
}: AddMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Project Member</DialogTitle>
          <DialogDescription>
            Add a member to this project
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, email: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the email address of the user you want to add
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Project Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: string) =>
                onFormChange({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TESTER">Tester (Default)</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="glass"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={adding} variant="glass-primary">
              {adding ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
