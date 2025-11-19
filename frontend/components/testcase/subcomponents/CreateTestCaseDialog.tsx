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
import { TestCaseFormData, TestSuite } from '../types';

interface CreateTestCaseDialogProps {
  open: boolean;
  formData: TestCaseFormData;
  testSuites: TestSuite[];
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: TestCaseFormData) => void;
  onSubmit: () => void;
}

export function CreateTestCaseDialog({
  open,
  formData,
  testSuites,
  onOpenChange,
  onFormChange,
  onSubmit,
}: CreateTestCaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glass" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Test Case</DialogTitle>
          <DialogDescription>
            Add a new test case to this project
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, title: e.target.value })
              }
              placeholder="Enter test case title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, description: e.target.value })
              }
              placeholder="Enter test case description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suite">Test Suite</Label>
            <Select
              value={formData.suiteId || "__none__"}
              onValueChange={(value: string) =>
                onFormChange({ ...formData, suiteId: value === "__none__" ? null : value })
              }
            >
              <SelectTrigger variant="glass">
                <SelectValue placeholder="Select a test suite" />
              </SelectTrigger>
              <SelectContent variant="glass">
                <SelectItem value="__none__">None (No Suite)</SelectItem>
                {testSuites.map((suite) => (
                  <SelectItem key={suite.id} value={suite.id}>
                    {suite.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: string) =>
                  onFormChange({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) =>
                  onFormChange({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
            <Input
              id="estimatedTime"
              type="number"
              value={formData.estimatedTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, estimatedTime: e.target.value })
              }
              placeholder="Enter estimated time"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preconditions">Preconditions</Label>
            <Textarea
              id="preconditions"
              value={formData.preconditions}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, preconditions: e.target.value })
              }
              placeholder="Enter preconditions"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postconditions">Postconditions</Label>
            <Textarea
              id="postconditions"
              value={formData.postconditions}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, postconditions: e.target.value })
              }
              placeholder="Enter postconditions"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps">Test Steps (Optional)</Label>
            <Textarea
              id="steps"
              value={formData.steps || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onFormChange({ ...formData, steps: e.target.value })
              }
              placeholder="Enter test steps (one per line)"
              rows={3}
            />
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
