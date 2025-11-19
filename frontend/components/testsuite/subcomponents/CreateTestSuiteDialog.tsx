'use client';

import { Button } from '@/elements/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';
import { TestSuite, TestSuiteFormData } from '../types';

interface CreateTestSuiteDialogProps {
  open: boolean;
  formData: TestSuiteFormData;
  testSuites: TestSuite[];
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: TestSuiteFormData) => void;
  onSubmit: () => void;
}

export function CreateTestSuiteDialog({
  open,
  formData,
  testSuites,
  onOpenChange,
  onFormChange,
  onSubmit,
}: CreateTestSuiteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glass" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Test Suite</DialogTitle>
          <DialogDescription>
            Organize your test cases into suites
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              variant="glass"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, name: e.target.value })
              }
              placeholder="Enter suite name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              variant="glass"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, description: e.target.value })
              }
              placeholder="Enter suite description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Suite (Optional)</Label>
            <Select
              value={formData.parentId || "__none__"}
              onValueChange={(value: string) =>
                onFormChange({ ...formData, parentId: value === "__none__" ? null : value })
              }
            >
              <SelectTrigger variant="glass">
                <SelectValue placeholder="Select parent suite" />
              </SelectTrigger>
              <SelectContent variant="glass">
                <SelectItem value="__none__">None (Root Level)</SelectItem>
                {testSuites.filter(s => !s.parentId).map((suite) => (
                  <SelectItem key={suite.id} value={suite.id}>
                    {suite.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="glass" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="glass-primary" onClick={onSubmit}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
