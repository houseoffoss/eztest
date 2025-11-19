import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { Button } from '@/elements/button';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';
import { CheckCircle, XCircle, AlertCircle, Circle } from 'lucide-react';
import { ResultFormData } from '../types';

interface RecordResultDialogProps {
  open: boolean;
  testCaseName: string;
  formData: ResultFormData;
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: Partial<ResultFormData>) => void;
  onSubmit: () => void;
}

export function RecordResultDialog({
  open,
  testCaseName,
  formData,
  onOpenChange,
  onFormChange,
  onSubmit,
}: RecordResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glass">
        <DialogHeader>
          <DialogTitle>Record Test Result</DialogTitle>
          <DialogDescription>{testCaseName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Result Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: string) => onFormChange({ status: value })}
            >
              <SelectTrigger variant="glass">
                <SelectValue placeholder="Select result status" />
              </SelectTrigger>
              <SelectContent variant="glass">
                <SelectItem value="PASSED">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Passed</span>
                  </div>
                </SelectItem>
                <SelectItem value="FAILED">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Failed</span>
                  </div>
                </SelectItem>
                <SelectItem value="BLOCKED">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>Blocked</span>
                  </div>
                </SelectItem>
                <SelectItem value="SKIPPED">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-gray-500" />
                    <span>Skipped</span>
                  </div>
                </SelectItem>
                <SelectItem value="RETEST">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-purple-500" />
                    <span>Retest</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              variant="glass"
              value={formData.comment}
              onChange={(e) => onFormChange({ comment: e.target.value })}
              placeholder="Add any comments about this test execution"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="glass" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="glass-primary" onClick={onSubmit}>
            Save Result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
