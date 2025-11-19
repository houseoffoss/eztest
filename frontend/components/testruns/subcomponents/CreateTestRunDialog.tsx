import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { Button } from '@/elements/button';
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
import { TestRunFormData } from '../types';

interface CreateTestRunDialogProps {
  open: boolean;
  formData: TestRunFormData;
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: Partial<TestRunFormData>) => void;
  onCreate: () => void;
}

export function CreateTestRunDialog({
  open,
  formData,
  onOpenChange,
  onFormChange,
  onCreate,
}: CreateTestRunDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glass" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Test Run</DialogTitle>
          <DialogDescription>
            Create a new test run to execute test cases
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              variant="glass"
              value={formData.name}
              onChange={(e) => onFormChange({ name: e.target.value })}
              placeholder="Enter test run name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              variant="glass"
              value={formData.description}
              onChange={(e) => onFormChange({ description: e.target.value })}
              placeholder="Enter test run description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Select
              value={formData.environment}
              onValueChange={(value: string) =>
                onFormChange({ environment: value })
              }
            >
              <SelectTrigger variant="glass">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent variant="glass">
                <SelectItem value="Production">Production</SelectItem>
                <SelectItem value="Staging">Staging</SelectItem>
                <SelectItem value="QA">QA</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="glass" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="glass-primary" onClick={onCreate}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
